"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: number;
  role: "user" | "ai";
  content: string;
  options?: string[];
};

type AiReply = {
  content: string;
  options?: string[];
  nextStep: number;
};

const INITIAL_MESSAGE: ChatMessage = {
  id: 1,
  role: "ai",
  content: "您好，我是誓約的 AI 婚禮策劃管家。請問您打算什麼時候、在哪座城市舉辦婚禮？",
  options: ["2027年1月·三亞", "2026年11月·海口", "還沒定，先看看"],
};

const STEP_1_ASK = "記下了。那麼您更往哪一種婚禮形式？";
const STEP_1_OPTIONS = ["濱海草坪", "酒店宴會廳", "目的地海島", "藝術空間"];

const STEP_2_ASK = "很好。最後兩個問題：大概邀請多少位賓客，整體預算希望在什麼範圍？";
const STEP_2_OPTIONS = ["80人內·15-20萬", "150人左右·30萬", "300人·60萬以上", "你幫我搭配"];

const CONFIRM_OPTIONS = ["確認，開始調配資源", "想再調整一下"];
const STEP_4_MESSAGE = "信息齊了。我現在進入後台為您調配資源...";
const ADJUST_ASK = "好的，請直接告訴我您想調整的地方，我再為您重新整理一次。";
const POST_DONE_NOTE = "收到，已為您記下。調配過程中若有需要，我會再向您確認。";

const THINKING_DELAY_MS = 500;

function summarize(answers: string[]) {
  const items = answers.map((answer) => answer.replace(/·/g, "，"));
  return `為您確認一下：${items.join("，")}。確認無誤的話，我就開始調配資源了。`;
}

export default function ChatUI() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const idRef = useRef(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSend = (raw: string) => {
    const text = raw.trim();
    if (!text || isThinking) return;

    const step = currentStep;
    let collected = answers;
    let reply: AiReply;

    if (step === 0) {
      collected = [...answers, text];
      reply = { content: STEP_1_ASK, options: STEP_1_OPTIONS, nextStep: 1 };
    } else if (step === 1) {
      collected = [...answers, text];
      reply = { content: STEP_2_ASK, options: STEP_2_OPTIONS, nextStep: 2 };
    } else if (step === 2) {
      collected = [...answers, text];
      reply = {
        content: summarize(collected),
        options: CONFIRM_OPTIONS,
        nextStep: 3,
      };
    } else if (step === 3) {
      if (text === CONFIRM_OPTIONS[0]) {
        reply = { content: STEP_4_MESSAGE, nextStep: 4 };
      } else if (text === CONFIRM_OPTIONS[1]) {
        reply = { content: ADJUST_ASK, nextStep: 3 };
      } else {
        collected = [...answers, text];
        reply = {
          content: summarize(collected),
          options: CONFIRM_OPTIONS,
          nextStep: 3,
        };
      }
    } else {
      reply = { content: POST_DONE_NOTE, nextStep: 4 };
    }

    setAnswers(collected);
    setInputValue("");
    setMessages((prev) => [
      ...prev,
      { id: ++idRef.current, role: "user", content: text },
    ]);
    setIsThinking(true);

    timerRef.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: ++idRef.current,
          role: "ai",
          content: reply.content,
          options: reply.options,
        },
      ]);
      setCurrentStep(reply.nextStep);
      setIsThinking(false);
    }, THINKING_DELAY_MS);
  };

  const lastMessage = messages[messages.length - 1];

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
        {messages.map((message) =>
          message.role === "user" ? (
            <div key={message.id} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-dark px-4 py-2.5 text-sm leading-relaxed text-brand-bg">
                {message.content}
              </div>
            </div>
          ) : (
            <div key={message.id} className="flex justify-start">
              <div>
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-stone-200/80 bg-white px-4 py-2.5 text-sm leading-relaxed text-brand-text shadow-sm">
                  {message.content}
                </div>
                {message.options && message.id === lastMessage.id && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSend(option)}
                        className="rounded-full border border-brand-gold bg-white px-3.5 py-1.5 text-xs text-brand-dark transition-colors hover:bg-brand-gold"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ),
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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-dark text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-dark"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
