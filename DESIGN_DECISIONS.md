# Design decisions

This document records how Sweety's interface was designed, which reference it follows, and where it deliberately departs from both the PRD and that reference.

- Original requirements: [prd.md](prd.md), section 7 "UI/UX Design Direction"
- Visual reference supplied during development: [design.md](design.md)
- Implementation: design tokens in [`client/src/index.css`](client/src/index.css)

## 1. Why the theme is light-only, not dark as the PRD specified

The PRD (section 7) asked for *"Dark theme as the primary theme"* with *"White/light text on dark backgrounds."* The shipped app is **light-only**.

This was a product-owner decision made during development, not a technical shortcut:

1. **The project owner supplied a new visual direction.** After Milestone 1 (which was built dark, as the PRD said), the owner provided `design.md` and asked for it to be used. That reference is explicitly light (`Theme: light`, a `#f6f8f7` canvas with black ink). A later, explicit instruction from the owner takes precedence over the original PRD wording.
2. **Mixing the two would not be coherent.** The reference's whole identity depends on a near-white canvas with dark `#0f0e12` bands used as the *only* elevation device. Inverting it into a dark theme would remove that contrast mechanism, so the choice was to follow one direction fully.
3. **The PRD's underlying goals are still met.** Section 7's intent — clean, minimal, professional, consistent spacing, few colours, no excessive gradients or animation, accessible contrast — is satisfied. The light theme still uses dark surfaces: the login/register brand panel and the site footer are `#0f0e12` bands with light text.

**Light-only, deliberately.** `dark:` utilities are bound to a `.dark` class that is never set, so the app does not follow the operating system's dark mode. This was added after testing showed that, without it, shadcn components picked up parts of their dark styling on a Mac in dark mode, producing grey input fields.

If a dark theme is needed later, it is a token change: redefine the CSS variables in `:root` under a `.dark` selector and toggle the class. No component code needs to change.

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
