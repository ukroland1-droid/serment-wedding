"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";

const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: "1",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "您好，我是誓約的 AI 婚禮策劃管家。請問您打算什麼時候、在哪座城市舉辦婚禮？",
      },
    ],
  },
];

function getMessageText(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

export default function ChatUI() {
  const { messages, sendMessage, status, regenerate } = useChat({
    messages: INITIAL_MESSAGES,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [inputValue, setInputValue] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const isBusy = status === "submitted" || status === "streaming";
  const lastMessage = messages[messages.length - 1];
  const isThinking =
    status === "submitted" ||
    (status === "streaming" &&
      lastMessage?.role === "assistant" &&
      getMessageText(lastMessage) === "");

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const handleSend = (raw: string) => {
    const text = raw.trim();
    if (!text || isBusy) return;
    setInputValue("");
    sendMessage({ text });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <header className="flex items-center gap-3 border-b border-brand-gold/30 bg-brand-dark px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-gold">
          <span className="font-serif text-xl leading-none text-brand-gold">S</span>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-base font-semibold tracking-wide text-white">
            誓約 SERMENT
          </h1>
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold/90">
            AI Wedding Concierge
          </p>
        </div>
        <span className="rounded-full border border-brand-gold px-2.5 py-0.5 text-[10px] font-medium tracking-[0.2em] text-brand-gold">
          DEMO
        </span>
      </header>

      <div
        ref={listRef}
        className="flex-1 space-y-4 overflow-y-auto bg-brand-bg px-4 py-4"
      >
        {messages.map((message) => {
          const text = getMessageText(message);
          if (!text) return null;

          return message.role === "user" ? (
            <div key={message.id} className="flex justify-end">
              <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-brand-dark px-4 py-2.5 text-sm leading-relaxed text-brand-bg">
                {text}
              </div>
            </div>
          ) : (
            <div key={message.id} className="flex justify-start">
              <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-stone-200/80 bg-white px-4 py-2.5 text-sm leading-relaxed text-brand-text shadow-sm">
                {text}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm border border-stone-200/80 bg-white px-4 py-2.5 text-sm text-stone-400 shadow-sm">
              AI 正在思考中...
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-start gap-2">
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              抱歉，系統暫時無法回應，請稍後再試。
            </div>
            <button
              type="button"
              onClick={() => regenerate()}
              className="rounded-full border border-brand-gold bg-white px-3.5 py-1.5 text-xs text-brand-dark transition-colors hover:bg-brand-gold"
            >
              重試
            </button>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputValue);
        }}
        className="flex items-center gap-2 border-t border-stone-200 bg-white px-3 py-3"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="輸入訊息，例如：2027年1月·三亞"
          className="min-w-0 flex-1 rounded-full border border-stone-300 bg-brand-bg px-4 py-2 text-sm text-brand-text placeholder:text-stone-400 focus:border-brand-gold focus:outline-none"
        />
        <button
          type="submit"
          aria-label="送出訊息"
          disabled={isBusy}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-dark text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
