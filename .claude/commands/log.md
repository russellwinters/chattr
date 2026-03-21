---
name: log
description: Add telemetry logging to code using the shared-telemetry package where appropriate.
argument-hint: <file references> (one or many files to add logging to)
---

Enhance code observability by adding meaningful telemetry logging using the `shared-telemetry` package. Process each referenced file with strategic logging additions.

## Step 1: Parse Arguments

- Extract file references from `@ARGUMENTS`.
- If no arguments provided, ask the user to specify one or more files to add logging to.
- For each file reference, resolve to an absolute workspace path.

## Step 2: Process Each File

For each file:

### A. Identify Logging Opportunities

Look for:

- **Async function calls** — wrap with `withSpan()` from `shared-telemetry`
- **Sync operations** — wrap with `withSpanSync()` for synchronous operations
- **Error handling** — use `recordException()` in catch blocks
- **State changes** — use `addSpanAttributes()` to record important state
- **API calls** — log method, endpoint, and response status
- **Database operations** — log operation type, table/collection, duration
- **Business logic milestones** — log key decision points, especially those affecting user experience

### B. Apply Telemetry

Import from `shared-telemetry`:

```typescript
import { withSpan, withSpanSync, recordException, addSpanAttributes } from "shared-telemetry";
```

For async operations:

```typescript
// Before
async function fetchUser(id: string) {
  const user = await db.users.find(id);
  return user;
}

// After
async function fetchUser(id: string) {
  return withSpan("fetchUser", async (span) => {
    span.setAttributes({ userId: id });
    const user = await db.users.find(id);
    span.setAttributes({ found: !!user });
    return user;
  });
}
```

For sync operations:

```typescript
// Before
function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// After
function calculateTotal(items: Item[]) {
  return withSpanSync("calculateTotal", (span) => {
    span.setAttributes({ itemCount: items.length });
    return items.reduce((sum, item) => sum + item.price, 0);
  });
}
```

For error handling:

```typescript
try {
  // operation
} catch (error) {
  recordException(error instanceof Error ? error : new Error(String(error)));
  throw error;
}
```

### C. Strategic Logging

- **Focus on business logic**, not utility functions (e.g., log API calls, not string trimming)
- **Avoid over-logging** — don't wrap every single function unless it's a critical path
- **Use meaningful span names** — e.g., `"createUserAccount"` not `"fn5"`
- **Include relevant context** — user IDs, request types, error reasons
- **Log once at the entry point** for sequences of related operations, rather than at every sub-function

### D. Apply Changes

- Update imports to include `shared-telemetry` functions.
- Wrap appropriate function bodies with `withSpan()`, `withSpanSync()`, or error handling with `recordException()`.
- Preserve existing logic and structure—only add logging.

## Step 3: Verify & Format

- Ensure all imports are correct and the `shared-telemetry` package is available in the file's dependency tree.
- Run `nx format:write` to apply consistent formatting across all modified files.

## Step 4: Summary

Provide a concise summary of logging additions:

- Number of functions/operations instrumented
- Key logging points added (e.g., API calls, error handling, state changes)
- Any files that required imports from `shared-telemetry`

## Notes

- Only add logging if it increases observability meaningfully. Avoid logging internal helpers.
- If a file is a test file or utility library, log sparingly (focus on integration points).
- Preserve type safety—use `span.setAttributes()` with appropriate key-value pairs.
- If a function is already using telemetry, enhance it rather than replace it.
