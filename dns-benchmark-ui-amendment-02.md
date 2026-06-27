# AMENDMENT 02: Behavioral Guardrails + Glass Modal Specification
> This document amends `dns-benchmark-ui-redesign-prompt.md` (the primary prompt).
> Feed **both files** to the agent in order: primary prompt first, this file second.
> Where the two conflict, **this document wins.**

---

## ⚠️ SECTION A: AGENT BEHAVIORAL GUARDRAILS
### "Edit-Only Mode" — Mandatory Operational Contract

This section exists because LLM coding agents frequently cause catastrophic site breakage by rewriting files wholesale instead of making targeted edits. The following rules override the agent's default behavior entirely.

---

### A1. THE PRIME DIRECTIVE: DIFF-MODE ONLY

**You are a diff engine, not a rewriter.**

You may only produce one of these four output types:
1. A new class or rule **appended** to the `<style>` block already in `<head>`
2. A Tailwind class string **appended** to an existing element's `class="..."` attribute
3. A new `<script>` theme-persistence snippet placed at **the exact location** specified in the primary prompt
4. An extension to `tailwind.config.js` using `extend:` only

**If the output is anything other than these four types — stop and re-read this document.**

---

### A2. FORBIDDEN OPERATIONS — ABSOLUTE BAN

The agent must never do any of the following. These are not guidelines. They are trip-wire rules: triggering any one of them invalidates the entire output.

| # | Forbidden Action | Why It Breaks Things |
|---|---|---|
| 1 | Outputting the full `index.html` rewritten from scratch | Destroys JS-wired attributes silently |
| 2 | Wrapping any element in a new `<div>`, `<span>`, or container | Breaks querySelector / DOM traversal in existing JS |
| 3 | Removing **any** existing class from any element | JS may toggle that class; removing it kills state logic |
| 4 | Replacing a class — even with a "better" Tailwind equivalent | Same as above |
| 5 | Changing a tag type (`<div>` → `<section>`, `<button>` → `<a>`) | Breaks CSS specificity chains and event delegation |
| 6 | Removing or "tidying" `data-*` attributes | These are live JS hooks; loss = silent JS failure |
| 7 | Editing any `<script>` tag content | The JS layer is completely frozen |
| 8 | Adding `style=""` inline attributes to any element | Conflicts with JS-driven dynamic styles; specificity war |
| 9 | Reordering sibling elements | Breaks nth-child selectors and JS index assumptions |
| 10 | Changing `id=""` values or adding new `id` attributes | Breaks `getElementById`, anchor links, ARIA labelledby |
| 11 | Changing `type=""` on any `<input>` | Breaks input validation and JS `.value` parsing |
| 12 | Changing `name=""` attributes on form elements | Breaks form serialization and JS `FormData` |
| 13 | Adding new HTML elements (buttons, labels, containers, icons) | Structural change; DOM hierarchy is frozen |
| 14 | Restructuring the `<head>` (reordering links, removing meta tags) | Breaks CSP, canonical URLs, OG tags |
| 15 | Touching `aria-*` attributes | Breaks accessibility tree and any JS relying on ARIA state |

---

### A3. PRE-EDIT AUDIT PROTOCOL

Before writing a single character of output, the agent must complete this internal audit and — if the interface allows it — output the audit as a comment block at the top of the response:

```
AUDIT:
- File to modify: [filename]
- Elements I plan to touch: [list element selectors + what I'm adding]
- Classes I am ADDING (not removing): [list]
- Classes I am NOT touching: [list any JS-sensitive ones found]
- New CSS rules I'm appending: [list rule names]
- Forbidden operations check: NONE of the 15 banned actions apply ✓
```

If the audit reveals that achieving the visual goal requires a forbidden operation, the agent must **stop, report the conflict, and ask for guidance** rather than proceeding with a workaround that modifies structure.

---

### A4. ONE COMPONENT AT A TIME

Do not batch style changes across multiple sections in a single output block. Work in this order, pausing to confirm before continuing:

1. `<head>` injections (fonts, CSS variables, modal styles)
2. `<body>` + `<html>` base classes
3. Navbar / header
4. Cards and panels
5. Benchmark section
6. Diagnostic section
7. Community section
8. Modals and popups (see Section B)
9. Tailwind config extension

Each step should be a discrete, reviewable unit. Do not proceed to step N+1 until step N is confirmed.

---

### A5. THE SNAPSHOT RULE (REINFORCED)

Before the first edit to any file:

```bash
cp index.html index.html.bak
```

If at any point the agent's edits cause a JavaScript error or layout break, the recovery command is:

```bash
cp index.html.bak index.html
```

The `.bak` file must never itself be edited.

---

### A6. CSS SPECIFICITY DISCIPLINE

When adding new CSS rules to the `<style>` block, every new rule must be written so it **cannot accidentally override an existing inline style or a JS-toggled class**.

- Prefer class-based selectors (`.glass`, `.metric-value`) over element selectors (`div`, `section`) for new rules
- Do not use `!important` except inside the `prefers-reduced-motion` block already specified in the primary prompt
- Do not write rules targeting `*` (universal selector) beyond what is already in the primary prompt
- If a new rule targets a tag name (e.g., `table`, `input`), add a qualifying parent class: `[class*="dns-"] table` not bare `table` — to prevent bleed into unintended elements

---

## SECTION B: GLASS MODAL & POPUP SPECIFICATION

All popup windows, dialogs, tooltips, and overlay panels must receive the following treatment. This is additive CSS only — no new HTML is created, no modal structure is changed.

### B1. Selector Coverage

The CSS below must target every popup pattern the existing app might use. Apply all rules:

- `dialog` (native HTML Dialog API)
- `.modal`, `.modal-dialog`, `.modal-content` (Bootstrap-style)
- `.popup`, `.popup-panel`, `.overlay-panel` (custom)
- `[role="dialog"]` (ARIA-annotated custom modals)
- `.sheet`, `.drawer` (mobile bottom-sheet patterns)

---

### B2. Append to the `<style>` Block in `<head>`

Add these rules **at the end** of the existing `<style>` block from the primary prompt, before the closing `</style>` tag:

```css
/* ═══════════════════════════════════════════════════════════
   GLASS MODAL & POPUP SYSTEM
   Target: all dialog/modal/popup/overlay patterns
   Rule: additive CSS only — no HTML modified
   ═══════════════════════════════════════════════════════════ */

/* ─── Backdrop / Scrim ──────────────────────────────────── */
.modal-backdrop,
.modal-overlay,
.overlay-bg,
dialog::backdrop,
[data-backdrop],
[data-modal-backdrop] {
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: opacity 0.2s ease;
}

.light .modal-backdrop,
.light dialog::backdrop,
[data-theme="light"] .modal-backdrop,
[data-theme="light"] dialog::backdrop {
  background: rgba(10, 10, 30, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* ─── Modal Container ───────────────────────────────────── */
dialog,
.modal,
.modal-dialog,
.popup-panel,
.overlay-panel,
.sheet,
.drawer,
[role="dialog"] {
  /* Frosted glass core */
  background: rgba(10, 10, 16, 0.88) !important;
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);

  /* Border: violet tint, inner specular highlight */
  border: 1px solid rgba(61, 70, 188, 0.18) !important;
  border-radius: 14px !important;

  /* Layered shadow: depth + faint violet halo */
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 8px 48px rgba(0, 0, 0, 0.70),
    0 2px 12px rgba(0, 0, 0, 0.50),
    0 0 40px rgba(61, 70, 188, 0.06);

  /* Contain the ::before highlight line */
  position: relative;
  overflow: hidden;
}

/* ─── Premium Top Highlight Line ────────────────────────── */
/* The 1px gradient at the top edge: the single premium signature detail */
dialog::before,
.modal::before,
.modal-dialog::before,
.popup-panel::before,
.overlay-panel::before,
[role="dialog"]::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(61, 70, 188, 0.55) 40%,
    rgba(83, 134, 238, 0.65) 50%,
    rgba(61, 70, 188, 0.55) 60%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 10;
}

/* ─── Modal Entry Animation ─────────────────────────────── */
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.965) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modal-exit {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.97) translateY(6px);
  }
}

dialog[open],
.modal.show,
.modal.active,
.modal.visible,
.popup-panel.open,
.overlay-panel.open,
[role="dialog"][aria-hidden="false"] {
  animation: modal-enter 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* ─── Modal Header ──────────────────────────────────────── */
.modal-header,
dialog .dialog-header,
.popup-panel .panel-header,
[role="dialog"] .header,
[role="dialog"] > header {
  border-bottom: 1px solid var(--border-subtle);
  padding: 1.25rem 1.5rem;
}

/* ─── Modal Title ───────────────────────────────────────── */
.modal-title,
dialog .dialog-title,
[role="dialog"] h2,
[role="dialog"] h3 {
  font-family: 'Geist', sans-serif;
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-primary);
  letter-spacing: -0.015em;
  line-height: 1.3;
}

/* ─── Modal Body ────────────────────────────────────────── */
.modal-body,
dialog .dialog-body,
.popup-panel .panel-body,
[role="dialog"] .body,
[role="dialog"] > main {
  padding: 1.5rem;
  color: var(--text-secondary);
  font-family: 'Geist', sans-serif;
  font-size: 0.875rem;
  line-height: 1.65;
  overflow-y: auto;
  max-height: 62vh;
  /* Scoped scrollbar inside modal */
  scrollbar-width: thin;
  scrollbar-color: var(--border-default) transparent;
}

/* ─── Modal Footer ──────────────────────────────────────── */
.modal-footer,
dialog .dialog-footer,
.popup-panel .panel-footer,
[role="dialog"] .footer,
[role="dialog"] > footer {
  border-top: 1px solid var(--border-subtle);
  padding: 1rem 1.5rem;
  /* Slightly darker footer — visual grounding */
  background: rgba(10, 12, 16, 0.35);
  border-radius: 0 0 14px 14px;
}

/* ─── Modal Close Button ────────────────────────────────── */
.modal-close,
.btn-close,
button[data-bs-dismiss],
button[data-dismiss="modal"],
[aria-label="Close"],
[aria-label="close"],
dialog .close,
.popup-panel .close,
[role="dialog"] [data-close] {
  /* Ghost style — matches btn-ghost but smaller, icon-sized */
  background: transparent !important;
  border: 1px solid transparent !important;
  color: var(--text-muted) !important;
  border-radius: var(--radius-chip) !important;
  width: 2rem !important;
  height: 2rem !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  padding: 0 !important;
  font-size: 1rem !important;
  line-height: 1 !important;
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease !important;
}

.modal-close:hover,
.btn-close:hover,
button[data-bs-dismiss]:hover,
button[data-dismiss="modal"]:hover,
[aria-label="Close"]:hover,
dialog .close:hover,
[role="dialog"] [data-close]:hover {
  color: var(--accent) !important;
  border-color: rgba(61, 70, 188, 0.25) !important;
  background: rgba(61, 70, 188, 0.08) !important;
}

/* ─── Tooltip Popups ────────────────────────────────────── */
.tooltip,
.tippy-box,
[role="tooltip"] {
  background: rgba(10, 10, 16, 0.94) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(61, 70, 188, 0.18) !important;
  border-radius: var(--radius-chip) !important;
  color: var(--text-primary) !important;
  font-family: 'Geist', sans-serif;
  font-size: 0.75rem;
  padding: 0.35rem 0.7rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.45);
}

/* ─── Dropdown Popups ───────────────────────────────────── */
.dropdown-menu,
.select-menu,
[role="listbox"],
[role="menu"] {
  background: rgba(18, 22, 34, 0.94) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(61, 70, 188, 0.14) !important;
  border-radius: var(--radius-chip) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.55) !important;
  padding: 0.375rem !important;
  animation: modal-enter 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.dropdown-item,
[role="option"],
[role="menuitem"] {
  color: var(--text-secondary) !important;
  border-radius: 4px !important;
  padding: 0.45rem 0.75rem !important;
  font-size: 0.875rem;
  font-family: 'Geist', sans-serif;
  transition: background 0.12s ease, color 0.12s ease !important;
}

.dropdown-item:hover,
[role="option"]:hover,
[role="menuitem"]:hover {
  background: rgba(61, 70, 188, 0.08) !important;
  color: var(--accent) !important;
}

/* ─── Light Mode Modal Overrides ────────────────────────── */
.light dialog,
.light .modal,
.light .modal-dialog,
.light .popup-panel,
.light [role="dialog"],
[data-theme="light"] dialog,
[data-theme="light"] .modal,
[data-theme="light"] [role="dialog"] {
  background: rgba(255, 255, 255, 0.92) !important;
  border-color: rgba(61, 70, 188, 0.16) !important;
  box-shadow:
    0 0 0 1px rgba(61,70,188,0.08) inset,
    0 8px 48px rgba(0, 0, 0, 0.12),
    0 2px 12px rgba(0, 0, 0, 0.07);
}

.light .modal-footer,
[data-theme="light"] .modal-footer,
.light dialog footer,
[data-theme="light"] dialog footer {
  background: rgba(241, 245, 249, 0.60);
}

.light .dropdown-menu,
[data-theme="light"] .dropdown-menu,
.light [role="listbox"],
[data-theme="light"] [role="listbox"] {
  background: rgba(255, 255, 255, 0.95) !important;
  border-color: rgba(61, 70, 188, 0.14) !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.10) !important;
}

/* ─── Reduced Motion: modals ────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  dialog[open],
  .modal.show,
  .dropdown-menu {
    animation: none !important;
  }
}
```

---

## SECTION C: AMENDMENTS TO THE PRIMARY PROMPT

The following entries correct, clarify, or strengthen specific directives from `dns-benchmark-ui-redesign-prompt.md`.

---

### C1. Amendment to "Cards & Panel Containers"

**Original directive:**
> Every card, panel, result-box, and section container: Add classes: `"glass animate-fade-in"`

**Amended directive:**
Before adding `glass` to any element, check whether it already has a class that controls `background`, `position`, `display`, or `overflow`. If it does, do **not** add `glass` — instead, add only the visual sub-properties as individual CSS rules scoped to that element's existing class (e.g., `.existing-class { backdrop-filter: blur(14px); border: 1px solid var(--border-default); }`). The `glass` class must never override `position: relative/absolute/fixed` or `display: flex/grid` set by existing classes.

**Also**: Do not add `animate-fade-in` to elements that already have a CSS `animation` or `transition` property set, to avoid conflict. Check the element's computed style first.

---

### C2. Amendment to "Dark / Light Mode Toggle"

**Original directive:**
> Wire to the existing toggle element. Add this behavior to the existing toggle's JS event handler.

**Clarification:**
Do not edit the existing event listener function body. Instead, find the existing toggle element by its `id` or `data-*` attribute and attach a **separate, additional** event listener using `addEventListener`. This preserves the original handler:

```js
// DO NOT edit existing JS. Add this as a new <script> block only.
(function() {
  // Find the existing toggle — check for these common patterns:
  const toggle =
    document.querySelector('[data-theme-toggle]') ||
    document.querySelector('[data-toggle="theme"]') ||
    document.querySelector('#theme-toggle') ||
    document.querySelector('#dark-mode-toggle') ||
    document.querySelector('.theme-toggle');

  if (!toggle) return; // If not found, do not create a new one

  toggle.addEventListener('click', function() {
    const root = document.documentElement;
    root.classList.toggle('dark');
    localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
  });
})();
```

---

### C3. Amendment to "Buttons & CTAs" — Specificity Fix

**Original directive:**
> All existing `<button>` elements ... Add class: `"btn-ghost"`

**Clarification — critical specificity issue:**
The `.btn-ghost` class uses `border: 1px solid var(--accent)`. If any existing button has an inline `style=""` with a border property set by JavaScript, `.btn-ghost`'s border will be silently overridden. To prevent this, add the class but also ensure the `<style>` block CSS rule for `.btn-ghost` uses `:not([style*="border"])` to exclude dynamically-styled buttons:

```css
/* Replace the original .btn-ghost rule with this safer version */
.btn-ghost:not([style*="border"]) {
  border: 1px solid var(--accent);
}
.btn-ghost {
  background: transparent;
  color: var(--accent);
  border-radius: var(--radius-chip);
  padding: 0.5rem 1.25rem;
  font-family: 'Geist', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.18s ease, box-shadow 0.18s ease;
}
.btn-ghost:hover,
.btn-ghost:focus-visible {
  background: rgba(61, 70, 188, 0.08);
  box-shadow: 0 0 14px 0 rgba(61, 70, 188, 0.18);
  outline: none;
}
```

---

### C4. New Rule — Protect JS-Managed Visibility Classes

Add this to the CSS block. It prevents any `.glass` or Tailwind class from inadvertently showing elements that JavaScript has hidden:

```css
/* ─── JS-Managed Visibility Protection ─────────────────── */
/* Never let cosmetic classes fight JS show/hide logic */
.hidden,
[hidden],
[style*="display: none"],
[style*="display:none"],
[aria-hidden="true"],
.d-none {
  display: none !important;
}

/* Preserve JS-toggled opacity states */
.invisible { visibility: hidden !important; opacity: 0 !important; }
```

---

### C5. New Addition — Subtle Background Grid Texture (Body)

Add this to the `body {}` rule in the CSS block. It adds a near-invisible technical grid pattern to the dark mode background — a single atmosphere detail that reinforces the instrument/benchmark aesthetic without affecting any layout:

```css
/* Append inside the existing body {} rule */
body:not(.light):not([data-theme="light"]) {
  background-image:
    linear-gradient(rgba(61, 70, 188, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(61, 70, 188, 0.025) 1px, transparent 1px);
  background-size: 48px 48px;
  background-position: center center;
}
```

---

## ADDENDUM: EXPANDED VERIFICATION CHECKLIST

Append these checks to the original checklist. All original checks still apply.

**Modal & Popup Checks:**
- [ ] All modals/dialogs render with frosted glass background, not solid color
- [ ] The violet top highlight gradient line (`#3d46bc` → `#5386ee` → `#3d46bc`) is visible at the top edge of each modal
- [ ] Modal backdrop is blurred, not just darkened
- [ ] Modal entry animation fires (scale + fade, 0.24s) when a modal opens
- [ ] Modal close button is ghost-styled (transparent bg, icon only, `#3d46bc` on hover)
- [ ] Tooltips and dropdowns receive glass treatment
- [ ] Modal body has its own scrollbar when content overflows, not the page

**Agent Behavioral Checks:**
- [ ] Diff of `index.html` vs `index.html.bak` shows **zero** removed attributes, **zero** removed classes, **zero** reordered elements
- [ ] No new HTML elements exist in the diff (no new divs, spans, buttons, or icons)
- [ ] No `style=""` attributes were added to any element
- [ ] All `<script>` tag contents are byte-for-byte identical to the original (only the two permitted snippets added at bottom of body)
- [ ] `.hidden`, `[hidden]`, `.d-none` elements remain hidden after styling is applied
- [ ] JS functionality (test runner, diagnostic checker, review submission) works identically to pre-redesign state

---

*End of Amendment 02. Feed this after the primary prompt. No further clarification required.*
