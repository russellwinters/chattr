const dispatchIncomingEvent = (value: string) => {
  const detail = {
    content: value,
    timestamp: new Date().getTime(),
    incoming: true,
  };

  const event = new CustomEvent("messageIncoming", {
    detail: { payload: detail },
  });

  window.dispatchEvent(event);
};

const dispatchOutgoingEvent = (value: string) => {
  const detail = {
    content: value,
    timestamp: new Date().getTime(),
    incoming: false,
  };

  const event = new CustomEvent("messageOutgoing", {
    detail: { payload: detail },
  });

  window.dispatchEvent(event);
};

export { dispatchIncomingEvent, dispatchOutgoingEvent };
