import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 這裡是我們自定義的「誓約」品牌顏色
        'brand-dark': '#2C1810',   // 深棕色 (用戶氣泡、主按鈕)
        'brand-gold': '#D4AF37',   // 金色 (高亮、邊框、Logo)
        'brand-bg': '#FAFAF9',     // 淺米色 (AI 氣泡背景)
        'brand-text': '#1C1917',   // 深灰色 (主要文字)
      },
      fontFamily: {
        // 可選：添加優雅的襯線字體，讓婚禮感更強
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;