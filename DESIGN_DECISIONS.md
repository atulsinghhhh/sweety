# Design decisions

This document records how Sweety's interface was designed, which reference it follows, and where it deliberately departs from both the PRD and that reference.

- Original requirements: [prd.md](prd.md), section 7 "UI/UX Design Direction"
- Visual reference supplied during development: [design.md](design.md)
- Implementation: design tokens in [`client/src/index.css`](client/src/index.css)

## 1. Themes: light and dark

**History.** The PRD (section 7) asked for *"Dark theme as the primary theme."* Milestone 1 was built dark. The project owner then supplied `design.md`, a light reference, and the app became light-only. Later the owner asked for a dark theme to be added as well. The app now ships **both**, which also satisfies the PRD's original dark-theme requirement.

**How it works**
- **Default:** follows the operating system (`prefers-color-scheme`) until the user picks a theme with the sun/moon toggle. The toggle is in the app header, the landing-page nav and the login/register pages. The choice is saved in `localStorage` (`sweety_theme`), and the OS setting is followed live while no choice is saved.
- **No flash of the wrong theme:** a small inline script in `client/index.html` sets the `.dark` class on `<html>` before the first paint. `ThemeProvider` (`src/context/ThemeContext.jsx`) keeps it in sync afterwards.
- **Tokens only:** every colour, including the palette tokens `ink`, `steel`, `canvas`, `carbon`, `mint` and `leaf`, is a CSS variable with a light (`:root`) and a dark (`.dark`) value, so components contain almost no theme logic. The exceptions:
  - Text on the always-dark carbon bands uses `on-carbon`, which stays light in both themes.
  - The error icon's stroke is fixed black because it sits on amber.
  - Dialog overlays get a stronger dim in dark mode.
- **`dark:` utilities** are bound to the `.dark` class, not directly to the OS setting. Earlier, binding to the OS setting caused grey inputs on a Mac in dark mode, so the class-based variant is kept and `ThemeProvider` decides when it applies.

**Dark palette** (derived from the reference's carbon `#0f0e12`)

| Role | Light | Dark | Dark contrast |
|---|---|---|---|
| Background | `#f6f8f7` | `#0f0e12` | — |
| Text | `#000000` | `#f6f8f7` | 18.0:1 |
| Muted text | `#5c5c5c` | `#a9a8b0` | 8.2:1 (7.7:1 on cards) |
| Hairlines (`steel`) | `#e5e5e5` | `#2b2a31` | decorative |
| Strong rules (`ink`) | `#000000` | `#f6f8f7` | — |
| Input borders | `#000000` | `#6e6d75` | 3.8:1 (≥ 3:1 for controls) |
| Primary button | black on `#f6f8f7` | `#0f0e12` on `#f6f8f7` | 18.0:1 |
| Destructive / errors | `#c8102e` | `#ff7a8a` | 7.7:1 |
| Links | `#0071bb` | `#6cb6ff` | 9.0:1 |
| Accent green (`leaf`) | `#1f7a4d` | `#5fcf95` | 9.9:1 (8.2:1 on mint) |
| Carbon bands | `#0f0e12` | `#1b1a21` (lifted so they stay distinct) | text 16.2:1 |

## 2. How the reference was applied

| Reference rule | Implementation |
|---|---|
| Five neutrals: `#f6f8f7`, `#000000`, `#0f0e12`, `#e5e5e5`, `#b2b2b2` | Tailwind tokens `canvas`, `ink`, `carbon`, `steel`, `graphite`; mapped onto shadcn's semantic variables (`--background`, `--foreground`, `--border`, …) |
| 0px radius everywhere | `--radius: 0px`; every shadcn radius step resolves to it |
| No shadows | All Tailwind `--shadow-*` tokens set to nothing; toast shadow removed |
| No gradients | None used |
| Hairline rules instead of fills | 1px `ink` rule under page headers and above stat grids, `steel` rules between rows and stat cells |
| Carbon bands as the only elevation | Auth brand panel and footer |
| Type scale 13 / 19 / 24 / 26 / 40px | Tokens `text-caption`, `text-subheading`, `text-heading-sm`, `text-heading`, `text-heading-lg` |
| Nothing heavier than weight 300 | shadcn's `font-medium` / `semibold` / `bold` are remapped to 300 |
| Spacing rhythm 15 / 22 / 33 / 66px | Tokens `spacing-15` … `spacing-66` |
| 1200px max width, left-aligned text | Page container `max-w-[1200px]`; no centred paragraphs |
| Blue links `#0071bb`, underline on hover | Base `a` style and `text-link` token |
| Colour only for states | Red only for validation errors and destructive actions; amber only for the error-state warning icon |
| Lowercase wordmark and labels | `sweety` wordmark, lowercase nav and field labels; required validation messages keep the exact sentence-case wording the assignment specifies |

## 3. Deliberate deviations from the reference

Sweety is a health app used to read and enter medical numbers, so readability takes priority where the reference trades it for style.

| Reference says | Sweety does | Why |
|---|---|---|
| Typeface `te-20` / `te-40` | **Inter** (variable) | The reference fonts are proprietary to another brand. Inter is the substitute the reference itself recommends. |
| Body copy at weight **100** | Body copy at weight **300** | 13–14px text at weight 100 is very hard to read, especially on forms and for older or visually impaired users. |
| Weight 100 for all text | Weight 100 only for the **40px stat numerals**; 300 for 19–24px numbers | Weight 100 strokes break up at mid sizes (observed while testing: "142" became hard to read at 19px). |
| Muted text `#b2b2b2` | Muted text **`#5c5c5c`** on light backgrounds; `#b2b2b2` kept for hairlines and text on carbon bands | `#b2b2b2` on `#f6f8f7` is 2.0:1 contrast, failing WCAG AA (4.5:1). `#5c5c5c` is 6.3:1. On `#0f0e12` bands, `#b2b2b2` is 9.1:1 and passes. |
| Body text 13px | Body text **14px**, captions 13px | Within the reference's 13–19px running-copy range, and easier to read on forms. |
| Input borders implied light | Inputs use a **1px black** hairline | Form controls need at least 3:1 contrast against the background to be identifiable (WCAG 1.4.11). |
| No brand references in product | No teenage engineering name, logo, imagery or font anywhere | Sweety uses only the visual language, never another company's identity. |
| Product photography as the hero | Large thin **numbers** are the "product" | The app has no imagery; the readings themselves are the dense objects on the page. |

## 4. Component and UX decisions

- **shadcn/ui** components (Dialog, AlertDialog, Select, Input, Button, Skeleton, Sonner) are used for accessibility (focus trapping, keyboard support, ARIA), restyled entirely through tokens. Focus rings are kept: they are required for keyboard users and are not shadows in the design sense.
- **Four-slot day view.** The Readings page always shows the four slots in order, each with Add or Edit/Delete. This makes the "one reading per slot, four per day" rule visible instead of something users discover through errors.
- **Taken slots are disabled** in the Add/Edit form, which loads the chosen date's readings; the server still re-validates everything.
- **The selected date lives in the URL** (`?date=YYYY-MM-DD`), so it survives reloads and carries across Dashboard, Readings and Reports.
- **States everywhere:** skeleton placeholders while loading, friendly empty states instead of `0`/`NaN` statistics, and error states with a retry button.
- **Animation is limited** to a 300ms fade-in on page content and the dialog transitions shadcn provides, matching the PRD's "subtle animations".
- **Responsive:** verified without horizontal scroll at 390px (Dashboard, Readings, Reports). The navigation wraps under the wordmark on small screens.

## 5. Public landing page (`/`)

The landing page was requested separately with its own brief: *"Modern healthcare SaaS. Light theme. White background. Soft green accent colors. Dark readable typography… Clean cards and subtle borders."* That brief is followed on the landing page only; the signed-in app is unchanged.

| Landing brief | Implementation |
|---|---|
| White background | The page uses `#ffffff`; the "How it works" band uses the app's `#f6f8f7` canvas for rhythm |
| Soft green accent | New tokens `leaf #1f7a4d` (icons, eyebrow labels, step numbers; 5.3:1 on white and 4.8:1 on mint, so it passes AA), `mint #eaf6ef` (soft backgrounds) and `mint-line #cfe9da` (decorative borders only). Used only on the landing page and the logo mark |
| Clean cards, subtle borders | Feature cards on a 1px `steel` hairline grid |
| Dark readable typography | Black ink on white, Inter at weight 300, muted text `#5c5c5c` (6.7:1 on white) |
| Smooth, subtle animations | A one-time fade-up when sections scroll into view (`IntersectionObserver` and existing `tw-animate-css` utilities, no new dependency) and smooth anchor scrolling. Both are disabled when the user prefers reduced motion |
| Use existing components | `Button`, `StatGrid` and `ReadingSlots` are reused |

**Kept from the app's design system for consistency:** square corners, no shadows, no gradients, Inter, the type scale and the black primary buttons. Moving from the landing page into the app therefore feels like the same product. The green accent is the one deliberate addition. It departs from `design.md`'s "never introduce a sixth color" rule because the landing brief explicitly asked for it.

**Dashboard preview.** The hero shows the real `StatGrid` and `ReadingSlots` components with four invented sample readings (98, 142, 156, 131; the statistics are computed from them). It is captioned "Illustrative preview · sample values" and exposed to screen readers as one labelled image, so the sample numbers are never presented as a real person's data.

**Content rules.** No medical claims: the copy describes recording and reviewing readings only, and the footer carries a disclaimer that Sweety does not diagnose, treat or give medical advice. No invented facts such as pricing or user counts. No privacy or contact links, because those pages do not exist and placeholder links would be fake functionality.

**Navigation.** Logged-out visitors see *Log in* and *Get started* (to `/login` and `/register`). Logged-in visitors see *Open dashboard*; `/login` and `/register` already redirect them to `/dashboard`. On screens under 768px the Features and How it works anchors are hidden from the top bar (the sections are directly below, and the footer links to both), which avoids adding a menu component. The wordmark on the login and register pages now links back to `/`.

**Brand mark.** A simple green drop with a hairline "reading line" (inline SVG, `components/Logo.jsx`). It is deliberately abstract and avoids medical symbols.

## 6. Landing-page motion

Animations use **Motion for React** (`motion`, formerly Framer Motion) on the landing page only. The signed-in app is not animated beyond its existing fades.

**Principles.** One easing curve for everything (`[0.22, 1, 0.36, 1]`: quick start, gentle settle, no bounce), durations around 0.6s, movement of at most 16–24px, and only `opacity` and `transform` (GPU-composited, never layout properties). Timings live in `components/landing/motion.js`.

| Where | What |
|---|---|
| Hero | Badge, the two headline sentences, the description, the buttons and the note fade up in a 80ms stagger on load (all done within about 0.8s, so content is never held back). The dashboard preview slides in from the right. |
| Floating decoration | Two soft green squares behind the preview drift up to 10px on 9–11s loops. Desktop only (`lg` and up), transform-only. These are the only continuous animations. |
| Dashboard preview | Stat cards appear in sequence; numbers count up from 0 once visible. The final value is rendered invisibly to reserve its width, so counting causes no layout shift, and a tiny `requestAnimationFrame` tween writes the text without React re-renders. |
| Features | The heading fades up when scrolled into view. Each card reveals on its own trigger and cascades across a desktop row. A single trigger for the whole list left the tall, stacked mobile list blank until most of it was on screen, so it was replaced. |
| How it works | The three steps reveal in order (180ms apart) and each step's top rule draws from left to right. |
| Micro-interactions | CSS only: buttons press to 98% scale on tap and the arrow nudges right on hover; feature cards tint and their icon tile fills with green on hover; nav links get a hairline underline that grows from the left. |

**Accessibility and performance**
- **Reduced motion:** with `prefers-reduced-motion: reduce`, `MotionConfig reducedMotion="user"` drops all movement, so content only fades in place. The floating shapes stay still, the count-up shows final values immediately, and the CSS hover and tap effects are `motion-safe:` only. This was verified in headless Chrome with `--force-prefers-reduced-motion`: no transforms were applied at any point.
- **Bundle:** `LazyMotion` with the `domAnimation` feature set and `m.*` components keep Motion small. The landing page is loaded as its own chunk (`React.lazy`), so signed-in app pages never download Motion. The landing chunk is about 37 kB gzipped, and the main bundle got slightly smaller than before the landing page existed.
- **Not built: the chart-line animation.** The brief asked for one in the dashboard preview, but the app has no chart (the Recharts chart is an unbuilt bonus feature). Showing an animated chart in a "preview of the existing application" would advertise a feature Sweety does not have, so it was left out.
