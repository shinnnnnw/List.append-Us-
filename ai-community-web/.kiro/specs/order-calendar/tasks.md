# Implementation Plan: Order Calendar Modal

## Overview

實作純前端行事曆提醒模組，在 AI 聊天建單成功後彈出 Modal，讓住戶選擇加入 Google 日曆、下載 .ics 檔案、或不加入。模組為獨立元件 `CalendarModal`，不涉及後端修改。

## Tasks

- [ ] 1. Create CalendarModal module core logic
  - [ ] 1.1 Create `js/calendar-modal.js` with CalendarModal object
    - Implement `calcEventTime(baseDate)` — compute start (baseDate+1 day 14:00 UTC+8 = 06:00Z) and end (07:00Z)
    - Implement `formatDateUTC(date)` — format Date to `YYYYMMDDTHHmmssZ` string
    - Implement `createEvent(service, feedbackNo, baseDate)` — assemble Event_Object with title, description, location, startTime, endTime
    - Implement `buildGoogleCalendarUrl(event)` — construct Google Calendar URL with URI-encoded params
    - Implement `generateICS(event)` — produce RFC 5545 VCALENDAR/VEVENT string with UID, DTSTART, DTEND, SUMMARY, DESCRIPTION, LOCATION
    - Implement `downloadFile(icsContent, filename)` — create Blob and trigger `<a download>` click
    - Implement `show(event)` — dynamically create modal DOM (overlay, title, description, 3 buttons), bind click handlers
    - Implement `close()` — remove modal overlay from DOM
    - Handle edge cases: null service defaults to "服務提醒", popup blocker fallback, duplicate show() calls
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 8.4_

  - [ ]* 1.2 Write property tests for CalendarModal pure functions
    - **Property 1: 事件時間計算正確性** — For any valid base date, calcEventTime returns correct start/end times (baseDate+1 day 06:00Z/07:00Z, exactly 1 hour apart)
    - **Validates: Requirements 3.1, 3.2, 3.3**
    - **Property 2: UTC 日期格式化正確性** — For any Date, formatDateUTC produces string matching `/^\d{8}T\d{6}Z$/`
    - **Validates: Requirements 3.4**
    - **Property 3: Event_Object 組裝完整性** — For any non-empty service/feedbackNo, createEvent produces correct Event_Object
    - **Validates: Requirements 4.1, 4.2, 4.3, 1.2**
    - **Property 4: Google Calendar URL 結構正確性** — For any valid Event_Object, buildGoogleCalendarUrl produces properly structured URL
    - **Validates: Requirements 5.1, 5.2**
    - **Property 5: ICS 內容 round-trip** — For any valid Event_Object, generating then parsing ICS yields equivalent values
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.6**

- [ ] 2. Create CalendarModal CSS styles
  - [ ] 2.1 Create `css/calendar-modal.css` with modal styling
    - Style `.calendar-modal-overlay` — fixed position, full viewport, semi-transparent backdrop, flex centering
    - Style `.calendar-modal-content` — card background, border radius, shadow, max-width, padding
    - Style `.calendar-modal-title` — title text styling
    - Style `.calendar-modal-desc` — description text with service name and date
    - Style `.calendar-modal-actions` — button container layout (vertical stack or flex)
    - Style buttons: primary style for Google Calendar, secondary for ICS download, text/ghost for「不加入」
    - Use existing CSS variables: `--primary`, `--bg-card`, `--radius`, `--text-primary`, `--text-secondary`, `--border`, `--shadow`
    - Ensure responsive centering on both desktop and mobile
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 3. Integrate CalendarModal trigger in Chat module
  - [ ] 3.1 Modify `js/chat.js` to trigger CalendarModal after order creation
    - In `handleSend()`, after `addOrderConfirmCard()` call, add code to construct Event_Object via `CalendarModal.createEvent(data.service, data.feedback_no, new Date())` and call `CalendarModal.show(calEvent)`
    - Ensure trigger only fires when `data.status === 'complete'` AND `data.feedback_no` is truthy
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 4. Add script and stylesheet references in index.html
  - [ ] 4.1 Modify `index.html` to include calendar-modal assets
    - Add `<link rel="stylesheet" href="css/calendar-modal.css">` in the `<head>` section alongside existing CSS files
    - Add `<script src="js/calendar-modal.js"></script>` before the chat.js script tag to ensure CalendarModal is available when Chat module loads
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 5. Checkpoint — Verify integration
  - Ensure all files are properly linked and CalendarModal loads without errors
  - Ensure modal appears after AI chat order completion
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 6. Write Property 6 DOM cleanup test
  - [ ]* 6.1 Write property test for Modal DOM cleanup
    - **Property 6: Modal DOM cleanup** — For any sequence of show() followed by close(), no `.calendar-modal-overlay` elements remain in the document
    - **Validates: Requirements 8.4, 7.2**
    - Requires jsdom or browser test environment for DOM assertions

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- No Lambda/backend changes needed — this is a pure frontend feature
- The project uses global objects (Chat, Utils, etc.) so CalendarModal follows the same pattern

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "3.1"] },
    { "id": 2, "tasks": ["4.1"] },
    { "id": 3, "tasks": ["6.1"] }
  ]
}
```
