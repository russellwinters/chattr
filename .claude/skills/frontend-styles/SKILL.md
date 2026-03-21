---
name: frontend-styles
description: This skill should be used when writing or reviewing SCSS styles for frontend components. It enforces the project's SCSS module conventions, nested selector structure mirroring the TSX component hierarchy, and DRY use of the shared base stylesheet tokens and mixins.
---

# Frontend Styles

To write styles for a frontend component, follow these conventions.

## File Structure

Every TSX component that needs styles gets a co-located SCSS module:

```
components/ComponentName.tsx
components/ComponentName.module.scss   ← created alongside the TSX file
```

Import styles in the TSX file as:

```tsx
import styles from "./ComponentName.module.scss";
```

Apply class names via the `styles` object: `className={styles.container}`, `className={styles.header}`, etc.

## SCSS Module Conventions

### Always import base

Every module must begin with:

```scss
@import '../styles/base/component';
```

This provides access to all shared variables and mixins from `styles/base/_vars.scss` and `styles/base/_mixins.scss`. Never hardcode a value that has a base token equivalent — always use the token. See `references/base-tokens.md` for the full list.

**Common violations to avoid:**

| Instead of...                                | Use...                         |
| -------------------------------------------- | ------------------------------ |
| `gap: 24px`                                  | `gap: $space-4`                |
| `padding: 16px`                              | `padding: $space-3`            |
| `color: #1A2E1A`                             | `color: $color-text-primary`   |
| `background: #F5F7F5`                        | `background: $color-bg-primary`|
| `font-weight: 700`                           | `font-weight: $font-weight-bold` |
| `font-size: 40px` / heading styles           | `@include heading-1`           |
| `font-size: 16px` / body styles              | `@include body-text`           |
| `font-size: 14px` / caption styles           | `@include caption-text`        |

### Typography mixins are mandatory

**Never write raw `font-size`, `line-height`, or `font-weight` combinations.** Always use a typography mixin from `styles/base/_mixins.scss` instead.

**Decision process for any text element:**

1. Check `references/base-tokens.md` (Typography — Mixins section) for a mixin that matches the intended text style.
2. If a mixin fits — use it: `@include heading-1`, `@include body-text`, `@include caption-text`, etc.
3. If no existing mixin fits — **do not write raw font properties**. Instead leave a TODO comment and write the raw properties below it so the styles still work:

```scss
// TODO: find an appropriate typography mixin for this text style
//       Figma reference: "<Text Style Name>" (e.g. "Body/Label Small" or "Heading/Display")
font-size: 15px;
line-height: 20px;
font-weight: $font-weight-semibold;
```

If you have access to the Figma design, include the exact Figma text-style name in the TODO comment. If the Figma style matches an existing mixin closely but not exactly, prefer the closest mixin and note the discrepancy in the comment.

### Mirror the JSX nesting

The SCSS selector hierarchy must mirror the JSX component tree. Every class on a JSX element should be nested inside its parent's selector.

**TSX:**

```tsx
<section className={styles.section}>
  <div className={styles.heading}>
    <h2 className={styles.title}>Title</h2>
    <p className={styles.description}>...</p>
  </div>
  <div className={styles.card}>
    <p className={styles.caption}>...</p>
  </div>
</section>
```

**Corresponding SCSS:**

```scss
@import '../styles/base/component';

.section {
  padding: $space-4;

  .heading {
    display: flex;
    flex-direction: column;
    gap: $space-3;

    .title {
      @include heading-2;
    }

    .description {
      @include body-text;
    }
  }

  .card {
    background-color: $color-bg-secondary;
    border: 1px solid $color-border;
    padding: $space-4;

    .caption {
      @include caption-text;
    }
  }
}
```

Do not write flat selectors. Nesting depth should match JSX depth exactly.

### Responsive styles

Use `@media` queries with the breakpoint variables, at the bottom of the file, outside the root selector, in mobile-first order:

```scss
.section {
  // mobile-first base styles
  padding: $space-3;
}

@media (min-width: $breakpoint-tablet) {
  .section {
    padding: $space-5;
    // nested overrides as above
  }
}

@media (min-width: $breakpoint-desktop) {
  .section {
    padding: $space-6;
  }
}
```

## DRY Principles and Extending Base

### Prefer base tokens over one-off values

Before writing any CSS property value, check `references/base-tokens.md`. If a matching token exists, use it.

### When to extend base

If the same raw value or style pattern appears in **2 or more separate component modules** and no base token covers it, propose adding a variable or mixin to the base stylesheet rather than duplicating the hardcoded value.

To extend base, add to the appropriate file in `styles/base/`:

- New variables → `_vars.scss` (and `_variables.scss` if CSS custom properties are needed globally)
- New typography mixins → `_mixins.scss`

After adding, the new token is available to all modules via `@import '../styles/base/component'`.

### Audit for hardcoded values

When reviewing or writing a SCSS module, scan for:

1. Pixel values that match spacing tokens (`$space-1` through `$space-7`)
2. Hex colors that match color variables (`$color-*`)
3. Any `font-size`, `line-height`, or `font-weight` declarations → **always** replace with a typography mixin; if none fits, add a TODO comment (see "Typography mixins are mandatory" above)
4. Transition durations → use `$transition-fast` (150ms) or `$transition-normal` (200ms)
5. Repeated `border` or `border-color` values → use `$color-border`

## Reference

Load `references/base-tokens.md` to see the full list of available variables and mixins when writing styles.
If extending the base tokens, update the reference as well.
