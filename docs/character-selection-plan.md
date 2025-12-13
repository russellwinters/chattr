# Character Selection - Technical Specification

## Executive Summary

This document specifies the design and implementation plan for **Character Selection**, a new feature that enhances the Conversation Mode by allowing users to converse with different AI personas. This feature will:

1. Provide preset character personas with unique conversation styles
2. Allow users to customize the AI's personality through system prompts
3. Enable creation of custom characters (stretch goal)
4. Integrate seamlessly with existing conversation mode infrastructure

This feature transforms chattr from a generic conversation partner into a personalized, engaging language learning experience with diverse conversation styles tailored to user preferences and learning goals.

## Problem Statement

The current conversation mode implementation provides a single, generic AI personality for all users and scenarios. This has several limitations:

1. **Limited engagement**: Generic responses may not resonate with all users
2. **One-size-fits-all approach**: No personalization for different learning styles or interests
3. **Missed learning opportunities**: Cannot tailor conversations to specific scenarios (formal business, casual chat, academic discussion)
4. **No context specialization**: Cannot have domain-specific conversations (history, cooking, sports, etc.)
5. **Reduced replay value**: Same conversation style becomes monotonous

Users who want varied, personalized, or specialized language practice scenarios cannot achieve this with the current single-personality implementation.

## Success Criteria

### Functional Requirements
1. Users can select from a list of preset character personas
2. Selected character influences AI conversation style and tone
3. Character selection persists across sessions (localStorage)
4. Character personas work with all supported languages
5. Preset characters include diverse personalities:
   - Friendly Tutor (encouraging, patient)
   - Casual Friend (informal, conversational)
   - Business Professional (formal, professional)
   - Enthusiastic Travel Guide (energetic, descriptive)
   - Wise Mentor (thoughtful, reflective)
6. **Stretch Goal**: Users can create custom characters by specifying name and archetype

### Non-Functional Requirements
1. Character selection UI is intuitive and discoverable
2. Character changes apply immediately to next message
3. No degradation in conversation quality or response time
4. Accessible character selector (keyboard navigation, screen readers)
5. Mobile-responsive design
6. Character persistence maintains conversation continuity

## Architecture Overview

### High-Level Components

```
┌─────────────────────────────────────────────────────────┐
│                    Application State                     │
│  (LanguageContext + ModeContext + CharacterContext +    │
│   localStorage)                                          │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┬───────────┐
        │                  │                  │           │
┌───────▼──────┐  ┌────────▼─────────┐  ┌────▼──────┐  ┌▼──────────┐
│  Language    │  │   Mode Selector  │  │ Character │  │  Message  │
│  Selector    │  │                  │  │ Selector  │  │  List     │
│              │  │                  │  │  (New)    │  │           │
└──────────────┘  └──────────────────┘  └───────────┘  └───────────┘
                                              │
                                         ┌────▼────────┐
                                         │  Message    │
                                         │  Box        │
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
│                  │  │ (Enhanced with    │  
│                  │  │  character)       │  
└──────────────────┘  └───────────────────┘
```

### Character Architecture

| Aspect | Current Conversation Mode | With Character Selection |
|--------|--------------------------|-------------------------|
| System Prompt | Generic "helpful assistant" | Character-specific personality |
| Conversation Style | Neutral, educational | Varies by character (formal, casual, enthusiastic, etc.) |
| Response Tone | Consistent | Character-appropriate (encouraging, professional, friendly) |
| Context Awareness | General conversation | Character-informed responses |
| User Experience | One-dimensional | Multi-dimensional, personalized |

## Component Specifications

### 1. CharacterSelector Component

**Location**: `/src/components/CharacterSelector/`

**Structure**:
```
src/components/CharacterSelector/
├── CharacterSelector.tsx
├── CharacterSelector.module.scss
├── CharacterCard.tsx         # Individual character option
├── CharacterCard.module.scss
├── CustomCharacterModal.tsx  # Stretch goal
└── index.ts
```

**Component Interface**:
```typescript
type Character = {
  id: string;                    // Unique identifier (e.g., 'friendly-tutor')
  name: string;                  // Display name (e.g., 'Friendly Tutor')
  description: string;           // Short description
  systemPrompt: string;          // AI persona prompt
  icon?: string;                 // Optional emoji or icon
  tags?: string[];              // Categories (formal, casual, learning, etc.)
};

type CharacterSelectorProps = {
  value: string;                 // Currently selected character ID
  onChange: (characterId: string) => void;
  classNames?: string;
  disabled?: boolean;
  showCustomOption?: boolean;    // Stretch goal: enable custom characters
};
```

**Visual Design**: 
- Grid or list of character cards
- Each card shows: Icon, Name, Brief Description
- Active character highlighted
- Hover state for preview
- Click to select
- Optional: "Create Custom" button (stretch goal)

### 2. Character Context

**Location**: `/src/contexts/CharacterContext.tsx`

**Interface**:
```typescript
type CharacterContextType = {
  selectedCharacter: Character;
  setSelectedCharacter: (character: Character) => void;
  availableCharacters: Character[];
  addCustomCharacter?: (character: Character) => void;  // Stretch goal
};

// Preset characters
const PRESET_CHARACTERS: Character[] = [
  {
    id: 'friendly-tutor',
    name: 'Friendly Tutor',
    description: 'Patient and encouraging, perfect for learners',
    systemPrompt: 'You are a friendly, patient language tutor...',
    icon: '👨‍🏫',
    tags: ['learning', 'supportive', 'educational']
  },
  {
    id: 'casual-friend',
    name: 'Casual Friend',
    description: 'Relaxed conversation like chatting with a friend',
    systemPrompt: 'You are a casual, friendly conversation partner...',
    icon: '😊',
    tags: ['casual', 'informal', 'friendly']
  },
  {
    id: 'business-professional',
    name: 'Business Professional',
    description: 'Formal and professional for workplace scenarios',
    systemPrompt: 'You are a professional business colleague...',
    icon: '💼',
    tags: ['formal', 'professional', 'business']
  },
  {
    id: 'travel-guide',
    name: 'Enthusiastic Travel Guide',
    description: 'Energetic guide sharing travel tips and culture',
    systemPrompt: 'You are an enthusiastic travel guide...',
    icon: '🌍',
    tags: ['travel', 'energetic', 'cultural']
  },
  {
    id: 'wise-mentor',
    name: 'Wise Mentor',
    description: 'Thoughtful and reflective, offers life wisdom',
    systemPrompt: 'You are a wise, thoughtful mentor...',
    icon: '🧙',
    tags: ['reflective', 'philosophical', 'mentor']
  }
];
```

**Storage**:
- localStorage key: `chattr_selected_character`
- Default: `'friendly-tutor'` (most beginner-friendly)
- For custom characters (stretch): `chattr_custom_characters` array

### 3. Enhanced Conversation API

**Location**: `/src/pages/api/conversation.ts` (modification)

**New Request Type**:
```typescript
type ConversationRequest = {
  userMessage: string;
  targetLanguage: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  characterId?: string;          // NEW: Selected character
  customSystemPrompt?: string;   // NEW: For custom characters (stretch)
};
```

**Response Type** (unchanged):
```typescript
type ConversationResponse = {
  userMessageTranslation: string;
  assistantResponse: string;
  assistantResponseTranslation: string;
  detectedSourceLanguage?: string;
};
```

## Preset Character Specifications

### 1. Friendly Tutor 👨‍🏫

**Personality**: Patient, encouraging, educational

**System Prompt**:
```
You are a friendly and patient language tutor helping someone learn ${targetLanguageName}. 
Your goal is to have natural conversations while being supportive and encouraging.
- Use clear, simple language appropriate for language learners
- Gently correct mistakes when appropriate
- Ask follow-up questions to keep the conversation flowing
- Celebrate small victories and progress
- Be patient and never condescending
- Keep responses concise (2-3 sentences)
- Respond naturally in the user's language
```

**Example Response Style**: 
- "That's great! You're really improving. Let me tell you about..."
- "Good question! In this context, we usually say..."

**Use Cases**: Beginners, structured learning, building confidence

### 2. Casual Friend 😊

**Personality**: Relaxed, informal, friendly

**System Prompt**:
```
You are a casual, friendly conversation partner who chats naturally like a good friend.
- Use informal, everyday language
- Be warm and personable
- Share personal anecdotes (as appropriate)
- Use contractions and casual expressions
- Keep the conversation light and fun
- Ask about the user's interests and experiences
- Keep responses conversational (2-3 sentences)
- Respond naturally in the user's language
```

**Example Response Style**: 
- "Oh cool! I love that too. Have you ever..."
- "Haha, yeah I know what you mean. The other day I..."

**Use Cases**: Conversational practice, casual chat, building fluency

### 3. Business Professional 💼

**Personality**: Formal, professional, courteous

**System Prompt**:
```
You are a professional business colleague engaging in workplace communication.
- Use formal, professional language
- Maintain appropriate business etiquette
- Focus on clear, concise communication
- Avoid overly casual expressions
- Be courteous and respectful
- Discuss professional topics appropriately
- Keep responses clear and structured (2-3 sentences)
- Respond naturally in the user's language
```

**Example Response Style**: 
- "Thank you for bringing that to my attention. Regarding your question..."
- "I appreciate your perspective. In my experience..."

**Use Cases**: Business language practice, formal scenarios, professional development

### 4. Enthusiastic Travel Guide 🌍

**Personality**: Energetic, descriptive, culturally aware

**System Prompt**:
```
You are an enthusiastic travel guide who loves sharing information about places, cultures, and experiences.
- Be energetic and excited about topics
- Use vivid, descriptive language
- Share interesting cultural facts and travel tips
- Ask about the user's travel interests and experiences
- Be engaging and animated in your responses
- Paint pictures with words
- Keep responses engaging (2-3 sentences)
- Respond naturally in the user's language
```

**Example Response Style**: 
- "Oh, you absolutely must visit! The architecture there is breathtaking, and..."
- "How exciting! Did you know that in that region..."

**Use Cases**: Travel preparation, cultural learning, descriptive language practice

### 5. Wise Mentor 🧙

**Personality**: Thoughtful, reflective, philosophical

**System Prompt**:
```
You are a wise, thoughtful mentor who offers reflective insights and gentle guidance.
- Be contemplative and measured in your responses
- Share wisdom and life perspectives when appropriate
- Ask thought-provoking questions
- Be encouraging but not pushy
- Use metaphors and reflective language
- Help users think deeper about topics
- Keep responses meaningful but concise (2-3 sentences)
- Respond naturally in the user's language
```

**Example Response Style**: 
- "That's an interesting observation. Have you considered..."
- "In my experience, the journey often teaches us more than..."

**Use Cases**: Reflective conversations, deeper discussions, mature learners

## Custom Characters (Stretch Goal)

### User-Created Characters

**Feature**: Allow users to create custom characters with their own personality and context

**Interface**:
```typescript
type CustomCharacterInput = {
  name: string;              // e.g., "Italian Historian"
  archetype: string;         // e.g., "Expert in Italian Renaissance history"
  tone?: 'formal' | 'casual' | 'enthusiastic' | 'neutral';
  expertise?: string;        // Optional: specific knowledge domain
  icon?: string;             // Optional: custom emoji
};

// Generates system prompt from inputs
function generateCustomCharacterPrompt(input: CustomCharacterInput): string {
  return `You are ${input.name}, ${input.archetype}.
  Respond in a ${input.tone || 'neutral'} tone.
  ${input.expertise ? `Your expertise includes ${input.expertise}.` : ''}
  Keep responses conversational and engaging (2-3 sentences).
  Respond naturally in the user's language.`;
}
```

**UI Flow**:
1. User clicks "Create Custom Character"
2. Modal/form appears with fields:
   - Character Name (required)
   - Character Description/Archetype (required)
   - Tone (dropdown: formal/casual/enthusiastic/neutral)
   - Expertise Area (optional text field)
   - Icon (optional emoji picker)
3. User submits
4. System generates appropriate prompt
5. Character saved to localStorage
6. Character appears in character list

**Examples**:
- "Italian Historian" - Expert in Italian Renaissance, formal tone
- "Tech Support" - Helpful tech support specialist, friendly tone
- "Fitness Coach" - Motivational fitness trainer, enthusiastic tone
- "Chef Pierre" - French cooking expert, passionate tone

**Storage**:
```typescript
// localStorage: chattr_custom_characters
type CustomCharacterStore = {
  characters: Character[];
  lastModified: string;
};
```

**Validation**:
- Name: 3-50 characters
- Archetype: 10-200 characters
- Maximum 10 custom characters per user
- Prevent duplicate names

**Management**:
- Edit existing custom characters
- Delete custom characters
- Cannot modify preset characters

## State Management Strategy

### Approach: Extend Existing Context Pattern

Following the established patterns of `LanguageContext` and `ModeContext`, we'll add `CharacterContext`.

**New Context**: `CharacterContext`
**Location**: `/src/contexts/CharacterContext.tsx`

```typescript
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type Character = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  icon?: string;
  tags?: string[];
  isCustom?: boolean;  // Stretch goal: distinguish custom characters
};

type CharacterContextType = {
  selectedCharacter: Character;
  setSelectedCharacter: (character: Character) => void;
  availableCharacters: Character[];
  addCustomCharacter?: (character: Character) => void;  // Stretch goal
  removeCustomCharacter?: (characterId: string) => void;  // Stretch goal
};

const PRESET_CHARACTERS: Character[] = [
  // ... preset characters defined above
];

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(
    PRESET_CHARACTERS[0]  // Default: Friendly Tutor
  );
  const [customCharacters, setCustomCharacters] = useState<Character[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCharacterId = localStorage.getItem('chattr_selected_character');
    if (savedCharacterId) {
      const character = [...PRESET_CHARACTERS, ...customCharacters]
        .find(c => c.id === savedCharacterId);
      if (character) {
        setSelectedCharacter(character);
      }
    }

    // Load custom characters (stretch goal)
    const savedCustom = localStorage.getItem('chattr_custom_characters');
    if (savedCustom) {
      try {
        const parsed = JSON.parse(savedCustom);
        setCustomCharacters(parsed.characters || []);
      } catch (e) {
        console.error('Failed to parse custom characters', e);
      }
    }
  }, []);

  // Save to localStorage on change
  const handleSetCharacter = (character: Character) => {
    setSelectedCharacter(character);
    localStorage.setItem('chattr_selected_character', character.id);
  };

  const addCustomCharacter = (character: Character) => {
    const updated = [...customCharacters, { ...character, isCustom: true }];
    setCustomCharacters(updated);
    localStorage.setItem('chattr_custom_characters', JSON.stringify({
      characters: updated,
      lastModified: new Date().toISOString()
    }));
  };

  const removeCustomCharacter = (characterId: string) => {
    const updated = customCharacters.filter(c => c.id !== characterId);
    setCustomCharacters(updated);
    localStorage.setItem('chattr_custom_characters', JSON.stringify({
      characters: updated,
      lastModified: new Date().toISOString()
    }));
  };

  return (
    <CharacterContext.Provider value={{
      selectedCharacter,
      setSelectedCharacter: handleSetCharacter,
      availableCharacters: [...PRESET_CHARACTERS, ...customCharacters],
      addCustomCharacter,
      removeCustomCharacter,
    }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within CharacterProvider');
  }
  return context;
};
```

**Integration**: Wrap app in `/src/pages/_app.tsx`:
```typescript
<LanguageProvider>
  <ModeProvider>
    <CharacterProvider>
      <Component {...pageProps} />
    </CharacterProvider>
  </ModeProvider>
</LanguageProvider>
```

## DOM Placement and Layout

### Character Selector Location

**Option A: Next to Mode Selector (Recommended)**

Placement: In the header area, alongside LanguageSelector and ModeSelector

```
┌───────────────────────────────────────────────────┐
│  Language: Spanish ▼  | [Trans|Conv] | Character: 👨‍🏫 Tutor ▼ │
└───────────────────────────────────────────────────┘
```

**Pros**: 
- Logically grouped with other conversation settings
- Always visible and accessible
- Consistent with other selector controls

**Cons**: 
- May clutter header on mobile
- Takes up horizontal space

**Option B: Dropdown Menu in Conversation Mode Only**

Show selector only when Conversation Mode is active, integrated into mode selector area

```
┌───────────────────────────────────────────────────┐
│  Language: Spanish ▼  | [Translation|Conversation]  │
│                        Character: 👨‍🏫 Tutor ▼      │
└───────────────────────────────────────────────────┘
```

**Pros**: 
- Only shown when relevant
- Less visual clutter in Translation mode
- Cleaner mobile layout

**Cons**: 
- Less discoverable
- Requires conditional rendering

**Recommendation**: Option B - Show CharacterSelector only when mode === 'conversation'

### Mobile Layout

```
┌─────────────────────────┐
│ Language: Spanish ▼     │
├─────────────────────────┤
│ [Translation | Conv.]   │
├─────────────────────────┤
│ Character: 👨‍🏫 Tutor ▼  │ ← Only in Conversation mode
└─────────────────────────┘
```

### Character Selection UI Options

**Option A: Dropdown List** (Recommended for MVP)
- Simple select element
- Shows: Icon + Name
- Click to expand and select
- Mobile-friendly
- Least development effort

**Option B: Modal with Grid** (Better UX, more effort)
- Click button to open modal
- Grid of character cards
- Each card shows: Icon, Name, Description
- Hover for more details
- Select button on each card
- Better for showcasing characters

**Option C: Inline Expandable Panel**
- Accordion-style expansion
- Shows current character
- Click to expand and see all options
- Takes vertical space when expanded

**Recommendation for MVP**: Option A (Dropdown)
**Recommendation for Phase 2**: Option B (Modal with Grid)

## Enhanced Conversation API Integration

### Updated OpenAI Integration

**Location**: `/src/lib/openai.ts` (modification)

```typescript
export const createConversationMessages = (
  targetLanguageName: string,
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  characterSystemPrompt?: string  // NEW: Character-specific prompt
) => {
  // Use character prompt if provided, otherwise use default
  const systemPrompt = characterSystemPrompt || `You are a helpful and friendly language learning assistant. 
The user is practicing ${targetLanguageName}. 
Respond naturally in the user's language (the language they're writing in).
Keep your responses concise (1-3 sentences) and conversational.
Ask engaging follow-up questions to maintain natural dialogue.
Be encouraging and supportive of their language learning journey.`;

  return [
    { role: 'system' as const, content: systemPrompt },
    ...history.slice(-10), // Keep last 10 messages for context
    { role: 'user' as const, content: userMessage }
  ];
};
```

### Updated Conversation API Endpoint

**Location**: `/src/pages/api/conversation.ts` (modification)

```typescript
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
    // Determine system prompt based on character
    let systemPrompt: string | undefined;
    if (data.characterId) {
      // Look up character and get system prompt
      const character = PRESET_CHARACTERS.find(c => c.id === data.characterId);
      if (character) {
        systemPrompt = character.systemPrompt;
      }
    }
    // Stretch goal: Support custom system prompts
    if (data.customSystemPrompt) {
      systemPrompt = data.customSystemPrompt;
    }

    // Step 1: Generate AI response with character-specific prompt
    const targetLanguageName = LANGUAGE_NAMES[data.targetLanguage] || data.targetLanguage;
    const messages = createConversationMessages(
      targetLanguageName,
      data.userMessage,
      data.conversationHistory || [],
      systemPrompt  // Pass character prompt
    );

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 150,
      temperature: 0.7,
    });

    const assistantResponseOriginal = completion.choices[0]?.message?.content || 
      "I'm not sure how to respond.";

    // Step 2: Translate both user message and AI response (unchanged)
    const combinedText = `${data.userMessage}\n|||DELIMITER|||\n${assistantResponseOriginal}`;
    
    const translationResult = await translator.translateText(
      combinedText,
      null,
      data.targetLanguage as any
    );

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
    
    // Fallback to simple translation if AI fails (unchanged)
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

## Component Integration Flow

### Implementation Order (Recommended)

1. **Phase 1: Character Infrastructure** (2-3 hours)
   - [ ] Define Character type and preset characters
   - [ ] Create `CharacterContext` with localStorage persistence
   - [ ] Create `useCharacter` custom hook
   - [ ] Add `CharacterProvider` to `_app.tsx`
   - [ ] Test character state management

2. **Phase 2: Character Selector UI** (2-3 hours)
   - [ ] Create `CharacterSelector` component (dropdown)
   - [ ] Add SCSS styling for dropdown
   - [ ] Integrate with `useCharacter` hook
   - [ ] Add conditional rendering (show only in conversation mode)
   - [ ] Add to main page layout
   - [ ] Test character selection and persistence

3. **Phase 3: API Integration** (2-3 hours)
   - [ ] Update conversation API to accept characterId
   - [ ] Update OpenAI integration to use character prompts
   - [ ] Add character prompt interpolation with target language
   - [ ] Test each preset character's response style
   - [ ] Verify conversation quality with different characters

4. **Phase 4: ChatInput Enhancement** (1-2 hours)
   - [ ] Pass characterId to conversation API from ChatInput
   - [ ] Test character context in conversations
   - [ ] Verify character persistence across messages

5. **Phase 5: Polish and Testing** (2-3 hours)
   - [ ] Test all preset characters with multiple languages
   - [ ] Verify character persistence across page refreshes
   - [ ] Test responsive design (mobile/desktop)
   - [ ] Accessibility audit (keyboard navigation, screen readers)
   - [ ] Edge case testing (switching characters mid-conversation)

6. **Phase 6: Documentation** (1 hour)
   - [ ] Update README with character selection feature
   - [ ] Document preset characters and their use cases
   - [ ] Add user guide for character selection

**MVP Total Estimated Time: 11-16 hours**

### Stretch Goal: Custom Characters (Phase 7)

7. **Phase 7: Custom Character Creation** (4-6 hours)
   - [ ] Create CustomCharacterModal component
   - [ ] Add form with validation
   - [ ] Implement custom character storage
   - [ ] Add character management UI (edit/delete)
   - [ ] Test custom prompt generation
   - [ ] Documentation for custom characters

**With Stretch Goal Total: 15-22 hours**

## Data Flow Diagrams

### Character Selection Flow

```
User opens character dropdown
      ↓
CharacterSelector displays available characters
      ↓
User selects character (e.g., "Business Professional")
      ↓
CharacterContext updates selectedCharacter
      ↓
localStorage saves character ID
      ↓
Next conversation uses selected character's system prompt
```

### Conversation with Character Flow

```
User types message (in original language)
      ↓
ChatInput captures input and checks mode = 'conversation'
      ↓
ChatInput reads selectedCharacter from context
      ↓
POST /api/conversation with {userMessage, targetLanguage, history, characterId}
      ↓
API looks up character and retrieves systemPrompt
      ↓
OpenAI generates response using character-specific prompt
      ↓
DeepL translates both messages to target language
      ↓
Return: {userTranslation, aiResponseTarget, aiResponseOriginal}
      ↓
Display bilingual messages with character personality reflected in response
```

## File Structure

### New Files to Create

1. `/src/contexts/CharacterContext.tsx` - Character state management
2. `/src/hooks/useCharacter.ts` - Character context hook
3. `/src/components/CharacterSelector/CharacterSelector.tsx` - Character selector UI
4. `/src/components/CharacterSelector/CharacterSelector.module.scss` - Styles
5. `/src/components/CharacterSelector/index.ts` - Export barrel
6. `/src/components/CharacterSelector/CharacterCard.tsx` - Individual card (optional, Phase 2)
7. `/src/components/CharacterSelector/CustomCharacterModal.tsx` - Custom character creation (stretch)
8. `/src/utils/characters.ts` - Character definitions and helpers

### Files to Modify

1. `/src/pages/_app.tsx` - Add CharacterProvider
2. `/src/pages/index.tsx` - Add CharacterSelector (conditional on conversation mode)
3. `/src/pages/api/conversation.ts` - Accept and use characterId
4. `/src/lib/openai.ts` - Support character-specific prompts
5. `/src/components/ChatInput/ChatInput.tsx` - Pass characterId to API
6. `/src/components/index.ts` - Export CharacterSelector
7. `README.md` - Document character feature

**Total**: 8 new files (5 for MVP, 3 for stretch), 7 modified files

## Styling Approach

### CharacterSelector Styling (Dropdown - MVP)

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
    color: var(--text-primary);
    font-size: 0.875rem;
    cursor: pointer;
    transition: border-color 0.2s;
    
    &:hover {
      border-color: var(--primary-color);
    }
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px var(--primary-color-alpha-20);
    }
  }
  
  .option {
    padding: 0.5rem;
    
    .icon {
      margin-right: 0.5rem;
    }
  }
}

// Responsive
@media (min-width: 768px) {
  .characterSelector {
    flex-direction: row;
    align-items: center;
    
    .label {
      margin-right: 0.5rem;
    }
  }
}
```

### Character Card Styling (Modal Grid - Phase 2)

```scss
// CharacterCard.module.scss
.characterCard {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border: 2px solid var(--border-color);
  border-radius: 1rem;
  background: var(--background-secondary);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &.selected {
    border-color: var(--primary-color);
    background: var(--primary-color-alpha-10);
  }
  
  .icon {
    font-size: 3rem;
    margin-bottom: 0.75rem;
  }
  
  .name {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    text-align: center;
    color: var(--text-primary);
  }
  
  .description {
    font-size: 0.875rem;
    color: var(--text-secondary);
    text-align: center;
    line-height: 1.4;
  }
  
  .tags {
    display: flex;
    gap: 0.25rem;
    margin-top: 0.75rem;
    flex-wrap: wrap;
    justify-content: center;
    
    .tag {
      padding: 0.25rem 0.5rem;
      background: var(--background-tertiary);
      border-radius: 0.25rem;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
  }
}

.characterGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
}
```

## Accessibility Considerations

### Keyboard Navigation
- [ ] Tab through character options
- [ ] Arrow keys to navigate dropdown options
- [ ] Enter/Space to select character
- [ ] Escape to close modal (Phase 2)
- [ ] Clear focus indicators

### Screen Reader Support
```html
<select 
  aria-label="Select character persona"
  aria-describedby="character-description"
>
  <option value="friendly-tutor">
    👨‍🏫 Friendly Tutor - Patient and encouraging
  </option>
  <!-- ... more options -->
</select>
<div id="character-description" className="sr-only">
  Choose a character to personalize your conversation experience
</div>
```

### ARIA Labels
- Character selector: `aria-label="Select AI character persona"`
- Each character option: Include icon, name, and brief description
- Custom character button: `aria-label="Create custom character"`
- Character cards (Phase 2): `aria-label="[Character Name] - [Description]"`

### Visual Contrast
- Ensure 4.5:1 contrast ratio for all text
- Selected character clearly distinguishable
- Focus states visible and high contrast
- Icons complement text, don't replace it

## Security Considerations

### Input Validation (Custom Characters - Stretch)

```typescript
// Validate custom character input
const validateCustomCharacter = (input: CustomCharacterInput): string[] => {
  const errors: string[] = [];
  
  // Name validation
  if (!input.name || input.name.length < 3) {
    errors.push('Character name must be at least 3 characters');
  }
  if (input.name.length > 50) {
    errors.push('Character name must be less than 50 characters');
  }
  
  // Archetype validation
  if (!input.archetype || input.archetype.length < 10) {
    errors.push('Character description must be at least 10 characters');
  }
  if (input.archetype.length > 200) {
    errors.push('Character description must be less than 200 characters');
  }
  
  // Sanitize inputs
  input.name = sanitizeInput(input.name);
  input.archetype = sanitizeInput(input.archetype);
  
  return errors;
};

const sanitizeInput = (text: string): string => {
  // Remove potentially harmful characters
  return text
    .trim()
    .replace(/[<>]/g, '') // Prevent HTML injection
    .replace(/[{}]/g, ''); // Prevent template injection
};
```

### Prompt Injection Prevention

```typescript
// Prevent malicious prompts in custom characters
const sanitizeSystemPrompt = (prompt: string): string => {
  // Remove instructions that could override system behavior
  const dangerousPatterns = [
    /ignore (previous|all) instructions?/gi,
    /disregard (previous|all) instructions?/gi,
    /you are now/gi,
    /new instructions?:/gi,
  ];
  
  let sanitized = prompt;
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized;
};
```

### Storage Limits

- Maximum 10 custom characters per user
- Maximum prompt length: 500 characters
- localStorage size monitoring
- Graceful degradation if storage full

## Testing Strategy

### Manual Testing Checklist

**Character Selection**
- [ ] Can select each preset character from dropdown
- [ ] Selected character persists after page refresh
- [ ] Character selection only visible in conversation mode
- [ ] Character name and icon display correctly
- [ ] Default character is Friendly Tutor

**Conversation Quality**
- [ ] Friendly Tutor: Patient, encouraging responses
- [ ] Casual Friend: Informal, friendly tone
- [ ] Business Professional: Formal, professional language
- [ ] Travel Guide: Enthusiastic, descriptive responses
- [ ] Wise Mentor: Thoughtful, reflective answers
- [ ] Character personality consistent across multiple messages
- [ ] Character personality works in all supported languages

**Switching Characters**
- [ ] Can switch characters mid-conversation
- [ ] New character personality applies to next response
- [ ] Conversation history maintained after character switch
- [ ] No errors when switching characters

**Custom Characters (Stretch Goal)**
- [ ] Can create custom character with valid inputs
- [ ] Form validation works correctly
- [ ] Custom character appears in selection list
- [ ] Custom character system prompt generates correctly
- [ ] Can edit existing custom character
- [ ] Can delete custom character
- [ ] Cannot create more than 10 custom characters
- [ ] Custom characters persist after page refresh

**Error Handling**
- [ ] Graceful fallback if character ID not found
- [ ] Falls back to default character if localStorage corrupted
- [ ] Error message if custom character limit reached
- [ ] Validation errors display clearly

**Accessibility**
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces character selection
- [ ] Focus indicators visible
- [ ] Character descriptions read by screen readers
- [ ] Color contrast meets WCAG AA standards

### Automated Testing (Phase 2)

**Unit Tests**:
```typescript
describe('CharacterContext', () => {
  it('defaults to Friendly Tutor', () => {
    // Test default character
  });
  
  it('persists character selection to localStorage', () => {
    // Test localStorage integration
  });
  
  it('loads custom characters from localStorage', () => {
    // Test custom character loading
  });
});

describe('Character System Prompts', () => {
  it('generates appropriate prompts for each character', () => {
    // Test prompt generation
  });
  
  it('includes target language in prompts', () => {
    // Test language interpolation
  });
});

describe('Custom Character Validation', () => {
  it('validates required fields', () => {
    // Test validation
  });
  
  it('sanitizes malicious input', () => {
    // Test security
  });
});
```

## Performance Considerations

### API Response Time
- **No performance degradation expected**: Character prompt is part of system message, doesn't add tokens
- **Estimated response time**: Same as current (1-2s for OpenAI + 400-600ms for DeepL)
- **Character switching**: Instant (no API call, just context update)

### localStorage Performance
- **Character selection**: <5ms read/write
- **Custom characters**: <10ms for array of 10 characters
- **No impact on page load time**

### Memory Usage
- **Minimal impact**: 5-10 preset characters + max 10 custom = ~50KB
- **Context updates**: Lightweight state changes
- **No additional API calls or network requests**

## Risk Assessment

### Low Risk Items ✅
- Feature is isolated and testable
- No breaking changes to existing conversation mode
- Character prompts are well-tested AI patterns
- Extends existing context pattern successfully
- Can be feature-flagged or disabled easily

### Medium Risk Items ⚠️
1. **Character prompt quality variance**
   - Mitigation: Thoroughly test each character with multiple scenarios
   - Fallback: Iterate on prompts based on user feedback

2. **User confusion with multiple options**
   - Mitigation: Clear descriptions, good defaults
   - Help text and tooltips
   
3. **Custom character prompt injection (stretch goal)**
   - Mitigation: Input validation and sanitization
   - Length limits and pattern blocking

### Mitigation Strategies
1. Start with well-tested preset characters only (defer custom to stretch)
2. Test thoroughly with multiple languages before launch
3. Monitor conversation quality metrics after launch
4. Gather user feedback on character personalities
5. Iterate on system prompts based on real usage

## Implementation Timeline

### Sprint 1 (Week 1): Core Character System
- **Days 1-2**: Character context, infrastructure, and state management
- **Day 3**: Character selector UI (dropdown MVP)
- **Days 4-5**: API integration and testing

### Sprint 2 (Week 2): Polish and Testing
- **Days 1-2**: Testing all characters with multiple languages
- **Day 3**: Responsive design and accessibility
- **Days 4-5**: Documentation and bug fixes

**MVP Timeline: 2 weeks (11-16 development hours)**

### Sprint 3 (Optional - Stretch Goal): Custom Characters
- **Days 1-2**: Custom character creation UI
- **Days 3-4**: Character management features
- **Day 5**: Testing and documentation

**With Stretch Goal: 3 weeks (15-22 development hours)**

## Success Metrics

### Quantitative Metrics
- [ ] Character selector renders correctly
- [ ] All 5 preset characters available and functional
- [ ] Character persistence works (localStorage)
- [ ] No performance degradation (<3s response time)
- [ ] Character personality detectable in responses
- [ ] Works with all supported languages

### Qualitative Metrics
- [ ] Character personalities feel distinct and appropriate
- [ ] UI is intuitive and discoverable
- [ ] Character selection enhances conversation experience
- [ ] Descriptions accurately represent character behavior
- [ ] Responses match expected character tone

### Adoption Metrics (Post-Launch)
- % of users who try different characters
- Most popular character personas
- Average number of character switches per session
- User feedback on character personalities
- Retention difference between users who use vs. don't use characters

## Open Questions for Stakeholders

Before implementation begins, please provide guidance on:

### 1. Character Roster
**Question**: Are the 5 proposed preset characters appropriate, or should we add/remove any?

**Current Roster**:
- Friendly Tutor (patient, educational)
- Casual Friend (informal, conversational)
- Business Professional (formal, professional)
- Enthusiastic Travel Guide (energetic, cultural)
- Wise Mentor (reflective, philosophical)

**Alternative Characters to Consider**:
- Child-Friendly Teacher (for younger learners)
- News Reporter (factual, informative)
- Comedian (humorous, entertaining)
- Storyteller (narrative, imaginative)

**Recommendation**: Start with current 5, expand based on feedback

### 2. Custom Character Priority
**Question**: Should custom character creation be part of MVP or deferred to Phase 2?

**Options**:
- **MVP**: Include custom characters (adds 4-6 hours)
- **Phase 2**: Launch with presets, add custom later
- **Premium Feature**: Custom characters for paid tier only

**Recommendation**: Defer to Phase 2 - presets validate concept first

### 3. Character Visibility
**Question**: Should character selector be:
- Always visible (next to language/mode selectors)
- Only visible in conversation mode (conditional rendering)
- In a settings menu

**Recommendation**: Only visible in conversation mode (reduces clutter)

### 4. Character Descriptions
**Question**: How much information should we show for each character?
- **Minimal**: Just name and icon (dropdown)
- **Brief**: Name, icon, one-line description (dropdown)
- **Detailed**: Name, icon, description, use cases (modal/cards)

**Recommendation**: Brief for MVP (dropdown), detailed for Phase 2 (modal)

### 5. Character Persistence Scope
**Question**: Should character selection persist:
- Globally (same character for all conversations)
- Per language (different character per language)
- Per session (reset on new conversation)

**Recommendation**: Globally (simplest, most consistent)

### 6. Future Enhancements
**Question**: What features should we prioritize for Phase 2?
- Custom character creation
- Character modal with grid layout
- Character usage analytics
- More preset characters
- Character sharing (export/import)

**Recommendation**: Custom characters → Character modal → More presets

## Conclusion

The Character Selection feature adds a powerful personalization layer to chattr's conversation mode, enabling users to have more engaging and contextually appropriate language practice. By offering diverse AI personas, we cater to different learning styles, proficiency levels, and use cases.

The implementation follows established architectural patterns, requires minimal changes to existing code, and provides clear value to users. The estimated effort of 2 weeks for MVP allows for thorough testing and polish, with a clear path for enhanced features in Phase 2.

Key success factors:
- ✅ Isolated, additive changes
- ✅ Reuses existing context patterns
- ✅ Well-defined character personalities
- ✅ Clear user value proposition
- ✅ Strong accessibility considerations
- ✅ Comprehensive testing strategy
- ✅ Scalable architecture for custom characters (stretch goal)
- ✅ No performance degradation
- ✅ Minimal risk to existing features

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-13  
**Status**: Ready for Review and Implementation  
**Estimated Effort (MVP)**: 11-16 hours / 2 weeks  
**Estimated Effort (with Stretch Goal)**: 15-22 hours / 3 weeks  
**Risk Level**: Low (additive feature, proven patterns)
