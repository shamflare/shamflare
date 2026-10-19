"""Session authentication endpoints for the custom dashboard.

* Only active staff users can log in; there is no registration endpoint.
* CSRF is enforced on login/logout even for anonymous requests (DRF's
  SessionAuthentication only enforces it for authenticated users).
* Successful login rotates the session key and the CSRF token.
"""

from __future__ import annotations

from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.authentication import CSRFCheck
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

INVALID_CREDENTIALS = "Invalid username or password, or the account has no dashboard access."


def enforce_csrf(request) -> None:
    def dummy_get_response(_request):  # pragma: no cover - never called
        return None

    check = CSRFCheck(dummy_get_response)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise PermissionDenied(f"CSRF Failed: {reason}")


class UserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    is_staff = serializers.BooleanField()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, trim_whitespace=True)
    password = serializers.CharField(max_length=256, trim_whitespace=False, style={"input_type": "password"})


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfView(APIView):
    authentication_classes: list = []
    permission_classes = [AllowAny]

    @extend_schema(tags=["auth"], responses=inline_serializer("CsrfToken", {"csrfToken": serializers.CharField()}))
    def get(self, request):
        return Response({"csrfToken": get_token(request)})


class LoginView(APIView):
    authentication_classes: list = []
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    @extend_schema(
        tags=["auth"],
        request=LoginSerializer,
        responses=inline_serializer("LoginResponse", {"user": UserSerializer()}),
    )
    def post(self, request):
        enforce_csrf(request._request)
        payload = LoginSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        user = authenticate(
            request._request,
            username=payload.validated_data["username"],
            password=payload.validated_data["password"],
        )
        if user is None or not user.is_active or not user.is_staff:
            raise serializers.ValidationError({"non_field_errors": [INVALID_CREDENTIALS]})
        login(request._request, user)
        return Response({"user": UserSerializer(user).data})


class LogoutView(APIView):
    authentication_classes: list = []
    permission_classes = [AllowAny]

    @extend_schema(tags=["auth"], request=None, responses={204: None})
    def post(self, request):
        enforce_csrf(request._request)
        logout(request._request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(tags=["auth"], responses=UserSerializer)
    def get(self, request):
        return Response(UserSerializer(request.user).data)
