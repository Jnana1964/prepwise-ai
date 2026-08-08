# PrepWise AI — Design System (v1.0, locked)

This is the canonical spec. Every page and component in this codebase must follow it.
Encoded in `tailwind.config.js` and `src/index.css` — don't hardcode values that already
exist as tokens there.

## Design Principles

1. Consistency over creativity.
2. Data first, decoration second.
3. One primary action per screen.
4. Orange indicates action, never decoration.
5. Every page answers: Where am I? What have I completed? What should I do next?
6. No fake metrics or placeholder data — ever. If data isn't loaded yet, show a loading
   or empty state, never a made-up number.
7. Every component must be reusable.

## UX Philosophy

PrepWise AI follows a progressive disclosure design philosophy. Every page surfaces the
single most important metric first, then provides supporting details only as needed.
Users should never face unnecessary complexity. Primary actions are emphasized with the
orange accent, secondary actions remain subtle, and every screen guides the user toward
the next step in their placement journey.

## Color

| Token | Value | Use |
|---|---|---|
| `base` | `#0a0a0a` | page background |
| `surface` | `#131313` | cards |
| `surface2` | `#161616` | nested surfaces, hover states |
| `border` | `#242424` | hairline separators only |
| `accent-500` | `#ff6a1a` | the one accent — action, active state, primary metric |
| `muted` | `#9ca3af` | secondary text, inactive icons |
| `success` | `#22c55e` | status only (completed, matched) |
| `danger` | `#ef4444` | status only (rejected, error) |

## Spacing (8px system)

Use only: `4px 8px 12px 16px 24px 32px 48px 64px` — Tailwind's default scale (`1,2,3,4,6,8,12,16`)
already maps to this. Never write an arbitrary padding/margin value outside this set.

## Radius

| Element | Token | Value |
|---|---|---|
| Buttons | `rounded-btn` | 14px |
| Cards | `rounded-card` | 20px |
| Modals | `rounded-modal` | 24px |
| Inputs | `rounded-input` | 14px |
| Progress cards | `rounded-progress` | 20px |

## Icons

Lucide React only.

- 20px — navigation icons
- 18px — inline icons (list rows, buttons)
- 28px — metric/headline icons
- Orange — important/active actions only
- Gray (`muted`) — inactive
- Green/Red — status only, never decorative

## Elevation

Never use large drop shadows. Depth comes from `base → surface → hairline border` only.
The one exception: a soft glow (`shadow-glow`) on the active/focused element (e.g. the
current step in a progress stepper, a focused input).

## Motion

| Element | Effect | Duration | Easing |
|---|---|---|---|
| Card hover | `scale(1.02)` (`.card-hover`) | 150ms | default |
| Button | background-color transition | 150ms | default |
| Page transition | fade | 200ms | ease-out |
| Sidebar (mobile) | slide | 250ms | default |
| Progress bars/rings | animate to value | 800ms | ease-out |

## Inputs

Dark background (`surface2`), hairline border, orange border on focus, gray placeholder,
14px radius. Use the `.input` utility class — don't restyle inputs per page.

## Buttons

Exactly two variants, no third:

- `.btn-accent` — solid orange, primary action per screen
- `.btn-outline` — orange outline on transparent, secondary action

## Charts (Recharts)

- Line: orange (`#ff6a1a`)
- Area fill: orange at 20% opacity
- Grid lines: dark gray (`#242424`), never full-strength white
- Axis labels: muted gray (`#9ca3af`)
- Tooltip: dark card surface with hairline border, matches `.card`

## Tables / Lists

- No zebra striping
- Hover highlight only (`.table-row`)
- 40–48px row height (44px default)
- Status shown as a pill on the right (`.pill-success` / `.pill-danger` / `.pill-muted` / `.pill-accent`)
- Minimal borders — one hairline between rows, no vertical column borders

## Layout Shell

Fixed left sidebar (280px) + top header + main content. This never changes between pages —
only the content inside `<Outlet />` changes. See `src/layouts/DashboardLayout.jsx`.
