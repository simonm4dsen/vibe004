# UI/UX Design Protocol for AI-Generated Software

These are binding design rules for building or modifying any web app UI in this
repo. They exist to close the gap between "vibe-coded" software and a product
people trust and pay for. That gap is almost never the code — it's interface
decisions. Follow this checklist before considering any UI work done. Source:
distilled from "How I Design SaaS That Looks EXPENSIVE" (Oliver / Rosewell.dev).

## 0. Prime directive

Every element must answer: **does this help the user complete the job they
came to this screen for?** If it's decoration rather than information, delete
it. AI defaults tend to decorate; your job is to inform.

## 1. Undo the AI defaults (cheapest, highest-impact fixes)

- **No emojis as UI elements.** Use a real icon set (Phosphor, Lucide, or
  Feather) for every icon — decorative or functional. Icons must share
  consistent size, stroke weight, and color across the whole app.
- **No clashing gradients or glow/neon shadows.** Flat, muted surfaces only.
- **One border radius scale.** Never mix square and circular/pill buttons in
  the same context. Pick one radius (or a small consistent scale: e.g. sm/md/lg)
  and use it everywhere.
- **Center content inside buttons/badges** — no off-center icon+label pairs.
- **One consistent font-size scale.** Don't let similar elements (card titles,
  labels) render at different, seemingly random sizes.
- Never let color, icon set, or radius be "whatever the AI defaulted to" —
  audit and normalize after every AI-generated pass.

## 2. Color

- Never let the AI pick a saturated blue/purple "default SaaS" palette with a
  clashing second accent. That reads as a template.
- Pick **one restrained neutral base + one muted accent color.** Near-white /
  grayscale base, thin borders, no drop shadows unless purposeful.
- **Reserve color for meaning only**: statuses, charts, key metrics, one
  primary CTA. A dashboard where every button/icon is a different bright
  color looks cheap. The same layout in muted chrome with color only on data
  looks expensive.
- Use color to guide, not decorate: e.g. a primary "Send" action can be solid
  blue, a neutral "Save draft" can be plain/outlined, a risky "Discard" should
  be low-emphasis — the hierarchy of color visually tells the user which path
  to take.

## 3. Layout & density

- Never let the AI choose the layout uncritically. The clearest tell of
  AI-generated UI is **repetition** — the same KPI cards copy-pasted across
  dashboard, analytics, and billing pages.
- **Each page/screen answers exactly one question.** Before adding anything,
  ask "what is the one thing someone comes to this page for?" and delete
  everything else. A guest-list tab shows a list of guests — not analytics
  about guests.
- **Fix dense/repeated components first** — this is the biggest visible win
  for the least effort:
  - Collapse a row of action buttons into a single "⋯" (kebab) menu.
  - Turn repeated text chips into small icons.
  - Push the number/value that matters to the right; de-emphasize the rest.
  - Only show color when it symbolizes status/priority — don't color every
    field on a card.
- If a form only has a few fields, prefer a centered modal over a mostly-empty
  slide-out panel.
- Prefer "Load more" pagination over infinite scroll — it gives users control
  and lets them actually reach the footer.

## 4. Consistency (write it down)

- Maintain (and add to, as the project grows) a short **design rules doc**
  covering: text sizes, button heights, spacing scale, border radius, and the
  exact verb used for each destructive/common action (pick one of
  delete/remove/trash — never mix).
- Humans pattern-match. Inconsistent verbs/sizes/labels for the same action
  create silent friction users won't report — they'll just find the app
  annoying and leave.
- Establish a **type hierarchy per screen**: one bold "subject" (page title or
  primary value), muted secondary text, and a clear section label. If
  everything is the same size/weight, the user must read all of it to find
  what they want. (Reference feel: Basecamp — bold titles + muted secondary
  text and nothing else.)

## 5. Design from intent, not from blank-canvas instinct

- Start every screen by asking **"what did the person arrive to do?"** —not
  "where does the sidebar go" or "what cards look cool."
- Add functionality/filters only when a **second, real intent** appears (e.g.
  browsing vs. searching). Never add a feature just because there's space to
  fill — that puts words in the user's mouth.
- **Design for real/ugly data, not clean demo data.** Decide up front: how are
  long strings truncated (e.g. ellipsis after ~15 chars)? What does an empty
  state look like? What does a loading state look like? What does an error
  message look like? These are things new users hit constantly — design them
  deliberately, don't leave them to chance.
- When in doubt: **try deleting something before adding something.** "When
  there's nothing left to remove, that's when it's perfect."

## 6. Onboarding

- Never force a full product tour — users click through without reading.
- Use **progressive onboarding**: surface one obvious next action, reveal the
  next step only once the current one is complete.
- Make the very first action visually impossible to miss (e.g. stronger
  shadow/color + a literal "Start here" label).
- Show a progress bar / checklist toward a finish line.
- Celebrate small milestones (confetti, a short congratulatory email/toast) —
  it materially improves activation.

## 7. Perceived speed

- A ~1 second unexplained delay measurably hurts conversion. The fix is
  **showing something immediately**, not necessarily faster code.
- Use skeleton screens/shimmer placeholders for anything that fetches data —
  never a blank screen while loading.
- Show a progress indicator for anything taking > 1s; for genuinely long
  operations, use a light, playful animation.
- Users don't need raw speed, they need **evidence something is happening.**

## 8. Show value, don't leave it to guesswork

- Surface a concrete "impact" or "value" summary (hours saved, tasks
  automated, leads found, revenue generated, items processed, etc.) somewhere
  prominent, e.g. on the dashboard. If the app doesn't show what the user is
  achieving, they will assume it's little to nothing — never assume it's more.
- This is cheap to build and disproportionately effective for retention,
  especially in B2B tools that must be "justified" to a boss or to oneself.

## 9. Friction should be intentional

- Irreversible/destructive/expensive actions must never complete instantly on
  a single click.
- Require an explicit **confirmation step** ("Are you sure?") for destructive
  actions.
- For truly severe/irreversible actions (deleting a project, a database, an
  account), require **typing the resource's name to confirm.**
- After any destructive/completing action, show a clear **completion state**
  (checkmark, brief confetti, or an undo toast with a short window, e.g. 5s)
  so the user has proof it worked and a chance to reverse it. Never let
  something just silently vanish.
- Rule of thumb: friction should scale with the cost of being wrong.

## 10. Motion

- Animation must earn its place: **ask "does this motion tell the user
  something?"** If not, remove it.
- Acceptable: skeleton-loading fade-ins, a completion checkmark/confetti,
  purposeful state transitions.
- Avoid: scroll-jacking, parallax, elements flying in from edges, decorative
  transitions with no informational purpose.

## 11. Landing pages

- Avoid the generic template signature: alternating text-left/image-right
  sections repeated down the page.
- Prefer a single strong hero (headline + subheadline + one/two CTAs) that
  "breathes," followed by focused sections.
- Use real product screenshots, never stock photos.
- **All CTA buttons use identical copy** across the whole page (pick one of
  "Get Started" / "Try free" / "Book a demo" — never mix). Same label = same
  destination, reducing cognitive load.
- Prefer **cropped/zoomed screenshots** that highlight the one relevant part of
  the UI for that section, over full, busy dashboard screenshots.
- Use a **Bento-style grid** (varied cell sizes) instead of a row of identical
  cards, so different content gets appropriately different visual weight.
- Small "expensive" touches: a subtle badge, a row of customer logos, a mega
  menu on the nav that hints at product depth.
- Copy should describe **outcomes, not features**: rewrite "Collect and
  analyze your data" as "Turn your data into decisions." This single rewrite
  is often the biggest quality jump on a page.
- Keep the funnel simple: hero → 2-3 core value sections → social proof →
  single clear pricing → FAQ → final CTA/demo. Avoid a 20-step explanation of
  the product.

## 12. Working method for this repo

1. When implementing any new screen/component, first state in one sentence:
   "The user comes here to ___." Design only what serves that sentence.
2. After generating a UI with AI, run the **Section 1 checklist** (icons,
   radii, centering, font scale, gradients/shadows) as an explicit pass before
   calling it done.
3. Reuse existing spacing/radius/color/verb tokens already defined elsewhere
   in the codebase rather than introducing new ad-hoc values. If a new pattern
   is genuinely needed, add it to this document so it becomes the standard.
4. Prefer removing an element over adding one when a screen feels cluttered.
5. Always design and visibly account for: empty state, loading state, error
   state, and long/real-world data — not just the happy path with clean demo
   data.
