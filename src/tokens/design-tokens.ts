/**
 * HospitalOS Enterprise Design Tokens
 * ────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH — all values here must match :root in
 * src/app/globals.css exactly.  When changing a color, update
 * BOTH this file AND the corresponding CSS variable.
 * ────────────────────────────────────────────────────────────
 * Compliant with WCAG 2.2 AA accessibility guidelines.
 */

export const hospitalTokens = {
  colors: {
    // ── Shell / Navigation (Deep Navy) ──────────────────────
    shell: {
      bgDeep:      "#040f1c",  // --shell-bg-deep
      bgSidebar:   "#071428",  // --shell-bg-sidebar
      bgHeader:    "#040f1c",  // --shell-bg-header
      bgHover:     "#0d2240",  // --shell-bg-hover
      bgActive:    "#0e2f57",  // --shell-bg-active
      border:      "#142b4a",  // --shell-border
      textMuted:   "#7a94b8",  // --shell-text-muted
      textBright:  "#f0f6ff",  // --shell-text-bright
    },

    // ── Accent / Brand (Cyan-Teal) ──────────────────────────
    accent: {
      50:  "#ecfeff",  // --accent-50
      100: "#cffafe",  // --accent-100
      300: "#67e8f9",  // --accent-300
      400: "#22d3ee",  // --accent-400
      500: "#06b6d4",  // --accent-500
      600: "#0891b2",  // --accent-600  ← primary interactive CTA
      700: "#0e7490",  // --accent-700  ← hover state
      800: "#155e75",  // --accent-800
      900: "#164e63",  // --accent-900
    },

    // ── Light-mode Surfaces ─────────────────────────────────
    surface: {
      canvas:     "#f5f7fa",  // --surface-canvas      (page bg)
      panel:      "#ffffff",  // --surface-panel       (cards, modals)
      subtle:     "#f0f4f8",  // --surface-subtle      (alt rows, input bg)
      muted:      "#e2e8f0",  // --surface-muted       (dividers)
      border:     "#e2e8f0",  // --surface-border      (standard border)
      borderDark: "#cbd5e1",  // --surface-border-dark (input/button border)
    },

    // ── Clinical Status Tokens ──────────────────────────────
    clinical: {
      // Stable / Normal / Discharged
      stable: {
        bg:     "#f0fdf4",  // --clinical-stable-bg
        text:   "#14532d",  // --clinical-stable-text
        border: "#bbf7d0",  // --clinical-stable-border
        solid:  "#16a34a",  // --clinical-stable-solid
      },
      // Caution / Observation / Triage 3
      warning: {
        bg:     "#fffbeb",  // --clinical-warning-bg
        text:   "#78350f",  // --clinical-warning-text
        border: "#fde68a",  // --clinical-warning-border
        solid:  "#d97706",  // --clinical-warning-solid
      },
      // Urgent / Triage 2
      urgent: {
        bg:     "#fff7ed",  // --clinical-urgent-bg
        text:   "#7c2d12",  // --clinical-urgent-text
        border: "#fed7aa",  // --clinical-urgent-border
        solid:  "#ea580c",  // --clinical-urgent-solid
      },
      // Critical / Code Blue / Triage 1
      critical: {
        bg:     "#fff1f2",  // --clinical-critical-bg
        text:   "#881337",  // --clinical-critical-text
        border: "#fecdd3",  // --clinical-critical-border
        solid:  "#dc2626",  // --clinical-critical-solid
      },
      // Routine / Informational / Scheduled
      routine: {
        bg:     "#eff6ff",  // --clinical-routine-bg
        text:   "#1e3a8a",  // --clinical-routine-text
        border: "#bfdbfe",  // --clinical-routine-border
        solid:  "#2563eb",  // --clinical-routine-solid
      },
      // Inactive / Archived / Deceased
      inactive: {
        bg:     "#f8fafc",  // --clinical-inactive-bg
        text:   "#475569",  // --clinical-inactive-text
        border: "#e2e8f0",  // --clinical-inactive-border
        solid:  "#64748b",  // --clinical-inactive-solid
      },
    },

    // ── Typography Hierarchy ────────────────────────────────
    text: {
      primary:   "#0d1b2e",  // --text-primary
      secondary: "#2c4264",  // --text-secondary
      muted:     "#5d7a9e",  // --text-muted
      disabled:  "#94a3b8",  // --text-disabled
      inverse:   "#ffffff",  // --text-inverse
    },

    // ── Nav Active State ────────────────────────────────────
    nav: {
      activeBg:     "rgba(6, 182, 212, 0.14)",  // --nav-active-bg
      activeBorder: "#22d3ee",                   // --nav-active-border
      activeText:   "#67e8f9",                   // --nav-active-text
    },
  },

  // ── Control Heights ─────────────────────────────────────
  controls: {
    xs: "1.75rem",   // 28px
    sm: "2rem",      // 32px — compact clinical standard
    md: "2.25rem",   // 36px — default button/input
    lg: "2.5rem",    // 40px — touch friendly
  },

  // ── Border Radii ────────────────────────────────────────
  radius: {
    none: "0px",
    xs:   "2px",
    sm:   "4px",      // buttons, inputs, controls
    md:   "6px",      // cards, table containers, popovers
    lg:   "10px",     // modal dialogs, large drawers
    xl:   "14px",     // feature panels
    full: "9999px",   // status badges, pill tags
  },

  // ── Navigation Dimensions ───────────────────────────────
  dimensions: {
    topNavHeight:          "3.5rem",   // 56px
    sidebarWidthExpanded:  "17rem",    // 272px
    sidebarWidthCollapsed: "4rem",     // 64px
    contentMaxWidth:       "80rem",    // 1280px
  },

  // ── Typography ──────────────────────────────────────────
  typography: {
    fontSans:   '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontArabic: '"IBM Plex Sans Arabic", "Cairo", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontMono:   'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },

  // ── Shadows ─────────────────────────────────────────────
  shadows: {
    none: "none",
    xs: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
    sm: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
    lg: "0 10px 20px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.03)",
  },

  // ── Focus Ring (WCAG 2.2 AA) ────────────────────────────
  focusRing: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
};

