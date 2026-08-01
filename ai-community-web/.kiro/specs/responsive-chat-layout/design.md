# Design Document: Responsive Chat Layout

## Architecture Overview

本設計透過 CSS media queries 和 flexbox 佈局修正首頁主控台的版面問題。核心策略：

1. 將 `page-content` 改為 flex column 佈局，讓 Service_Grid 和 Chat_Section 共享可視區域高度
2. 引入三段式 breakpoints 讓 `--max-width` 隨螢幕調整
3. 桌面環境下 page-content 切換為 flex row（左右並排）

不需要 JavaScript 改動，純 CSS 修正。

## Responsive Breakpoints

```css
/* 手機 (預設, < 576px): max-width 480px */
:root {
  --max-width: 480px;
}

/* 平板 (576px - 1024px): max-width 768px */
@media (min-width: 576px) {
  :root {
    --max-width: 768px;
  }
}

/* 桌面 (> 1024px): max-width 960px */
@media (min-width: 1025px) {
  :root {
    --max-width: 960px;
  }
}
```

## Layout Strategy

### Mobile (< 576px) — Vertical Stack, Compressed Service Grid

```
┌─────────────────────┐
│      Header         │
├─────────────────────┤
│  Service Grid       │ ← max-height: 30% of content area, overflow-y: auto
├─────────────────────┤
│                     │
│   Chat Section      │ ← flex: 1, fills remaining height
│                     │
├─────────────────────┤
│    Bottom Nav       │
└─────────────────────┘
```

### Tablet (576px - 1024px) — Vertical Stack, More Width

Same vertical structure as mobile but with 768px max-width, giving more horizontal space for the grid and chat.

### Tablet (576px - 1024px) — 垂直堆疊，寬度加大

與手機相同的垂直結構，但 max-width 放大到 768px，讓格子和聊天區域有更多水平空間。

### Desktop (> 1024px) — Side-by-Side Layout

```
┌───────────────────────────────────────┐
│               Header                   │
├────────────┬──────────────────────────┤
│            │                          │
│  Service   │      Chat Section        │
│   Grid     │                          │
│  (35%)     │        (65%)             │
│            │                          │
├────────────┴──────────────────────────┤
│             Bottom Nav                 │
└───────────────────────────────────────┘
```

## Component Changes

### 1. `style.css` — Responsive Variables and Page Content Flex

```css
/* 在 :root 中移除固定 --max-width: 480px，改為由 media query 控制 */

.page-content {
  padding: 15px;
  padding-top: var(--header-height);
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--nav-height));
  overflow: hidden;
}

/* 平板斷點 */
@media (min-width: 576px) {
  :root {
    --max-width: 768px;
  }
}

/* 桌面斷點 */
@media (min-width: 1025px) {
  :root {
    --max-width: 960px;
  }

  .page-content {
    flex-direction: row;
    gap: 20px;
    align-items: stretch;
  }
}
```

### 2. `services.css` — Service Grid Height Constraint

```css
/* 手機：限制高度，超出可捲動 */
.service-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 0;
  max-height: 30vh;
  overflow-y: auto;
  flex-shrink: 0;
}

/* 桌面：左側固定寬度 */
@media (min-width: 1025px) {
  .service-grid {
    max-height: none;
    overflow-y: auto;
  }

  .service-grid .service-btn {
    width: calc(50% - 8px); /* 桌面左欄改為兩列 */
  }
}
```

### 3. `chat.css` — Chat Section Flex Fill

```css
.chat-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 200px;
  overflow: hidden;
}

/* 桌面並排時 chat 佔滿右側 */
@media (min-width: 1025px) {
  .chat-section {
    flex: 1;
    height: calc(100vh - var(--header-height) - var(--nav-height) - 30px);
  }
}
```

### 4. `index.html` — Minimal Structure Change

需要在 `.page-content` 內加入一個 wrapper 將 section-title 和 service-grid 包在一起，方便桌面佈局控制：

```html
<div class="page-content">
  <!-- 服務區域 -->
  <div class="dashboard-services">
    <h3 class="section-title">一站搞定生活大小事</h3>
    <div id="service-grid" class="service-grid"></div>
  </div>

  <!-- AI 聊天 -->
  <div class="chat-section">
    <div id="chat-container" class="chat-container"></div>
    <div class="chat-input-bar">...</div>
  </div>
</div>
```

新增 `.dashboard-services` wrapper 的 CSS：

```css
.dashboard-services {
  flex-shrink: 0;
}

@media (max-width: 575px) {
  .dashboard-services {
    max-height: 30%;
    overflow-y: auto;
  }
}

@media (min-width: 1025px) {
  .dashboard-services {
    width: 35%;
    max-height: none;
    overflow-y: auto;
  }
}
```

## Data Models

此功能不涉及資料模型變更，純為前端 CSS/HTML 佈局修正。

## Error Handling

- 當 viewport 極小（< 500px 高度）時，Chat_Section 保持 min-height: 200px，Service_Grid 允許內部捲動
- CSS 變數透過 media query 動態更新，無需 JavaScript 介入，不存在執行時錯誤風險

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Breakpoint max-width mapping

*For any* viewport width, the computed max-width of Page_Wrapper SHALL be exactly 480px when viewport < 576px, 768px when viewport is in [576px, 1024px], and 960px when viewport > 1024px.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 2: Service grid width ratio in desktop layout

*For any* viewport width greater than 1024px, the computed width of Service_Grid SHALL be no more than 35% of the Page_Wrapper content width.

**Validates: Requirements 3.3**

### Property 3: Service grid height constraint on mobile

*For any* viewport width less than 576px, the Service_Grid container (dashboard-services) SHALL have a maximum height no greater than 30% of the available content area height.

**Validates: Requirements 4.1**
