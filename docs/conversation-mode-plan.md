# Conversation Mode - Technical Specification

## Executive Summary

This document specifies the design and implementation plan for **Conversation Mode**, a new feature that transforms chattr from a simple translation tool into a conversational language learning and communication platform. Unlike the current "Translation Mode" which simply translates user input, Conversation Mode will:

1. Display the user's original message with a translation to the target language
2. Generate a conversational AI response in both the target language and the user's original language
3. Allow users to toggle between Translation Mode and Conversation Mode

This feature leverages AI language models to create engaging, contextual conversations that help users learn and practice languages naturally.

## Problem Statement

The current implementation provides only one-way translation: users type in English (or source language) and receive a translation in the target language. This has several limitations:

1. **No conversation context**: Each translation is isolated, with no awareness of previous messages
2. **No learning engagement**: Users don't receive responses that help them practice or learn
3. **Limited utility**: The app functions more as a translator than a conversation partner
4. **Missing bilingual display**: Original messages aren't shown with their translations for learning

Users who want to practice conversational language skills or have an engaging dialogue in another language cannot do so with the current implementation.

## Success Criteria

### Functional Requirements
1. Users can toggle between "Translation Mode" and "Conversation Mode"
2. In Conversation Mode:
   - User's original message displays with target language translation underneath
   - AI generates a conversational response in the target language
   - AI response includes original language translation underneath
3. Mode selection persists across sessions (localStorage)
4. Conversation context is maintained within a session
5. Visual distinction between modes is clear in the UI
6. All existing Translation Mode functionality continues to work

### Non-Functional Requirements
1. Response time < 3 seconds for conversational AI responses
2. Graceful degradation if AI API is unavailable (fallback to translation-only)
3. Accessible mode switcher (keyboard navigation, screen reader support)
4. Mobile-responsive design
5. Secure API key management

## Architecture Overview

### High-Level Components

```
┌─────────────────────────────────────────────────────────┐
│                    Application State                     │
│  (LanguageContext + ModeContext + localStorage)         │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐  ┌────────▼─────────┐  ┌────▼────────┐
│  Language    │  │   Mode Selector  │  │  Message    │
│  Selector    │  │  (New)           │  │  List       │
└──────────────┘  └──────────────────┘  └─────────────┘
                                              │
                                         ┌────▼────────┐
                                         │  Message    │
                                         │  Box        │
                                         │  (Enhanced) │
                                         └─────────────┘
                           │
                  ┌────────▼─────────┐
                  │   Chat Input     │
                  └──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────────┐  ┌────▼──────────────┐  
│  /api/translate  │  │ /api/conversation │  
│  (Existing)      │  │ (New)             │  
└──────────────────┘  └───────────────────┘
```

### Mode Comparison

| Aspect | Translation Mode (Current) | Conversation Mode (New) |
|--------|---------------------------|-------------------------|
| User Input | Sent as-is | Sent as-is |
| Display User Message | Original only | Original + Translation |
| Response Type | Translation only | AI-generated conversation |
| Response Display | Target language only | Target language + Original language |
| Context Awareness | None | Full conversation history |
| API Endpoint | /api/translate | /api/conversation |

## Component Specifications

### 1. ModeSelector Component

**Location**: `/src/components/ModeSelector/`

**Structure**:
```
src/components/ModeSelector/
├── ModeSelector.tsx
├── ModeSelector.module.scss
└── index.ts
```

**Component Interface**:
```typescript
type Mode = 'translation' | 'conversation';

type ModeSelectorProps = {
  value: Mode;
  onChange: (mode: Mode) => void;
  classNames?: string;
  disabled?: boolean;
};
```

**Visual Design**: Toggle switch or segmented control
- Left: "Translation" with translate icon
- Right: "Conversation" with chat bubble icon
- Active state clearly highlighted
- Smooth transition animation

### 2. Mode Context

**Location**: `/src/contexts/ModeContext.tsx`

**Interface**:
```typescript
type ModeContextType = {
  mode: Mode;
  setMode: (mode: Mode) => void;
};

type Mode = 'translation' | 'conversation';
```

**Storage**:
- localStorage key: `chattr_mode`
- Default: `'translation'` (backward compatibility)

### 3. Enhanced MessageBox Component

**Current State**: Displays single text content
**Required Enhancement**: Support for bilingual display

**New Props**:
```typescript
type MessageBoxProps = {
  children: ReactNode;
  incoming?: boolean;
  classNames?: string;
  // New props for conversation mode
  translatedText?: string;      // Translation to show below main text
  showTranslation?: boolean;    // Whether to show translated version
  isConversationMode?: boolean; // Styling adjustments for mode
};
```

**Visual Layout** (Conversation Mode):
```
┌─────────────────────────────────┐
│ Main text (original or target) │
│ ─────────────────────────────── │
│ Translation (smaller, muted)    │
└─────────────────────────────────┘
```

### 4. Conversation API Endpoint

**Location**: `/src/pages/api/conversation.ts`

**Request Type**:
```typescript
type ConversationRequest = {
  userMessage: string;           // User's input in original language
  targetLanguage: string;        // Selected target language code
  conversationHistory?: Array<{  // Optional context
    role: 'user' | 'assistant';
    content: string;
  }>;
};
```

**Response Type**:
```typescript
type ConversationResponse = {
  userMessageTranslation: string;    // User's message in target language
  assistantResponse: string;         // AI response in target language
  assistantResponseTranslation: string; // AI response in original language
  detectedSourceLanguage?: string;   // Auto-detected source language
};
```

**Error Response**:
```typescript
type ErrorResponse = {
  message: string;
  fallbackTranslation?: string; // Fallback to simple translation if AI fails
};
```

## AI/Conversational API Options

### Option 1: OpenAI ChatGPT API (Recommended)

**Pros**:
- Excellent conversation quality
- Strong multilingual support (100+ languages)
- Built-in context management (conversation history)
- Extensive documentation and community support
- Reliable uptime and performance
- Flexible pricing (pay-per-token)

**Cons**:
- Requires separate API key (additional setup)
- Cost per request (~$0.002 per conversation turn for GPT-3.5)
- Requires careful prompt engineering

**Implementation**:
```typescript
// Using openai npm package
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `You are a helpful language learning assistant. 
The user is learning ${targetLanguageName}. 
Respond naturally in ${targetLanguageName}, keeping responses concise (1-3 sentences).
Be encouraging and ask follow-up questions to maintain conversation.`;
```

**API Call**:
```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: translatedUserMessage }
  ],
  max_tokens: 150,
  temperature: 0.7,
});
```

**Cost Estimate**: 
- GPT-3.5-turbo: ~$0.002 per request (assuming 100 tokens input + 150 tokens output)
- For 1000 conversations/month: ~$2/month
- GPT-4 option available but more expensive (~$0.05 per request)

### Option 2: Anthropic Claude API

**Pros**:
- High-quality conversational responses
- Good multilingual support
- Long context window (100k+ tokens)
- Strong safety features
- Competitive pricing

**Cons**:
- Slightly less multilingual coverage than OpenAI
- Newer API (less community resources)
- Requires separate API key

**Implementation**: Similar to OpenAI but using `@anthropic-ai/sdk`

**Cost Estimate**: ~$0.003 per request (Claude 3 Haiku)

### Option 3: DeepL + Simple Response Generation

**Pros**:
- Reuses existing DeepL integration
- No additional API key required
- Lower cost
- Simpler implementation

**Cons**:
- Not truly conversational (would need custom response templates)
- Limited context awareness
- Less natural, engaging responses
- Requires maintaining response templates for each language

**Implementation**:
```typescript
// Translate user message to target language
const translatedMessage = await translator.translateText(
  userMessage, 
  null, 
  targetLanguage
);

// Generate simple response from templates
const response = generateTemplateResponse(translatedMessage, targetLanguage);

// Translate response back to original language
const responseTranslation = await translator.translateText(
  response,
  targetLanguage,
  originalLanguage
);
```

### Option 4: Google Cloud AI (Gemini API)

**Pros**:
- Excellent multilingual support (Google's strength)
- Competitive pricing
- Integration with Google Translate
- Free tier available

**Cons**:
- More complex setup (Google Cloud Console)
- Requires separate API key
- Less conversational optimization than OpenAI

**Cost Estimate**: ~$0.0025 per request (Gemini Pro)

### Option 5: Hugging Face Inference API

**Pros**:
- Free tier available
- Many model options
- Open-source models
- Good for experimentation

**Cons**:
- Variable quality across models
- Potential latency issues
- Less reliable than commercial APIs
- May require model fine-tuning for best results

### Recommendation: OpenAI ChatGPT API

**Rationale**:
1. **Best conversation quality**: Purpose-built for natural dialogue
2. **Excellent multilingual**: Works well with all 31 DeepL languages
3. **Easy integration**: Simple REST API, well-documented
4. **Reasonable cost**: ~$2/month for moderate usage, scales linearly
5. **Reliable**: Industry-standard uptime and performance
6. **Future-proof**: Ongoing improvements, strong ecosystem

**Phase 2 Consideration**: Could add option for users to select AI provider (OpenAI, Claude, etc.) with different API keys, similar to how some apps offer multiple LLM backends.

## State Management Strategy

### Approach: Extend Existing Context Pattern

The application already uses React Context for language selection. We'll add a parallel context for mode selection.

**New Context**: `ModeContext`
**Location**: `/src/contexts/ModeContext.tsx`

```typescript
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type Mode = 'translation' | 'conversation';

type ModeContextType = {
  mode: Mode;
  setMode: (mode: Mode) => void;
};

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<Mode>('translation');

  // Load from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('chattr_mode') as Mode;
    if (savedMode && (savedMode === 'translation' || savedMode === 'conversation')) {
      setMode(savedMode);
    }
  }, []);

  // Save to localStorage on change
  const handleSetMode = (newMode: Mode) => {
    setMode(newMode);
    localStorage.setItem('chattr_mode', newMode);
  };

  return (
    <ModeContext.Provider value={{ mode, setMode: handleSetMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within ModeProvider');
  }
  return context;
};
```

**Integration**: Wrap app in `/src/pages/_app.tsx`:
```typescript
<LanguageProvider>
  <ModeProvider>
    <Component {...pageProps} />
  </ModeProvider>
</LanguageProvider>
```

## Conversation History Management

### Client-Side History (Recommended for MVP)

**Storage**: In-memory React state (clears on page refresh)
**Structure**:
```typescript
type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  timestamp: number;
};

// In ChatInput or parent component
const [conversationHistory, setConversationHistory] = 
  useState<ConversationMessage[]>([]);
```

**Limit**: Keep last 10 messages for context (prevents token overflow)

**Pros**: Simple, no backend changes, privacy-friendly (no storage)
**Cons**: History lost on refresh

### Future Enhancement: Persistent Storage

**Options for Phase 2**:
1. **localStorage**: Persist conversations locally
2. **IndexedDB**: For larger conversation histories
3. **Backend database**: User accounts with saved conversations
4. **Session storage**: Temporary per-tab storage

## DOM Placement and Layout

### Current Layout
```
┌─────────────────────────────────┐
│      LanguageSelector           │
├─────────────────────────────────┤
│                                 │
│      MessageList                │
│                                 │
├─────────────────────────────────┤
│      ChatInput                  │
└─────────────────────────────────┘
```

### New Layout with ModeSelector
```
┌─────────────────────────────────┐
│  LanguageSelector | ModeSelector│  ← Side by side or stacked
├─────────────────────────────────┤
│                                 │
│      MessageList                │
│      (Enhanced for bilingual)   │
│                                 │
├─────────────────────────────────┤
│      ChatInput                  │
└─────────────────────────────────┘
```

### Header Layout Options

**Option A: Side-by-Side (Recommended for Desktop)**
```
┌──────────────────────┬──────────────────────┐
│  Language: Spanish ▼ │ [Translate|Chat] 💬  │
└──────────────────────┴──────────────────────┘
```

**Option B: Stacked (Better for Mobile)**
```
┌─────────────────────────────────┐
│    Language: Spanish ▼          │
├─────────────────────────────────┤
│  [ Translation | Conversation ] │
└─────────────────────────────────┘
```

**Recommendation**: Use CSS Grid/Flexbox with responsive breakpoint:
- Desktop (>768px): Side-by-side
- Mobile (<768px): Stacked

## Enhanced Message Display

### Translation Mode (Current)
```
┌─────────────────────────────────┐
│ Hello, how are you?             │  ← User (outgoing)
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Hola, ¿cómo estás?              │  ← Translation (incoming)
└─────────────────────────────────┘
```

### Conversation Mode (New)
```
┌─────────────────────────────────┐
│ Hello, how are you?             │  ← User original
│ ──────────────────────────────  │
│ Hola, ¿cómo estás?              │  ← Translation (smaller)
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ ¡Hola! Estoy muy bien, gracias. │  ← AI response (target)
│ ¿Y tú? ¿Qué tal tu día?         │
│ ──────────────────────────────  │
│ Hi! I'm very well, thanks.      │  ← Translation (smaller)
│ And you? How's your day?        │
└─────────────────────────────────┘
```

### Styling Considerations

**Main text**: Regular size and weight
**Translation text**: 
- Smaller font size (0.85em)
- Muted color (opacity: 0.7)
- Italic style
- Separated by subtle divider line

**SCSS Example**:
```scss
.messageBox {
  // Existing styles...
  
  &.bilingual {
    .mainText {
      font-size: 1rem;
      color: var(--text-primary);
    }
    
    .divider {
      margin: 0.5rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .translationText {
      font-size: 0.85rem;
      font-style: italic;
      opacity: 0.7;
      color: var(--text-secondary);
    }
  }
}
```

## API Integration Plan

### Step 1: Create OpenAI Client Configuration

**File**: `/src/lib/openai.ts`
```typescript
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY not configured. Conversation mode will not work.');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const createConversationMessages = (
  targetLanguageName: string,
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
) => {
  const systemPrompt = `You are a helpful and friendly language learning assistant. 
The user is practicing ${targetLanguageName}. 
Respond naturally in the user's language (the language they're writing in).
Keep your responses concise (1-3 sentences) and conversational.
Ask engaging follow-up questions to maintain natural dialogue.
Be encouraging and supportive of their language learning journey.`;

  return [
    { role: 'system' as const, content: systemPrompt },
    ...history.slice(-10), // Keep last 10 messages for context (in original language)
    { role: 'user' as const, content: userMessage }
  ];
};
```

### Step 2: Create Conversation API Route

**File**: `/src/pages/api/conversation.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import * as deepl from "deepl-node";
import { openai, createConversationMessages } from "@/lib/openai";
import { VALID_LANGUAGE_CODES, LANGUAGE_NAMES } from "@/utils/languages";

const translator = new deepl.Translator(process.env.DEEPL_API_KEY || "");

type ConversationRequest = {
  userMessage: string;
  targetLanguage: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
};

type ConversationResponse = {
  userMessageTranslation: string;
  assistantResponse: string;
  assistantResponseTranslation: string;
  detectedSourceLanguage?: string;
};

type ErrorResponse = {
  message: string;
  fallbackTranslation?: string;
};

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse<ConversationResponse | ErrorResponse>
) {
  const data: ConversationRequest = req.body;

  // Validation
  if (!data.userMessage) {
    return res.status(400).json({ 
      message: "Please send a message" 
    });
  }

  if (!VALID_LANGUAGE_CODES.has(data.targetLanguage)) {
    return res.status(400).json({ 
      message: `Invalid target language: ${data.targetLanguage}` 
    });
  }

  try {
    // Step 1: Generate AI response in original language
    if (!process.env.OPENAI_API_KEY) {
      // Fallback: Simple echo response if no OpenAI key
      const fallbackTranslation = await translator.translateText(
        data.userMessage,
        null,
        data.targetLanguage as any
      );
      
      return res.status(200).json({
        userMessageTranslation: fallbackTranslation.text,
        assistantResponse: fallbackTranslation.text,
        assistantResponseTranslation: "I'm here to chat! (AI not configured)",
      });
    }

    const targetLanguageName = LANGUAGE_NAMES[data.targetLanguage] || data.targetLanguage;
    const messages = createConversationMessages(
      targetLanguageName,
      data.userMessage,
      data.conversationHistory || []
    );

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 150,
      temperature: 0.7,
    });

    const assistantResponseOriginal = completion.choices[0]?.message?.content || 
      "I'm not sure how to respond.";

    // Step 2: Translate both user message and AI response to target language in single call
    // Combine texts with delimiter for batch translation
    const combinedText = `${data.userMessage}\n|||DELIMITER|||\n${assistantResponseOriginal}`;
    
    const translationResult = await translator.translateText(
      combinedText,
      null, // Auto-detect source
      data.targetLanguage as any
    );

    // Split the translated result back into separate parts
    const [userMessageTranslation, assistantResponse] = 
      translationResult.text.split('\n|||DELIMITER|||\n');

    return res.status(200).json({
      userMessageTranslation: userMessageTranslation.trim(),
      assistantResponse: assistantResponse.trim(),
      assistantResponseTranslation: assistantResponseOriginal,
      detectedSourceLanguage: translationResult.detectedSourceLang?.toLowerCase(),
    });

  } catch (error) {
    console.error('Conversation API error:', error);
    
    // Fallback to simple translation if AI fails
    try {
      const fallbackTranslation = await translator.translateText(
        data.userMessage,
        null,
        data.targetLanguage as any
      );

      return res.status(200).json({
        userMessageTranslation: fallbackTranslation.text,
        assistantResponse: "Sorry, I'm having trouble responding right now.",
        assistantResponseTranslation: "Sorry, I'm having trouble responding right now.",
      });
    } catch (translationError) {
      return res.status(500).json({
        message: "Translation service error",
      });
    }
  }
}
```

### Step 3: Update ChatInput Component

**Modified**: `/src/components/ChatInput/ChatInput.tsx`

Add mode-aware API calls:
```typescript
import { useMode } from '@/hooks/useMode';

const { mode } = useMode();
const { targetLanguage } = useLanguage();

const handleSubmit = async (value: string) => {
  if (mode === 'translation') {
    // Existing translation flow
    await handleTranslation(value);
  } else {
    // New conversation flow
    await handleConversation(value);
  }
};

const handleConversation = async (value: string) => {
  const response = await fetch("/api/conversation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userMessage: value,
      targetLanguage,
      conversationHistory: getRecentHistory(), // Last 10 messages
    }),
  });

  if (response.ok) {
    const data = await response.json();
    
    // Dispatch user message with translation
    dispatchOutgoingEvent(value, data.userMessageTranslation);
    
    // Dispatch assistant response with translation
    dispatchIncomingEvent(data.assistantResponse, data.assistantResponseTranslation);
  }
};
```

## Component Integration Flow

### Implementation Order (Recommended)

1. **Phase 1: Mode Infrastructure** (2-3 hours)
   - [x] Create `ModeContext` with localStorage persistence
   - [x] Create `useMode` custom hook
   - [x] Add `ModeProvider` to `_app.tsx`
   - [x] Test mode state management

2. **Phase 2: Mode Selector UI** (1-2 hours)
   - [x] Create `ModeSelector` component with toggle UI
   - [x] Add SCSS styling (toggle switch or segmented control)
   - [x] Integrate with `useMode` hook
   - [x] Add to main page layout
   - [x] Test responsive behavior

3. **Phase 3: Enhanced Message Display** (2-3 hours)
   - [x] Update `MessageBox` component props for bilingual display
   - [x] Add conditional rendering for translation text
   - [x] Update SCSS for bilingual styling (divider, smaller text)
   - [x] Update event system to support translation metadata
   - [x] Test both mode displays

4. **Phase 4: OpenAI Integration** (2-3 hours)
   - [x] Add `openai` npm package
   - [x] Create OpenAI client configuration (`/src/lib/openai.ts`)
   - [x] Implement conversation prompt engineering
   - [x] Add environment variable for `OPENAI_API_KEY`
   - [x] Test basic OpenAI completion

5. **Phase 5: Conversation API** (3-4 hours)
   - [x] Create `/api/conversation` endpoint
   - [x] Implement 2-step flow: AI response → batch translate
   - [x] Add conversation history support
   - [x] Add error handling and fallbacks
   - [x] Test with various languages and inputs

6. **Phase 6: ChatInput Enhancement** (1-2 hours)
   - [x] Add mode-aware message handling
   - [x] Implement conversation history tracking
   - [x] Update event dispatching for bilingual messages
   - [x] Test mode switching and persistence

7. **Phase 7: Polish and Testing** (2-3 hours)
   - [ ] Add loading states for AI responses
   - [ ] Add error messages for API failures
   - [ ] Responsive design testing (mobile/desktop)
   - [ ] Accessibility audit (keyboard navigation, screen readers)
   - [ ] Cross-browser testing
   - [ ] Performance optimization

8. **Phase 8: Documentation** (1 hour)
   - [ ] Update README with new mode feature
   - [ ] Add setup instructions for OpenAI API key
   - [ ] Document conversation mode behavior
   - [ ] Add architecture diagrams

### Total Estimated Time: 14-21 hours

## Data Flow Diagrams

### Translation Mode Flow (Current)
```
User types message
      ↓
ChatInput captures input
      ↓
Call /api/translate
      ↓
DeepL translates text
      ↓
Return translation
      ↓
Dispatch incoming event (translated text)
      ↓
MessageList displays message
```

### Conversation Mode Flow (New)
```
User types message (in original language)
      ↓
ChatInput captures input (stores to history)
      ↓
Call /api/conversation with history (in original language)
      ↓
Step 1: OpenAI generates response in original language
      ↓
Step 2: DeepL batch-translates both messages to target language
      ↓
Return: {userTranslation, aiResponseTarget, aiResponseOriginal}
      ↓
Dispatch outgoing event (original + translation)
      ↓
Dispatch incoming event (AI response target + original)
      ↓
MessageList displays both with bilingual format
```

## File Structure

### New Files to Create

1. `/src/contexts/ModeContext.tsx` - Mode state management
2. `/src/hooks/useMode.ts` - Mode context hook
3. `/src/components/ModeSelector/ModeSelector.tsx` - Mode toggle UI
4. `/src/components/ModeSelector/ModeSelector.module.scss` - Mode toggle styles
5. `/src/components/ModeSelector/index.ts` - Export barrel
6. `/src/lib/openai.ts` - OpenAI client configuration
7. `/src/pages/api/conversation.ts` - Conversation API endpoint
8. `/src/utils/languages.ts` - Language names constant (if not exists)

### Files to Modify

1. `/src/pages/_app.tsx` - Add ModeProvider
2. `/src/pages/index.tsx` - Add ModeSelector to layout
3. `/src/components/MessageBox/MessageBox.tsx` - Add bilingual display
4. `/src/components/MessageBox/MessageBox.module.scss` - Add bilingual styles
5. `/src/components/ChatInput/ChatInput.tsx` - Add mode-aware logic
6. `/src/utils/events.ts` - Support translation metadata in events
7. `/src/components/index.ts` - Export ModeSelector
8. `package.json` - Add openai dependency
9. `.env.example` - Add OPENAI_API_KEY
10. `README.md` - Document new feature

## Styling Approach

### ModeSelector Styling

**Option A: Toggle Switch** (Recommended)
```scss
.modeSelector {
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .toggle {
    position: relative;
    width: 200px;
    height: 40px;
    background: var(--background-secondary);
    border-radius: 20px;
    display: flex;
    
    .option {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2;
      transition: color 0.3s;
      
      &.active {
        color: var(--text-primary);
      }
      
      &:not(.active) {
        color: var(--text-muted);
      }
    }
    
    .slider {
      position: absolute;
      width: 50%;
      height: 100%;
      background: var(--primary-color);
      border-radius: 20px;
      transition: transform 0.3s;
      z-index: 1;
      
      &.conversation {
        transform: translateX(100%);
      }
    }
  }
}
```

**Option B: Segmented Control**
```scss
.modeSelector {
  display: inline-flex;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  
  button {
    padding: 0.5rem 1.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    
    &:not(:last-child) {
      border-right: 1px solid var(--border-color);
    }
    
    &.active {
      background: var(--primary-color);
      color: white;
    }
    
    &:not(.active) {
      color: var(--text-muted);
      
      &:hover {
        background: var(--background-hover);
      }
    }
  }
}
```

### Bilingual Message Styling

```scss
.messageBox {
  // Existing styles...
  
  &.bilingual {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    .mainText {
      font-size: 1rem;
      line-height: 1.5;
    }
    
    .divider {
      width: 100%;
      height: 1px;
      background: linear-gradient(
        to right,
        transparent,
        rgba(255, 255, 255, 0.1) 20%,
        rgba(255, 255, 255, 0.1) 80%,
        transparent
      );
      margin: 0.25rem 0;
    }
    
    .translation {
      font-size: 0.85rem;
      font-style: italic;
      opacity: 0.7;
      line-height: 1.4;
    }
  }
  
  // Adjust padding for bilingual messages
  &.bilingual {
    padding: 1rem 1.25rem;
  }
}
```

### Responsive Considerations

```scss
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 0.75rem;
    
    .languageSelector,
    .modeSelector {
      width: 100%;
    }
  }
  
  .messageBox.bilingual {
    .mainText {
      font-size: 0.95rem;
    }
    
    .translation {
      font-size: 0.8rem;
    }
  }
}
```

## Accessibility Considerations

### Keyboard Navigation
- [ ] Tab order: Language selector → Mode selector → Message list → Input
- [ ] Mode selector toggle: `Space` or `Enter` to switch
- [ ] All interactive elements focusable
- [ ] Clear focus indicators (outline, highlight)

### Screen Reader Support
```html
<div role="group" aria-label="Mode selection">
  <button
    role="radio"
    aria-checked={mode === 'translation'}
    aria-label="Translation mode"
  >
    Translation
  </button>
  <button
    role="radio"
    aria-checked={mode === 'conversation'}
    aria-label="Conversation mode"
  >
    Conversation
  </button>
</div>
```

### ARIA Labels
- Mode selector: `aria-label="Select interaction mode"`
- Each mode option: `aria-label="Translation mode"` / `"Conversation mode"`
- Bilingual messages: `aria-label="Message in [language] with translation"`

### Visual Contrast
- Ensure 4.5:1 contrast ratio for all text
- Active mode clearly distinguishable from inactive
- Translation text maintains readability at reduced opacity

## Security Considerations

### API Key Management
1. **Never expose keys in client-side code**
   - OpenAI key only in server-side API routes
   - DeepL key only in server-side API routes
2. **Environment variables**
   - Store in `.env.local` (gitignored)
   - Document in `.env.example`
3. **Rate limiting** (Phase 2)
   - Prevent abuse of AI API
   - Consider implementing per-IP rate limits

### Input Validation
```typescript
// Sanitize user input
const sanitizeInput = (text: string): string => {
  return text.trim().slice(0, 1000); // Max 1000 characters
};

// Validate conversation history
const validateHistory = (history: any[]): boolean => {
  if (!Array.isArray(history)) return false;
  if (history.length > 20) return false; // Max 20 messages
  return history.every(msg => 
    msg.role && msg.content && 
    typeof msg.content === 'string'
  );
};
```

### Error Message Security
- Don't expose API keys or internal errors to client
- Use generic error messages: "Service temporarily unavailable"
- Log detailed errors server-side only

### Content Moderation
Consider adding OpenAI's moderation API:
```typescript
const moderation = await openai.moderations.create({
  input: userMessage,
});

if (moderation.results[0].flagged) {
  return res.status(400).json({
    message: "Message contains inappropriate content"
  });
}
```

## Testing Strategy

### Manual Testing Checklist

**Mode Switching**
- [ ] Toggle between modes updates UI immediately
- [ ] Mode persists after page refresh
- [ ] Mode state syncs across components
- [ ] Default mode is "translation" for new users

**Translation Mode**
- [ ] Existing functionality unchanged
- [ ] Single language translation works
- [ ] Messages display correctly

**Conversation Mode**
- [ ] User message shows with translation
- [ ] AI responds in target language
- [ ] AI response shows with translation back to source
- [ ] Conversation maintains context (follow-up questions work)
- [ ] Fallback works when AI unavailable

**Bilingual Display**
- [ ] Main text and translation both visible
- [ ] Translation text is styled appropriately (smaller, muted)
- [ ] Divider line appears between texts
- [ ] Layout looks good on mobile and desktop

**Error Handling**
- [ ] Missing OpenAI key shows graceful fallback
- [ ] Network errors show user-friendly message
- [ ] Invalid language codes rejected
- [ ] Empty messages prevented

**Accessibility**
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces mode changes
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA standards

### Automated Testing (Phase 2)

**Unit Tests**:
```typescript
describe('ModeContext', () => {
  it('defaults to translation mode', () => {
    // Test default state
  });
  
  it('persists mode to localStorage', () => {
    // Test localStorage integration
  });
});

describe('conversation API', () => {
  it('translates user message', async () => {
    // Test DeepL integration
  });
  
  it('generates AI response', async () => {
    // Test OpenAI integration
  });
  
  it('handles missing API keys gracefully', async () => {
    // Test fallback behavior
  });
});
```

**Integration Tests**:
- Full conversation flow end-to-end
- Mode switching during active conversation
- Language switching in conversation mode

## Performance Considerations

### API Response Time
- **Target**: < 3 seconds for conversation response
- **Actual**: ~1-2 seconds (OpenAI: 1-2s, DeepL batch: 400-600ms)
- **Optimization**: Batch translation reduces API calls and latency

### Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleConversation = async (message: string) => {
  setIsLoading(true);
  try {
    // API call
  } finally {
    setIsLoading(false);
  }
};
```

**UI Indicators**:
- Disable input while loading
- Show "AI is typing..." message
- Animated dots or spinner

### Token Usage Optimization
- Limit conversation history to 10 messages
- Use max_tokens: 150 for concise responses
- Consider GPT-3.5-turbo over GPT-4 for cost/speed

### Client-Side Performance
- Lazy load OpenAI integration (only when conversation mode active)
- Debounce input if implementing auto-translate preview
- Virtualize message list for long conversations (Phase 2)

## Risk Assessment

### High Risk Items
None - Feature is isolated and additive

### Medium Risk Items
1. **OpenAI API costs** 
   - Mitigation: Start with GPT-3.5-turbo, add usage monitoring
   - Fallback: Disable conversation mode if budget exceeded
   
2. **API reliability**
   - Mitigation: Graceful fallbacks to translation-only
   - Monitoring: Log API failures for troubleshooting

3. **Response quality in all languages**
   - Mitigation: Test with major languages before launch
   - Feedback: Add user feedback mechanism for poor responses

### Low Risk Items
1. **UI complexity**: Mitigated by reusing existing components
2. **State management**: React Context is proven for this scale
3. **Breaking changes**: None - additive feature with fallbacks

## Dependencies

### New NPM Packages Required
```json
{
  "dependencies": {
    "openai": "^4.20.0"  // Latest stable version
  }
}
```

### Environment Variables Required
```env
# Existing
DEEPL_API_KEY=your_deepl_key_here

# New
OPENAI_API_KEY=your_openai_key_here
```

### External Services
1. **DeepL API** (existing) - Translation services
2. **OpenAI API** (new) - Conversational AI

## Migration Strategy

### Backward Compatibility
- Default mode is "translation" (existing behavior)
- No database migrations required
- No breaking changes to existing API
- Existing components continue to work

### User Migration
- Existing users see familiar UI by default
- New mode selector is discoverable but non-intrusive
- localStorage ensures preference persists

### Rollback Plan
If issues arise:
1. Remove `<ModeSelector>` from UI
2. Remove `<ModeProvider>` from `_app.tsx`
3. Conversation mode gracefully degrades to unavailable
4. No data loss (in-memory only)

## Future Enhancements (Phase 2+)

### Conversation Features
1. **Conversation history persistence**
   - Save conversations to localStorage or backend
   - Allow users to review past conversations
   - Export conversations for study

2. **Conversation scenarios**
   - Pre-defined scenarios (ordering food, asking directions)
   - Role-play exercises
   - Vocabulary practice mode

3. **Voice input/output**
   - Speech-to-text for user input
   - Text-to-speech for AI responses
   - Pronunciation practice

4. **Multiple AI personalities**
   - Formal vs casual conversation styles
   - Different personas (teacher, friend, customer service)
   - Adjustable difficulty levels

### Technical Improvements
1. **Alternative AI providers**
   - Support Claude, Gemini, etc.
   - User-selectable AI backend
   - Cost comparison dashboard

2. **Streaming responses**
   - Show AI response as it's generated (word by word)
   - Better perceived performance
   - More engaging UX

3. **Advanced context management**
   - Semantic search over conversation history
   - Summary generation for long conversations
   - Topic tracking

4. **Performance optimizations**
   - Cache common responses
   - Prefetch translations for likely responses
   - WebSocket connection for real-time updates

### Analytics
1. **Usage tracking**
   - Mode usage statistics
   - Popular languages in conversation mode
   - Average conversation length
   - User engagement metrics

2. **Quality metrics**
   - Response time monitoring
   - API error rates
   - User satisfaction ratings

## Open Questions for Stakeholders

1. **AI Budget**: What's the acceptable monthly cost for OpenAI API?
   - Current estimate: $2-20/month depending on usage
   - Need to decide on rate limiting strategy

2. **Content Moderation**: Should we implement content filtering?
   - OpenAI moderation API available
   - Adds latency (~200ms) but prevents misuse

3. **Conversation Persistence**: MVP uses in-memory only. When to add persistence?
   - localStorage: Simple, no backend
   - Database: Requires user accounts, more complex

4. **AI Model Selection**: Start with GPT-3.5-turbo or offer GPT-4 option?
   - GPT-3.5: Fast, cheap ($0.002/request)
   - GPT-4: Better quality, slower, expensive ($0.05/request)

5. **Language Learning Features**: Should AI provide corrections/explanations?
   - Could highlight grammar mistakes
   - Offer alternative phrasings
   - Explain vocabulary in context

6. **Multiple Conversations**: Should users be able to have separate conversation threads?
   - Multiple tabs/sessions
   - Named conversations
   - Conversation switching UI

## Success Metrics

### Quantitative Metrics
- [ ] Mode selector visible and functional
- [ ] < 3 second response time for conversations
- [ ] 99% uptime for conversation API
- [ ] Zero breaking changes to translation mode
- [ ] Bilingual messages display correctly in all languages

### Qualitative Metrics
- [ ] User feedback positive on conversation quality
- [ ] Interface intuitive (no documentation needed to understand)
- [ ] Responses feel natural and engaging
- [ ] Translations accurate and contextual
- [ ] Mobile experience smooth and responsive

### Adoption Metrics (Post-Launch)
- % of sessions using conversation mode
- Average conversation length
- User retention in conversation mode
- Feedback/ratings for AI responses

## Implementation Timeline

### Sprint 1 (Week 1): Core Infrastructure
- **Days 1-2**: Mode context, selector UI, layout integration
- **Days 3-4**: Enhanced message display with bilingual support
- **Day 5**: Testing and bug fixes

### Sprint 2 (Week 2): AI Integration
- **Days 1-2**: OpenAI setup, client configuration, prompt engineering
- **Days 3-4**: Conversation API endpoint, error handling
- **Day 5**: Integration testing with real API calls

### Sprint 3 (Week 3): Polish and Launch
- **Days 1-2**: ChatInput enhancements, history management
- **Day 3**: Loading states, error messages, edge cases
- **Day 4**: Accessibility, responsive design, cross-browser testing
- **Day 5**: Documentation, final QA, deployment

### Total Timeline: 3 weeks (15 business days)
Or 14-21 development hours if done focused work

## Conclusion

The Conversation Mode feature transforms chattr from a simple translation tool into an engaging language learning platform. By combining DeepL's accurate translations with OpenAI's conversational AI, we create a unique experience that helps users practice languages naturally.

The implementation follows existing architectural patterns, minimizes risk through graceful fallbacks, and provides clear value to users. The estimated effort of 3 weeks allows for careful testing and polish, ensuring a high-quality feature launch.

Key success factors:
- ✅ Isolated, non-breaking changes
- ✅ Reuses existing components and patterns
- ✅ Clear fallback strategies
- ✅ Minimal new dependencies
- ✅ Strong accessibility and UX considerations
- ✅ Comprehensive error handling
- ✅ Scalable architecture for future enhancements

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-08  
**Status**: Ready for Review and Implementation  
**Estimated Effort**: 14-21 hours / 3 weeks  
**Risk Level**: Low-Medium (new API dependency)
