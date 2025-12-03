## Current App State

- Technology: Next.js TypeScript app created with `create-next-app`.
- UI: React components under `src/components/` including `ChatInput`, `MessageList`, `MessageBox`, and `Button`.
- API: Two server API routes use DeepL via `deepl-node`:
  - `src/pages/api/translate.ts` — translates arbitrary text (expects `DEEPL_API_KEY`).
  - `src/pages/api/hello.ts` — example route demonstrating translation.
- Environment: `.env.example` contains `DEEPL_API_KEY=`; the app reads `process.env.DEEPL_API_KEY`.
- Styling: mixture of CSS Modules and global CSS (`src/styles/`).

Notes:
- There is currently no UI for selecting source/target languages — the API calls the translator with a fixed target (`"es"` in the example).
- Translation key management is left to environment variables (local `.env.local` or hosting environment variables).

## MVP Goal

Enable selecting languages (both translated "from" and "to") and wire that selection through the UI to the translation API so a user can:

- choose a source language (or auto-detect),
- choose a target language,
- submit text in the chosen source language and receive the translated text in the target language in the normal chat/message view.

Acceptance criteria:
- UI has visible selectors for source and target languages (desktop + responsive mobile fallback).
- The selectors’ values are sent with the translation request and used by the API to request the correct translation from DeepL.
- The translation result displays in the message list as a translated message (maintain original message if desired).
- Local setup documented: user sets `DEEPL_API_KEY` in `.env.local` (see `README.md` / `.env.example`).

Implementation notes (high level):
- Add a `LanguageSelector` component under `src/components/LanguageSelector/` that exposes two dropdowns (source, target) and a callback `onChange({ source, target })`.
- Lift language state to a parent (e.g., page component `pages/index.tsx`) or a small React context `LanguageContext` so `ChatInput` and API-call helpers can read the selection.
- Update the client-side translation request to include `{ text, source_lang, target_lang }` in the POST body to `/api/translate`.
- Modify `src/pages/api/translate.ts` to accept optional `source_lang` and `target_lang` fields and call `translator.translateText(text, source_lang || null, target_lang)` (DeepL's API accepts `source_lang` or `null` to auto-detect).
- Keep behaviour backwards-compatible: when no languages are provided, fall back to the current hard-coded target (or `null` to let DeepL auto-detect + choose default target).
- Ensure `DEEPL_API_KEY` is required server-side and return a helpful 500-level error if missing.

Local dev steps (quick):

1. Create `.env.local` at project root with:

```dotenv
DEEPL_API_KEY=your_deepl_api_key_here
```

2. Start dev server:

```bash
npm run dev
# or
pnpm dev
```

3. Use the language selectors and send text to verify translation appears in `MessageList`.

## Stretch Goal — Conversation Mode

Provide a "conversation" mode where a user can type and carry on a conversation in one language, and each reply is shown both in the typed language and in the translated language.

Features / UX:
- Toggle to enable Conversation Mode.
- When enabled, messages are stored as conversation turns with both `originalText` and `translatedText`.
- Each assistant or partner reply is produced (or proxied to) by the translation service and displayed in two rows/cards: the reply in the conversation language, and the translated reply in the chosen alternate language.

Implementation notes:
- Conversation state shape: { id, author, originalText, translatedText, timestamp }.
- Either perform translation synchronously after receiving a reply from the assistant/service, or keep a background queue to translate messages and update the UI when translations arrive for better latency handling.
- If you later integrate an LLM/chat API, keep the translation step separate from the generation step so you can support: (a) generate in target language and translate back, or (b) generate in original language and translate forward.

Acceptance criteria (stretch):
- Conversation Mode toggle exists and persists per-session.
- Each turn shows both languages side-by-side (or stacked on mobile) with clear labels.
- Messages remain editable / copyable and accessible for privacy review.

## Next Steps / Action Items to Reach MVP

- Implement `LanguageSelector` component
  - Create `src/components/LanguageSelector/` with two dropdowns: `source` (include "Auto-detect") and `target`.
  - Expose an `onChange({ source, target })` callback for parent components.
- Lift language state or add `LanguageContext`
  - Store selected `source`/`target` at the page level (e.g., `pages/index.tsx`) or in a small `LanguageContext` so `ChatInput` and other components can access it.
- Update `ChatInput` to include language values in requests
  - Send `{ text, source_lang, target_lang }` in the POST body to `/api/translate` when submitting text.
- Update server API route (`/api/translate`)
  - Accept optional `source_lang` and `target_lang` fields in the request body.
  - Require `DEEPL_API_KEY` and return a clear 500-level error if it's missing.
  - Call `translator.translateText(text, source_lang || null, target_lang)` so DeepL can auto-detect when `source_lang` is omitted.
- Display translated results while preserving originals
  - Show translated messages in `MessageList` and keep original text (or show both in Conversation Mode if enabled).
- Docs & environment
  - Update `README.md` with instructions to set `DEEPL_API_KEY` in the `.gitignore`'d file in order to run the app locally.
  - Update the `README.md` to accurately represent the app
- (Optional) Add API tests
  - Add tests for `/api/translate` to validate payload handling and behavior when `DEEPL_API_KEY` is missing.
