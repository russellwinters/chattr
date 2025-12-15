# Character Selection - Quick Reference Guide

> **Quick Start**: One-page summary for developers implementing the Character Selection feature.

## Overview

Add AI character personas to conversation mode, allowing users to choose different conversation styles and personalities for more engaging language practice.

**Five Preset Characters**:
- 👨‍🏫 **Friendly Tutor**: Patient, encouraging, educational
- 😊 **Casual Friend**: Informal, conversational, warm
- 💼 **Business Professional**: Formal, professional, courteous
- 🌍 **Enthusiastic Travel Guide**: Energetic, descriptive, cultural
- 🧙 **Wise Mentor**: Thoughtful, reflective, philosophical

## Key Decisions at a Glance

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Character Roster | 5 preset personas | Covers formal to informal, beginner to advanced |
| State Management | React Context + localStorage | Consistent with existing patterns |
| UI Component | Dropdown selector (MVP) | Simple, fast, mobile-friendly |
| Placement | Below mode selector (conditional) | Only visible in conversation mode |
| Default Character | Friendly Tutor | Most appropriate for language learners |
| Custom Characters | Stretch goal (Phase 2) | Validate presets first, lower MVP risk |
| API Changes | Optional characterId parameter | Backward compatible, minimal changes |

## Architecture Quick View

```
┌─────────────────────────────────────┐
│  CharacterContext (new)             │
│  ├─ selectedCharacter               │
│  ├─ setSelectedCharacter            │
│  └─ availableCharacters (5 presets) │
│  └─ localStorage: 'chattr_selected_ │
│     character'                      │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  CharacterSelector (new)            │
│  Dropdown: [👨‍🏫 Friendly Tutor ▼]   │
│  Only visible when mode='conv'      │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  ChatInput (enhanced)               │
│  Pass characterId to API            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  /api/conversation (enhanced)       │
│  Use character-specific prompt      │
└─────────────────────────────────────┘
```

## Implementation Checklist

### Phase 1: Character Infrastructure (2-3 hours)
- [x] Define Character type and preset characters in `/src/utils/characters.ts`
- [x] Create `/src/contexts/CharacterContext.tsx`
- [x] Create `/src/hooks/useCharacter.ts`
- [x] Add `CharacterProvider` to `/src/pages/_app.tsx`
- [x] Test localStorage persistence

### Phase 2: Character Selector UI (2-3 hours)
- [x] Create `/src/components/CharacterSelector/` component
- [x] Add dropdown styling (SCSS)
- [x] Integrate with `useCharacter` hook
- [x] Add conditional rendering (only show in conversation mode)
- [x] Add to main page layout
- [x] Test character selection and display

### Phase 3: API Integration (2-3 hours)
- [x] Update `/src/pages/api/conversation.ts` to accept characterId
- [x] Update `/src/lib/openai.ts` to support character prompts
- [x] Test each preset character's response style
- [x] Verify conversation quality with different characters

### Phase 4: ChatInput Enhancement (1-2 hours)
- [x] Pass characterId to conversation API from ChatInput
- [x] Test character context in conversations
- [x] Verify character persistence across messages

### Phase 5: Polish & Testing (2-3 hours)
- [ ] Test all characters with multiple languages
- [ ] Verify character persistence across page refreshes
- [ ] Changing characters should clear conversation
- [ ] Update the loading message to be full width and mention loading response and translation
- [ ] Move the submit button to the same line as the input on all screen sizes
- [ ] Responsive design testing (mobile/desktop)
- [ ] Accessibility audit (keyboard, screen readers)

### Phase 6: Documentation (1 hour)
- [ ] Update README with character feature
- [ ] Document preset characters and use cases
- [ ] Add character selection guide

**MVP Total: 11-16 hours** (2 weeks as sprint)

### Phase 7: Custom Characters (Stretch Goal) (4-6 hours)
- [ ] Create CustomCharacterModal component
- [ ] Add form with validation
- [ ] Implement custom character storage
- [ ] Add character management (edit/delete)
- [ ] Test custom prompt generation

**With Stretch: 15-22 hours** (3 weeks as sprint)

## Code Snippets

### Character Type Definition

```typescript
// src/utils/characters.ts
export type Character = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  icon?: string;
  tags?: string[];
  isCustom?: boolean;
};

export const PRESET_CHARACTERS: Character[] = [
  {
    id: 'friendly-tutor',
    name: 'Friendly Tutor',
    description: 'Patient and encouraging, perfect for learners',
    systemPrompt: `You are a friendly and patient language tutor helping someone learn {targetLanguage}. 
Your goal is to have natural conversations while being supportive and encouraging.
- Use clear, simple language appropriate for language learners
- Gently correct mistakes when appropriate
- Ask follow-up questions to keep the conversation flowing
- Celebrate small victories and progress
- Be patient and never condescending
- Keep responses concise (2-3 sentences)
- Respond naturally in the user's language`,
    icon: '👨‍🏫',
    tags: ['learning', 'supportive', 'educational']
  },
  {
    id: 'casual-friend',
    name: 'Casual Friend',
    description: 'Relaxed conversation like chatting with a friend',
    systemPrompt: `You are a casual, friendly conversation partner who chats naturally like a good friend.
- Use informal, everyday language
- Be warm and personable
- Share personal anecdotes (as appropriate)
- Use contractions and casual expressions
- Keep the conversation light and fun
- Ask about the user's interests and experiences
- Keep responses conversational (2-3 sentences)
- Respond naturally in the user's language`,
    icon: '😊',
    tags: ['casual', 'informal', 'friendly']
  },
  // ... other characters (Business Professional, Travel Guide, Wise Mentor)
];
```

### CharacterContext Setup

```typescript
// src/contexts/CharacterContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PRESET_CHARACTERS, Character } from '@/utils/characters';

type CharacterContextType = {
  selectedCharacter: Character;
  setSelectedCharacter: (character: Character) => void;
  availableCharacters: Character[];
};

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(
    PRESET_CHARACTERS[0]  // Default: Friendly Tutor
  );

  useEffect(() => {
    const savedId = localStorage.getItem('chattr_selected_character');
    if (savedId) {
      const character = PRESET_CHARACTERS.find(c => c.id === savedId);
      if (character) setSelectedCharacter(character);
    }
  }, []);

  const handleSetCharacter = (character: Character) => {
    setSelectedCharacter(character);
    localStorage.setItem('chattr_selected_character', character.id);
  };

  return (
    <CharacterContext.Provider value={{
      selectedCharacter,
      setSelectedCharacter: handleSetCharacter,
      availableCharacters: PRESET_CHARACTERS,
    }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) throw new Error('useCharacter must be used within CharacterProvider');
  return context;
};
```

### CharacterSelector Component

```typescript
// src/components/CharacterSelector/CharacterSelector.tsx
import { FC } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { useMode } from '@/hooks/useMode';
import styles from './CharacterSelector.module.scss';

const CharacterSelector: FC = () => {
  const { mode } = useMode();
  const { selectedCharacter, setSelectedCharacter, availableCharacters } = useCharacter();

  // Only show in conversation mode
  if (mode !== 'conversation') return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const character = availableCharacters.find(c => c.id === e.target.value);
    if (character) setSelectedCharacter(character);
  };

  return (
    <div className={styles.characterSelector}>
      <label htmlFor="character-select" className={styles.label}>
        Character:
      </label>
      <select
        id="character-select"
        value={selectedCharacter.id}
        onChange={handleChange}
        className={styles.select}
        aria-label="Select character persona"
      >
        {availableCharacters.map(character => (
          <option key={character.id} value={character.id}>
            {character.icon} {character.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CharacterSelector;
```

### Enhanced Conversation API

```typescript
// src/pages/api/conversation.ts
import { PRESET_CHARACTERS } from '@/utils/characters';

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userMessage, targetLanguage, conversationHistory, characterId } = req.body;

  // Get character-specific system prompt
  let systemPrompt: string | undefined;
  if (characterId) {
    const character = PRESET_CHARACTERS.find(c => c.id === characterId);
    if (character) {
      // Replace {targetLanguage} placeholder in prompt
      systemPrompt = character.systemPrompt.replace(
        '{targetLanguage}',
        LANGUAGE_NAMES[targetLanguage] || targetLanguage
      );
    }
  }

  // Generate AI response with character prompt
  const messages = createConversationMessages(
    LANGUAGE_NAMES[targetLanguage] || targetLanguage,
    userMessage,
    conversationHistory || [],
    systemPrompt  // Pass character-specific prompt
  );

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    max_tokens: 150,
    temperature: 0.7,
  });

  // ... rest of translation logic (unchanged)
}
```

### ChatInput Enhancement

```typescript
// In ChatInput component
const { selectedCharacter } = useCharacter();
const { mode } = useMode();
const { targetLanguage } = useLanguage();

const handleConversation = async (value: string) => {
  const response = await fetch("/api/conversation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userMessage: value,
      targetLanguage,
      conversationHistory: getRecentHistory(),
      characterId: selectedCharacter.id,  // NEW: Pass character
    }),
  });

  // ... rest of handling (unchanged)
};
```

## Data Flow

### Character Selection Flow
```
User selects character → 
CharacterContext updates → 
localStorage saves → 
Next message uses character prompt
```

### Conversation with Character
```
User message →
ChatInput reads selectedCharacter →
POST /api/conversation with characterId →
API looks up character.systemPrompt →
OpenAI uses character-specific prompt →
AI response reflects character personality →
Display conversation
```

## Styling Quick Reference

```scss
// CharacterSelector.module.scss
.characterSelector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  .label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
  }
  
  .select {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    background: var(--background-primary);
    font-size: 0.875rem;
    cursor: pointer;
    
    &:hover {
      border-color: var(--primary-color);
    }
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px var(--primary-color-alpha-20);
    }
  }
}

@media (min-width: 768px) {
  .characterSelector {
    flex-direction: row;
    align-items: center;
  }
}
```

## Preset Character Prompts

### 👨‍🏫 Friendly Tutor
- **Tone**: Patient, encouraging, educational
- **Use Case**: Beginners, structured learning
- **Example**: "That's great! You're improving. Let me tell you about..."

### 😊 Casual Friend
- **Tone**: Informal, warm, conversational
- **Use Case**: Everyday practice, casual chat
- **Example**: "Oh cool! I love that too. Have you ever..."

### 💼 Business Professional
- **Tone**: Formal, professional, structured
- **Use Case**: Business language, workplace scenarios
- **Example**: "Thank you for raising that. Regarding your question..."

### 🌍 Enthusiastic Travel Guide
- **Tone**: Energetic, descriptive, cultural
- **Use Case**: Travel prep, descriptive language
- **Example**: "Oh, you must visit! The architecture is breathtaking..."

### 🧙 Wise Mentor
- **Tone**: Thoughtful, reflective, philosophical
- **Use Case**: Deeper discussions, mature learners
- **Example**: "Interesting observation. Have you considered..."

## Testing Focus Areas

### Critical Paths
1. ✅ Character selector appears only in conversation mode
2. ✅ Can select each preset character
3. ✅ Character persists after refresh
4. ✅ Character personality reflected in AI responses
5. ✅ Character works with all languages
6. ✅ Can switch characters mid-conversation

### Character Personality Testing
- [ ] Friendly Tutor: Patient, encouraging responses
- [ ] Casual Friend: Informal, conversational tone
- [ ] Business Professional: Formal, professional language
- [ ] Travel Guide: Energetic, descriptive responses
- [ ] Wise Mentor: Thoughtful, reflective answers

### Edge Cases
- Default character on first use (Friendly Tutor)
- Invalid characterId (fallback to default)
- Character switching during conversation
- Character persistence across sessions
- Mobile vs. desktop layout
- All supported languages

### Accessibility
- Keyboard navigation (Tab to select)
- Arrow keys in dropdown
- Screen reader announces selection
- Focus indicators visible
- Sufficient color contrast

## File Structure

### New Files (MVP)
1. `/src/utils/characters.ts` - Character definitions
2. `/src/contexts/CharacterContext.tsx` - State management
3. `/src/hooks/useCharacter.ts` - Context hook
4. `/src/components/CharacterSelector/CharacterSelector.tsx` - UI
5. `/src/components/CharacterSelector/CharacterSelector.module.scss` - Styles
6. `/src/components/CharacterSelector/index.ts` - Export

### Modified Files (MVP)
1. `/src/pages/_app.tsx` - Add CharacterProvider
2. `/src/pages/index.tsx` - Add CharacterSelector (conditional)
3. `/src/pages/api/conversation.ts` - Accept characterId
4. `/src/lib/openai.ts` - Support character prompts
5. `/src/components/ChatInput/ChatInput.tsx` - Pass characterId
6. `/src/components/index.ts` - Export CharacterSelector
7. `README.md` - Document feature

### Additional Files (Stretch Goal)
8. `/src/components/CharacterSelector/CustomCharacterModal.tsx`
9. `/src/components/CharacterSelector/CharacterCard.tsx`

**Total MVP**: 6 new + 7 modified = 13 files

## Performance Notes

- **No performance impact**: Character prompts add ~50-100 tokens (negligible cost)
- **Response time**: Same as current (~1-2s OpenAI + 400-600ms DeepL)
- **Character switching**: Instant (no API call)
- **localStorage**: <5ms read/write
- **Memory**: ~10KB for 5 characters

## Deployment Checklist

Before going live:
- [ ] All 5 preset characters tested with multiple languages
- [ ] Character persistence verified
- [ ] Character switching tested mid-conversation
- [ ] Default character (Friendly Tutor) confirmed
- [ ] Mobile responsive layout tested
- [ ] Accessibility requirements met
- [ ] Documentation updated (README, character guide)
- [ ] Team trained on character feature

## Troubleshooting

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| Character not persisting | localStorage blocked | Check browser settings |
| Character personality not distinct | Prompt needs refinement | Iterate on system prompts |
| Character not in dropdown | Not in PRESET_CHARACTERS | Verify characters.ts |
| Default character wrong | Context initialization | Check CharacterProvider default |
| Character switching doesn't work | Context not updating | Verify setSelectedCharacter |

## Quick Links

- **Full Planning**: [character-selection-plan.md](./character-selection-plan.md)
- **Summary**: [character-selection-summary.md](./character-selection-summary.md)
- **Diagrams**: [character-selection-diagrams.md](./character-selection-diagrams.md)
- **Conversation Mode Docs**: [conversation-mode-plan.md](./conversation-mode-plan.md)
- **OpenAI System Prompts**: https://platform.openai.com/docs/guides/prompt-engineering

---

**Version**: 1.0  
**Last Updated**: 2025-12-13  
**Estimated Implementation (MVP)**: 11-16 hours / 2 weeks  
**Estimated with Stretch Goal**: 15-22 hours / 3 weeks  
**Status**: Ready for Development
