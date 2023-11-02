import cx from "classnames";
import { FC } from "react";
import { MessageBox } from "../MessageBox";
import styles from "./MessageList.module.scss";
import { useEffect, useState } from "react";
type Props = {
  classNames?: string;
};

type Message = {
  content: string;
  timestamp: number;
  incoming: boolean;
};

const MessageList: FC<Props> = ({ classNames }) => {
  const [messages, setMessages] = useState<Message[]>([
    { content: "Message in Ensligh here.", timestamp: 1, incoming: false },
    {
      content: "And you'll get a spanish translation here.",
      timestamp: 2,
      incoming: true,
    },
  ]);

  useEffect(() => {
    const messageReceiver = (e) => {
      if (e.detail.payload) {
        setMessages((prev) => [...prev, e.detail.payload]);
      }
    };

    window.addEventListener("messageIncoming", messageReceiver);
    window.addEventListener("messageOutgoing", messageReceiver);

    return () => {
      window.removeEventListener("messageIncoming", messageReceiver);
      window.removeEventListener("messageOutgoing", messageReceiver);
    };
  }, []);

  return (
    <section className={cx(styles.messageList, classNames)}>
      {messages.map((m) => {
        return (
          <MessageBox
            classNames={cx(styles.message, {
              [styles.incoming]: m.incoming,
              [styles.outgoing]: !m.incoming,
            })}
            key={m.timestamp}
            incoming={m.incoming}
          >
            {m.content}
          </MessageBox>
        );
      })}
    </section>
  );
};

export default MessageList;
