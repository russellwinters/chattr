import ChatInput from "@/components/ChatInput";
import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import MessageList from "@/components/MessageList";
import styles from "@/styles/Home.module.css";
import customSyles from "@/styles/Home.module.scss";
import { CharacterSelector, LanguageSelector, ModeSelector } from "@/components";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>Chattr - Language Learning & Translation</title>
        <meta name="description" content="Real-time translation and AI-powered conversation for language learning" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={customSyles.main}>
        <section className={customSyles.selectors} aria-label="Mode and language selection">
          <ModeSelector />
          <LanguageSelector />
          <CharacterSelector />
        </section>
        <MessageList classNames={customSyles.messageList} />
        <ChatInput />
      </main>
    </>
  );
}
