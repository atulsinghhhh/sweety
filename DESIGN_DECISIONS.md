# Design decisions

This document records how Sweety's interface is designed and why. The tokens themselves live in [`client/src/index.css`](client/src/index.css).

## History

1. The PRD (section 7) asked for a dark primary theme. Milestone 1 was built dark.
2. The owner supplied a light "industrial catalogue" reference (square corners, hairlines, thin type). The app became light, and a dark theme was later added back.
3. **November 2026:** the owner asked for a premium healthcare-SaaS redesign of the whole app. A first pass used a terracotta "apothecary" style reference the owner had supplied alongside the brief.
4. **Current:** the owner re-sent the brief alone, so the brief's own palette is now applied: warm off-white canvas, white surfaces, sage-green accent, deep charcoal type. The layouts, components, charts and motion from the redesign are unchanged; only the tokens, card surfaces, radii and shadows changed.

## 1. Visual system

| Element | Implementation |
|---|---|
| Palette (brief) | Background `#F8F9F5`, surface `#FFFFFF` (`bg-card`), primary `#668B72` (`brand`), primary light `#E5F0E7` (`brand-soft`), text `#202820`, border `#E8EBE5`. Supporting steps: `paper` `#F1F4EE` and `paper-deep` `#E8EDE4` for wells and hover, `rule` `#D5DCD2` for dashed outlines and dividers, `brand-muted` `#B9CDBE` for secondary marks. |
| Contrast adjustments | Two brief colours fail WCAG AA for normal-size text: `#777F77` secondary text (3.9:1) and white on `#668B72` (3.8:1). Secondary text therefore uses `#5E665E` (5.6:1), accent text uses `brand-ink` `#4E7059` (5.3:1), and filled buttons use `#557A61` (white 4.8:1). `#668B72` itself is used for chart marks, icons and fills. |
| Type | **Newsreader** (variable serif with optical sizes) for page titles, stat values and section headings, via the `font-display` utility; an `<em>` inside it becomes the light italic accent word ("Good afternoon, *Demo*."). **Inter** for all UI text. Uppercase 12px `eyebrow` labels sit above headings. |
| Shape | Cards 20px radius (`rounded-3xl` is remapped to 20px), nested cards 16px; pill buttons, inputs and selects. |
| Elevation | White cards with a 1px border and `shadow-soft`; `shadow-glow` for popovers, the active nav pill and the selected report tab; `shadow-float` for dialogs and landing previews. |
| Featured stat | The *Average* card is charcoal-filled so the number people check first leads the row. |

**Dark theme.** Deep green-black surfaces (`#121612` / `#171C17` / `#1A1F1A`), pale ink `#EEF2EC`, muted `#A3ADA3` (≥ 7.2:1) and a lighter sage `#8FB69A` (8.1:1) for the accent and buttons, with dark button text. The theme follows the OS until the toggle is used, the choice is saved in `localStorage` (`sweety_theme`), and an inline script in `index.html` prevents a flash of the wrong theme.

## 2. App screens

- **Shell.** A sticky, translucent top bar holds the wordmark, a pill-segmented navigation (Dashboard / Readings / Reports, with the active item in sage), the theme toggle, an initials avatar with name and email (≥ 1024px), and Log out. Under 768px the navigation moves to a full-width row below the bar. The selected `?date=` still carries across pages.
- **Dashboard.** A greeting header (date eyebrow, the serif greeting with the first name in italic) with the date picker and Add reading. Below it: the four stat cards for the selected day; a **14-day trend** chart beside a **daily timeline** of the four slots, where empty slots offer *Add*, opening the dialog with that slot preselected; and the recent-readings list.
- **Readings.** Four slot cards with distinct icons (sunrise, coffee, sun, moon) and a hint line. Each card shows one of three states: **Recorded** (white card, tick badge, value, Edit and Delete), **Not recorded** (dashed outline, Add reading), or **Editing** (sage ring and badge while its add or edit dialog is open). A four-segment progress bar shows *n of 4 readings*. Validation errors still appear under each field in the dialog, with the exact required wording.
- **Reports.** Three period tabs (Daily, Month to date, Previous month; Radix Tabs, so arrow keys work) each show that period's average and reading count, so all three periods can be compared at a glance. The selected period shows the four stat cards, then:
  - Daily: a bar chart by time slot and the read-only slot cards.
  - Month to date and previous month: a daily-trend chart and a **day-by-day table** (one row per day with readings, a column per slot, and the day's average).
  - Each period keeps its original empty-state text.
- **Auth and 404.** A split layout with an aged-paper brand panel (serif headline, three points, slot icons) beside the form. Under 1024px the panel is hidden and the wordmark shows above the form.

## 3. Charts

- **Recharts**, used only through `components/charts/*` and lazy-loaded (`React.lazy`), so the ~110 kB gzipped chart chunk downloads only when a chart is on screen. `TrendLegend` lives in its own file so pages can show it without pulling in Recharts.
- **No new endpoints.** The range charts and the day-by-day table use the existing `GET /api/readings?from=&to=`. Daily averages are computed client-side (`lib/stats.js`).
- **Honest data:** days without readings stay empty (the line bridges them, and the band leaves a gap); nothing is interpolated or invented. No glucose target ranges or "high/low" judgements are drawn, because Sweety does not give medical advice.
- **Marks:** single series in the accent. The line is 2px with dots for ranges of 16 days or fewer, plus a lowest-to-highest band. Bars have 4px top radius. The grid is horizontal-only, the y-axis uses round ticks (multiples of 50, or 100 for wide ranges), and a crosshair tooltip shows date, average, lowest, highest and count. Text uses ink tokens, never the series colour.
- **Reduced motion:** chart animations are turned off when `prefers-reduced-motion: reduce` is set (`hooks/useReducedMotion.js`).

## 4. Motion

- **App pages: CSS only.** The app doesn't download Motion. An `animate-rise` utility (10px fade-up, 0.6s, same curve as the landing page) staggers headers and cards via an inline `--delay`. Content is keyed by route, so each page eases in on navigation.
- **Landing page: Motion for React** (`LazyMotion` + `m.*`, its own chunk). The hero headline animates word by word, with the italic phrase "*one reading*". The preview rises in; its stats count up and its sample trend line draws itself. Soft sage discs drift slowly behind it. Sections reveal on scroll, the step vignettes and showcase bars grow in, and feature cards lift with `shadow-float` on hover.
- **Reduced motion:** `MotionConfig reducedMotion="user"` on the landing page, plus a global CSS rule that collapses animation and transition durations.

## 5. Landing page

Sections: hero (with three real facts: 4 slots a day, 3 report periods, the 40–600 mg/dL accepted range) → Features → How it works (numbered step cards with small UI vignettes) → Reports showcase → ink-filled final CTA → footer with the medical disclaimer.

**Content rules** carried over from the previous design:
- Previews are captioned "Illustrative preview · sample values" and exposed to screen readers as one labelled image.
- No medical claims.
- No invented metrics, pricing or testimonials.
- No links to pages that don't exist.

The previews now include charts because the app has them.

## 6. Accessibility

- Every text and background pair is ≥ 4.5:1 and control borders are ≥ 3:1 in both themes (checked with a contrast script during the redesign).
- Focus rings use the accent at 20–30% alpha.
- Stat cards are a `<dl>`. Charts sit next to an equivalent table or slot cards.
- Decorative icons are `aria-hidden`. An empty slot's "—" has screen-reader text "No reading".
- The skip link is kept.
