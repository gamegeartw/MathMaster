# 數學大師五年級 (Math Master Grade 5)

> 本專案使用 [Gemini AI Studio](https://aistudio.google.com/) 開發。

專為國小五年級學生設計的趣味數學練習 App，旨在透過互動式練習與即時回饋，提升學生的計算能力與學習興趣。

## ✨ App 特色

- **四大練習模式**：提供加法、減法、估商練習，以及綜合挑戰模式。
- **🤖 AI 小老師**：整合 Google Gemini API，當學生遇到難題時，可以呼叫 AI 老師提供即時、易懂的提示。
- **🏆 榮譽排行榜**：練習結果會記錄在排行榜上，支援 Firebase 雲端儲存（並具備 LocalStorage 本地儲存備援機制），增加學習的動力與趣味性。
- **📱 行動裝置優先**：簡潔清晰的介面，專為觸控操作優化，在手機和平板上都有良好的使用者體驗。
- **🔧 高度可維護性**：採用現代化的前端開發實踐，如元件化、狀態管理、國際化等，使程式碼易於維護與擴充。

---

## 🎨 設計理念

本專案在開發過程中遵循以下核心設計理念：

### 🎯 專注於使用者體驗 (User-Centric Design)

- **簡潔直觀**：介面設計力求簡單，避免不必要的干擾，讓孩子能專注於數學題目本身。
- **即時回饋**：答對時給予正面鼓勵，答錯時提供具體的訂正提示，幫助學生從錯誤中學習。
- **趣味互動**：透過計分、計時與排行榜機制，將遊戲元素融入學習過程，提升學生的參與感。

### 🧱 現代化的元件架構 (Component-Driven Architecture)

- **關注點分離 (Separation of Concerns)**：將應用程式切分為多個獨立、可複用的元件（Components）。每個元件都有明確的職責，例如 `MenuComponent` 負責主選單，`GameComponent` 負責遊戲介面。
- **智慧容器 vs. 展示元件**：`AppComponent` 作為核心的「智慧容器 (Smart Container)」，負責管理整個 App 的狀態（State）和核心商業邏輯。而 `components/` 目錄下的元件則為「展示元件 (Presentational Components)」，它們只負責接收資料並呈現 UI，大幅降低了程式碼的複雜度。

### 🚀 追求高效能與可維護性 (Performant & Maintainable)

- **響應式狀態管理**：全面採用 Angular Signals 進行狀態管理，程式碼更簡潔，且能實現高效能的變更偵測。
- **型別安全**：使用 TypeScript 與 `enum` 來管理 App 的各種模式與狀態，消除了「魔法字串 (Magic Strings)」，提升了程式碼的健壯性。
- **國際化 (i18n)**：將所有 UI 文字抽離至獨立的字典檔 (`zh-TW.ts`)，並透過 `I18nService` 進行管理。這樣的設計讓未來新增其他語言版本變得非常容易。

---

## 📂 程式架構

專案遵循標準的 Angular 應用程式結構，將不同職責的程式碼分門別類。

```
.
├── src
│   ├── app.component.html      # 主元件模板 (負責根據 App 模式切換顯示的子元件)
│   ├── app.component.ts        # 主元件 (核心狀態與邏輯管理中心)
│   ├── app.types.ts            # 全域型別定義 (存放 AppMode, MathMode 等 Enums)
│   │
│   ├── components/             # UI 展示元件 (Dumb/Presentational Components)
│   │   ├── menu/               # 主選單元件
│   │   ├── game/               # 遊戲介面元件
│   │   ├── summary/            # 分數總結元件
│   │   ├── leaderboard/        # 排行榜元件
│   │   └── divisor-select/     # 估商除數選擇元件
│   │
│   ├── services/               # 核心邏輯服務 (Singleton Services)
│   │   ├── math.service.ts     # 負責生成數學題目與答案
│   │   ├── ai-tutor.service.ts # 負責與 Google Gemini API 溝通，獲取 AI 提示
│   │   ├── i18n.service.ts     # 提供國際化 (i18n) 文字翻譯功能
│   │   └── leaderboard.service.ts # 處理排行榜分數的新增與讀取
│   │
│   └── i18n/                   # 語言字典檔
│       └── zh-TW.ts            # 繁體中文的 UI 文字庫
│
├── index.html                  # 應用程式主入口 HTML 檔案
├── index.tsx                   # 應用程式啟動腳本 (Angular Bootstrap)
└── metadata.json               # 應用程式元數據
```

---

## 📜 License

This project is licensed under the MIT License.
