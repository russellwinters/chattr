# LanguageSelector Component - Architecture Diagrams

## Component Hierarchy

```
App (_app.tsx)
└── LanguageProvider (NEW)
    └── Home (index.tsx)
        ├── MessageList
        │   └── MessageBox (multiple)
        ├── LanguageSelector (NEW)
        └── ChatInput
            ├── Input
            └── Button
```

## File Structure

```
chattr/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   ├── ChatInput/
│   │   ├── Input/
│   │   ├── MessageBox/
│   │   ├── MessageList/
│   │   ├── LanguageSelector/          ← NEW
│   │   │   ├── LanguageSelector.tsx
│   │   │   ├── LanguageSelector.module.scss
│   │   │   └── index.ts
│   │   └── index.ts (updated)
│   ├── contexts/                       ← NEW FOLDER
│   │   └── LanguageContext.tsx
│   ├── utils/
│   │   ├── events.ts
│   │   └── languages.ts                ← NEW
│   ├── pages/
│   │   ├── _app.tsx (updated)
│   │   ├── index.tsx (updated)
│   │   └── api/
│   │       └── translate.ts (updated)
│   └── styles/
│       └── Home.module.scss (updated)
└── docs/                               ← NEW FOLDER
    ├── language-selector-plan.md
    ├── language-selector-quick-reference.md
    └── language-selector-diagrams.md (this file)
```

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Application Start                     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              LanguageProvider Initializes                │
│   - Reads from localStorage('chattr_target_language')   │
│   - Falls back to 'es' if not found                     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Context Value Available                     │
│   { targetLanguage: 'es', setTargetLanguage, ... }      │
└────────────┬────────────────────────────┬────────────────┘
             │                            │
             │                            │
    ┌────────▼────────┐          ┌───────▼────────┐
    │ LanguageSelector│          │   ChatInput     │
    │  (consumer)     │          │   (consumer)    │
    └────────┬────────┘          └───────┬────────┘
             │                            │
             │                            │
    User selects language            User submits text
             │                            │
             ▼                            │
    setTargetLanguage('fr')              │
             │                            │
             ▼                            │
    Context updates                      │
             │                            │
             ▼                            │
    localStorage.setItem(...)            │
             │                            │
             └────────────┬───────────────┘
                          │
                          ▼
                  ChatInput re-renders
                          │
                          ▼
            Sends API request with language
                          │
                          ▼
                   /api/translate
                          │
                          ▼
                  DeepL API translates
                          │
                          ▼
                  Response returned
                          │
                          ▼
            Message displayed in MessageList
```

## UI Layout

### Desktop View (≥768px)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                     Message List                        │
│  ┌──────────────────────────────────────────────┐     │
│  │ Message in English here.                     │     │
│  └──────────────────────────────────────────────┘     │
│                                                         │
│             ┌─────────────────────────────────┐        │
│             │ And you'll get a Spanish        │        │
│             │ translation here.               │        │
│             └─────────────────────────────────┘        │
│                                                         │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Translate to: [Spanish (Español)        ▼]            │  ← LanguageSelector
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  [Type here...                    ] [ Submit ]          │  ← ChatInput
└─────────────────────────────────────────────────────────┘
```

### Mobile View (<768px)
```
┌───────────────────────────────┐
│                               │
│       Message List            │
│  ┌─────────────────────┐     │
│  │ Message in English  │     │
│  │ here.               │     │
│  └─────────────────────┘     │
│                               │
│     ┌─────────────────┐      │
│     │ Spanish         │      │
│     │ translation     │      │
│     └─────────────────┘      │
│                               │
└───────────────────────────────┘
┌───────────────────────────────┐
│  Translate to:                │  ← LanguageSelector
│  [Spanish (Español)      ▼]  │     (stacked, full width)
└───────────────────────────────┘
┌───────────────────────────────┐
│  [Type here...          ]     │  ← ChatInput
│  [      Submit          ]     │
└───────────────────────────────┘
```

**Note**: Layout switches at 768px breakpoint using CSS media query `@media (max-width: 767px)`

## API Request Flow

```
User Action: Submit Message
         │
         ▼
┌─────────────────────────┐
│   ChatInput Component   │
│  - Gets text from Input │
│  - Reads targetLanguage │
│    from context         │
└──────────┬──────────────┘
           │
           ▼
     POST /api/translate
     {
       text: "Hello world",
       targetLanguage: "fr"
     }
           │
           ▼
┌─────────────────────────┐
│  Translate API Handler  │
│  1. Extract params      │
│  2. Validate language   │
│  3. Default to 'es'     │
│     if invalid          │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│   DeepL API Call        │
│  translator.translateText│
│  (text, null, "fr")     │
└──────────┬──────────────┘
           │
           ▼
     Response: {
       result: {
         text: "Bonjour le monde"
       }
     }
           │
           ▼
┌─────────────────────────┐
│   ChatInput Processes   │
│  - Dispatches events    │
│  - Updates MessageList  │
└─────────────────────────┘
```

## Component Props Flow

```
LanguageContext
      │
      │ provides { targetLanguage, setTargetLanguage, availableLanguages }
      │
      ├──────────────────────┬──────────────────────┐
      │                      │                      │
      ▼                      ▼                      ▼
┌────────────┐      ┌──────────────┐      ┌──────────────┐
│ Language   │      │  ChatInput   │      │  (Future)    │
│ Selector   │      │              │      │  Other       │
│            │      │              │      │  Components  │
└────────────┘      └──────────────┘      └──────────────┘
      │                      │
      │                      │
      │ onChange             │ uses targetLanguage
      │                      │ in API call
      ▼                      ▼
setTargetLanguage()   fetch('/api/translate', {
                        body: { targetLanguage }
                      })
```

## CSS Grid Layout

### Current Layout
```scss
.main {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 56px;  // MessageList + ChatInput
}
```

### New Layout
```scss
.main {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto 56px;  // MessageList + LanguageSelector + ChatInput
  
  .messageList {
    grid-row: 1;      // Takes up expanding space
    overflow: auto;
  }
  
  .languageSelector {
    grid-row: 2;      // Auto-height based on content
    padding: 12px 0;
  }
  
  .chatInput {
    grid-row: 3;      // Fixed 56px height
  }
}
```

## LocalStorage Structure

```
Key: 'chattr_target_language'

Value (examples):
  'es'      → Spanish
  'fr'      → French
  'de'      → German
  'en-US'   → English (American)
  'pt-BR'   → Portuguese (Brazilian)

Read on:
  - Application mount
  - LanguageProvider initialization

Write on:
  - User changes language selection
  - setTargetLanguage() called

Fallback:
  - If key doesn't exist → 'es'
  - If value is invalid → 'es'
  - If localStorage blocked → in-memory only, default 'es'
```

## Type Definitions Overview

```typescript
// /src/utils/languages.ts
export type LanguageOption = {
  code: string;        // 'es', 'fr', 'de', etc.
  name: string;        // 'Spanish', 'French', 'German'
  nativeName: string;  // 'Español', 'Français', 'Deutsch'
};

export const SUPPORTED_LANGUAGES: LanguageOption[] = [...];

// /src/contexts/LanguageContext.tsx
type LanguageContextType = {
  targetLanguage: string;
  setTargetLanguage: (code: string) => void;
  availableLanguages: LanguageOption[];
};

// /src/components/LanguageSelector/LanguageSelector.tsx
type LanguageSelectorProps = {
  value?: string;
  onChange?: (languageCode: string) => void;
  classNames?: string;
  disabled?: boolean;
};
```

## Sequence Diagram: First Time User

```
User          App           LanguageProvider    localStorage    LanguageSelector
  │             │                   │                 │               │
  │──Open App──▶│                   │                 │               │
  │             │                   │                 │               │
  │             │──Initialize──────▶│                 │               │
  │             │                   │                 │               │
  │             │                   │──getItem────────▶               │
  │             │                   │     ('chattr_target_language')  │
  │             │                   │                 │               │
  │             │                   │◀───null─────────│               │
  │             │                   │                 │               │
  │             │                   │ (set default 'es')              │
  │             │                   │                 │               │
  │             │◀──Context Ready───│                 │               │
  │             │   { targetLanguage: 'es' }          │               │
  │             │                   │                 │               │
  │             │──Render──────────────────────────────────────────▶ │
  │             │                                                    │
  │◀────────────│◀────────────────────────UI Shows 'Spanish'────────│
  │                                                                   
```

## Sequence Diagram: Language Selection

```
User          LanguageSelector    LanguageContext    localStorage    ChatInput
  │                   │                   │                 │            │
  │──Click Dropdown──▶│                   │                 │            │
  │                   │                   │                 │            │
  │◀──Show Options────│                   │                 │            │
  │                   │                   │                 │            │
  │──Select 'French'─▶│                   │                 │            │
  │                   │                   │                 │            │
  │                   │──onChange('fr')──▶│                 │            │
  │                   │                   │                 │            │
  │                   │                   │──setItem────────▶            │
  │                   │                   │  ('chattr_target_language', 'fr')
  │                   │                   │                 │            │
  │                   │                   │──notify─────────────────────▶│
  │                   │                   │  consumers                   │
  │                   │                   │                 │            │
  │◀──UI Updates─────│◀──Re-render──────│                 │            │
  │  to 'French'      │  (new context)   │                 │            │
  │                   │                   │                 │            │
```

---

These diagrams provide visual references for understanding the LanguageSelector component's integration, state management, and user interaction flows.
