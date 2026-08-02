/**
 * CalendarModal — 行事曆提醒彈窗元件
 * 純前端模組，建單成功後提供加入 Google 日曆或下載 .ics 檔案
 */
const CalendarModal = {

  /**
   * 計算事件時間（baseDate + 1 天，14:00-15:00 UTC+8）
   */
  calcEventTime(baseDate) {
    const nextDay = new Date(baseDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const startTime = new Date(Date.UTC(
      nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate(), 6, 0, 0
    ));
    const endTime = new Date(Date.UTC(
      nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate(), 7, 0, 0
    ));
    return { startTime, endTime };
  },

  /**
   * 格式化 Date 為 YYYYMMDDTHHmmssZ（UTC）
   */
  formatDateUTC(date) {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    const h = String(date.getUTCHours()).padStart(2, '0');
    const min = String(date.getUTCMinutes()).padStart(2, '0');
    const s = String(date.getUTCSeconds()).padStart(2, '0');
    return `${y}${m}${d}T${h}${min}${s}Z`;
  },

  /**
   * 建立 Event_Object
   */
  createEvent(service, feedbackNo, baseDate) {
    const title = service || '服務提醒';
    const description = `服務已成立，諮詢單號 ${feedbackNo || ''}，廠商將盡快與您聯繫確認詳細時段`;
    const { startTime, endTime } = this.calcEventTime(baseDate || new Date());
    return { title, description, location: '', startTime, endTime };
  },

  /**
   * 組合 Google Calendar 新增事件 URL
   */
  buildGoogleCalendarUrl(event) {
    const start = this.formatDateUTC(event.startTime);
    const end = this.formatDateUTC(event.endTime);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${start}/${end}`,
      details: event.description,
      location: event.location,
    });
    return `https://www.google.com/calendar/render?${params.toString()}`;
  },

  /**
   * 產生 ICS 檔案內容（RFC 5545）
   */
  generateICS(event) {
    const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@ai-community`;
    const start = this.formatDateUTC(event.startTime);
    const end = this.formatDateUTC(event.endTime);
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Ai Community//Calendar//TW',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  },

  /**
   * 觸發瀏覽器下載檔案
   */
  downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * 顯示行事曆提醒 Modal
   */
  show(event) {
    // 若已有 modal 開著，先移除
    const existing = document.querySelector('.calendar-modal-overlay');
    if (existing) existing.remove();

    // 格式化顯示日期（給使用者看的）
    const dateStr = `${event.startTime.getFullYear()}/${event.startTime.getMonth() + 1}/${event.startTime.getDate()} 14:00-15:00`;

    // 建立 DOM
    const overlay = document.createElement('div');
    overlay.className = 'calendar-modal-overlay';
    overlay.innerHTML = `
      <div class="calendar-modal-content">
        <h3 class="calendar-modal-title">📅 加入行事曆提醒</h3>
        <p class="calendar-modal-desc">
          <strong>${event.title}</strong><br>
          預定提醒時間：${dateStr}
        </p>
        <div class="calendar-modal-actions">
          <button class="btn btn-primary btn-block calendar-btn-google">加入 Google 日曆</button>
          <button class="btn btn-outline btn-block calendar-btn-ics">下載日曆檔案(.ics)</button>
          <button class="calendar-btn-skip">不加入</button>
        </div>
      </div>
    `;

    // 綁定事件
    overlay.querySelector('.calendar-btn-google').addEventListener('click', () => {
      const url = this.buildGoogleCalendarUrl(event);
      const win = window.open(url, '_blank');
      if (!win) window.location.href = url; // popup blocker fallback
      this.close();
    });

    overlay.querySelector('.calendar-btn-ics').addEventListener('click', () => {
      const ics = this.generateICS(event);
      const filename = `${event.title}-reminder.ics`;
      this.downloadFile(ics, filename);
      this.close();
    });

    overlay.querySelector('.calendar-btn-skip').addEventListener('click', () => {
      this.close();
    });

    // Backdrop 點擊關閉
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    document.body.appendChild(overlay);
  },

  /**
   * 關閉並移除 modal
   */
  close() {
    const overlay = document.querySelector('.calendar-modal-overlay');
    if (overlay) overlay.remove();
  },
};
