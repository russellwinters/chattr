# Base Stylesheet Reference

Located at: `styles/base/`

Import in component SCSS modules with:
```scss
@import '../styles/base/component';
```

`_component.scss` re-exports `_vars.scss` and `_mixins.scss` — all variables and mixins below are available after this import.

---

## Colors

### Background

| Variable               | Value     | Usage                        |
| ---------------------- | --------- | ---------------------------- |
| `$color-bg-primary`    | `#F5F7F5` | Page background (off-white)  |
| `$color-bg-secondary`  | `#FFFFFF` | Card/section backgrounds     |
| `$color-bg-tertiary`   | `#3D4F3D` | Dark card/section backgrounds |

### Text

| Variable                 | Value     | Usage                          |
| ------------------------ | --------- | ------------------------------ |
| `$color-text-primary`    | `#1A2E1A` | Headings, body text (deep forest) |
| `$color-text-secondary`  | `#3D4F3D` | Captions, secondary text       |
| `$color-text-muted`      | `#5A6B5A` | Metadata, timestamps           |

### Accent

| Variable               | Value     | Usage                              |
| ---------------------- | --------- | ---------------------------------- |
| `$color-accent`        | `#2E7D6F` | Links, interactive elements (forest green) |
| `$color-accent-hover`  | `#236358` | Hover states                       |
| `$color-accent-alt`    | `#3B82A0` | Secondary accent (sky/ocean blue)  |

### Border

| Variable        | Value     | Usage                          |
| --------------- | --------- | ------------------------------ |
| `$color-border` | `#D4DDD4` | Subtle dividers, card borders  |

### Header (template/placeholder)

| Variable                       | Value     |
| ------------------------------ | --------- |
| `$color-header-gradient-start` | `#0f172a` |
| `$color-header-gradient-end`   | `#1e293b` |
| `$color-header-link`           | `#93c5fd` |
| `$color-header-text`           | `#ffffff` |

---

## Spacing (8px base)

| Variable  | Value | Usage                        |
| --------- | ----- | ---------------------------- |
| `$space-1` | 4px  | Tight groupings              |
| `$space-2` | 8px  | Related elements             |
| `$space-3` | 16px | Component internal padding   |
| `$space-4` | 24px | Between components           |
| `$space-5` | 32px | Section internal margins     |
| `$space-6` | 48px | Major section gaps           |
| `$space-7` | 64px | Page section rhythm          |

---

## Layout

| Variable                     | Value  | Usage                          |
| ---------------------------- | ------ | ------------------------------ |
| `$max-content-width`         | 720px  | Optimal reading line length    |
| `$container-padding-mobile`  | 24px   | Mobile horizontal padding      |
| `$container-padding-desktop` | 48px   | Desktop horizontal padding     |
| `$section-spacing`           | 64px   | Vertical rhythm between sections |

---

## Breakpoints

| Variable              | Value  |
| --------------------- | ------ |
| `$breakpoint-mobile`  | 600px  |
| `$breakpoint-tablet`  | 768px  |
| `$breakpoint-desktop` | 1024px |

Use with standard media queries (mobile-first):

```scss
@media (min-width: $breakpoint-tablet) { ... }
@media (min-width: $breakpoint-desktop) { ... }
```

---

## Typography — Font Family

| Variable             | Value                                                              |
| -------------------- | ------------------------------------------------------------------ |
| `$font-family-base`  | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...`       |

---

## Typography — Font Sizes

| Variable              | Value       | Usage                    |
| --------------------- | ----------- | ------------------------ |
| `$font-size-h1`       | 2.5rem (40px) | Hero headings          |
| `$font-size-h1-mobile`| 1.5rem (24px) | Mobile hero heading    |
| `$font-size-h2`       | 1.75rem (28px) | Section headings      |
| `$font-size-h3`       | 1.25rem (20px) | Subsection headings   |
| `$font-size-body`     | 1rem (16px) | Body text                |
| `$font-size-caption`  | 0.875rem (14px) | Captions, metadata   |

---

## Typography — Font Weights

| Variable               | Value |
| ---------------------- | ----- |
| `$font-weight-normal`  | 400   |
| `$font-weight-semibold`| 600   |
| `$font-weight-bold`    | 700   |

---

## Typography — Line Heights

| Variable                | Value |
| ----------------------- | ----- |
| `$line-height-h1`       | 1.2   |
| `$line-height-h2`       | 1.3   |
| `$line-height-h3`       | 1.4   |
| `$line-height-body`     | 1.6   |
| `$line-height-caption`  | 1.5   |

---

## Typography — Mixins

Defined in `styles/base/_mixins.scss`. Use these instead of writing raw `font-size`, `font-weight`, and `line-height` combinations.

| Mixin               | Font size        | Weight   | Line height |
| ------------------- | ---------------- | -------- | ----------- |
| `@include heading-1` | 2.5rem (40px)   | bold     | 1.2         |
| `@include heading-2` | 1.75rem (28px)  | semibold | 1.3         |
| `@include heading-3` | 1.25rem (20px)  | semibold | 1.4         |
| `@include body-text` | 1rem (16px)     | normal   | 1.6         |
| `@include caption-text` | 0.875rem (14px) | normal | 1.5      |

All typography mixins also set `font-family: $font-family-base`.

---

## Animation/Transition

| Variable            | Value  |
| ------------------- | ------ |
| `$transition-fast`  | 150ms  |
| `$transition-normal`| 200ms  |
