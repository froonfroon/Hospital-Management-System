# HospitalOS by Solve Codex

**HospitalOS** is a modern, enterprise-grade healthcare operating system frontend foundation engineered for hospitals, medical centers, and acute care facilities.

Built with **Next.js App Router**, **React 19**, **TypeScript in strict mode**, **Tailwind CSS v4**, **shadcn / Radix UI**, **Lucide React**, **React Hook Form**, **Zod**, **TanStack Table**, and **Recharts**.

---

## Key Features

1. **Enterprise Healthcare Visual Identity**:
   - Deep navy navigation shell (`#0a192f` / `#0f233f`).
   - Clean, light neutral surfaces (`#f8fafc` / `#ffffff`).
   - Restrained medical cyan action accents (`#0891b2`).
   - Semantic clinical status palette (Stable / Warning / Emergent / Critical Code Blue).
   - High-density data tables and compact card metrics without marketing fluff.

2. **Complete Global Application Shell**:
   - Responsive collapsible sidebar with navigation groups and live acuity badge counters.
   - Global Patient Quick Search modal with instant fuzzy search (`Ctrl + K`).
   - Clinical Notification Drawer with STAT vitals and abnormal lab alerts.
   - Active Department & Role switcher (Cardiology, ICU, Emergency, Surgery, Pediatrics).
   - User profile menu with medical license confirmation and session expiry status.
   - Contextual Help and Emergency Triage Protocols guide (`?` shortcut).
   - Fully responsive mobile drawer navigation.

3. **Bilingual Internationalization (Arabic & English)**:
   - Native bidirectional layout switching via HTML `dir="rtl"` / `dir="ltr"`.
   - Appropriate Arabic medical typography (`IBM Plex Sans Arabic` / `Cairo`).
   - Proper logical alignment (`start`, `end`, `ps-`, `pe-`, `border-s`, `border-e`, RTL icon mirroring).
   - Complete localized medical dictionaries (`en.ts` and `ar.ts`).

4. **Clinical Design System**:
   - 26 reusable UI primitives and composite components (Buttons, Inputs, Selects, Searchable Selects, Dialogs, Drawers, Tabs, Menus, Tooltips, Alerts, Badges, Data Tables, Pagination, Filter Bars, Breadcrumbs, Stat Cards, Timelines, Skeletons, Error Boundaries, Confirmation Dialogs, Form Sections, Patient Identity Headers, Audit Stamps, and Print Layouts).

5. **Patient Master Index Feature Module**:
   - Multi-facet search and filter toolbar.
   - TanStack Data Table with multi-column sorting and loading skeletons.
   - Inpatient admission dialog with React Hook Form and Zod schema validation.
   - Slide-over clinical chart inspection drawer with interactive Recharts vital sign trend lines, active medication orders, and SOAP progress notes.
   - Guarded discharge action with confirmation dialog.

6. **Fail-Safe Data Integration Layer**:
   - Typed API client with request correlation IDs (`X-Correlation-ID`), timeout handling, and request cancellation.
   - Dedicated synthetic development data adapter (`NEXT_PUBLIC_USE_DEV_FIXTURES="true"`).
   - Real API errors are never masked with fake data.

---

## Getting Started

### Prerequisites
- Node.js `v20.x` or later (tested on Node `v24`)
- npm `v10.x` or later

### Installation
```bash
npm install --legacy-peer-deps
```

### Environment Configuration
Copy the template configuration:
```bash
cp .env.example .env.local
```

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Quality Gates & Verification

### Run TypeScript Strict Check
```bash
npx tsc --noEmit
```

### Run Vitest Unit & Integration Tests
```bash
npm test
```

### Run Production Build
```bash
npm run build
```

### Run Playwright End-to-End Tests
```bash
npm run test:e2e
```

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Open Global Patient Search modal |
| `?` | Open Clinical Help & Triage Guidelines |
| `Esc` | Close any active modal, drawer, or search dialog |
| `Ctrl + P` / `Cmd + P` | Print active clinical face sheet or registry view |

---

## License & Attribution
Developed for **HospitalOS by Solve Codex**. All rights reserved.
