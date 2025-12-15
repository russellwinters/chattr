# Chattr

A real-time translation and conversation application that helps you learn languages through translation and AI-powered conversations.

## Features

### Translation Mode
- Chat-style interface for text translation
- Real-time translation to multiple languages via DeepL
- Support for 31 languages
- Message history with incoming/outgoing message display

### Conversation Mode
- AI-powered conversational responses using OpenAI GPT-3.5-turbo
- Bilingual message display (original language + translation)
- Context-aware responses for natural conversations
- Language learning focused interactions
- Conversation history tracking (last 10 messages for context)
- **Character Selection**: Choose from 5 AI personas to customize your learning experience
  - 👨‍🏫 **Friendly Tutor**: Patient and encouraging, perfect for beginners
  - 😊 **Casual Friend**: Relaxed, informal conversation like chatting with a friend
  - 💼 **Business Professional**: Formal, professional for workplace scenarios
  - 🌍 **Enthusiastic Travel Guide**: Energetic, descriptive for travel preparation
  - 🧙 **Wise Mentor**: Thoughtful, reflective for deeper discussions

### General Features
- Mode selector to switch between translation and conversation modes
- Language selector with support for 31 DeepL languages
- Character selector for conversation mode (5 preset personas)
- Persistent mode, language, and character preferences (localStorage)
- Simple, clean UI built with React and SASS

## Prerequisites

- Node.js 20.x or higher
- DeepL API key ([get one here](https://www.deepl.com/pro-api))
- OpenAI API key (optional, for conversation mode) ([get one here](https://platform.openai.com/api-keys))

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your API keys:
   ```
   DEEPL_API_KEY=your_deepl_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here  # Optional, for conversation mode
   ```
   
   **Note**: The OpenAI API key is only required if you want to use the conversation mode feature. Translation mode works with just the DeepL API key.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

### Translation Mode
1. Select your target language from the language selector
2. Type your text in the input field and press Enter or click Submit
3. The app will display your message and return a translation in your selected language

### Conversation Mode
1. Toggle to "Conversation" mode using the mode selector
2. Select your target language from the language selector
3. Choose your preferred AI character from the character selector (appears in conversation mode)
4. Type your message in any language and press Enter or click Submit
5. The AI will respond conversationally in the style of your chosen character, with both the original and translated versions displayed
6. The conversation maintains context for natural, flowing dialogue (tracks last 10 messages)
7. You'll see "Loading response and translation..." while waiting for responses
8. **Note**: Switching characters will clear your current conversation to start fresh with the new persona

**Note**: Conversation mode requires an OpenAI API key to be configured. If OpenAI is not available, the system will fall back to translation-only mode.

### Example Conversation Flow

Here's how a typical conversation might look when learning Spanish:

**Example with Friendly Tutor (👨‍🏫)**:

**You (in English)**: "Hello, I'm learning Spanish. Can you help me practice?"
- _Translation shown in Spanish_: "Hola, estoy aprendiendo español. ¿Puedes ayudarme a practicar?"

**AI Response (in English)**: "¡Hola! Of course, I'd be happy to help you practice Spanish. What would you like to talk about?"
- _Translation shown in Spanish_: "¡Hola! Por supuesto, estaré encantado de ayudarte a practicar español. ¿De qué te gustaría hablar?"

The AI maintains context throughout the conversation, so you can ask follow-up questions naturally. Each message displays in both the original language and your selected target language to help you learn.

### Choosing the Right Character

Each character offers a unique conversational style:

- **👨‍🏫 Friendly Tutor**: Best for beginners or structured learning. Patient, encouraging, and educational in tone.
- **😊 Casual Friend**: Perfect for everyday conversation practice. Uses informal language, contractions, and casual expressions.
- **💼 Business Professional**: Ideal for learning professional language for workplace settings, formal meetings, or business correspondence.
- **🌍 Enthusiastic Travel Guide**: Great for travel preparation. Energetic, descriptive, and culturally informative.
- **🧙 Wise Mentor**: Suited for advanced learners who want deeper, more philosophical conversations and reflective dialogue.

### Keyboard Navigation
- **Tab**: Navigate between interactive elements (mode selector, language selector, input field, submit button)
- **Enter**: Submit your message from the input field
- **Space**: Toggle mode selector buttons when focused
- **Arrow keys**: Navigate through language selector options when the dropdown is open

### Accessibility Features
- Full keyboard navigation support
- Screen reader compatible with ARIA labels and live regions
- High contrast color schemes for better readability
- Focus indicators on all interactive elements
- Semantic HTML structure
- Error messages announced to screen readers
- Loading states announced for better context

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: SASS with CSS Modules
- **Translation**: DeepL Node SDK
- **AI Conversations**: OpenAI GPT-3.5-turbo (optional)
- **UI**: React 18
- **State Management**: React Context + localStorage

## Project Structure

```
src/
├── components/
│   ├── Button/              # Submit button component
│   ├── CharacterSelector/   # Character selection dropdown (conversation mode)
│   ├── ChatInput/           # Input field with mode-aware logic
│   ├── Input/               # Base input component
│   ├── LanguageSelector/    # Language selection dropdown
│   ├── MessageBox/          # Individual message display (bilingual support)
│   ├── MessageList/         # Message history container
│   └── ModeSelector/        # Translation/Conversation mode toggle
├── contexts/
│   ├── CharacterContext.tsx # Character state management
│   ├── LanguageContext.tsx  # Language state management
│   └── ModeContext.tsx      # Mode state management
├── hooks/
│   ├── useCharacter.ts      # Hook to access character context
│   ├── useLanguage.ts       # Hook to access language context
│   └── useMode.ts           # Hook to access mode context
├── lib/
│   └── openai.ts            # OpenAI client configuration
├── pages/
│   ├── api/
│   │   ├── conversation.ts  # Conversation API with AI + translation
│   │   └── translate.ts     # DeepL translation endpoint
│   ├── _app.tsx             # App wrapper with providers
│   └── index.tsx            # Main chat page
└── utils/
    ├── characters.ts        # Character definitions and presets
    ├── events.ts            # Custom event system for messages
    └── languages.ts         # Language codes and utilities
```

## Development Status

### Completed Features ✅
- [x] Multi-language support with language selector (31 languages)
- [x] Mode infrastructure (ModeContext with localStorage persistence)
- [x] Mode selector UI (toggle between Translation and Conversation)
- [x] Enhanced message display (bilingual support)
- [x] OpenAI integration setup
- [x] Conversation API endpoint (`/api/conversation`)
- [x] AI response generation with context (last 10 messages)
- [x] Batch translation for efficient API usage
- [x] Error handling with fallback to translation-only mode
- [x] ChatInput mode-aware routing
- [x] Conversation history tracking in component state
- [x] **Character Selection System** (5 preset personas)
- [x] Character-specific AI prompts and personalities
- [x] Character persistence across sessions (localStorage)
- [x] Clear conversation when switching characters

### Future Roadmap 📋
- [ ] Conversation history persistence (localStorage)
- [ ] Loading states and error handling
- [ ] Content moderation
- [ ] Grammar corrections and learning tips
- [ ] User feedback mechanism
- [ ] Rate limiting and usage monitoring

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Troubleshooting

### Common Issues

**"Translation failed" error message**
- Verify your `DEEPL_API_KEY` is correctly set in `.env.local`
- Check that your DeepL API key has remaining quota
- Ensure you have a stable internet connection

**"Conversation failed" error message in Conversation Mode**
- Verify your `OPENAI_API_KEY` is correctly set in `.env.local`
- Check that your OpenAI API key is valid and has remaining quota
- The app will automatically fall back to translation-only mode if OpenAI is unavailable

**Mode or language preference not persisting**
- Check that localStorage is enabled in your browser
- Clear browser cache and try again
- Some browsers in private/incognito mode may block localStorage

**Messages not appearing**
- Check browser console for JavaScript errors
- Ensure you've selected a target language
- Try refreshing the page

**Slow responses in Conversation Mode**
- This is normal - AI responses can take 2-5 seconds
- You'll see "Loading response and translation..." while waiting
- Check your internet connection if it takes longer than 10 seconds

**Character selector not showing**
- Character selector only appears in Conversation mode
- Switch to Conversation mode using the mode selector to see character options

**AI personality doesn't seem right**
- Try switching to a different character to find the style that suits your learning goals
- Note that switching characters will clear your current conversation

### API Key Setup

Make sure your `.env.local` file is in the root directory (not in `src/`) and contains:

```
DEEPL_API_KEY=your_actual_deepl_key_here
OPENAI_API_KEY=your_actual_openai_key_here
```

After adding or changing API keys, restart the development server:
```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```