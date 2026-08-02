# Requirements Document

## Introduction

本功能在使用者透過 AI 對話成功建立訂單後，彈出自訂 modal 彈窗詢問是否將服務預約提醒加入行事曆。使用者可選擇「加入 Google 日曆」（新分頁開啟 Google Calendar URL）、「下載日曆檔案」（產生 .ics 檔觸發瀏覽器下載）、或「不加入」直接關閉彈窗。此為純前端功能，不修改 Lambda 後端。

## Glossary

- **Calendar_Modal**: 自訂行事曆彈窗元件，提供使用者選擇加入行事曆的 UI 介面
- **Chat_Module**: 現有的 AI 聊天模組（chat.js 中的 Chat 物件），負責處理 AI 對話流程
- **Order_Data**: 訂單建立成功後後端回傳的資料物件，包含 feedback_no、intent、collected 等欄位
- **ICS_Generator**: 負責產生符合 RFC 5545 標準的 .ics 日曆檔案內容的模組
- **Google_Calendar_URL_Builder**: 負責組合 Google Calendar 新增事件 URL 的模組
- **Event_Object**: 包含事件標題、描述、地點、開始時間、結束時間的結構化資料物件

## Requirements

### Requirement 1: 觸發行事曆彈窗

**User Story:** As a 住戶, I want 在 AI 對話建單成功後看到行事曆提示, so that 我可以方便地將服務預約加入我的行事曆。

#### Acceptance Criteria

1. WHEN the Chat_Module's `handleSend()` receives a `/ai/chat` response where `result.data.status === 'complete'` AND `result.data.feedback_no` is truthy (representing successful order creation via AI dialogue), THE Chat_Module SHALL display the Calendar_Modal after calling `addOrderConfirmCard()`.
2. THE Calendar_Modal SHALL receive an Event_Object constructed from: `data.service` (服務名稱), `data.feedback_no` (諮詢單號), and the current browser timestamp (`new Date()`) as the base date for time calculation.
3. THE Calendar_Modal SHALL NOT depend on order_time from the API response; it SHALL always use the frontend's `new Date()` at the moment of trigger as the base date.

### Requirement 2: Modal UI 設計

**User Story:** As a 住戶, I want 看到清楚的彈窗介面, so that 我可以快速選擇要如何加入行事曆或不加入。

#### Acceptance Criteria

1. THE Calendar_Modal SHALL display a title text of「加入行事曆提醒」.
2. THE Calendar_Modal SHALL display a description showing the service name and the calculated event date and time.
3. THE Calendar_Modal SHALL display three action buttons:「加入 Google 日曆」,「下載日曆檔案(.ics)」, and「不加入」.
4. THE Calendar_Modal SHALL overlay the page with a semi-transparent backdrop that prevents interaction with elements behind the modal.
5. WHEN the user clicks the backdrop area outside the modal content, THE Calendar_Modal SHALL close without performing any calendar action.
6. THE Calendar_Modal SHALL be centered vertically and horizontally in the viewport on both desktop and mobile screens.

### Requirement 3: 事件時間計算

**User Story:** As a 住戶, I want 行事曆事件預設在訂單建立隔天下午, so that 我能預先收到提醒準備服務到來。

#### Acceptance Criteria

1. THE Event_Object start time SHALL be calculated as the order_time date portion plus 1 calendar day, at 14:00 local time (UTC+8).
2. THE Event_Object end time SHALL be calculated as the order_time date portion plus 1 calendar day, at 15:00 local time (UTC+8).
3. WHEN converting to UTC for calendar URL and ICS output, THE Google_Calendar_URL_Builder and ICS_Generator SHALL represent 14:00 UTC+8 as 06:00Z and 15:00 UTC+8 as 07:00Z.
4. THE Event_Object date strings for Google Calendar SHALL use the format `YYYYMMDDTHHmmssZ` (e.g., `20250202T060000Z`).

### Requirement 4: 事件內容組裝

**User Story:** As a 住戶, I want 行事曆事件包含服務名稱和諮詢單號, so that 我能在行事曆中辨識這個服務提醒。

#### Acceptance Criteria

1. THE Event_Object title SHALL be the value of `data.service` from the AI chat response (e.g.,「清潔」「水電修繕」).
2. THE Event_Object description SHALL be the text:「服務已成立，諮詢單號 {data.feedback_no}，廠商將盡快與您聯繫確認詳細時段」.
3. THE Event_Object location SHALL always be an empty string (at this trigger point, no address data is available from the AI chat response).

### Requirement 5: 加入 Google 日曆

**User Story:** As a 住戶, I want 點擊按鈕就能在 Google 日曆新增事件, so that 我不需要手動輸入任何資訊。

#### Acceptance Criteria

1. WHEN the user clicks the「加入 Google 日曆」button, THE Google_Calendar_URL_Builder SHALL construct a URL in the format: `https://www.google.com/calendar/render?action=TEMPLATE&text={title}&dates={start}/{end}&details={description}&location={location}`.
2. THE Google_Calendar_URL_Builder SHALL encode the title, details, and location parameters using URI encoding.
3. WHEN the Google Calendar URL is constructed, THE Calendar_Modal SHALL open the URL in a new browser tab.
4. WHEN the URL has been opened in a new tab, THE Calendar_Modal SHALL close itself.

### Requirement 6: 下載 ICS 檔案

**User Story:** As a 住戶, I want 下載 .ics 檔案, so that 我可以匯入到 Apple 日曆、Outlook 或其他支援 iCalendar 標準的應用程式。

#### Acceptance Criteria

1. WHEN the user clicks the「下載日曆檔案(.ics)」button, THE ICS_Generator SHALL produce a text content string conforming to RFC 5545 VCALENDAR/VEVENT structure.
2. THE ICS_Generator output SHALL include the following VEVENT properties: DTSTART, DTEND, SUMMARY (title), DESCRIPTION, LOCATION, and a unique UID.
3. THE ICS_Generator SHALL set DTSTART and DTEND values using the UTC format `YYYYMMDDTHHmmssZ`.
4. WHEN the ICS content is generated, THE Calendar_Modal SHALL trigger a browser file download with filename format `{service_name}-reminder.ics`.
5. WHEN the file download has been triggered, THE Calendar_Modal SHALL close itself.
6. FOR ALL valid Event_Object inputs, parsing the generated ICS content then extracting DTSTART, DTEND, SUMMARY, DESCRIPTION, and LOCATION SHALL produce values equivalent to the original Event_Object (round-trip property).

### Requirement 7: 不加入行事曆

**User Story:** As a 住戶, I want 可以選擇不加入行事曆, so that 我不會被強制執行非必要的操作。

#### Acceptance Criteria

1. WHEN the user clicks the「不加入」button, THE Calendar_Modal SHALL close immediately.
2. WHEN the Calendar_Modal is closed via the「不加入」button, THE Chat_Module SHALL not modify the existing order or conversation state.
3. WHEN the Calendar_Modal is closed via the「不加入」button, THE Chat_Module SHALL allow the user to continue the conversation normally.

### Requirement 8: 元件可重用性

**User Story:** As a 開發者, I want 彈窗元件是通用可重用的, so that 未來其他功能可以直接使用相同的 modal 元件。

#### Acceptance Criteria

1. THE Calendar_Modal SHALL be implemented as an independent module that accepts an Event_Object configuration parameter.
2. THE Calendar_Modal SHALL not depend on Chat_Module internal state or DOM structure.
3. THE Calendar_Modal SHALL expose a public function that accepts an Event_Object and displays the modal (e.g., `CalendarModal.show(eventObject)`).
4. THE Calendar_Modal SHALL handle its own DOM creation, event binding, and cleanup when closed.
