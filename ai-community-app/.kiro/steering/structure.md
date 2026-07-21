# Project Structure - Aî 智慧社區服務平台

## 目錄結構

```
ai-community-app/
├── app/                        # 路由頁面 (Expo Router file-based routing)
│   ├── _layout.tsx             # 根佈局：AuthProvider 包裝 + Stack Navigator
│   ├── +html.tsx               # Web 平台 HTML 模板
│   ├── +not-found.tsx          # 404 頁面
│   ├── modal.tsx               # 全域 Modal 頁面
│   ├── auth/
│   │   └── login.tsx           # 登入頁：uniopen 一鍵授權登入
│   └── (tabs)/                 # Tab 導覽群組
│       ├── _layout.tsx         # Tab 佈局：底部導覽列設定
│       ├── index.tsx           # Tab One：AI 智慧管家主畫面（聊天 + 服務快捷）
│       └── two.tsx             # Tab Two：預留功能頁
├── components/                 # 共用元件
│   ├── EditScreenInfo.tsx      # 開發資訊展示元件
│   ├── ExternalLink.tsx        # 外部連結元件
│   ├── StyledText.tsx          # 自訂文字樣式元件
│   ├── Themed.tsx              # 主題感知的 View/Text 元件
│   ├── useClientOnlyValue.ts   # Client-only 值 Hook (native)
│   ├── useClientOnlyValue.web.ts # Client-only 值 Hook (web)
│   ├── useColorScheme.ts       # 色彩模式 Hook (native)
│   └── useColorScheme.web.ts   # 色彩模式 Hook (web)
├── constants/
│   └── Colors.ts               # 色彩常數（light/dark 主題色）
├── context/
│   └── AuthContext.tsx          # 認證 Context：login/logout + User 狀態
├── assets/
│   ├── fonts/
│   │   └── SpaceMono-Regular.ttf
│   └── images/                 # App 圖示、啟動畫面等
├── app.json                    # Expo 應用程式配置
├── package.json                # 依賴與腳本
├── tsconfig.json               # TypeScript 設定
└── expo-env.d.ts               # Expo 型別宣告
```

## 關鍵檔案說明

### 路由層 (`app/`)
| 檔案 | 職責 |
|------|------|
| `_layout.tsx` | 全域：載入字型、Splash Screen、AuthProvider、根據認證狀態導向 |
| `auth/login.tsx` | 登入畫面：品牌展示 + uniopen OAuth 按鈕 |
| `(tabs)/index.tsx` | 主畫面：AI 對話、服務快捷按鈕、點數顯示 |
| `(tabs)/two.tsx` | 預留第二 Tab（目前為範例內容） |
| `(tabs)/_layout.tsx` | Tab 導覽配置：圖示、標題、Header 右側按鈕 |

### 元件層 (`components/`)
- `Themed.tsx`：封裝 `View` 和 `Text`，自動套用 light/dark 主題色
- `useColorScheme`：平台差異化的色彩模式偵測（native vs web）
- `useClientOnlyValue`：SSR hydration 安全的條件值

### 狀態層 (`context/`)
- `AuthContext.tsx`：提供 `user`, `isAuthenticated`, `login()`, `logout()`
- User 介面：`{ inbr_account_id, name, phone, email }`

### 設定層
- `constants/Colors.ts`：主題色定義（tint、background、text、tabIcon）
- `app.json`：Expo 配置（scheme, plugins, typed routes）

## 資料檔案（專案根目錄，非 App 內）

```
hack_game/
├── mms_order_record.sql          # 訂單紀錄表 DDL
├── order_record範例資料.json      # 訂單範例資料
├── order_record範例資料.csv       # 訂單範例資料 (CSV)
├── 相關主檔設定.json              # 服務商 + 服務項目設定
├── 縣市區域檔.sql                 # 縣市/行政區 DDL
├── 縣市區域範例資料.json          # 台灣縣市區域資料
├── 諮詢單相關table.sql            # 表單系統 DDL (pms_form, topic, option, feedback)
├── 諮詢單相關範例資料.json        # 表單系統範例資料
├── README.pdf                     # 專案說明
└── 統一資訊-黑客松企業數據工作坊簡報.pdf
```

## 新增功能建議位置

| 需求 | 建議位置 |
|------|----------|
| 新頁面 | `app/` 下新增 .tsx 檔案（自動產生路由） |
| 新 Tab 頁 | `app/(tabs)/` 下新增 + 在 `_layout.tsx` 註冊 |
| 共用 UI 元件 | `components/` |
| 全域狀態 | `context/` 新增 Context Provider |
| API 串接 | 建議新增 `services/` 或 `api/` 目錄 |
| 型別定義 | 建議新增 `types/` 目錄 |
| 工具函式 | 建議新增 `utils/` 目錄 |
| 常數/設定 | `constants/` |
