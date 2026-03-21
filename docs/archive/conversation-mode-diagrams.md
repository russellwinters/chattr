# Conversation Mode - Architecture Diagrams and Visual Documentation

> **Visual Reference**: Diagrams, mockups, and visual representations of the Conversation Mode architecture.

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Component Hierarchy](#component-hierarchy)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [UI Layout Mockups](#ui-layout-mockups)
5. [API Request/Response Flow](#api-requestresponse-flow)
6. [State Management](#state-management)
7. [Sequence Diagrams](#sequence-diagrams)
8. [File Structure](#file-structure)

---

## System Architecture

### High-Level System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Chattr Application                       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              React Context Layer                    │    │
│  │  ┌──────────────────┐  ┌─────────────────────┐    │    │
│  │  │ LanguageContext  │  │   ModeContext (NEW) │    │    │
│  │  │  - targetLang    │  │   - mode: trans/conv│    │    │
│  │  │  - languages[]   │  │   - setMode()       │    │    │
│  │  └──────────────────┘  └─────────────────────┘    │    │
│  │              ↓                      ↓               │    │
│  │      localStorage          localStorage            │    │
│  │   'chattr_target_lang'  'chattr_mode'             │    │
│  └────────────────────────────────────────────────────┘    │
│                              ↓                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              UI Component Layer                     │    │
│  │                                                     │    │
│  │  ┌─────────────┐  ┌──────────────┐                │    │
│  │  │  Language   │  │    Mode      │  ← Header      │    │
│  │  │  Selector   │  │  Selector    │                │    │
│  │  └─────────────┘  └──────────────┘                │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │         MessageList                      │     │    │
│  │  │  ┌────────────────────────────────┐     │     │    │
│  │  │  │ MessageBox (Enhanced)          │     │     │    │
│  │  │  │  - Main text                   │     │     │    │
│  │  │  │  - Translation (if conv mode)  │     │     │    │
│  │  │  └────────────────────────────────┘     │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │         ChatInput (Enhanced)             │     │    │
│  │  │  - Mode-aware submission                 │     │    │
│  │  │  - History tracking                      │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────┘    │
│                              ↓                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              API Layer (Next.js)                    │    │
│  │                                                     │    │
│  │  ┌──────────────┐  ┌─────────────────────────┐    │    │
│  │  │ /api/        │  │  /api/conversation      │    │    │
│  │  │  translate   │  │  (NEW)                  │    │    │
│  │  └──────────────┘  └─────────────────────────┘    │    │
│  └────────────────────────────────────────────────────┘    │
│                 ↓                      ↓                    │
└─────────────────┼──────────────────────┼───────────────────┘
                  ↓                      ↓
    ┌─────────────────────┐  ┌───────────────────────┐
    │   DeepL API         │  │   OpenAI API (NEW)    │
    │   - Translation     │  │   - GPT-3.5-turbo     │
    │   - Language detect │  │   - Conversation      │
    └─────────────────────┘  └───────────────────────┘
```

---

## Component Hierarchy

### Complete Component Tree

```
App (_app.tsx)
│
├─ LanguageProvider (existing)
│  │
│  └─ ModeProvider (NEW)
│     │
│     └─ Component (pages/index.tsx)
│        │
│        ├─ Head (meta tags)
│        │
│        └─ main
│           │
│           ├─ Header Section (NEW grouping)
│           │  ├─ LanguageSelector (existing)
│           │  └─ ModeSelector (NEW)
│           │
│           ├─ MessageList (existing, enhanced)
│           │  └─ MessageBox[] (enhanced for bilingual)
│           │     ├─ mainText
│           │     ├─ divider (if bilingual)
│           │     └─ translation (if bilingual)
│           │
│           └─ ChatInput (existing, enhanced)
│              ├─ Input (existing)
│              └─ Button (existing)
```

### New Component: ModeSelector

```
ModeSelector
│
├─ Props
│  ├─ value: Mode
│  ├─ onChange: (mode: Mode) => void
│  ├─ classNames?: string
│  └─ disabled?: boolean
│
├─ State (from useMode)
│  ├─ mode: 'translation' | 'conversation'
│  └─ setMode: (mode: Mode) => void
│
└─ Render
   └─ Toggle Control
      ├─ Option: Translation
      │  ├─ onClick: setMode('translation')
      │  ├─ aria-pressed: mode === 'translation'
      │  └─ className: active/inactive
      │
      └─ Option: Conversation
         ├─ onClick: setMode('conversation')
         ├─ aria-pressed: mode === 'conversation'
         └─ className: active/inactive
```

### Enhanced Component: MessageBox

```
MessageBox (Enhanced)
│
├─ Props (NEW additions)
│  ├─ children: ReactNode (existing)
│  ├─ incoming?: boolean (existing)
│  ├─ classNames?: string (existing)
│  ├─ translation?: string (NEW)
│  └─ showTranslation?: boolean (NEW)
│
└─ Render
   ├─ Main Text Container
   │  └─ {children}
   │
   └─ If showTranslation && translation
      ├─ Divider Line
      └─ Translation Text
         └─ {translation}
```

---

## Data Flow Diagrams

### Translation Mode Flow (Existing)

```
┌─────────────┐
│    User     │
│  Types msg  │
└──────┬──────┘
       │
       ↓
┌─────────────────────┐
│    ChatInput        │
│  Captures input     │
└──────┬──────────────┘
       │
       ↓ POST /api/translate
       │ { text, targetLanguage }
┌──────┴──────────────┐
│  /api/translate     │
│  Endpoint           │
└──────┬──────────────┘
       │
       ↓ translateText()
┌──────┴──────────────┐
│    DeepL API        │
│  Translates text    │
└──────┬──────────────┘
       │
       ↓ { result: { text } }
┌──────┴──────────────┐
│  /api/translate     │
│  Returns result     │
└──────┬──────────────┘
       │
       ↓
┌──────┴──────────────┐
│    ChatInput        │
│ dispatchIncoming    │
│    Event            │
└──────┬──────────────┘
       │
       ↓
┌──────┴──────────────┐
│   MessageList       │
│  Renders message    │
└──────┬──────────────┘
       │
       ↓
┌──────┴──────────────┐
│    MessageBox       │
│ Displays translation│
└─────────────────────┘
```

### Conversation Mode Flow (NEW)

```
┌─────────────┐
│    User     │
│  Types msg  │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────┐
│    ChatInput                │
│  Captures input             │
│  Checks mode = conversation │
└──────┬──────────────────────┘
       │
       ↓ POST /api/conversation
       │ { userMessage, targetLanguage, conversationHistory }
       │
┌──────┴───────────────────────────────────────────┐
│  /api/conversation Endpoint                      │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │ Step 1: Generate AI Response            │    │
│  │  OpenAI: Chat completion                │    │
│  │  Input: userMessage (original language) │    │
│  │  Context: History (in original language)│    │
│  │  Result: assistantResponseOriginal      │    │
│  └─────────────┬───────────────────────────┘    │
│                ↓                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Step 2: Batch Translate Both Messages   │    │
│  │  DeepL: Combined text → targetLang      │    │
│  │  Input: userMsg + delimiter + aiResponse│    │
│  │  Result: userMessageTranslation +       │    │
│  │          assistantResponse (target)     │    │
│  └─────────────┬───────────────────────────┘    │
│                ↓                                 │
│  Return {                                        │
│    userMessageTranslation,                       │
│    assistantResponse (target language),          │
│    assistantResponseTranslation (original)       │
│  }                                               │
└──────┬───────────────────────────────────────────┘
       │
       ↓
┌──────┴──────────────────────────────────┐
│    ChatInput                             │
│  1. dispatchOutgoingEvent                │
│     (userMsg, userMsgTranslation)        │
│  2. dispatchIncomingEvent                │
│     (aiResponse, aiResponseTranslation)  │
│  3. Add to conversationHistory           │
│     (in original language)               │
└──────┬───────────────────────────────────┘
       │
       ↓
┌──────┴──────────────────────────────────┐
│   MessageList                            │
│  Renders both messages                   │
└──────┬───────────────────────────────────┘
       │
       ↓
┌──────┴──────────────────────────────────┐
│    MessageBox (Bilingual Display)       │
│                                          │
│  User Message:                           │
│  ┌────────────────────────────────────┐ │
│  │ Hello, how are you?                │ │
│  │ ──────────────────────────────────│ │
│  │ Hola, ¿cómo estás?                 │ │
│  └────────────────────────────────────┘ │
│                                          │
│  AI Response:                            │
│  ┌────────────────────────────────────┐ │
│  │ ¡Muy bien, gracias! ¿Y tú?         │ │
│  │ ──────────────────────────────────│ │
│  │ Very well, thanks! And you?        │ │
│  └────────────────────────────────────┘ │
└───────────────────────────────────────────┘
```

---

## UI Layout Mockups

### Current Layout (Translation Mode Only)

```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Language: Spanish ▼                  │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │                                       │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │ Hello!                          │ │ │
│  │  └─────────────────────────────────┘ │ │
│  │                                       │ │
│  │      ┌─────────────────────────────┐ │ │
│  │      │ ¡Hola!                      │ │ │
│  │      └─────────────────────────────┘ │ │
│  │                                       │ │
│  │  MessageList                          │ │
│  │                                       │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌─────────────────────────┬────────────┐ │
│  │  Type here...           │  Submit    │ │
│  └─────────────────────────┴────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

### New Layout with Conversation Mode (Desktop)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌────────────────────┬──────────────────────────────┐ │
│  │ Language: Spanish▼ │ [Translation | Conversation] │ │
│  └────────────────────┴──────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │ Hello, how are you?                         │ │ │
│  │  │ ─────────────────────────────────────────── │ │ │
│  │  │ Hola, ¿cómo estás?                         │ │ │
│  │  └─────────────────────────────────────────────┘ │ │
│  │                                                   │ │
│  │      ┌─────────────────────────────────────────┐ │ │
│  │      │ ¡Hola! Muy bien, gracias. ¿Y tú?       │ │ │
│  │      │ ─────────────────────────────────────── │ │ │
│  │      │ Hi! Very well, thanks. And you?        │ │ │
│  │      └─────────────────────────────────────────┘ │ │
│  │                                                   │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │ I'm doing great! What did you do today?     │ │ │
│  │  │ ─────────────────────────────────────────── │ │ │
│  │  │ ¡Estoy muy bien! ¿Qué hiciste hoy?         │ │ │
│  │  └─────────────────────────────────────────────┘ │ │
│  │                                                   │ │
│  │  MessageList (Bilingual Messages)                │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────┬──────────────┐ │
│  │  Type here...                     │    Submit    │ │
│  └───────────────────────────────────┴──────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Mobile Layout (Responsive < 768px)

```
┌──────────────────────────┐
│                          │
│ ┌──────────────────────┐ │
│ │ Language: Spanish ▼  │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │[Translation | Conv.] │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │                      │ │
│ │ ┌──────────────────┐ │ │
│ │ │ Hello!           │ │ │
│ │ │ ──────────────── │ │ │
│ │ │ ¡Hola!           │ │ │
│ │ └──────────────────┘ │ │
│ │                      │ │
│ │   ┌──────────────┐   │ │
│ │   │ ¡Hola!       │   │ │
│ │   │ ──────────── │   │ │
│ │   │ Hi there!    │   │ │
│ │   └──────────────┘   │ │
│ │                      │ │
│ │ MessageList          │ │
│ │                      │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │ Type here...         │ │
│ ├──────────────────────┤ │
│ │      Submit          │ │
│ └──────────────────────┘ │
│                          │
└──────────────────────────┘
```

### Mode Selector Visual States

**Option A: Toggle Switch**
```
┌────────────────────────────┐
│ Translation │ Conversation │  ← Inactive
└────────────────────────────┘

┌────────────────────────────┐
│ Translation │ Conversation │  ← Active (Translation)
│▓▓▓▓▓▓▓▓▓▓▓▓│              │
└────────────────────────────┘

┌────────────────────────────┐
│ Translation │ Conversation │  ← Active (Conversation)
│             │▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
└────────────────────────────┘
```

**Option B: Segmented Control**
```
┌──────────────┬──────────────┐
│ Translation  │ Conversation │  ← Both inactive
└──────────────┴──────────────┘

┌──────────────┬──────────────┐
│▓Translation▓ │ Conversation │  ← Translation active
└──────────────┴──────────────┘

┌──────────────┬──────────────┐
│ Translation  │▓Conversation▓│  ← Conversation active
└──────────────┴──────────────┘
```

### Message Box Visual Comparison

**Translation Mode (Single Text)**
```
┌──────────────────────────────┐
│ ¡Hola! ¿Cómo estás?          │  ← Single line
└──────────────────────────────┘
```

**Conversation Mode (Bilingual)**
```
┌──────────────────────────────┐
│ ¡Hola! ¿Cómo estás?          │  ← Main text (1rem, full opacity)
│ ──────────────────────────── │  ← Divider (1px, subtle)
│ Hi! How are you?             │  ← Translation (0.85rem, 70% opacity, italic)
└──────────────────────────────┘
```

---

## API Request/Response Flow

### Translation API (Existing)

**Request:**
```json
POST /api/translate
{
  "text": "Hello, how are you?",
  "targetLanguage": "es"
}
```

**Response:**
```json
{
  "result": {
    "text": "Hola, ¿cómo estás?",
    "detectedSourceLang": "en"
  }
}
```

### Conversation API (NEW)

**Request:**
```json
POST /api/conversation
{
  "userMessage": "Hello, how are you?",
  "targetLanguage": "es",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hola"
    },
    {
      "role": "assistant",
      "content": "¡Hola! ¿En qué puedo ayudarte?"
    }
  ]
}
```

**Response:**
```json
{
  "userMessageTranslation": "Hola, ¿cómo estás?",
  "assistantResponse": "¡Hola! Estoy muy bien, gracias. ¿Y tú? ¿Cómo te va?",
  "assistantResponseTranslation": "Hi! I'm very well, thanks. And you? How's it going?",
  "detectedSourceLanguage": "en"
}
```

**Error Response:**
```json
{
  "message": "Service temporarily unavailable",
  "fallbackTranslation": "Hola, ¿cómo estás?"
}
```

### Internal API Flow Diagram

```
┌──────────────────────────────────────────────────┐
│         /api/conversation Endpoint               │
│                                                  │
│  1. Validate Request                             │
│     ├─ userMessage present?                      │
│     ├─ targetLanguage valid?                     │
│     └─ conversationHistory valid?                │
│                                                  │
│  2. ┌─────────────────────────────────────┐     │
│     │  OpenAI Conversation (Step 1)       │     │
│     │  Model: gpt-3.5-turbo               │     │
│     │  Messages:                           │     │
│     │    - System: language learning prompt│    │
│     │    - History: last 10 (original lang)│     │
│     │    - User: userMessage (original)    │     │
│     │  Output: assistantResponseOriginal  │     │
│     └─────────────────────────────────────┘     │
│                     ↓                            │
│  3. ┌─────────────────────────────────────┐     │
│     │  DeepL Batch Translation (Step 2)   │     │
│     │  Input: Combined text with delimiter│     │
│     │    userMsg + "|||DELIMITER|||" +    │     │
│     │    assistantResponseOriginal        │     │
│     │  Target: targetLanguage             │     │
│     │  Output: userMessageTranslation +   │     │
│     │          assistantResponse          │     │
│     └─────────────────────────────────────┘     │
│                     ↓                            │
│  4. Return Complete Response                     │
│     {                                            │
│       userMessageTranslation,                    │
│       assistantResponse (target language),       │
│       assistantResponseTranslation (original),   │
│       detectedSourceLanguage                     │
│     }                                            │
│                                                  │
│  Error Handling:                                 │
│  ├─ OpenAI fails → Fallback to translation only │
│  ├─ DeepL fails → Return error with message     │
│  └─ Network error → 500 with user-friendly msg  │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## State Management

### ModeContext State Diagram

```
┌─────────────────────────────────────────────┐
│            ModeContext State                │
│                                             │
│  Initial State (on mount):                  │
│  ┌────────────────────────────────────┐    │
│  │ mode = 'translation' (default)     │    │
│  └────────────────────────────────────┘    │
│              ↓                              │
│  Check localStorage:                        │
│  ┌────────────────────────────────────┐    │
│  │ const saved = localStorage         │    │
│  │   .getItem('chattr_mode')          │    │
│  │ if (saved) mode = saved            │    │
│  └────────────────────────────────────┘    │
│              ↓                              │
│  Render with current mode                   │
│                                             │
│  On mode change:                            │
│  ┌────────────────────────────────────┐    │
│  │ 1. setMode(newMode)                │    │
│  │ 2. Update localStorage             │    │
│  │ 3. Re-render all consumers         │    │
│  └────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘

State Flow:
───────────
   'translation'  ⇄  'conversation'
        ↕                  ↕
   localStorage      localStorage
   'chattr_mode'     'chattr_mode'
```

### Conversation History Management

```
┌─────────────────────────────────────────────┐
│      Conversation History (In-Memory)       │
│                                             │
│  Data Structure:                            │
│  ┌────────────────────────────────────┐    │
│  │ type ConversationMessage = {       │    │
│  │   role: 'user' | 'assistant',      │    │
│  │   content: string,                 │    │
│  │   translation?: string,            │    │
│  │   timestamp: number                │    │
│  │ }                                  │    │
│  │                                    │    │
│  │ const [history, setHistory] =     │    │
│  │   useState<ConversationMessage[]>  │    │
│  └────────────────────────────────────┘    │
│                                             │
│  Operations:                                │
│  ┌────────────────────────────────────┐    │
│  │ Add Message:                       │    │
│  │   setHistory(prev => [             │    │
│  │     ...prev,                       │    │
│  │     newMessage                     │    │
│  │   ])                               │    │
│  │                                    │    │
│  │ Get Recent (for API):              │    │
│  │   history.slice(-10)               │    │
│  │   ↑ Last 10 messages only          │    │
│  │                                    │    │
│  │ Clear History:                     │    │
│  │   setHistory([])                   │    │
│  └────────────────────────────────────┘    │
│                                             │
│  Lifecycle:                                 │
│  ├─ Created: On component mount            │
│  ├─ Updated: After each conversation turn  │
│  └─ Cleared: On page refresh/unmount       │
│                                             │
└─────────────────────────────────────────────┘
```

### Props Flow Diagram

```
App (_app.tsx)
│
├─ LanguageProvider
│  └─ value: { targetLanguage, setTargetLanguage }
│     │
│     ├─→ LanguageSelector
│     ├─→ ChatInput (reads targetLanguage)
│     └─→ Any component via useLanguage()
│
└─ ModeProvider
   └─ value: { mode, setMode }
      │
      ├─→ ModeSelector (reads & writes mode)
      ├─→ ChatInput (reads mode for routing)
      ├─→ MessageBox (reads mode for styling)
      └─→ Any component via useMode()
```

---

## Sequence Diagrams

### User Sends Message in Conversation Mode

```
User          ChatInput      ModeContext    /api/conversation   DeepL   OpenAI
│                │               │                │              │        │
├─ Type "Hi"     │               │                │              │        │
│                │               │                │              │        │
├─ Click Submit ─→               │                │              │        │
│                │               │                │              │        │
│                ├─ useMode() ───→               │              │        │
│                │               │                │              │        │
│                ←── mode='conv' ┤               │              │        │
│                │               │                │              │        │
│                ├─ POST request ─────────────────→              │        │
│                │               │                │              │        │
│                │               │                ├─ translate ──→        │
│                │               │                │              │        │
│                │               │                ←── "Hola" ────┤        │
│                │               │                │              │        │
│                │               │                ├─ completion ─────────→
│                │               │                │              │        │
│                │               │                ←── AI response ────────┤
│                │               │                │              │        │
│                │               │                ├─ translate ──→        │
│                │               │                │              │        │
│                │               │                ←── translation┤        │
│                │               │                │              │        │
│                ←─ Response ────────────────────┤              │        │
│                │               │                │              │        │
│                ├─ dispatch events               │              │        │
│                │   (outgoing & incoming)        │              │        │
│                │               │                │              │        │
├─ See messages ←┤               │                │              │        │
│  (bilingual)   │               │                │              │        │
│                │               │                │              │        │
```

### Mode Switch Sequence

```
User          ModeSelector    ModeContext    localStorage    ChatInput   MessageBox
│                │               │               │              │           │
├─ Click "Conv" ─→              │               │              │           │
│                │               │               │              │           │
│                ├─ setMode() ───→              │              │           │
│                │               │               │              │           │
│                │               ├─ save ────────→              │           │
│                │               │               │              │           │
│                │               ├─ notify consumers            │           │
│                │               │               │              │           │
│                │               ├───────────────────────────────→          │
│                │               │               │              │           │
│                │               ├─────────────────────────────────────────→
│                │               │               │              │           │
│                ←── re-render ──┤               │              │           │
│                │               │               │              │           │
├─ See updated UI┤               │               │              │           │
│                │               │               │              │           │
```

---

## File Structure

### Complete File Tree (With New Files Highlighted)

```
chattr/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   ├── ChatInput/
│   │   │   ├── ChatInput.tsx         ← MODIFIED (mode-aware)
│   │   │   └── ChatInput.module.scss
│   │   ├── Input/
│   │   ├── LanguageSelector/
│   │   ├── MessageBox/
│   │   │   ├── MessageBox.tsx        ← MODIFIED (bilingual)
│   │   │   └── MessageBox.module.scss ← MODIFIED (bilingual styles)
│   │   ├── MessageList/
│   │   ├── ModeSelector/             ← NEW
│   │   │   ├── ModeSelector.tsx      ← NEW
│   │   │   ├── ModeSelector.module.scss ← NEW
│   │   │   └── index.ts              ← NEW
│   │   └── index.ts                  ← MODIFIED (export ModeSelector)
│   │
│   ├── contexts/
│   │   ├── LanguageContext.tsx
│   │   └── ModeContext.tsx           ← NEW
│   │
│   ├── hooks/
│   │   ├── useLanguage.ts
│   │   └── useMode.ts                ← NEW
│   │
│   ├── lib/
│   │   └── openai.ts                 ← NEW
│   │
│   ├── pages/
│   │   ├── api/
│   │   │   ├── conversation.ts       ← NEW
│   │   │   └── translate.ts
│   │   ├── _app.tsx                  ← MODIFIED (add ModeProvider)
│   │   └── index.tsx                 ← MODIFIED (add ModeSelector)
│   │
│   ├── styles/
│   ├── utils/
│   │   ├── events.ts                 ← MODIFIED (bilingual events)
│   │   └── languages.ts
│   │
├── docs/
│   ├── conversation-mode-plan.md          ← NEW
│   ├── conversation-mode-summary.md       ← NEW
│   ├── conversation-mode-quick-reference.md ← NEW
│   ├── conversation-mode-diagrams.md      ← NEW (this file)
│   ├── language-selector-*.md
│   └── README.md                          ← MODIFIED
│
├── .env.example                           ← MODIFIED (add OPENAI_API_KEY)
├── .env.local                             ← MODIFIED (add key)
├── package.json                           ← MODIFIED (add openai)
└── README.md                              ← MODIFIED (document feature)
```

### Files Summary

**New Files (8):**
1. `/src/contexts/ModeContext.tsx` - Mode state management
2. `/src/hooks/useMode.ts` - Mode context hook
3. `/src/components/ModeSelector/ModeSelector.tsx` - Mode toggle UI
4. `/src/components/ModeSelector/ModeSelector.module.scss` - Mode styles
5. `/src/components/ModeSelector/index.ts` - Export
6. `/src/lib/openai.ts` - OpenAI client
7. `/src/pages/api/conversation.ts` - Conversation endpoint
8. `/src/utils/languages.ts` - Language names (if needed)

**Modified Files (10):**
1. `/src/pages/_app.tsx` - Add ModeProvider
2. `/src/pages/index.tsx` - Add ModeSelector
3. `/src/components/MessageBox/MessageBox.tsx` - Bilingual props
4. `/src/components/MessageBox/MessageBox.module.scss` - Bilingual styles
5. `/src/components/ChatInput/ChatInput.tsx` - Mode-aware logic
6. `/src/utils/events.ts` - Translation metadata
7. `/src/components/index.ts` - Export ModeSelector
8. `package.json` - Add openai dependency
9. `.env.example` - Document OPENAI_API_KEY
10. `README.md` - Feature documentation

---

## Type Definitions Overview

### Core Types

```typescript
// Mode Types
type Mode = 'translation' | 'conversation';

// Context Types
type ModeContextType = {
  mode: Mode;
  setMode: (mode: Mode) => void;
};

// Message Types
type Message = {
  content: string;
  timestamp: number;
  incoming: boolean;
  translation?: string;  // NEW for conversation mode
};

// Conversation Types
type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  timestamp: number;
};

// API Types
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
```

---

## Styling Architecture

### CSS Class Hierarchy

```
.modeSelector
├─ .toggle (if toggle switch)
│  ├─ .option
│  │  └─ .active
│  └─ .slider
│
└─ .segmentedControl (if segmented)
   ├─ button
   └─ button.active

.messageBox
├─ .incoming / .outgoing (existing)
│
└─ .bilingual (NEW)
   ├─ .mainText
   ├─ .divider
   └─ .translation
```

### Responsive Breakpoints

```scss
// Mobile first approach
.header {
  display: flex;
  flex-direction: column;  // Stack on mobile
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;  // Side-by-side on desktop
    justify-content: space-between;
  }
}

.messageBox.bilingual {
  padding: 0.75rem 1rem;
  
  .mainText {
    font-size: 0.95rem;
  }
  
  .translation {
    font-size: 0.8rem;
  }
  
  @media (min-width: 768px) {
    padding: 1rem 1.25rem;
    
    .mainText {
      font-size: 1rem;
    }
    
    .translation {
      font-size: 0.85rem;
    }
  }
}
```

---

## Performance Considerations

### API Call Optimization

```
┌─────────────────────────────────────────┐
│     Conversation API Call               │
│                                         │
│  Parallel possible?                     │
│  ├─ Step 1: AI generation     ← First
│  └─ Step 2: Batch translate   ← Depends on Step 1
│                                         │
│  ⚠️ Sequential execution required       │
│                                         │
│  Timing breakdown (typical):            │
│  ├─ OpenAI completion:  1000-2000ms    │
│  └─ DeepL batch translate: 400-600ms   │
│  ─────────────────────────────────────  │
│  Total:                 1.4-2.6 seconds │
│                                         │
│  ✅ Faster than 3-step flow!            │
│                                         │
└─────────────────────────────────────────┘
```

### Loading State Flow

```
User clicks Submit
      ↓
[Loading: Disable input, show spinner]
      ↓
API call in progress (1.4-2.6s)
      ↓
[Loading: Show "AI is typing..." message]
      ↓
Response received
      ↓
[Loading: Hide spinner, enable input]
      ↓
Display messages
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-08  
**Status**: Ready for Development  
**Related Docs**: conversation-mode-plan.md, conversation-mode-summary.md, conversation-mode-quick-reference.md
