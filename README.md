# Chattr

A real-time translation chat application that translates English text to Spanish using the DeepL API.

## Features

- Chat-style interface for text translation
- Real-time English to Spanish translation via DeepL
- Message history with incoming/outgoing message display
- Simple, clean UI built with React and SASS

## Prerequisites

- Node.js 20.x or higher
- DeepL API key ([get one here](https://www.deepl.com/pro-api))

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your DeepL API key:
   ```
   DEEPL_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

Type your English text in the input field and press Enter or click Submit. The app will display your message and return a Spanish translation.

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: SASS with CSS Modules
- **Translation**: DeepL Node SDK
- **UI**: React 18

## Project Structure

```
src/
├── components/
│   ├── Button/           # Submit button component
│   ├── ChatInput/        # Input field with translation logic
│   ├── Input/            # Base input component
│   ├── MessageBox/       # Individual message display
│   └── MessageList/      # Message history container
├── pages/
│   ├── api/
│   │   └── translate.ts  # DeepL translation endpoint
│   └── index.tsx         # Main chat page
└── utils/
    └── events.ts         # Custom event system for messages
```

## MVP Roadmap

- [ ] Multi-language support with language selector
- [ ] Bidirectional translation
- [ ] Translation history persistence
- [ ] User preferences and settings

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint