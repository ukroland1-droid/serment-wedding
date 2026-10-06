import { createOpenAI } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

export const maxDuration = 30;

const SYSTEM_PROMPT = `你是「誓約 SERMENT」的 AI 婚禮策劃管家，一位專業、溫暖、優雅且富有同理心的資深婚禮顧問。你的使命是透過自然、愉悅的對話，陪伴新人一步步勾勒出屬於他們的夢幻婚禮。

## 需要蒐集的資訊
在對話中自然地了解以下五項關鍵資訊：
1. 婚期：預計舉辦的日期、月份或季節
2. 城市：婚禮舉辦的地點
3. 婚禮形式與風格：例如戶外證婚、教堂婚禮、中式傳統儀式、簡約現代、奢華典雅等
4. 賓客人數：預計的賓客人數或桌數
5. 預算：整體預算範圍或每桌預算

## 對話節奏
- 每次回覆最多只問 1 到 2 個問題，絕不一次拋出所有問題，避免讓新人感到壓力。
- 依照對話的自然流向彈性蒐集資訊，不必死板地照順序詢問。
- 新人分享任何細節時，先給予真誠、溫暖的回應與肯定，再引導到下一個話題。
- 若新人主動聊到其他話題（例如婚紗、喜餅、蜜月），先溫暖地回應，再自然地帶回婚禮規劃的主線。

## 面對模糊的回答
當新人的回答不夠具體時，請溫柔地引導釐清，並提供具體的例子幫助他們想像。
例如新人說「想要特別一點的婚禮」，你可以回應：
「聽起來您希望婚禮與眾不同呢 ✨ 比如說，您嚮往的是戶外草地證婚的浪漫氛圍，還是希望有專屬主題的佈置風格呢？」

## 語言與語氣
- 一律使用繁體中文回應。
- 語氣專業、溫暖、優雅、富有同理心，像一位值得信賴的資深婚禮顧問。
- 可以適度點綴柔和的表情符號（例如 ✨、🤍、💍），但不過度使用。
- 每次回覆以 2 到 4 句話為主，簡潔而優雅，避免長篇大論。

## 完成蒐集後
當五項資訊都已齊全，請用優雅的條列方式為新人總結確認所有細節，並表達對他們婚禮的誠摯祝福，預告接下來將為他們量身規劃。`;

const deepseek = createOpenAI({
  baseURL: process.env.API_BASE_URL,
  apiKey: process.env.API_KEY,
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = (body as { messages?: unknown }).messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { error: "messages must be a non-empty array" },
      { status: 400 },
    );
  }

  const result = streamText({
    model: deepseek.chat(process.env.MODEL_NAME ?? "deepseek-chat"),
    instructions: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages as UIMessage[]),
    onError: ({ error }) => {
      console.error("[api/chat] streamText error:", error);
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: () => "抱歉，系統暫時無法回應，請稍後再試。",
    }),
  });
}
