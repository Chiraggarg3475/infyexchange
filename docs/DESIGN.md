# InfyExchange – Design brief

The agent must follow this file for ALL UI work. If a choice here conflicts with a library default, this file wins.

## Subject and direction
**Who:** Infosys Mysore trainees, roughly 18–25, on phones first, laptops second.
**Primary jobs:** post an item in under a minute; find something nearby and contact the owner quickly.
**Place:** Mysore. The palace lit with gold bulbs at night; the campus lawns by day.
**Direction: "Palace lights".** Day mode is fresh campus-lawn green on cool white. Night mode is the palace after dark: deep green-black with warm bulb-gold.
**The one memorable idea:** the price tag. Prices are tag-shaped, and the landing hero is a row of price tags hanging on strings. Everything else stays quiet and disciplined.

## Colour tokens (map to shadcn CSS variables in `globals.css`, light and `.dark`)
| Token | Day | Night |
|---|---|---|
| background (Mist / Dusk) | `#F3F6F4` | `#08120F` |
| surface | `#FFFFFF` | `#0F1C17` |
| raised (menus, dialogs) | `#FFFFFF` | `#152720` |
| ink (text) | `#10201A` | `#ECF2EE` |
| muted text | `#5B6E65` | `#8FA69B` |
| line (borders) | `#DCE4DF` | `#1F332B` |
| primary (buttons, links) | Lawn `#0F5C45` | Gold `#F4B73F` |
| primary-foreground | `#FFFFFF` | `#1A1305` |
| accent (Gold) | `#E8A317` | `#F4B73F` |
| destructive | `#C93A3A` | `#F06A6A` |

Kind colours (badge text/border; use ~12% tint as the fill):
For sale `#2B5BD7` / night `#6C8CF5` · Rent or lend `#D4691F` / night `#F0914A` · Free `#14925F` / night `#3CC48B` · Wanted `#C0306A` / night `#EE6A9F`.
Gold appears only on: the Post button, price tags, the active nav pill, focus accents. Never use pure `#000` or `#fff` as a page background. Meet WCAG AA contrast in both themes.

## Typography
- Headlines, prices, wordmark: **Bricolage Grotesque** (700, tracking about -0.02em). Load with `next/font/google`.
- Body and UI: **Geist** (400/500/600). Load with `next/font/google`.
- Scale (px): 12, 14, 16, 18, 22, 28, 40, and a fluid hero `clamp(40px, 7vw, 72px)`. Line length under 70 characters. Prices use tabular figures.
- Sentence case everywhere. No ALL-CAPS labels or eyebrows above headings. No underlined or italic single-word accents in headlines.

## Shape and depth
- Listing images radius 20px. Buttons and inputs radius 12px. Chips are pills.
- **PriceTag** component: a small tag shape (one notched corner via `clip-path`, a tiny punched hole), Gold fill with dark ink text, Bricolage 700. Used for every price. Free items show a green "Free" tag; wanted items show "Budget ₹…" in a violet-pink outline tag.
- 1px hairline borders in `line`. Shadows only on things that float (menus, dialogs, the mobile Post button): one soft ink-tinted shadow.
- **Do not wrap every listing in a bordered card.** Feed tiles are borderless and image-first (image on top, title and tag below). Use cards only for forms, the contact card and dialogs.

## Layout
**Mobile (up to 767px):** top bar with wordmark on the left and theme toggle + avatar on the right. Bottom nav with Browse, My, Alerts, Profile and a raised round gold Post button in the middle. Feed is 2 columns.
**Desktop (1024px and up):** top bar with wordmark, a centred search field, a gold "Post an item" button, theme toggle, avatar menu. Feed is 4 columns inside a 1200px container. Listing detail is two columns: sticky gallery on the left (about 7/12), info and contact card on the right (about 5/12).
**Tile image:** fixed 4:5 aspect ratio (prevents layout shift), `loading="lazy"`.
**Landing (logged-out), left-aligned on desktop and stacked on mobile:**
```
[wordmark]                                  [theme] [Continue with Google]
 |      |       |        |       |
[tag]  [tag]   [tag]    [tag]   [tag]     <- hanging price tags on strings
 Buy, sell, borrow or give away. Right on campus.   (hero headline)
 A swap-shop for Infosys Mysore trainees. Post an item in a minute, then meet in person.
 [Continue with Google]   You'll need your batch's access code.
 Small line: "Unofficial community app. Not run by Infosys."
```
Sample tags: "Study table ₹1,500", "Cycle ₹20 a day", "Free: winter hoodie", "Wanted: iron box", "Formal shoes ₹600".

## Motion (library: `motion`, import from `motion/react`)
Motion is restrained. One orchestrated moment plus motion that answers a user's action. Do NOT add fade-up on every section or lift-on-hover on every card.
1. **Hero (the single non-user-triggered moment):** the hanging tags drop in once with a spring, staggered 90ms apart, then idle-sway slowly (about ±2 degrees, different phase and duration per tag). Tapping a tag makes it swing.
2. **Feed first load:** the first 8 tiles stagger in (40ms apart), once. Not on scroll, not on "Load more".
3. **Press feedback:** buttons and tiles scale to 0.97–0.98 on press with a spring. On desktop hover, the tile image scales to 1.03 (no lift, no shadow change).
4. **Bottom nav:** the active pill slides between tabs (shared `layoutId`).
5. **Theme toggle:** sun and moon morph with a rotation, and colours cross-fade over 250ms.
6. **Post form:** choosing a kind highlights the card with a ring and a popping checkmark; fields that change animate height.
7. **Photos:** picked photos scale in; a progress ring shows while uploading.
8. **Gallery:** swipe on touch, arrow keys on desktop; dots morph.
9. **Contact card:** expands from the "Contact owner" button with a spring.
10. **Post success:** a tag "stamps" onto the screen saying "Posted", then navigate to the listing.
11. **Delete:** after confirming, the tile collapses (height to 0 and fade).
Animate only `transform` and `opacity`. Honour `prefers-reduced-motion` (no sway, no stagger, no springs; instant state changes).

## Components to build once and reuse
TopBar, BottomNav, ThemeToggle, ListingTile, PriceTag, KindBadge, Gallery, ContactCard, EmptyState, ConfirmDialog, ComingSoon, skeletons with a gentle shimmer.

**ComingSoon:** a control (button, tab or card) with a dashed outline and a small gold "Soon" pill. Tapping it opens a small sheet: title = feature name, text = "We're building this. Want it sooner? Tell us what you'd like.", and a button that opens `FEEDBACK_URL` from `src/lib/config.ts` (hide the button if the URL is empty). It performs no backend work.

## Copy rules
- Plain verbs, active voice, sentence case. CTAs say exactly what happens: "Post an item", "Contact owner", "Mark as done", "Delete listing". The same action keeps the same name through the flow (button "Post", toast "Posted").
- Errors say what went wrong and how to fix it; they don't apologise or blame.
- Empty states invite an action ("Nothing here yet. Post the first item.").
- No "→" on buttons, no middle-dot strings like "A · B · C", no emoji in the interface chrome.

## Quality floor
Responsive from 360px to 1536px with no horizontal scroll. Visible keyboard focus (2px ring in primary, 2px offset). Tap targets at least 44px. Images have fixed aspect ratios. Both themes tested on every screen.

## Restraint
Spend boldness in one place: the hanging tags and the gold price tags. Keep everything else calm. If a decoration doesn't help someone post, find or contact, remove it.
