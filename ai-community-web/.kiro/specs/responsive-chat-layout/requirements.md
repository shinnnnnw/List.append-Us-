# Requirements Document

## Introduction

修正首頁（index.html）登入後主控台畫面的版面問題：AI 對話區域被快捷服務按鈕推出可視範圍、整體寬度限制在 480px 導致桌面體驗差、缺乏響應式設計。目標是讓使用者在任何裝置上不需捲動即可看到 AI 對話區域，並根據裝置大小自適應寬度。

## Glossary

- **Dashboard**: 首頁登入後的主控台畫面（view-dashboard），包含快捷服務格子與 AI 聊天區域
- **Service_Grid**: 快捷服務按鈕區域（.service-grid），以格狀排列顯示常用服務入口
- **Chat_Section**: AI 聊天區域（.chat-section），包含聊天訊息容器與輸入列
- **Page_Wrapper**: 頁面最外層容器（.page-wrapper），控制整體最大寬度
- **Viewport**: 使用者裝置的可視區域高度與寬度
- **Breakpoint**: CSS media query 中用於區分裝置尺寸的螢幕寬度閾值

## Requirements

### Requirement 1

**User Story:** 身為住戶，我希望登入後不需要捲動頁面就能看到 AI 對話區域，以便即時與 AI 管家互動。

#### Acceptance Criteria

1. WHEN the Dashboard loads on any device, THE Chat_Section SHALL be visible within the Viewport without scrolling
2. WHILE the Dashboard is displayed, THE Service_Grid and Chat_Section SHALL both fit within the Viewport height between the header and the bottom navigation
3. IF the Viewport height is less than 500px, THEN THE Chat_Section SHALL maintain a minimum height of 200px and allow the Service_Grid to scroll within its own container

### Requirement 2

**User Story:** 身為住戶，我希望版面能根據我使用的裝置自動調整寬度，讓我在手機、平板或桌面都能有舒適的閱讀體驗。

#### Acceptance Criteria

1. WHILE the Viewport width is less than 576px, THE Page_Wrapper SHALL use a maximum width of 480px
2. WHILE the Viewport width is between 576px and 1024px, THE Page_Wrapper SHALL use a maximum width of 768px
3. WHILE the Viewport width is greater than 1024px, THE Page_Wrapper SHALL use a maximum width of 960px
4. WHEN the Viewport width changes (e.g., device rotation or browser resize), THE Page_Wrapper SHALL adjust its maximum width to match the appropriate Breakpoint without page reload

### Requirement 3

**User Story:** 身為住戶，我希望在大螢幕桌面上快捷服務和對話區域能更好地利用空間，不會有大量留白。

#### Acceptance Criteria

1. WHILE the Viewport width is greater than 1024px, THE Dashboard SHALL display the Service_Grid and Chat_Section in a side-by-side layout with the Service_Grid on the left and Chat_Section on the right
2. WHILE the Viewport width is 1024px or less, THE Dashboard SHALL display the Service_Grid above the Chat_Section in a vertical stack layout
3. WHILE in side-by-side layout, THE Service_Grid SHALL occupy no more than 35% of the content width and THE Chat_Section SHALL occupy the remaining width

### Requirement 4

**User Story:** 身為住戶，我希望在手機上快捷服務區域不會佔據太多螢幕空間，讓我能快速看到對話區域。

#### Acceptance Criteria

1. WHILE the Viewport width is less than 576px, THE Service_Grid SHALL limit its maximum height to 30% of the available content height
2. WHILE the Service_Grid content exceeds its maximum height, THE Service_Grid SHALL become scrollable within its own container
3. THE Chat_Section SHALL use the remaining available height after the header, Service_Grid, and bottom navigation are accounted for
