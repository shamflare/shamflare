"use client";

import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from "motion/react";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { localeNames, locales, type Locale } from "@/i18n/routing";
import { ApiError, apiRequest } from "@/lib/api/client";
import { BUDGET_OPTIONS, type InquiryPayload, type InquiryReceipt } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

type ServiceOption = { key: string; title: string };
type FieldName = "name" | "email" | "company" | "service" | "budget" | "description" | "preferred_language" | "consent";
type Errors = Partial<Record<FieldName, string>>;

const DESCRIPTION_MIN = 20;
const DESCRIPTION_MAX = 5000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const fieldClass =
  "block w-full rounded-[var(--radius-md)] border bg-bg px-3.5 py-2.5 text-fg placeholder:text-subtle " +
  "transition-[border-color,box-shadow] outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/25 " +
  "aria-[invalid=true]:border-danger/70";

export function InquiryForm({ services }: { services: ServiceOption[] }) {
  const t = useTranslations("Form");
  const locale = useLocale() as Locale;
  const formId = useId();
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  const [values, setValues] = useState<InquiryPayload>({
    name: "",
    email: "",
    company: "",
    service: "",
    budget: "",
    description: "",
    preferred_language: locale,
    consent: false,
    website: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<InquiryReceipt | null>(null);

  function validate(next: InquiryPayload): Errors {
    const result: Errors = {};
    if (!next.name.trim()) result.name = t("errorNameRequired");
    if (!next.email.trim()) result.email = t("errorEmailRequired");
    else if (!EMAIL_PATTERN.test(next.email.trim())) result.email = t("errorEmailInvalid");
    const length = next.description.trim().length;
    if (length < DESCRIPTION_MIN) result.description = t("errorDescriptionShort");
    else if (length > DESCRIPTION_MAX) result.description = t("errorDescriptionLong");
    if (!next.consent) result.consent = t("errorConsent");
    return result;
  }

  function update<K extends keyof InquiryPayload>(key: K, value: InquiryPayload[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    // After the first submit attempt, re-validate as the visitor corrects fields.
    if (submitted) setErrors(validate(next));
  }

  /** Server field errors are mapped to localized messages where we know the rule. */
  function localizeServerErrors(fields: Record<string, string[]>): Errors {
    const known: Partial<Record<FieldName, string>> = {
      name: t("errorNameRequired"),
      email: t("errorEmailInvalid"),
      description: values.description.trim().length > DESCRIPTION_MAX ? t("errorDescriptionLong") : t("errorDescriptionShort"),
      consent: t("errorConsent"),
    };
    const result: Errors = {};
    for (const [field, messages] of Object.entries(fields)) {
      if (field in known || ["company", "service", "budget", "preferred_language"].includes(field)) {
        const name = field as FieldName;
        result[name] = known[name] ?? messages[0];
      }
    }
    return result;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitted(true);
    setFormError("");

    const clientErrors = validate(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiRequest<InquiryReceipt>("inquiries/", {
        method: "POST",
        body: {
          ...values,
          name: values.name.trim(),
          email: values.email.trim(),
          company: values.company.trim(),
          description: values.description.trim(),
        },
      });
      setReceipt(result);
      requestAnimationFrame(() => successRef.current?.focus());
    } catch (error) {
      if (error instanceof ApiError && error.status === 400 && Object.keys(error.fields).length > 0) {
        const serverErrors = localizeServerErrors(error.fields);
        setErrors(serverErrors);
        if (Object.keys(serverErrors).length === 0) setFormError(t("errorGeneric"));
      } else if (error instanceof ApiError && error.status === 429) {
        setFormError(t("errorThrottled"));
      } else if (error instanceof ApiError && error.status === 0) {
        setFormError(t("errorNetwork"));
      } else {
        setFormError(t("errorGeneric"));
      }
      requestAnimationFrame(() => summaryRef.current?.focus());
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setValues((current) => ({ ...current, description: "", service: "", budget: "", consent: false }));
    setErrors({});
    setSubmitted(false);
    setReceipt(null);
  }

  const errorCount = Object.keys(errors).length;
  const id = (name: string) => `${formId}-${name}`;
  const describedBy = (name: FieldName, extra?: string) =>
    [extra, errors[name] ? id(`${name}-error`) : null].filter(Boolean).join(" ") || undefined;

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="wait" initial={false}>
          {receipt ? (
            <m.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
              className="rounded-[var(--radius-lg)] border border-success/30 bg-success/5 p-8"
              role="status"
            >
              <CircleCheck className="size-8 text-success" aria-hidden />
              <h2 ref={successRef} tabIndex={-1} className="mt-5 text-2xl font-semibold outline-none">
                {t("successTitle")}
              </h2>
              <p className="mt-3 leading-relaxed text-muted">
                {t("successBody", { reference: receipt.reference, email: values.email.trim() })}
              </p>
              <Button variant="secondary" className="mt-8" onClick={reset}>
                {t("sendAnother")}
              </Button>
            </m.div>
          ) : (
            <m.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              noValidate
              onSubmit={onSubmit}
              aria-labelledby={id("legend")}
              aria-busy={submitting}
              className="relative space-y-6"
            >
              <h2 id={id("legend")} className="sr-only">
                {t("legend")}
              </h2>

              <div
                ref={summaryRef}
                tabIndex={-1}
                aria-live="assertive"
                className={cn(
                  "outline-none",
                  // Stays in the DOM for screen-reader announcements; takes no space while empty.
                  !(formError || (submitted && errorCount > 0)) && "-mb-6",
                  (formError || (submitted && errorCount > 0)) &&
                    "flex gap-3 rounded-[var(--radius-md)] border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-fg",
                )}
              >
                {formError || (submitted && errorCount > 0) ? (
                  <>
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
                    <p>{formError || t("errorSummary")}</p>
                  </>
                ) : null}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field id={id("name")} label={t("name")} required requiredLabel={t("required")} error={errors.name} errorId={id("name-error")}>
                  <input
                    id={id("name")}
                    name="name"
                    autoComplete="name"
                    maxLength={120}
                    value={values.name}
                    onChange={(e) => update("name", e.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={describedBy("name")}
                    aria-required
                    className={cn(fieldClass, "border-line-strong")}
                  />
                </Field>
                <Field id={id("email")} label={t("email")} required requiredLabel={t("required")} error={errors.email} errorId={id("email-error")}>
                  <input
                    id={id("email")}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    dir="ltr"
                    maxLength={254}
                    value={values.email}
                    onChange={(e) => update("email", e.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={describedBy("email")}
                    aria-required
                    className={cn(fieldClass, "border-line-strong rtl:text-right")}
                  />
                </Field>
              </div>

              <Field id={id("company")} label={t("company")} optionalLabel={t("optional")} error={errors.company} errorId={id("company-error")}>
                <input
                  id={id("company")}
                  name="company"
                  autoComplete="organization"
                  maxLength={160}
                  value={values.company}
                  onChange={(e) => update("company", e.target.value)}
                  aria-invalid={Boolean(errors.company)}
                  aria-describedby={describedBy("company")}
                  className={cn(fieldClass, "border-line-strong")}
                />
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field id={id("service")} label={t("service")} optionalLabel={t("optional")} error={errors.service} errorId={id("service-error")}>
                  <select
                    id={id("service")}
                    name="service"
                    value={values.service}
                    onChange={(e) => update("service", e.target.value)}
                    aria-invalid={Boolean(errors.service)}
                    aria-describedby={describedBy("service")}
                    className={cn(fieldClass, "border-line-strong")}
                  >
                    <option value="">{t("servicePlaceholder")}</option>
                    {services.map((service) => (
                      <option key={service.key} value={service.key}>
                        {service.title}
                      </option>
                    ))}
                    <option value="other">{t("serviceOther")}</option>
                  </select>
                </Field>
                <Field id={id("budget")} label={t("budget")} optionalLabel={t("optional")} error={errors.budget} errorId={id("budget-error")}>
                  <select
                    id={id("budget")}
                    name="budget"
                    value={values.budget}
                    onChange={(e) => update("budget", e.target.value as InquiryPayload["budget"])}
                    aria-invalid={Boolean(errors.budget)}
                    aria-describedby={describedBy("budget")}
                    className={cn(fieldClass, "border-line-strong")}
                  >
                    <option value="">{t("budgetPlaceholder")}</option>
                    {BUDGET_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {t(`budget_${option}`)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field
                id={id("description")}
                label={t("description")}
                required
                requiredLabel={t("required")}
                error={errors.description}
                errorId={id("description-error")}
              >
                <p id={id("description-hint")} className="mb-2 text-sm text-subtle">
                  {t("descriptionHint")}
                </p>
                <textarea
                  id={id("description")}
                  name="description"
                  rows={7}
                  maxLength={DESCRIPTION_MAX}
                  value={values.description}
                  onChange={(e) => update("description", e.target.value)}
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby={describedBy("description", id("description-hint"))}
                  aria-required
                  className={cn(fieldClass, "min-h-40 resize-y border-line-strong leading-relaxed")}
                />
                <p className="mt-1.5 text-end text-xs text-subtle" dir="ltr" aria-hidden>
                  {t("characters", { count: values.description.trim().length, max: DESCRIPTION_MAX })}
                </p>
              </Field>

              <fieldset>
                <legend className="mb-3 text-sm font-medium text-fg">{t("preferredLanguage")}</legend>
                <div className="flex flex-wrap gap-2">
                  {locales.map((l) => (
                    <label
                      key={l}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/50",
                        values.preferred_language === l ? "border-accent/60 bg-accent/10 text-fg" : "border-line text-muted hover:text-fg",
                      )}
                    >
                      <input
                        type="radio"
                        name="preferred_language"
                        value={l}
                        checked={values.preferred_language === l}
                        onChange={() => update("preferred_language", l)}
                        className="sr-only"
                      />
                      <span lang={l}>{localeNames[l]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Honeypot: invisible to people, tempting to bots. The server rejects non-empty values. */}
              <div aria-hidden className="absolute -start-[9999px] h-px w-px overflow-hidden">
                <label htmlFor={id("website")}>{t("honeypot")}</label>
                <input
                  id={id("website")}
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.website}
                  onChange={(e) => update("website", e.target.value)}
                />
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={values.consent}
                    onChange={(e) => update("consent", e.target.checked)}
                    aria-invalid={Boolean(errors.consent)}
                    aria-describedby={describedBy("consent")}
                    aria-required
                    className="mt-0.5 size-4.5 shrink-0 accent-[var(--color-accent)]"
                  />
                  <span>
                    {t.rich("consent", {
                      // New tab, so the visitor does not lose what they have typed.
                      link: (chunks) => (
                        <Link href="/privacy" target="_blank" className="text-accent underline underline-offset-2 hover:text-fg">
                          {chunks}
                        </Link>
                      ),
                    })}
                  </span>
                </label>
                {errors.consent ? (
                  <p id={id("consent-error")} className="mt-2 text-sm text-danger">
                    {errors.consent}
                  </p>
                ) : null}
              </div>

              <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
                {submitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" aria-hidden />
                    {t("submitting")}
                  </>
                ) : (
                  t("submit")
                )}
              </Button>
              <p className="sr-only" aria-live="polite">
                {submitting ? t("submitting") : ""}
              </p>
            </m.form>
          )}
        </AnimatePresence>
      </MotionConfig>
    </LazyMotion>
  );
}

function Field({
  id,
  label,
  required,
  requiredLabel,
  optionalLabel,
  error,
  errorId,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  requiredLabel?: string;
  optionalLabel?: string;
  error?: string;
  errorId: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-baseline gap-2 text-sm font-medium text-fg">
        {label}
        {required ? (
          <span className="text-accent" aria-hidden>
            *
          </span>
        ) : null}
        {required && requiredLabel ? <span className="sr-only">({requiredLabel})</span> : null}
        {!required && optionalLabel ? <span className="text-xs font-normal text-subtle">({optionalLabel})</span> : null}
      </label>
      {children}
      {error ? (
        <p id={errorId} className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
