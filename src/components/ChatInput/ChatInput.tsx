import { dispatchIncomingEvent, dispatchOutgoingEvent } from "@/utils/events";
import { FC, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useMode } from "@/hooks/useMode";
import { ConversationMessage } from "@/lib/openai";
import Button from "../Button";
import Input from "../Input";
import styles from "./ChatInput.module.scss";

const ChatInput: FC = () => {
  const [value, setValue] = useState<string | undefined>();
  const { targetLanguage } = useLanguage();
  const { mode } = useMode();
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);

  const handleTranslation = async (value: string) => {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: value,
        targetLanguage,
      }),
    });

    try {
      if (response.ok) {
        const data = await response.json();
        if (data?.result?.text) {
          dispatchIncomingEvent(data.result.text);
        }
      } else {
        console.log("There was an error with the response type");
      }
    } catch (err) {
      console.log("The API call failed");
    }
  };

  const handleConversation = async (value: string) => {
    const response = await fetch("/api/conversation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userMessage: value,
        targetLanguage,
        conversationHistory,
      }),
    });

    try {
      if (response.ok) {
        const data = await response.json();
        
        // Dispatch user message with translation
        dispatchOutgoingEvent(value, data.userMessageTranslation);
        
        // Dispatch AI response with translation
        dispatchIncomingEvent(data.assistantResponse, data.assistantResponseTranslation);
        
        // Update conversation history (keep last 10 messages)
        setConversationHistory((prev) => {
          const updated: ConversationMessage[] = [
            ...prev,
            { role: "user" as const, content: value },
            { role: "assistant" as const, content: data.assistantResponseTranslation },
          ];
          // Keep only the last 10 messages
          return updated.slice(-10);
        });
      } else {
        console.log("There was an error with the conversation response");
      }
    } catch (err) {
      console.log("The conversation API call failed");
    }
  };

  const handleSubmit = async (value: string) => {
    if (mode === "conversation") {
      await handleConversation(value);
    } else {
      dispatchOutgoingEvent(value);
      await handleTranslation(value);
    }
  };

  return (
    <section className={styles.container}>
      <Input
        value={value}
        label="Type here"
        onChange={(e) => {
          if (typeof e.target.value === "string") {
            setValue(e.target.value);
          }
        }}
        onKeyDown={(e) => {
          if (e?.key === "Enter" && value) {
            e.preventDefault();
            handleSubmit(value);
            setValue(undefined);
          }
        }}
        classNames={styles.input}
      />
      <Button
        onClick={() => {
          if (typeof value === "string") {
            handleSubmit(value);
            setValue(undefined);
          }
        }}
        classNames={styles.button}
      >
        Submit
      </Button>
    </section>
  );
};

export default ChatInput;
