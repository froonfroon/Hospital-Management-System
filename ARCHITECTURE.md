# HospitalOS by Solve Codex - Frontend Architecture Documentation

HospitalOS is an enterprise healthcare operating system built with **Next.js App Router**, **React 19**, **TypeScript in strict mode**, **Tailwind CSS**, and **shadcn / Radix UI** primitives. It is designed for high-density clinical workflows across general hospitals, specialized departments, and emergency care facilities.

---

## 1. Architectural Philosophy

Clinical software operates under strict reliability, cognitive-load, and regulatory constraints. Unlike consumer web products or marketing dashboards:
- **No decorative clutter**: Low cognitive load, high contrast, compact vertical padding, restrained healthcare color tokens.
- **Data density & glanceability**: Critical vitals, medical record numbers (MRNs), bed locations, and triage acuteness are immediately visible without excessive drilling.
- **Fail-safe Data Layer**: Clean separation between live HTTP gateways and synthetic clinical fixtures; real failures are never masked with mock data.
- **Dual-direction Internationalization (i18n)**: Native bidirectional support for Arabic (RTL) and English (LTR) using the document `dir` attribute, CSS logical properties, and clinical medical dictionaries.
- **Accessibility (WCAG 2.2 AA)**: Fully operable via keyboard shortcuts (`Ctrl+K` for global patient search, `?` for clinical help), visible focus indicators, and screen-reader ARIA announcements.

---

## 2. Directory & Module Structure

```
├── .env.example                       # Documented environment variables
├── .env.local                         # Active local configuration
├── vitest.config.ts                   # Vitest configuration for unit tests
├── playwright.config.ts               # Playwright E2E configuration
├── e2e/
│   └── basic.spec.ts                  # End-to-end integration test
└── src/
    ├── api/                           # Data integration layer
    │   ├── client.ts                  # Typed HTTP client with correlation IDs, timeout, cancellation
    │   ├── fixtures.ts                # Synthetic clinical fixtures (patients, vitals, beds, notes)
    │   ├── adapter.ts                 # Dedicated data adapter (switches between real API & fixtures)
    │   └── __tests__/                 # API and adapter test suite
    ├── auth/                          # Authentication & RBAC
    │   ├── authorization.ts           # Department models, role permissions, active session
    │   └── auth-context.tsx           # Session context, active role & department switcher
    ├── components/
    │   ├── ui/                        # Reusable clinical design system
    │   │   ├── button.tsx             # Semantic buttons with loading spinner & variants
    │   │   ├── input.tsx              # Input with focus rings and error states
    │   │   ├── select.tsx             # Accessible select with RTL arrow mirroring
    │   │   ├── date-picker.tsx        # Clinical date picker
    │   │   ├── searchable-select.tsx  # Keyboard-accessible popover search select
    │   │   ├── dialog.tsx             # Accessible modal dialogs with focus trap
    │   │   ├── drawer.tsx             # Slide-over drawers (RTL/LTR docking)
    │   │   ├── tabs.tsx               # Accessible tabs
    │   │   ├── dropdown-menu.tsx      # Menu with keyboard navigation
    │   │   ├── tooltip.tsx            # Contextual micro-tooltips
    │   │   ├── alert.tsx              # Clinical severity alerts
    │   │   ├── status-badge.tsx       # Triage & acuity badges with semantic color dots
    │   │   ├── data-table.tsx         # Data-dense TanStack table with sorting & skeletons
    │   │   ├── pagination.tsx         # Accessible pagination with bidirectional arrows
    │   │   ├── filter-bar.tsx         # Multi-facet filtering toolbar
    │   │   ├── breadcrumbs.tsx        # Hierarchical breadcrumb navigation
    │   │   ├── page-header.tsx        # Standardized page title, actions, and breadcrumb slot
    │   │   ├── stat-card.tsx          # Data-dense KPI metric card
    │   │   ├── timeline.tsx           # Chronological clinical event stream
    │   │   ├── empty-state.tsx        # Zero-state placeholder
    │   │   ├── loading-skeleton.tsx   # Loading placeholders
    │   │   ├── error-boundary.tsx     # React ErrorBoundary with reset trigger
    │   │   ├── confirmation-dialog.tsx# Guarded action modal (e.g. Discharges, Order Stop)
    │   │   ├── form-section.tsx       # Grouped clinical form layout
    │   │   ├── patient-identity-header.tsx # Persistent patient banner (MRN, Age, Allergies, Bed)
    │   │   ├── audit-stamp.tsx        # Electronic signature & audit timestamp
    │   │   ├── print-container.tsx    # Media print layout with letterhead
    │   │   └── __tests__/             # Unit tests for shared UI components
    │   ├── shell/                     # Global application shell
    │   │   ├── app-shell.tsx          # Root layout shell
    │   │   ├── sidebar.tsx            # Deep navy collapsible sidebar
    │   │   ├── top-nav.tsx            # Top bar with search trigger, notifications & profile
    │   │   ├── global-patient-search.tsx # Instant search modal (Ctrl+K)
    │   │   ├── notification-center.tsx# STAT clinical alert drawer
    │   │   ├── department-role-selector.tsx # Active department and role switcher
    │   │   ├── user-profile-menu.tsx  # User info and session validity
    │   │   ├── contextual-help-modal.tsx # Clinical triage scale & shortcut guide
    │   │   ├── mobile-nav.tsx         # Responsive mobile navigation drawer
    │   │   └── shell-context.tsx      # Global UI states and keybinding listeners
    │   └── common/
    │       └── state-views.tsx        # Loading, Empty, Error, and Unauthorized state views
    ├── features/
    │   └── patients/                  # Patient Master Index & Admission Feature
    │       ├── schemas.ts             # Zod validation schemas for admission & vitals
    │       └── components/
    │           ├── patient-registry-table.tsx     # TanStack patient table
    │           ├── patient-registration-dialog.tsx# Inpatient admission modal
    │           ├── patient-clinical-drawer.tsx    # Slide-over clinical chart
    │           └── vitals-chart.tsx               # Recharts hemodynamics stream
    ├── i18n/                          # Localization architecture
    │   ├── config.ts
    │   ├── i18n-context.tsx           # Context updating document.documentElement.dir & lang
    │   └── translations/
    │       ├── en.ts                  # English healthcare dictionary
    │       └── ar.ts                  # Arabic healthcare dictionary
    ├── tokens/
    │   └── design-tokens.ts           # Semantic colors, typography, elevations, focus states
    └── types/                         # TypeScript strict definitions
        ├── common.ts                  # Locales, Pagination, Audit, Departments
        ├── clinical.ts                # Vitals, TriageLevels, Medications, SOAP Notes
        ├── patient.ts                 # Full Patient Master Entity
        ├── api.ts                     # Envelope types, ApiError, RequestOptions
        └── auth.ts                    # UserSession, Permissions, RBAC
```

---

## 3. Data Integration Layer

### 3.1 Base HTTP Client (`src/api/client.ts`)
- Configured via `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_API_TIMEOUT_MS`.
- Automatically injects correlation headers (`X-Correlation-ID`) into every request.
- Handles cancellation via `AbortController` and custom abort signals.
- Transparently traps `401 Unauthorized` / expired sessions, triggering session refresh handlers.
- Standardizes errors into typed `ApiError` objects containing English & Arabic messages, HTTP status codes, and field validation errors.

### 3.2 Development Data Adapter (`src/api/adapter.ts`)
- Explicit environment gate: `NEXT_PUBLIC_USE_DEV_FIXTURES="true"` invokes the synthetic clinical development adapter; setting to `"false"` routes strictly to real backend endpoints.
- **Zero Silent Fallback**: If the real API request fails, it throws a legitimate typed `ApiError` rather than silently degrading into fake data.

---

## 4. Internationalization & RTL Engineering

- Localization is achieved natively through `document.documentElement.dir` (`ltr` vs `rtl`) and `document.documentElement.lang` (`en` vs `ar`).
- No fragile CSS hack overrides: all layouts leverage CSS logical properties (e.g. `start`, `end`, `ps-`, `pe-`, `border-s`, `border-e`, `rtl:rotate-180`).
- Professional medical Arabic typography with `IBM Plex Sans Arabic` and `Cairo`.
- Instant language toggle in the top bar with persistent local storage.

---

## 5. Security & Sensitive Information Hygiene

- Strict compliance with Next.js environment security: client-side variables are restricted to harmless UI flags (`NEXT_PUBLIC_USE_DEV_FIXTURES`, `NEXT_PUBLIC_DEFAULT_LOCALE`).
- API tokens, service accounts, and database secrets are never exposed in client bundles.
