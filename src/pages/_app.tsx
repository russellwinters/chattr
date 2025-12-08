import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ModeProvider } from '@/contexts/ModeContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ModeProvider>
      <LanguageProvider>
        <Component {...pageProps} />
      </LanguageProvider>
    </ModeProvider>
  )
}
