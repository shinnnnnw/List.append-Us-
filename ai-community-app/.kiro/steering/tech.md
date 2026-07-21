# Tech Stack - Aî 智慧社區服務平台

## 框架與核心依賴

| 技術 | 版本 | 用途 |
|------|------|------|
| React | 19.2.3 | UI 框架 |
| React Native | 0.86.0 | 跨平台行動裝置 |
| Expo | ~57.0.4 | 開發工具鏈與服務 |
| Expo Router | ~57.0.4 | 檔案系統路由 (file-based routing) |
| TypeScript | ~6.0.3 | 型別安全 |

## 重要套件

- `expo-font` - 自訂字型載入 (SpaceMono)
- `expo-splash-screen` - 啟動畫面管理
- `expo-symbols` - 跨平台圖示 (SF Symbols / Material)
- `react-native-reanimated` - 動畫引擎
- `react-native-safe-area-context` - 安全區域適配
- `react-native-screens` - 原生螢幕容器
- `react-native-web` - Web 平台支援

## 開發設定

### TypeScript 配置
- 繼承 `expo/tsconfig.base`
- 啟用 `strict` 模式
- 路徑別名：`@/*` 對應專案根目錄

### 建構與執行
```bash
npm start          # 啟動 Expo 開發伺服器
npm run android    # Android 模擬器
npm run ios        # iOS 模擬器
npm run web        # 瀏覽器 (metro bundler + static output)
```

### Expo 配置重點
- `scheme`: "aicommunityapp" (deep linking)
- `web.output`: "static" (靜態產出)
- `experiments.typedRoutes`: true (型別安全路由)
- `userInterfaceStyle`: "automatic" (跟隨系統暗色/亮色模式)

## 架構模式

### 路由系統 (Expo Router - File-based)
- 使用檔案目錄結構定義路由
- `(tabs)` 群組實現 Tab 導覽
- Stack Navigator 管理全域導覽（登入、Modal）
- 根據認證狀態自動重導向

### 狀態管理
- React Context + useState（目前規模簡單，無需 Redux）
- `AuthContext` 管理全域認證狀態
- 元件內局部狀態管理對話訊息

### 主題系統
- 支援 Light / Dark 模式自動切換
- 使用 `useColorScheme` Hook 偵測系統設定
- `ThemeProvider` 包裝 React Navigation 主題

### 資料層（後端，非本 App 直接管理）
- PostgreSQL 資料庫
- 敏感欄位 AES-256 GCM 加密
- JSONB 儲存彈性結構資料（order_items, vendor_data, feedback_content）
- UUID v7 作為主要識別碼格式

## 編碼規範

- 元件使用 PascalCase 命名
- 檔案名稱使用 camelCase（元件除外，元件用 PascalCase）
- 使用 `interface` 定義型別（非 `type` alias）
- StyleSheet.create 集中管理樣式
- 中文 UI 文字直接寫在 JSX 中（非 i18n）
- 文件路徑引用使用 `@/` 別名

## 注意事項

- Expo SDK 57 有重大變更，寫程式碼前請參考 https://docs.expo.dev/versions/v57.0.0/
- 本專案為黑客松 MVP，部分功能使用 `alert()` 模擬（非最終實作）
- 尚未整合真實 API，登入與 AI 回覆目前為前端模擬
