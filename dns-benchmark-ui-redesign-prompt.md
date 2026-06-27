# EXECUTION PROMPT: DNS Speed Test & Network Diagnostic Tool — UI Redesign
> Feed this document verbatim to your coding agent. All parameters are pre-resolved.

---

## MISSION STATEMENT

Restyle the existing DNS Speed Test and Network Diagnostic benchmark application to a polished, minimal, premium black-dominant tech tool using Tailwind CSS. The aesthetic is **true black surfaces + pure white text + `#3d46bc` violet-blue accent** — clean, readable, no neon. The redesign is purely cosmetic — a surgical CSS/class-layer operation. The existing HTML structure, DOM hierarchy, element ordering, IDs, data attributes, JavaScript hooks, and all functional logic are **frozen** and must not be touched.

---

## PROJECT CONTEXT

The application contains three primary feature surfaces:
1. **Real-time DoH Speed Benchmark** — latency/speed testing against DNS-over-HTTPS providers
2. **Deep DNS & IP Diagnostic Checker** — query resolution diagnostics and IP metadata
3. **Community Review Section** — user-submitted ratings/comments on DNS providers

The redesign must make all three surfaces feel like a unified, professional network instrumentation tool — not a generic web app.

---

## ABSOLUTE CONSTRAINTS — READ BEFORE WRITING A SINGLE LINE

These are hard rules. Violation of any one of them makes the output unacceptable.

1. **DO NOT modify, reorder, add, or remove any HTML element, tag, attribute, `id`, `data-*` attribute, `aria-*` attribute, `name`, or `class` that is wired to JavaScript behavior.** Assume every `id` and `data-*` attribute is a live JS hook.
2. **DO NOT alter the DOM hierarchy.** No elements may be wrapped in new containers, unwrapped, moved, or restructured.
3. **DO NOT remove or rename existing CSS classes that may be referenced by JavaScript** (e.g., `.active`, `.hidden`, `.loading`, `.error`, `.result`). Add new Tailwind/utility classes alongside them — never replace.
4. **DO NOT touch `<script>` tags, inline `onclick` handlers, or any JavaScript.** The JS layer is out of scope entirely.
5. **All styling changes must be delivered exclusively through:**
   - Addition of Tailwind utility classes to existing elements
   - A single `<style>` block appended inside `<head>` for CSS variables, the Geist font import, Tailwind `@layer` overrides, and glassmorphism/glow utility definitions that Tailwind cannot express natively
   - Extension of `tailwind.config` (if a config file exists) to register custom tokens
6. **The light/dark mode toggle must use Tailwind's `dark:` variant strategy** (`class` strategy on `<html>` or `<body>`). Wire it to the existing toggle element — do not create a new one.
7. **Preserve all existing layout breakpoints and grid/flex structure.** Only apply visual treatments on top of the existing layout system.

---

## DESIGN SYSTEM SPECIFICATION

### 1. Tailwind Configuration

Use Tailwind CSS v3+ with the `class`-based dark mode strategy. Extend the default theme — do not override or purge existing tokens.

```js
// tailwind.config.js (extend only)
module.exports = {
  darkMode: 'class',
  content: ['./**/*.html', './**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Base surfaces — true black dominant
        'surface-950': '#000000',  // true black background
        'surface-900': '#0d0d12',  // primary background (faint purple tint)
        'surface-800': '#111118',  // card background
        'surface-700': '#16161e',  // elevated card / nav
        'surface-600': '#1e1e2a',  // borders, dividers

        // Accent system — blue-purple (#3d46bc range)
        'violet-300': '#94b3f4',   // lightest, decorative
        'violet-400': '#5386ee',   // light, hover states
        'violet-500': '#3d46bc',   // PRIMARY accent
        'violet-600': '#2b3286',   // darker variant
        'violet-700': '#1a1e50',   // deepest, backgrounds

        // Semantic (unchanged)
        'success':   '#10b981',
        'warning':   '#f59e0b',
        'danger':    '#f43f5e',
        'muted':     '#505060',

        // Light mode surfaces — pure white dominant
        'light-bg':       '#ffffff',
        'light-surface':  '#fafafd',
        'light-elevated': '#f0f0f5',
        'light-border':   '#e0e0ee',
        'light-muted':    '#a0a0b2',
      },
      boxShadow: {
        'glow-violet':    '0 0 20px 0 rgba(61, 70, 188, 0.18)',
        'glow-violet-sm': '0 0 10px 0 rgba(61, 70, 188, 0.12)',
        'glass':          '0 4px 32px 0 rgba(0,0,0,0.50)',
        'glass-light':    '0 2px 20px 0 rgba(0,0,0,0.06)',
      },
      backdropBlur: {
        'glass': '14px',
      },
      borderRadius: {
        'panel': '12px',
        'card':  '10px',
        'chip':  '6px',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 1px rgba(61,70,188,0.20)' },
          '50%':       { boxShadow: '0 0 0 1px rgba(61,70,188,0.45)' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'fade-in':    'fade-in 0.25s ease-out forwards',
      },
    },
  },
  plugins: [],
}
```

---

### 2. Font Import

Place this as the **first** child of `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

---

### 3. CSS Variables Block

Append this `<style>` block inside `<head>` **after** the Tailwind CDN link or compiled CSS link:

```css
<style>
/* ─── Design Tokens ──────────────────────────────────────── */
:root {
  --bg-primary:      #000000;
  --bg-surface:      #0d0d12;
  --bg-elevated:     #16161e;
  --border-default:  rgba(61, 70, 188, 0.14);
  --border-subtle:   rgba(255, 255, 255, 0.05);
  --accent:          #3d46bc;
  --accent-light:    #5386ee;
  --text-primary:    #ffffff;
  --text-secondary:  #a0a0b2;
  --text-muted:      #505060;
  --radius-panel:    12px;
  --radius-card:     10px;
  --radius-chip:     6px;
}

/* ─── Light Mode Overrides ──────────────────────────────── */
.light, [data-theme="light"] {
  --bg-primary:     #ffffff;
  --bg-surface:     #fafafd;
  --bg-elevated:    #f0f0f5;
  --border-default: rgba(61, 70, 188, 0.18);
  --border-subtle:  rgba(0, 0, 0, 0.07);
  --text-primary:   #000000;
  --text-secondary: #555565;
  --text-muted:     #a0a0b2;
}

/* ─── Global Typography ─────────────────────────────────── */
body {
  font-family: 'Geist', system-ui, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color 0.25s ease, color 0.2s ease;
}

code, pre, .font-mono,
[class*="latency"], [class*="ping"],
[class*="ms"], [class*="metric"],
[class*="result"], [class*="speed"] {
  font-family: 'Geist Mono', ui-monospace, monospace;
}

/* ─── Glassmorphism Utility ─────────────────────────────── */
.glass {
  background: rgba(13, 13, 18, 0.80);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  box-shadow: 0 4px 32px 0 rgba(0, 0, 0, 0.50);
}

.light .glass, [data-theme="light"] .glass {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 2px 20px 0 rgba(0, 0, 0, 0.06);
}

/* ─── Metric/Number Ambient Glow ────────────────────────── */
.metric-value {
  font-family: 'Geist Mono', monospace;
  font-variant-numeric: tabular-nums;
  color: var(--accent);
  text-shadow: 0 0 20px rgba(61, 70, 188, 0.20);
  letter-spacing: -0.02em;
}

.light .metric-value, [data-theme="light"] .metric-value {
  text-shadow: none;
}

/* ─── Ghost Button Base ─────────────────────────────────── */
.btn-ghost {
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  border-radius: var(--radius-chip);
  padding: 0.5rem 1.25rem;
  font-family: 'Geist', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: background 0.18s ease, box-shadow 0.18s ease, color 0.18s ease;
}

.btn-ghost:hover,
.btn-ghost:focus-visible {
  background: rgba(61, 70, 188, 0.08);
  box-shadow: 0 0 14px 0 rgba(61, 70, 188, 0.18);
  outline: none;
}

/* ─── Input / Select Fields ─────────────────────────────── */
input[type="text"],
input[type="search"],
input[type="url"],
input[type="email"],
select,
textarea {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-chip);
  color: var(--text-primary);
  font-family: 'Geist', sans-serif;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  outline: none;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(61, 70, 188, 0.12);
}

input::placeholder { color: var(--text-muted); }

/* ─── Scrollbar (WebKit) ────────────────────────────────── */
::-webkit-scrollbar       { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: 9999px;
}

/* ─── Selection ─────────────────────────────────────────── */
::selection {
  background: rgba(61, 70, 188, 0.22);
  color: var(--text-primary);
}

/* ─── Dividers ──────────────────────────────────────────── */
hr, .divider {
  border-color: var(--border-subtle);
  opacity: 1;
}

/* ─── Links ─────────────────────────────────────────────── */
a:not([class]) {
  color: var(--accent-light);
  text-decoration: none;
  transition: color 0.15s ease;
}
a:not([class]):hover { color: var(--accent); }

/* ─── Status Badges ─────────────────────────────────────── */
.badge-success { background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.25); }
.badge-warning { background: rgba(245,158,11,0.12); color: #f59e0b; border: 1px solid rgba(245,158,11,0.25); }
.badge-danger  { background: rgba(244,63,94,0.12);  color: #f43f5e; border: 1px solid rgba(244,63,94,0.25); }
.badge-active  { background: rgba(61,70,188,0.12);  color: #5386ee; border: 1px solid rgba(61,70,188,0.28); }
.badge-success, .badge-warning, .badge-danger, .badge-active {
  border-radius: var(--radius-chip);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.2rem 0.6rem;
  font-family: 'Geist Mono', monospace;
}

/* ─── Reduced Motion ────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}
</style>
```

---

## COMPONENT STYLING DIRECTIVES

Apply these Tailwind class additions and CSS class additions to existing elements. Classes are **additive only**.

### Body & Root Background

```
<body>  → add classes: "bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans transition-colors duration-300"
<html>  → add class: "dark" (default; toggle removes it for light mode)
```

---

### Navigation / Header

- Background: `glass` class on the navbar container
- Position: `sticky top-0 z-50`
- Title/Logo text: `text-[var(--text-primary)] font-semibold tracking-tight text-lg`
- Nav links: `text-[var(--text-secondary)] hover:text-[var(--accent)] text-sm font-medium transition-colors duration-150`
- Active nav link: `text-[var(--accent)]`
- Bottom border: `border-b border-[var(--border-subtle)]`

---

### Cards & Panel Containers

Every card, panel, result-box, and section container:

```
Add classes: "glass animate-fade-in"
```

Section headings inside cards:
```
text-xs font-semibold tracking-widest uppercase text-[var(--text-muted)] mb-4
```

---

### Benchmark / Speed Test Panel

- Provider name labels: `text-sm font-medium text-[var(--text-primary)] font-sans`
- Latency/speed values: add class `metric-value text-2xl font-semibold` (this triggers the Geist Mono + ambient glow CSS rule above)
- Progress bars/indicators: border `border-[var(--accent)]`, fill `bg-[var(--accent)]`, with `opacity-80`
- "Testing…" / spinner state containers: `animate-pulse-glow`
- Result rows on hover: `hover:bg-[rgba(61,70,188,0.05)] transition-colors duration-150 rounded-[var(--radius-chip)]`

---

### DNS & IP Diagnostic Panel

- Query input field: receives `.btn-ghost` border treatment via global input rules above; no additional action needed
- Result key labels: `text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider`
- Result values: `text-sm font-mono text-[var(--text-primary)]`
- IP address strings: `font-mono text-[var(--accent-light)] text-sm`
- Error output: `.badge-danger` or `text-[#f43f5e]`
- Success/resolved output: `.badge-success` or `text-[#10b981]`
- Warning/partial output: `.badge-warning` or `text-[#f59e0b]`

---

### Buttons & CTAs

All existing `<button>` elements and `<a role="button">` elements:

```
Add class: "btn-ghost"
```

Primary action buttons (e.g., "Run Test", "Check DNS"):
```
Additional class: "animate-pulse-glow"  ← adds the slow glow breathing effect
```

Destructive or reset buttons:
```
Override border/text color inline: style="border-color:#f43f5e; color:#f43f5e;"
```

Disabled state: `opacity-40 cursor-not-allowed pointer-events-none`

---

### Tables & Data Grids

```
<table>   → add: "w-full text-sm border-separate border-spacing-0"
<thead>   → add: "text-[var(--text-muted)] text-xs uppercase tracking-widest font-semibold"
<th>      → add: "py-2 px-3 border-b border-[var(--border-subtle)] font-semibold text-left"
<tr>      → add: "border-b border-[var(--border-subtle)] hover:bg-[rgba(61,70,188,0.04)] transition-colors"
<td>      → add: "py-3 px-3 text-[var(--text-secondary)] font-mono text-xs"
```

Numeric cells (latency, TTL, score):
```
Add class: "metric-value text-sm"
```

---

### Community Review Section

- Review card containers: `glass mb-4`
- Reviewer name: `text-sm font-semibold text-[var(--text-primary)]`
- Review body text: `text-sm text-[var(--text-secondary)] leading-relaxed`
- Rating elements (stars/score): `text-[var(--accent)]`
- Timestamp/metadata: `text-xs text-[var(--text-muted)] font-mono`
- Submit/post button: `btn-ghost`

---

### Dark / Light Mode Toggle

Wire to the existing toggle element. Add this behavior to the existing toggle's JS event handler — do **not** create a new toggle or move the existing one:

```js
// Append to the existing toggle's event listener — do not replace it
const root = document.documentElement; // <html> element
// Toggle the 'dark' class (Tailwind dark: strategy)
root.classList.toggle('dark');
// Persist preference
localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
```

On page load, prepend this snippet before the closing `</body>` tag:

```html
<script>
  // Respect saved preference or system default
  (function() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'light' || (!saved && !prefersDark)) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

Toggle icon treatment (if an icon/SVG exists inside the toggle):
- Dark mode: show moon icon — `class="text-[var(--text-secondary)] hover:text-[var(--accent)]"`
- Light mode: show sun icon — same class

---

## IMPLEMENTATION STRATEGY

Execute in this exact order to minimize risk:

1. **Snapshot first.** Before any edits, copy the original HTML to `index.backup.html`. All work happens on the original file.

2. **Install Tailwind.** If no `tailwind.config.js` exists, initialize it (`npx tailwindcss init`). If using CDN, replace with the Play CDN for development (`<script src="https://cdn.tailwindcss.com"></script>`) and add the config inline via `tailwind.config` object.

3. **Inject font + CSS variable block** into `<head>` as specified above.

4. **Inject the theme persistence script** before `</body>`.

5. **Apply `dark` class to `<html>`** as the default state.

6. **Restyle components top-down**: `<body>` → header → section panels → cards → tables → buttons → badges. Work one component at a time and verify in browser before moving to the next.

7. **Wire dark/light toggle** to the existing toggle element last, after all visual tokens are confirmed working.

8. **Cross-check against constraint list** (see Verification Checklist below).

---

## TAILWIND CDN SETUP (if not using build pipeline)

If the project uses a CDN include rather than a build step, use the Play CDN with inline config:

```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        // Paste the full `extend` block from Design System §1 here
      }
    }
  }
</script>
```

---

## VERIFICATION CHECKLIST

Before marking the task complete, validate every item:

- [ ] All existing `id` attributes are unchanged
- [ ] All existing `data-*` attributes are unchanged
- [ ] No HTML elements have been added, removed, or reordered
- [ ] No `<script>` tags have been modified (only the two permitted snippets added)
- [ ] All existing JS-referenced class names (`.active`, `.hidden`, `.loading`, `.error`, `.result`, `.running`, etc.) are still present — new classes are *additions*, not replacements
- [ ] Dark mode default renders correctly (true black `#000000` background, `#3d46bc` violet-blue accents)
- [ ] Light mode toggle works and persists across page reload
- [ ] All three feature surfaces (DoH Benchmark, DNS Diagnostic, Community Reviews) render with the glassmorphism card treatment
- [ ] Metric values display in Geist Mono with subtle violet ambient glow (dark mode only; flat in light mode)
- [ ] All buttons are ghost-outlined with `#3d46bc` border/text and subtle fill on hover
- [ ] All inputs have the styled focus ring
- [ ] Scrollbar styled (WebKit), `::selection` styled
- [ ] No layout breakpoints broken at mobile (≤ 640px), tablet (≤ 1024px), or desktop
- [ ] `prefers-reduced-motion` disables all animations
- [ ] No console errors introduced

---

*End of execution prompt. All parameters are resolved. No clarification from the developer is required.*
