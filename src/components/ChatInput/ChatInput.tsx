import {
  dispatchIncomingEvent,
  dispatchOutgoingEvent,
} from "../../../utils/events.ts";
import { FC, useState } from "react";
import Button from "../Button";
import Input from "../Input";
import styles from "./ChatInput.module.scss";

const ChatInput: FC = () => {
  const [value, setValue] = useState<string | undefined>();

  const handleTranslation = async (value: string) => {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: value,
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
          if (e?.key === "Enter") {
            event.preventDefault();
            handleTranslation(value);
            dispatchOutgoingEvent(value);
            setValue(undefined);
          }
        }}
        classNames={styles.input}
      />
      <Button
        onClick={() => {
          if (typeof value === "string") {
            handleTranslation(value);
            dispatchOutgoingEvent(value);
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
