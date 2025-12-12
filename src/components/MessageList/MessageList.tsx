import cx from "classnames";
import { FC } from "react";
import MessageBox from "../MessageBox";
import styles from "./MessageList.module.scss";
import { useEffect, useState } from "react";
import { useMode } from "@/hooks/useMode";

type Props = {
  classNames?: string;
};

type Message = {
  content: string;
  timestamp: number;
  incoming: boolean;
  translation?: string;
};

const MESSAGES_DEFAULT: Message[] = [
  { content: "Message in English here.", timestamp: 1, incoming: false },
  {
    content: `And you'll get a response here.`,
    timestamp: 2,
    incoming: true,
  },
];

const MessageList: FC<Props> = ({ classNames }) => {
  const { mode } = useMode();
  const [messages, setMessages] = useState<Message[]>(MESSAGES_DEFAULT);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const messageReceiver = (e: any) => {
      if (e.detail.payload) {
        setMessages((prev) => [...prev, e.detail.payload]);
      }
    };

    const loadingHandler = (e: any) => {
      if (e.detail?.isLoading !== undefined) {
        setIsLoading(e.detail.isLoading);
      }
    };

    window.addEventListener("messageIncoming", messageReceiver);
    window.addEventListener("messageOutgoing", messageReceiver);
    window.addEventListener("conversationLoading", loadingHandler);

    return () => {
      window.removeEventListener("messageIncoming", messageReceiver);
      window.removeEventListener("messageOutgoing", messageReceiver);
      window.removeEventListener("conversationLoading", loadingHandler);
    };
  }, []);

  useEffect(() => {
    setMessages(MESSAGES_DEFAULT);
  }, [mode])

  return (
    <section className={cx(styles.messageList, classNames)} aria-live="polite" aria-label="Message history">
      {messages.map((m) => {
        return (
          <MessageBox
            classNames={cx(styles.message, {
              [styles.incoming]: m.incoming,
              [styles.outgoing]: !m.incoming,
            })}
            key={m.timestamp}
            incoming={m.incoming}
            translation={mode === "conversation" ? m.translation : undefined}
          >
            {m.content}
          </MessageBox>
        );
      })}
      {isLoading && mode === "conversation" && (
        <div className={cx(styles.message, styles.incoming, styles.loadingIndicator)}>
          <span className={styles.loadingText}>AI is typing</span>
          <span className={styles.loadingDots}>
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      )}
    </section>
  );
};

export default MessageList;
