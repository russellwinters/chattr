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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslation = async (value: string) => {
    setError(null);
    setIsLoading(true);

    try {
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

      if (response.ok) {
        const data = await response.json();
        if (data?.result?.text) {
          dispatchIncomingEvent(data.result.text);
        } else {
          setError("Translation failed. Please try again.");
        }
      } else {
        setError("Translation failed. Please check your connection and try again.");
      }
    } catch (err) {
      setError("Unable to connect to translation service. Please try again.");
      console.error("Translation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversation = async (value: string) => {
    setError(null);
    setIsLoading(true);

    // Dispatch loading indicator
    window.dispatchEvent(new CustomEvent("conversationLoading", { detail: { isLoading: true } }));

    try {
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

      if (!response.ok) {
        setError("Conversation failed. Please check your connection and try again.");
        return;
      }

      const data = await response.json().catch((err) => {
        console.error("Failed to parse conversation API response:", err);
        return null;
      });

      if (!data) {
        setError("Failed to process conversation response. Please try again.");
        return;
      }

      dispatchOutgoingEvent(value, data.userMessageTranslation);
      dispatchIncomingEvent(data.assistantResponse, data.assistantResponseTranslation);

      setConversationHistory((prev) => {
        const updated: ConversationMessage[] = [
          ...prev,
          { role: "user" as const, content: value },
          { role: "assistant" as const, content: data.assistantResponseTranslation },
        ];
        return updated.slice(-10);
      });
    } catch (err) {
      setError("Unable to connect to conversation service. Please try again.");
      console.error("Conversation error:", err);
    } finally {
      setIsLoading(false);
      window.dispatchEvent(new CustomEvent("conversationLoading", { detail: { isLoading: false } }));
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
      {error && (
        <div className={styles.error} role="alert" aria-live="polite">
          {error}
        </div>
      )}
      <div>
        <Input
          value={value}
          label={isLoading ? "Processing..." : "Type here"}
          onChange={(e) => {
            if (typeof e.target.value === "string") {
              setValue(e.target.value);
            }
          }}
          onKeyDown={(e) => {
            if (e?.key === "Enter" && value && !isLoading) {
              e.preventDefault();
              handleSubmit(value);
              setValue(undefined);
            }
          }}
          classNames={styles.input}
          disabled={isLoading}
          aria-label="Message input"
        />
        <Button
          onClick={() => {
            if (typeof value === "string" && !isLoading) {
              handleSubmit(value);
              setValue(undefined);
            }
          }}
          classNames={styles.button}
          disabled={isLoading}
          aria-label="Submit message"
        >
          {isLoading ? "Sending..." : "Submit"}
        </Button>
      </div>
    </section>
  );
};

export default ChatInput;
