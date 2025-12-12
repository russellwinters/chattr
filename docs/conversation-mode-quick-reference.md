# Conversation Mode - Quick Reference Guide

> **Quick Start**: One-page summary for developers implementing the Conversation Mode feature.

## Overview

Transform chattr from a translation tool into a conversational language learning platform with AI-powered responses.

**Two Modes**:
- **Translation Mode** (current): User input → Translation
- **Conversation Mode** (new): User input → Translation + AI response (bilingual)

## Key Decisions at a Glance

| Decision | Choice | Rationale |
|----------|--------|-----------|
| AI Provider | OpenAI GPT-3.5-turbo | Best conversation quality, reasonable cost ($0.002/request) |
| Mode Storage | React Context + localStorage | Consistent with existing patterns, persists preferences |
| Message Display | Bilingual (main + translation) | Promotes language learning |
| History | In-memory (last 10 messages) | Simple MVP, no backend changes |
| Default Mode | Translation | Backward compatibility, no breaking changes |
| Fallback Strategy | Multi-level (AI → translate-only → error) | Ensures reliability |

## Architecture Quick View

```
┌─────────────────────────────────────┐
│  ModeContext (new)                  │
│  ├─ mode: 'translation' | 'conversation'
│  └─ localStorage: 'chattr_mode'    │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  ModeSelector (new)                 │
│  Toggle: [Translation | Conversation]
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  ChatInput (enhanced)               │
│  ├─ if translation: /api/translate │
│  └─ if conversation: /api/conversation
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  MessageBox (enhanced)              │
│  ├─ Show main text                 │
│  └─ Show translation (if conv mode)│
└─────────────────────────────────────┘
```

## Implementation Checklist

### Phase 1: Mode Infrastructure (2-3 hours)
- [x] Create `/src/contexts/ModeContext.tsx`
- [x] Create `/src/hooks/useMode.ts`
- [x] Add `ModeProvider` to `/src/pages/_app.tsx`
- [x] Test localStorage persistence

### Phase 2: Mode Selector UI (1-2 hours)
- [x] Create `/src/components/ModeSelector/` component
- [x] Add toggle/segmented control styling
- [x] Integrate with `useMode` hook
- [x] Add to main page layout (next to LanguageSelector)

### Phase 3: Enhanced Message Display (2-3 hours)
- [x] Update `MessageBox` props for bilingual support
- [x] Add conditional rendering for translation
- [x] Style bilingual layout (main + divider + translation)
- [x] Update event system to carry translation data

### Phase 4: OpenAI Integration (2-3 hours)
- [x] Run `npm install openai`
- [x] Create `/src/lib/openai.ts` with client config
- [x] Implement prompt engineering for conversations
- [x] Add `OPENAI_API_KEY` to `.env.local`

### Phase 5: Conversation API (3-4 hours)
- [x] Create `/src/pages/api/conversation.ts`
- [x] Implement 2-step flow: AI response → batch translate
- [x] Add conversation history support (in original language)
- [x] Implement error handling and fallbacks

### Phase 6: ChatInput Enhancement (1-2 hours)
- [x] Add mode detection in submit handler
- [x] Route to appropriate API based on mode
- [x] Track conversation history (last 10 messages)
- [x] Dispatch bilingual events in conversation mode

### Phase 7: Polish & Testing (2-3 hours)
- [ ] Add loading states ("AI is typing...")
- [ ] Add error messages for API failures
- [ ] Test responsive design (mobile/desktop)
- [ ] Accessibility audit (keyboard, screen readers)

### Phase 8: Documentation (1 hour)
- [ ] Update README with conversation mode info
- [ ] Document OpenAI setup process
- [ ] Add usage examples

**Total: 14-21 hours** (3 weeks as sprint)

## Code Snippets

### ModeContext Setup

```typescript
// src/contexts/ModeContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Mode = 'translation' | 'conversation';

type ModeContextType = {
  mode: Mode;
  setMode: (mode: Mode) => void;
};

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<Mode>('translation');

  useEffect(() => {
    const saved = localStorage.getItem('chattr_mode') as Mode;
    if (saved) setMode(saved);
  }, []);

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
  if (!context) throw new Error('useMode must be used within ModeProvider');
  return context;
};
```

### ModeSelector Component

```typescript
// src/components/ModeSelector/ModeSelector.tsx
import { FC } from 'react';
import cx from 'classnames';
import { useMode } from '@/hooks/useMode';
import styles from './ModeSelector.module.scss';

const ModeSelector: FC = () => {
  const { mode, setMode } = useMode();

  return (
    <div className={styles.modeSelector}>
      <button
        className={cx(styles.option, { [styles.active]: mode === 'translation' })}
        onClick={() => setMode('translation')}
        aria-pressed={mode === 'translation'}
      >
        Translation
      </button>
      <button
        className={cx(styles.option, { [styles.active]: mode === 'conversation' })}
        onClick={() => setMode('conversation')}
        aria-pressed={mode === 'conversation'}
      >
        Conversation
      </button>
    </div>
  );
};

export default ModeSelector;
```

### Enhanced MessageBox

```typescript
// src/components/MessageBox/MessageBox.tsx
import cx from 'classnames';
import { FC, ReactNode } from 'react';
import styles from './MessageBox.module.scss';

type Props = {
  children: ReactNode;
  incoming?: boolean;
  classNames?: string;
  translation?: string;  // NEW
  showTranslation?: boolean;  // NEW
};

const MessageBox: FC<Props> = ({ 
  children, 
  incoming = false, 
  classNames,
  translation,
  showTranslation = false 
}) => {
  return (
    <span
      className={cx(styles.messageBox, classNames, {
        [styles.incoming]: incoming,
        [styles.outgoing]: !incoming,
        [styles.bilingual]: showTranslation && translation,
      })}
    >
      <div className={styles.mainText}>{children}</div>
      {showTranslation && translation && (
        <>
          <div className={styles.divider} />
          <div className={styles.translation}>{translation}</div>
        </>
      )}
    </span>
  );
};

export default MessageBox;
```

### Conversation API Endpoint

```typescript
// src/pages/api/conversation.ts
import type { NextApiRequest, NextApiResponse } from "next";
import * as deepl from "deepl-node";
import { openai } from "@/lib/openai";

const translator = new deepl.Translator(process.env.DEEPL_API_KEY || "");

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  const { userMessage, targetLanguage, conversationHistory } = req.body;

  // Step 1: Generate AI response in original language
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { 
        role: 'system', 
        content: `You are a language learning assistant. Respond naturally in the user's language.` 
      },
      ...conversationHistory.slice(-10), // Context in original language
      { role: 'user', content: userMessage }
    ],
    max_tokens: 150,
  });

  const assistantResponseOriginal = completion.choices[0].message.content;

  // Step 2: Batch translate both messages to target language
  const combinedText = `${userMessage}\n|||DELIMITER|||\n${assistantResponseOriginal}`;
  const translationResult = await translator.translateText(
    combinedText,
    null,
    targetLanguage
  );

  const [userMessageTranslation, assistantResponse] = 
    translationResult.text.split('\n|||DELIMITER|||\n');

  res.status(200).json({
    userMessageTranslation: userMessageTranslation.trim(),
    assistantResponse: assistantResponse.trim(),
    assistantResponseTranslation: assistantResponseOriginal,
  });
}
```

### Mode-Aware ChatInput

```typescript
// In ChatInput component
const { mode } = useMode();
const { targetLanguage } = useLanguage();

const handleSubmit = async (value: string) => {
  if (mode === 'translation') {
    await handleTranslation(value);
  } else {
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
      conversationHistory: getRecentHistory(),
    }),
  });

  const data = await response.json();
  
  // Dispatch with translations
  dispatchOutgoingEvent(value, data.userMessageTranslation);
  dispatchIncomingEvent(data.assistantResponse, data.assistantResponseTranslation);
};
```

## Data Flow

### Translation Mode (Current)
```
User Input → /api/translate → DeepL → Translation → Display
```

### Conversation Mode (New)
```
User Input → /api/conversation →
  ├─ Step 1: OpenAI (generate response in original language)
  └─ Step 2: DeepL (batch translate user msg + AI response to target)
→ Display bilingual messages
```

## Styling Quick Reference

```scss
// Bilingual message styling
.messageBox.bilingual {
  .mainText {
    font-size: 1rem;
    color: var(--text-primary);
  }
  
  .divider {
    margin: 0.5rem 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .translation {
    font-size: 0.85rem;
    font-style: italic;
    opacity: 0.7;
  }
}

// Mode selector toggle
.modeSelector {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  
  .option {
    padding: 0.5rem 1.5rem;
    
    &.active {
      background: var(--primary-color);
      color: white;
    }
  }
}
```

## Testing Focus Areas

### Critical Paths
1. ✅ Mode toggle updates immediately
2. ✅ Mode persists after refresh
3. ✅ Translation mode unchanged
4. ✅ Conversation shows both languages
5. ✅ AI maintains context in conversation
6. ✅ Fallback works when AI unavailable

### Edge Cases
- Empty conversation history
- Very long messages (token limits)
- API timeouts
- Invalid language codes
- Missing API keys
- Network failures

### Accessibility
- Keyboard navigation (Tab, Enter, Space)
- Screen reader announcements
- Focus indicators
- ARIA labels on mode selector
- Color contrast (4.5:1 minimum)

## Environment Setup

```bash
# 1. Install OpenAI package
npm install openai

# 2. Add to .env.local
echo "OPENAI_API_KEY=sk-your-key-here" >> .env.local

# 3. Add to .env.example (for team)
echo "OPENAI_API_KEY=your_openai_key_here" >> .env.example
```

## Cost Monitoring

```typescript
// Optional: Add usage tracking
const logUsage = async (tokens: number) => {
  console.log(`OpenAI tokens used: ${tokens}`);
  // Could send to analytics service
};

// In conversation API
const completion = await openai.chat.completions.create({...});
logUsage(completion.usage?.total_tokens || 0);
```

**Expected Costs**:
- Per conversation: ~$0.002
- 1000 conversations/month: ~$2
- 10,000 conversations/month: ~$20

## Deployment Checklist

Before going live:
- [ ] OpenAI API key set in production environment
- [ ] DeepL API key working (existing)
- [ ] Error monitoring configured
- [ ] Usage/cost alerts set up
- [ ] Rate limiting considered (optional)
- [ ] Documentation updated
- [ ] Team trained on new feature

## Troubleshooting

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| "AI not configured" | Missing OpenAI key | Add OPENAI_API_KEY to .env |
| Slow responses | Network/API latency | Add loading indicator, check API status |
| Poor translations | Wrong language code | Verify VALID_LANGUAGE_CODES |
| Mode not persisting | localStorage blocked | Check browser settings, add fallback |
| Context not working | History not passed | Verify conversationHistory in API call |

## Quick Links

- **Full Planning**: [conversation-mode-plan.md](./conversation-mode-plan.md)
- **Summary**: [conversation-mode-summary.md](./conversation-mode-summary.md)
- **Diagrams**: [conversation-mode-diagrams.md](./conversation-mode-diagrams.md)
- **OpenAI Docs**: https://platform.openai.com/docs
- **DeepL API**: https://www.deepl.com/docs-api

---

**Version**: 1.0  
**Last Updated**: 2025-12-08  
**Estimated Implementation**: 14-21 hours  
**Status**: Ready for Development
