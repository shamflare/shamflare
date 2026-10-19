# SHAMFLARE — MASTER PROJECT PROMPT
## Premium Software Development Company Website & Full-Stack CMS

You are the lead software architect, senior full-stack engineer, UI/UX designer, database architect, security engineer, and QA engineer responsible for building **Shamflare**, a premium, production-oriented software development company website and content management platform.

Your mission is to transform the existing project in this VS Code workspace into a polished, distinctive, secure, responsive, multilingual digital presence for Shamflare.

Do not merely generate a landing page. Build a coherent, maintainable full-stack application with a real backend, database, content management system, administrator dashboard, and working user-facing functionality.

Take ownership of the engineering process. Inspect the repository, make sound technical decisions, implement the project incrementally, run available checks, and fix the problems you discover.

---

# 1. COMPANY IDENTITY AND BUSINESS OBJECTIVES

Company name: Shamflare

Domain: https://shamflare.com

Business: Software development and digital solutions.

Core services:
1. Website development.
2. Mobile application development.
3. Desktop application development.
4. Technical support, maintenance, and troubleshooting.

Future expansion:
- Website and application hosting services.
- Additional software and IT services.

Target customers:
- Businesses and enterprises.
- Startups.
- Small businesses.
- Individual customers and entrepreneurs.

Brand positioning:
Shamflare is a modern, reliable, engineering-driven software development company that turns ideas into useful digital products.

Proposed brand tagline:
"Turning Ideas Into Digital Products."

Treat this tagline as configurable content, not as a hardcoded assumption throughout the application.

Primary business objective:
Convert visitors into qualified project inquiries by clearly communicating Shamflare's capabilities, demonstrating its work, and making it easy to contact the company.

Secondary objectives:
- Build credibility.
- Showcase portfolio projects.
- Publish useful technical articles.
- Make website content manageable without editing source code.
- Establish a technical foundation that can evolve as the business grows.

Do not invent real clients, testimonials, certifications, awards, statistics, or completed commercial projects.

If real portfolio projects are not available, use clearly labeled demonstration projects or tasteful placeholders that the administrator can replace.

---

# 2. NON-NEGOTIABLE WORKING RULES

## 2.1 Inspect before changing

Before writing or modifying code:

1. Inspect the complete existing repository structure.
2. Read package manifests, configuration files, README files, environment examples, and existing source code.
3. Determine whether a frontend, backend, database schema, or other implementation already exists.
4. Identify the existing framework versions, installed dependencies, scripts, and development conventions.
5. Check the current Git status if Git is available.
6. Identify existing functionality that must be preserved.
7. Summarize your findings and propose an implementation plan.

Do not blindly replace the project, delete existing files, recreate an existing application from scratch, or overwrite working functionality.

Preserve unrelated user changes. Never expose, overwrite, or delete secrets or user data.

If the repository is empty, establish a clean project structure appropriate to the requirements below.

## 2.2 Work autonomously, but safely

Once the repository has been inspected and the implementation plan is clear, begin implementation without asking for approval after every routine step.

Make reasonable engineering decisions independently.

Ask a question only when a missing decision genuinely blocks progress or could cause a significant irreversible consequence.

Do not stop after producing a plan. Continue implementing the project in manageable phases.

Do not claim that a feature works merely because its code exists. Run relevant checks and report the actual results.

## 2.3 Do not fake functionality

Every visible button, form, navigation link, filter, language selector, and dashboard action must have a meaningful behavior.

Do not leave:
- Dead buttons.
- Empty page templates presented as finished features.
- Fake success messages.
- Hardcoded dashboard statistics pretending to be live data.
- Forms that discard submitted information.
- Language selectors that change labels inconsistently.
- Fake authentication.
- Placeholder API calls presented as working integrations.

If an external service cannot be configured because credentials are unavailable, implement the appropriate integration boundary, provide safe configuration instructions, and explain what remains necessary.

## 2.4 Keep documentation current

Maintain a useful README and update it when implementation decisions change.

Document important architectural decisions, environment variables, database setup, migrations, development commands, testing, and deployment.

---

# 3. VISUAL DESIGN AND BRAND SYSTEM

Create a distinctive, premium, modern technology-company aesthetic.

The website must immediately communicate software development, digital products, engineering, and technical expertise.

It must not look like a generic template generated from a standard SaaS landing-page prompt.

## 3.1 Design direction

Use a hybrid visual style:

- Dark, sophisticated, futuristic.
- Minimal and easy to navigate.
- Strong typography and clear visual hierarchy.
- Restrained gradients and luminous accents.
- Carefully composed spacing.
- Professional visual storytelling.
- Consistent components and interactions.
- Excellent readability and accessibility.

Suggested initial palette:

- Deep navy: #0B1220
- Secondary dark surface: #111B2D
- Primary text: #F8FAFC
- Secondary text: #A7B5CC
- Electric cyan: #67E8F9
- Blue accent: #38BDF8
- Restrained violet accent: #A78BFA

These values are a starting point. Refine them into a coherent design-token system and verify contrast in actual components.

Use CSS variables or the project's established token system for colors, spacing, radii, shadows, and typography.

Avoid excessive glow effects, neon overload, meaningless animations, oversized rounded cards everywhere, and unnecessary decorative elements.

## 3.2 Wordmark

Create a refined typographic Shamflare wordmark.

The wordmark must work in:
- The desktop navigation.
- Mobile navigation.
- The footer.
- The administrator login screen where appropriate.
- A compact favicon derived from the brand's typography or initials.

Use a high-quality typographic treatment rather than relying on an unrelated generic icon.

Do not assume that a styled text element is a completed custom logo asset. If no actual logo asset is available, build a consistent text-based wordmark and document how it can later be replaced with an SVG or other brand asset.

## 3.3 Hero section

Create a strong first impression with:

- A concise, meaningful headline.
- Supporting copy explaining what Shamflare builds.
- A primary CTA: "Start a Project".
- A secondary CTA: "Explore Our Services".
- A sophisticated visual representation of software engineering, digital products, interconnected systems, or application interfaces.

The hero visual should feel intentionally designed.

Prefer custom CSS/SVG compositions, carefully crafted UI mockups, or suitable licensed assets over random stock imagery.

Do not add a large image merely to fill space.

## 3.4 Motion and interaction

Use Motion where it meaningfully improves the experience.

Possible applications:
- Subtle entrance transitions.
- Navigation interactions.
- Carefully controlled hover effects.
- Small visual transitions between interface states.
- Reduced-motion alternatives.

Avoid animation that delays reading, causes layout shifts, or makes mobile navigation difficult.

Respect the user's reduced-motion preference.

## 3.5 Responsive behavior

Design mobile-first and verify:

- Small mobile screens.
- Standard mobile screens.
- Tablets.
- Laptops.
- Large desktop displays.

Navigation, forms, portfolio grids, tables, and dashboard layouts must adapt appropriately.

Do not solve mobile issues by simply shrinking desktop components.

## 3.6 Typography and icons

Choose readable typography with appropriate support for Latin, Turkish, and Arabic characters.

Use a consistent icon library such as Lucide.

Do not use emoji as substitutes for professional interface icons.

Ensure Arabic characters render correctly and do not become disconnected or clipped.

---

# 4. REQUIRED TECHNOLOGY STACK

Use the following architecture unless the existing repository contains a compelling, documented reason to adapt it.

## Frontend

- Next.js with React.
- TypeScript in strict mode.
- Tailwind CSS.
- Motion for selective animations.
- Lucide icons.
- A suitable internationalization library such as next-intl, or another compatible solution if justified.

Prefer stable, mutually compatible package versions.

Do not install unnecessary libraries simply to increase the technology count.

Use Next.js App Router if appropriate for the existing project.

Use server rendering and static rendering strategically, based on the content and data requirements.

Avoid placing the entire application in client-side components unnecessarily.

## Backend

- Python.
- Django.
- Django REST Framework.
- PostgreSQL.
- A suitable ORM-based data model using Django's built-in ORM.
- Django migrations.
- Django's security and authentication facilities.

Do not introduce a second ORM such as Prisma for the Django database.

Use Django REST Framework serializers, permissions, views/viewsets, routers, pagination, filtering, and validation where appropriate.

## Infrastructure

- Docker.
- Docker Compose.
- A reverse proxy such as Nginx or Caddy.
- HTTPS in production.
- Environment-based configuration.
- PostgreSQL with persistent storage.
- Separate media storage from application code.

Choose and document a sensible deployment topology.

The public website and Django API may run as separate services on the same VPS.

The PostgreSQL service must not be exposed directly to the public internet.

---

# 5. APPLICATION ARCHITECTURE

Use a clean separation of responsibilities.

Suggested repository structure, adapted to the existing project where necessary:

    shamflare/
      frontend/
        app/
        components/
        features/
        lib/
        messages/
        public/
        styles/
        tests/
        package.json
        Dockerfile

      backend/
        config/
        apps/
          core/
          services/
          portfolio/
          blog/
          inquiries/
          site_settings/
        tests/
        manage.py
        requirements.txt
        Dockerfile

      infrastructure/
        nginx/
      docker-compose.yml
      .env.example
      .gitignore
      README.md

This is a proposed structure, not a reason to move existing files unnecessarily.

Keep business logic out of presentation components.

Use reusable components and feature-based organization where useful.

Keep API configuration centralized in the frontend.

Use a consistent API error format and predictable loading, empty, success, and error states.

Version the API if doing so fits the project's complexity, for example under /api/v1/.

Document the architecture and the reasoning behind important decisions.

---

# 6. MULTILINGUAL EXPERIENCE

The website must support exactly these initial locales:

- English: en
- Turkish: tr
- Arabic: ar

English is the default language.

Provide an accessible language selector that remains easy to find on desktop and mobile.

Use locale-aware routes such as:

- /en
- /tr
- /ar

Adapt routing to the selected internationalization library and Next.js version.

## 6.1 Translation requirements

All public interface text must be translated.

This includes:
- Navigation.
- Buttons.
- Form labels and validation.
- Service descriptions.
- Footer content.
- Error messages.
- Empty states.
- Metadata where applicable.
- Cookie or privacy interface text if implemented.

Do not leave English labels embedded in otherwise translated pages.

## 6.2 Arabic RTL

When Arabic is selected:

- Set the correct document language.
- Set the document direction to RTL.
- Adjust layout and text alignment appropriately.
- Review navigation, breadcrumbs, forms, icons, and spacing.
- Avoid incorrectly reversing icons that represent non-directional concepts.
- Ensure the design remains coherent rather than mirroring every component mechanically.

English and Turkish must use LTR.

## 6.3 Content translation model

Dynamic content must support translations stored and managed through the backend.

Design a consistent, maintainable translation model for services, portfolio projects, blog posts, and relevant site content.

Choose between related translation tables or another normalized model based on the content requirements.

Requirements:

- One canonical content entity per service, project, or article.
- Separate locale-specific content.
- Stable identifiers or slugs where appropriate.
- Draft and publication status.
- Translation completeness tracking.
- No accidental duplicate records when editing translations.
- Predictable behavior when a translation is missing.

Do not display blank content or silently invent translations.

Define a sensible missing-translation strategy. For example, an unavailable localized item can be omitted from that locale's listing, with a clear fallback policy for other cases.

## 6.4 Admin translation editing

The administrator must be able to create and edit translations for all supported locales.

Provide separate, clearly labeled language sections or tabs.

Allow translations to be saved as drafts.

Make it clear when a translation is missing or incomplete.

Do not require editing source files or redeploying the application to update ordinary dynamic content.

Keep static application messages in locale message files. Dynamic content belongs in the database.

This distinction is intentional: editable content does not mean every UI label must be stored in PostgreSQL.

---

# 7. PUBLIC WEBSITE PAGES

Implement a coherent, complete public website.

## 7.1 Home

Include:

1. Hero section.
2. Company positioning and introduction.
3. Main services.
4. Selected portfolio projects.
5. How the company works.
6. Technology or capability highlights.
7. A clear project inquiry CTA.
8. Recent blog articles.
9. Footer with company information and contact links.

Use a natural visual flow rather than placing every possible section on the page.

## 7.2 About

Explain Shamflare's approach, engineering philosophy, quality standards, and customer collaboration.

Do not invent founding dates, staff biographies, physical offices, company size, or business achievements.

Keep configurable company content editable.

## 7.3 Services

Create an overview page and individual service pages for:

- Website Development.
- Mobile App Development.
- Desktop Application Development.
- Technical Support & Maintenance.

Each service detail page should support:

- Title and localized description.
- Relevant capabilities.
- Typical use cases.
- Process or delivery approach.
- Related portfolio projects where available.
- A clear project inquiry CTA.
- Appropriate metadata and SEO fields.

Keep the architecture open to future services such as Hosting.

Do not advertise hosting as an available commercial service until the administrator enables and publishes it.

## 7.4 Portfolio

Build a project listing and individual project detail pages.

Support:

- Project title and localized description.
- Cover image.
- Additional images when useful.
- Project category.
- Technologies used.
- Optional external project URL.
- Featured status.
- Publication status.
- Sort order.
- Locale-specific slug where appropriate.

Never fabricate customer identities, testimonials, performance results, or commercial outcomes.

Clearly identify demonstration projects when real work is unavailable.

## 7.5 Blog

Build a useful, maintainable blog with:

- Blog listing.
- Article detail pages.
- Categories.
- Cover images.
- Author display where supported.
- Draft and published states.
- Publication timestamps.
- Locale-specific titles and slugs.
- SEO title and description.
- Social sharing metadata.
- Pagination or an equivalent scalable listing strategy.

Use semantic HTML and accessible article layouts.

Do not generate dozens of meaningless articles merely to make the website look populated.

A small number of useful initial articles is preferable, and all sample content must be honest.

## 7.6 Contact and Start a Project

Build a polished project inquiry form.

Suggested fields:

- Name.
- Email.
- Optional company name.
- Service type.
- Estimated budget, optional.
- Project description.
- Preferred language.
- Consent checkbox where legally appropriate.

Do not make unnecessary personal information mandatory.

Requirements:

- Frontend validation for usability.
- Backend validation as the source of truth.
- Clear field-level errors.
- Accessible status announcements.
- Loading and duplicate-submission protection.
- Server-side spam mitigation.
- Rate limiting or equivalent abuse protection.
- Safe handling and storage of submitted data.
- A clear success message only after the server confirms successful persistence.

Store inquiries in PostgreSQL.

The inquiry must remain available to the administrator even when email integration is not configured.

Do not pretend that an email was sent when no email provider has been configured.

## 7.7 WhatsApp

Use the supplied company contact number:

+905343299918

Create a properly formatted WhatsApp link using the international number without the leading plus sign in the wa.me path.

Use an appropriate URL-encoded prefilled message when helpful.

Make the CTA visible without obscuring content or interfering with accessibility.

Use a configurable setting for the number and message rather than scattering the number across source files.

The administrator should be able to update the contact details through the dashboard.

---

# 8. DATABASE AND CONTENT MODEL

Design normalized Django models with appropriate constraints, indexes, timestamps, and relationships.

At minimum, evaluate models for:

- Service.
- ServiceTranslation.
- PortfolioProject.
- PortfolioProjectTranslation.
- BlogPost.
- BlogPostTranslation.
- BlogCategory and translations if required.
- ProjectInquiry.
- SiteSettings.
- Uploaded media references if appropriate.

Use Django's built-in user system for administration.

Avoid creating unnecessary custom user models unless a concrete requirement justifies one.

Choose clear, consistent field names.

Use publication status and draft handling for content.

Add sensible ordering and filtering.

Prevent invalid duplicate slugs within the relevant locale and content type.

Add database indexes for frequently queried fields.

Use migrations to evolve the schema.

Do not use destructive schema changes to solve ordinary development issues.

Avoid storing the same configurable company information in multiple unrelated tables.

Document the entity relationships and translation strategy.

---

# 9. ADMINISTRATOR DASHBOARD

Build a professional, private administration experience.

Suggested route: /admin.

Use a visually consistent interface with the public brand, but prioritize productivity and clarity over decorative effects.

The dashboard must support a single administrator initially.

## 9.1 Authentication and authorization

Use secure authentication integrated with Django.

Choose an authentication strategy compatible with the deployment architecture.

Evaluate secure HttpOnly cookies and Django session authentication where appropriate.

If token authentication is chosen, justify the choice and protect tokens properly.

Do not store long-lived authentication tokens in localStorage.

Protect all write operations using appropriate authentication, permissions, and CSRF protections where applicable.

The backend must enforce authorization independently of frontend visibility.

Do not permit public registration for dashboard accounts.

Do not ship default production administrator credentials.

Document the secure process for creating the first administrator.

## 9.2 Dashboard features

Implement:

- Overview with real database-backed statistics.
- Services management.
- Portfolio management.
- Blog and category management.
- Translation management.
- Inquiry management.
- Site settings.
- Media management or integration with the selected media workflow.

Inquiry statuses should include meaningful states such as:

- New.
- In progress.
- Completed.
- Archived.

Provide filtering, pagination, sorting where useful, and clear empty states.

Content management should support create, read, update, and delete operations, with publication controls and confirmation for destructive actions.

Where practical, offer preview before publishing.

Use Django Admin as a useful internal fallback and operational tool, but do not treat the uncustomized Django Admin as the entire custom dashboard requested here.

The custom dashboard and Django Admin must share the same underlying data and permissions.

---

# 10. API DESIGN

Use Django REST Framework for the backend API.

Design consistent endpoints for public content and protected administration.

Possible public endpoint groups:

- /api/v1/services/
- /api/v1/portfolio/
- /api/v1/blog/
- /api/v1/blog/categories/
- /api/v1/inquiries/
- /api/v1/site-settings/

Protected administration endpoints should use explicit permissions and must not expose management functionality to anonymous visitors.

Adapt exact endpoint naming to the final implementation, but keep it consistent and documented.

Requirements:

- Serializer-based validation.
- Appropriate HTTP status codes.
- Consistent error responses.
- Pagination.
- Filtering and search where useful.
- Locale-aware content retrieval.
- Explicit field exposure.
- No accidental disclosure of internal fields.
- API documentation where practical.
- Correct CORS and CSRF configuration for the chosen frontend/backend origin arrangement.

Never solve CORS or authentication issues by allowing every origin or disabling security protections globally.

Use environment-specific settings for local development and production.

---

# 11. SEO, ACCESSIBILITY, AND PERFORMANCE

## SEO

Implement:

- Locale-aware page metadata.
- Unique titles and descriptions.
- Canonical URLs where appropriate.
- hreflang annotations for valid localized equivalents.
- Sitemap generation.
- robots.txt.
- Open Graph metadata.
- Semantic headings.
- Meaningful image alt text.
- Clean URLs.
- Structured data only when accurate and appropriate.

Do not claim ratings, awards, addresses, or other business facts that have not been provided.

## Accessibility

Target WCAG 2.2 AA principles where practical.

Include:

- Keyboard navigation.
- Visible focus indicators.
- Semantic HTML.
- Accessible forms.
- Appropriate ARIA only where necessary.
- Sufficient contrast.
- Accessible menus and dialogs.
- Screen-reader status messages.
- Reduced-motion support.
- Proper document language and direction.

## Performance

Optimize for real-world loading performance.

Use:

- Appropriate Next.js rendering strategies.
- Optimized image delivery.
- Responsive image sizes.
- Lazy loading where appropriate.
- Font optimization.
- Minimal unnecessary client-side JavaScript.
- Efficient API queries.
- Pagination for growing content.
- Caching only where safe and correctly invalidated.

Avoid unnecessary dependencies and oversized animation libraries or media.

Set performance budgets and measure results when tooling is available.

Do not claim a perfect Lighthouse score without measuring it.

---

# 12. SECURITY REQUIREMENTS

Security must be implemented, not merely described in the README.

At minimum:

1. Keep secrets out of source code and Git.
2. Provide a complete .env.example with placeholder values only.
3. Validate and sanitize untrusted input appropriately.
4. Enforce server-side authorization for all protected operations.
5. Configure Django production security settings.
6. Protect against CSRF where applicable.
7. Configure CORS narrowly.
8. Use secure cookie settings in production.
9. Apply request throttling and spam mitigation to public forms.
10. Avoid exposing detailed internal errors to visitors.
11. Restrict upload types and sizes.
12. Prevent unsafe file path handling.
13. Use least-privilege database credentials.
14. Keep PostgreSQL private.
15. Use HTTPS in production.
16. Configure security headers through Django and/or the reverse proxy.
17. Avoid committing database files, uploaded customer data, logs, secrets, or local environment files.
18. Use supported dependency versions and review dependency vulnerabilities where tools permit.
19. Document database backup and restoration procedures.
20. Ensure destructive operations require appropriate permissions and confirmation.

Use Django's deployment checklist as part of production preparation.

Reference:
https://docs.djangoproject.com/en/stable/howto/deployment/checklist/

Do not claim the application is production-secure merely because these items appear in the plan.

---

# 13. EMAIL INTEGRATION — PREPARED, NOT ACTIVATED

Email integration will be configured later.

For now:

- Store inquiries reliably in the database.
- Keep the notification workflow separate from the core submission workflow.
- Define a clean interface for future email notifications.
- Add documented environment variables for a future provider.
- Do not invent provider credentials.
- Do not send fake email success responses.
- Ensure the absence of email configuration does not cause a successfully stored inquiry to be reported as failed.

Document the steps required to activate notifications later.

---

# 14. FUTURE HOSTING SERVICES

Hosting is a future business service, not an active feature for launch.

Do not build a hosting control panel, subscription billing system, server provisioning platform, or customer infrastructure management system in this phase.

Keep the service model extensible so that a Hosting service can later be published through the existing CMS.

Do not expose incomplete hosting functionality to visitors.

---

# 15. DOCKER AND VPS DEPLOYMENT

Prepare the application for deployment to a VPS owned or selected by the company.

The initial VPS has not yet been purchased, so do not assume a provider, IP address, or server hostname.

Use Docker Compose to coordinate the application services.

Provide appropriate configuration for:

- Next.js frontend.
- Django backend.
- PostgreSQL.
- Reverse proxy.
- Persistent media and database storage.
- Health checks where appropriate.
- Restart policies.
- Production environment variables.
- Internal service networking.

Use a non-root container user where practical.

Do not expose PostgreSQL publicly.

Do not use Django's development server in production.

Do not use Next.js development mode in production.

Provide an appropriate production start command and build process.

Configure HTTPS using a suitable reverse proxy and certificate strategy.

Document DNS requirements for shamflare.com without assuming the current DNS provider.

Keep local development convenient while ensuring production configuration is separate.

Provide a deployment checklist that includes:

- DNS.
- Firewall rules.
- Environment variables.
- Database migrations.
- Administrator creation.
- Static and media files.
- HTTPS.
- Backups.
- Health checks.
- Logging.
- Rollback considerations.

Do not perform destructive production actions without explicit authorization.

---

# 16. TESTING AND QUALITY ASSURANCE

Testing is part of implementation, not a final optional task.

Use suitable tools for the selected stack.

Frontend checks should include:

- TypeScript type checking.
- Linting.
- Production build.
- Component or integration tests where appropriate.
- Form validation tests.
- Locale and RTL tests.
- Navigation tests.
- Critical user flow tests.

Backend checks should include:

- Django system checks.
- Model and migration validation.
- Serializer validation tests.
- API tests.
- Authentication and permission tests.
- Inquiry submission tests.
- Translation behavior tests.
- Publication and draft tests.
- Upload validation tests where applicable.

Test important end-to-end journeys when suitable browser testing tools are available.

At minimum, verify:

1. A visitor can browse the main pages.
2. Language switching works.
3. Arabic layout uses RTL correctly.
4. Published content is retrieved from the backend.
5. Unpublished content is not publicly exposed.
6. An inquiry is validated and stored.
7. A visitor cannot access protected administration operations.
8. The administrator can sign in.
9. The administrator can manage content and translations.
10. The administrator can review inquiries.
11. Missing translations behave as documented.
12. The production build completes successfully.
13. Docker services start using the documented configuration.

If a tool, credential, or environment limitation prevents a test, state exactly what could not be tested and why.

Never claim a test passed unless it actually ran and passed.

---

# 17. IMPLEMENTATION PHASES

Implement the project incrementally in the following order.

## Phase 0 — Repository discovery

Inspect the repository, identify the existing implementation, and document findings.

Deliver:
- Repository assessment.
- Architecture proposal.
- Implementation checklist.
- Important risks and compatibility issues.

Then proceed with implementation.

## Phase 1 — Foundation and design system

Implement:
- Project configuration.
- Shared design tokens.
- Typography.
- Wordmark.
- Navigation.
- Footer.
- Responsive layout.
- Shared buttons, forms, cards, and other necessary components.

Establish the intended visual quality before building every page.

## Phase 2 — Public website

Implement the main pages, service pages, portfolio, blog presentation, contact flow, and WhatsApp integration.

Use realistic initial content without inventing company facts.

## Phase 3 — Backend and database

Implement Django, Django REST Framework, PostgreSQL configuration, models, migrations, serializers, API endpoints, validation, and permissions.

Ensure public endpoints only expose published content.

## Phase 4 — Internationalization and CMS

Complete the three-language architecture and editable content translations.

Implement publication states, translation completeness, slugs, and locale-aware content delivery.

## Phase 5 — Administrator dashboard

Implement authentication and the custom dashboard.

Connect every management interface to the real backend.

Implement content management, translations, site settings, and inquiry management.

## Phase 6 — Security and integrations

Harden configuration, validation, permissions, uploads, abuse prevention, and environment separation.

Prepare the future email integration without pretending it is active.

## Phase 7 — Deployment preparation

Implement Docker configuration, reverse proxy configuration, health checks, persistent storage, environment templates, and deployment documentation.

## Phase 8 — Testing and refinement

Run available checks and tests.

Fix failures, improve responsive layouts, review accessibility, and eliminate broken interactions.

Revisit visual consistency and performance after the complete application is integrated.

Do not mark the project complete while critical functionality remains broken.

If context or time limits prevent finishing every phase in one session, leave the repository in a coherent state and report the exact completed and remaining tasks.

---

# 18. DEFINITION OF DONE

The project is considered ready for a deployment review only when:

- The visual identity is coherent and professional.
- The main public pages are implemented.
- The three locales work correctly.
- Arabic RTL has been checked.
- Dynamic content is served from Django.
- PostgreSQL migrations are present and reproducible.
- The contact form persists inquiries.
- WhatsApp links work.
- Portfolio and blog content can be managed.
- The administrator can manage translations.
- Authentication and permissions are enforced on the backend.
- Unpublished content remains private.
- No critical buttons or forms are knowingly nonfunctional.
- Environment variables are documented.
- Docker configuration is available.
- Relevant automated checks have been run.
- Deployment and backup instructions are documented.
- Known limitations are explicitly reported.

A successful local build is not proof that the application has been deployed or is accessible on the public domain.

---

# 19. FINAL EXECUTION INSTRUCTIONS

Begin by inspecting the existing repository.

Then provide a concise assessment and a phased plan.

After that, implement the project rather than stopping at recommendations or mockups.

Prioritize correctness, coherent architecture, visual quality, security, and working functionality over unnecessary complexity.

Use your engineering judgment to resolve routine decisions.

Do not repeatedly ask the user to approve ordinary implementation details.

Do not fabricate external credentials, test results, customer data, or deployment success.

Keep documentation updated as the project evolves.

At the end of each major phase, report:
- What was implemented.
- Which files or areas changed.
- Which commands and tests were run.
- Which checks passed or failed.
- Any decisions or limitations requiring attention.
- The next concrete implementation step.

Your objective is to deliver a genuinely useful, premium-quality, multilingual software company website and CMS for Shamflare — not merely an attractive screenshot.

Start with repository discovery now.