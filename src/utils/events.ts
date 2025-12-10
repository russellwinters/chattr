const dispatchIncomingEvent = (value: string, translation?: string) => {
  const detail = {
    content: value,
    timestamp: new Date().getTime(),
    incoming: true,
    translation,
  };

  const event = new CustomEvent("messageIncoming", {
    detail: { payload: detail },
  });

  window.dispatchEvent(event);
};

const dispatchOutgoingEvent = (value: string, translation?: string) => {
  const detail = {
    content: value,
    timestamp: new Date().getTime(),
    incoming: false,
    translation,
  };

  const event = new CustomEvent("messageOutgoing", {
    detail: { payload: detail },
  });

  window.dispatchEvent(event);
};

export { dispatchIncomingEvent, dispatchOutgoingEvent };
