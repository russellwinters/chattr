---
name: design-portfolio
description: >
  Guide portfolio page design by asking clarifying questions, then generating
  both desktop and mobile wireframe layouts written to a FigJam board using
  generate_diagram. Accepts a FigJam board URL and optional purpose description.
  Trigger phrases include: "design my portfolio", "portfolio wireframe", "portfolio layout".
argument-hint: <figjam-url> [purpose description]
---

# Portfolio Design Wireframe Generator

Guide the design of a personal portfolio page and generate annotated desktop and mobile wireframes directly in a FigJam board.

## Step 1 — Parse Arguments and Verify Access

Parse `$ARGUMENTS` for:

1. **FigJam URL** — the first argument (required). Must match `figma.com/board/:fileKey/...`.
2. **Purpose description** — everything after the URL (optional seed context).

**URL validation:**
- Extract `fileKey` from `figma.com/board/:fileKey/...`
- If the URL matches `figma.com/design/...` instead, stop and respond:
  > ⚠️ This command writes wireframes to **FigJam boards** (`figma.com/board/...`), not Figma design files. Please provide a FigJam board URL and try again.
- If no URL is provided, ask the user to supply one before proceeding.

After extracting a valid `fileKey`, call `whoami()` to verify Figma access. If access fails, report the error and stop.

Store the `fileKey` for use in Steps 4 and 5.

## Step 2 — Ask 6 Clarifying Questions (single message)

Send **one message** containing all six questions. Do not proceed until the user has answered them.

---

To design wireframes that fit your specific portfolio, I need a few details:

1. **Who are you?** What is your profession, role, and specialty? (e.g., "senior product designer focused on fintech UX", "full-stack engineer specializing in developer tools")

2. **Who is your primary audience?** Check all that apply: recruiters, hiring managers, direct clients, creative peers, conference organizers, investors, other?

3. **What work do you want to feature?** List 2–4 projects with a name and one-line outcome for each. (e.g., "Redesigned onboarding — reduced drop-off 35%")

4. **What tone and personality should the portfolio convey?** (e.g., minimal and precise, bold and editorial, warm and approachable, technical and rigorous)

5. **Which sections do you need?** Check all that apply:
   - [ ] Hero
   - [ ] Featured Projects
   - [ ] About / Bio
   - [ ] Skills / Stack
   - [ ] Testimonials
   - [ ] Blog / Writing
   - [ ] Contact

6. **What navigation pattern fits best?**
   - Single-page scroll (best for designers/creatives, works well with animation)
   - Multi-page (best for many projects, better SEO, individual case study pages)
   - Hybrid (main sections on one page, case studies on separate pages)

---

Wait for the user's answers before continuing.

## Step 3 — Apply Portfolio Design Patterns

Using the user's answers, prepare the layout plan:

**30-second test** — Verify the first viewport (above the fold) will contain:
- Who they are (name + role)
- What they do (one-line differentiator)
- Best work (visible path to projects)
- How to contact (or clear CTA)

If the proposed section order would bury any of these, flag it and reorder accordingly.

**Hero copy** — Construct real copy (not lorem ipsum) using the Hero Section Formula:
```
[Name or preferred identifier]
[What they do in one line — from Q1]
[One line that differentiates them — synthesized from Q1 + Q3 outcomes]
[CTA: View Work / See Projects / Get in Touch]
```

**Section order** — Arrange sections using priority from the skill:

| Section | Priority |
|---------|----------|
| Hero | Critical — always first |
| Featured Projects | Critical — second |
| About / Bio | Important — third if selected |
| Skills / Stack | Situational — after About if selected |
| Testimonials | Nice to have — after Skills if selected |
| Blog / Writing | Optional — near end if selected |
| Contact | Critical — always last before footer |

Apply the navigation pattern from Q6 to the nav bar design.

**Project cards** — For each project from Q3, plan card elements:
- Thumbnail placeholder
- Project title
- One-liner (what they did — from Q3 outcome)
- Tech / tags
- Impact metric (from Q3 outcome)

## Step 4 — Write Desktop Wireframe → `generate_diagram`

Call `generate_diagram` with:
- `fileKey`: extracted in Step 1
- `title`: "[Name]'s Portfolio — Desktop Layout (1280px)"

The diagram should represent a full-page wireframe at 1280px viewport width with these sections in order, annotated with heights and notes:

```
┌─────────────────────────────────────────────┐
│ NAV BAR                              ~64px   │
│ Logo/Name · [Section links] · CTA button     │
│ Background: solid or transparent on scroll   │
├─────────────────────────────────────────────┤
│ HERO                                ~100vh   │
│ 2-column layout: left copy / right image     │
│ Left: H1 name, role line, differentiator,    │
│       CTA button (primary) + secondary link  │
│ Right: Photo or abstract visual              │
│ Background: [from tone answer]               │
├─────────────────────────────────────────────┤
│ FEATURED PROJECTS                   ~auto    │
│ Section heading + subtext                    │
│ [3-column card grid — one card per project]  │
│ Each card: thumbnail · title · one-liner     │
│            tags · impact metric · link       │
│ Max content width: 1184px (1280 - 48px×2)   │
├─────────────────────────────────────────────┤
│ [ADDITIONAL SECTIONS — in priority order]    │
│ Each section: ~400–600px tall                │
│ Full-width or max-width container            │
│ Alternating background treatments            │
├─────────────────────────────────────────────┤
│ CONTACT                             ~300px   │
│ Centered: heading + subtext + email CTA      │
│ Optional: contact form or social links       │
├─────────────────────────────────────────────┤
│ FOOTER                               ~80px   │
│ Name · Nav links · Social icons · © year    │
└─────────────────────────────────────────────┘
```

**Annotations to include:**
- Section heights (px or vh)
- Max-content-width container: 1184px (1280px − 48px padding each side)
- Desktop breakpoint: 1024px+
- Nav: sticky on scroll, background fills on scroll past hero
- Hero: min-height 100vh; image column 40% width
- Project grid: 3 columns, 24px gap between cards
- Section rhythm: 64px vertical gap between sections
- CTA button: 48px height, 24px horizontal padding, minimum touch target

## Step 5 — Write Mobile Wireframe → `generate_diagram`

Call `generate_diagram` a second time with:
- `fileKey`: same fileKey from Step 1
- `title`: "[Name]'s Portfolio — Mobile Layout (390px)"

The diagram should represent a full-page wireframe at 390px viewport width:

```
┌─────────────────┐
│ NAV BAR  ~56px  │
│ Logo · ☰ icon   │
│ Hamburger menu  │
├─────────────────┤
│ HERO    ~100vh  │
│ Stacked layout  │
│ Image (full-w)  │
│ H1 name (24px)  │
│ Role line       │
│ Differentiator  │
│ Full-width CTA  │
├─────────────────┤
│ FEATURED WORK   │
│ Single column   │
│ Full-width cards│
│ 16px gap        │
├─────────────────┤
│ [OTHER SECTIONS]│
│ Single column   │
│ 24px h-padding  │
├─────────────────┤
│ CONTACT         │
│ Stacked, center │
│ Full-width CTA  │
├─────────────────┤
│ FOOTER  ~120px  │
│ Stacked links   │
└─────────────────┘
```

**Annotations to include:**
- Viewport width: 390px; horizontal padding: 24px each side
- Mobile breakpoint: below 600px
- Nav: hamburger icon (44×44px touch target); drawer opens full-width overlay
- Hero: image above copy (not side-by-side); H1 font-size 24px (vs 40px desktop)
- Project cards: full-width single column; 16px vertical gap
- CTA buttons: full-width (stretch to container), 48px height
- Section gap: 48px vertical (vs 64px desktop)
- All tap targets: minimum 44×44px
- Note stacking behavior change from each desktop section

## Step 6 — Report

After both `generate_diagram` calls succeed, output:

1. **Confirmation** — both wireframes written, with the FigJam board URL
2. **Layout summary:**
   - Section order used and nav pattern chosen
   - Hero copy constructed (the actual 4-line formula output)
   - 30-second test: ✅ pass or ⚠️ flag with the issue
3. **Next steps:**
   - `/project-plan` — generate implementation tickets from this design
   - `/frontend-design` — build the components from the wireframe
   - `/frontend-styles` — apply SCSS tokens and spacing to the implementation
