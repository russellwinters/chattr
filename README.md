# Chattr

A real-time translation and conversation application that helps you learn languages through translation and AI-powered conversations.

## Features

### Translation Mode
- Chat-style interface for text translation
- Real-time translation to multiple languages via DeepL
- Support for 31 languages
- Message history with incoming/outgoing message display

### Conversation Mode (In Development)
- AI-powered conversational responses using OpenAI GPT-3.5-turbo
- Bilingual message display (original language + translation)
- Context-aware responses for natural conversations
- Language learning focused interactions

### General Features
- Mode selector to switch between translation and conversation modes
- Language selector with support for 31 DeepL languages
- Persistent mode and language preferences (localStorage)
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

### Conversation Mode (In Development)
1. Toggle to "Conversation" mode using the mode selector
2. Select your target language from the language selector
3. Type your message in any language and press Enter or click Submit
4. The AI will respond conversationally, with both the original and translated versions displayed
5. The conversation maintains context for natural, flowing dialogue

**Note**: Conversation mode requires an OpenAI API key to be configured.

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
│   ├── Button/           # Submit button component
│   ├── ChatInput/        # Input field with mode-aware logic
│   ├── Input/            # Base input component
│   ├── LanguageSelector/ # Language selection dropdown
│   ├── MessageBox/       # Individual message display (bilingual support)
│   ├── MessageList/      # Message history container
│   └── ModeSelector/     # Translation/Conversation mode toggle
├── contexts/
│   ├── LanguageContext.tsx  # Language state management
│   └── ModeContext.tsx      # Mode state management
├── hooks/
│   ├── useLanguage.ts    # Hook to access language context
│   └── useMode.ts        # Hook to access mode context
├── lib/
│   └── openai.ts         # OpenAI client configuration
├── pages/
│   ├── api/
│   │   ├── conversation.ts # Conversation API with AI + translation
│   │   └── translate.ts    # DeepL translation endpoint
│   ├── _app.tsx            # App wrapper with providers
│   └── index.tsx           # Main chat page
└── utils/
    ├── events.ts         # Custom event system for messages
    └── languages.ts      # Language codes and utilities
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

### In Progress 🚧
- [ ] ChatInput mode-aware routing
- [ ] Conversation history tracking in component state

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