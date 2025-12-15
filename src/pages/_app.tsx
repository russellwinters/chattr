import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ModeProvider } from '@/contexts/ModeContext'
import { CharacterProvider } from '@/contexts/CharacterContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ModeProvider>
      <LanguageProvider>
        <CharacterProvider>
          <Component {...pageProps} />
        </CharacterProvider>
      </LanguageProvider>
    </ModeProvider>
  )
}
