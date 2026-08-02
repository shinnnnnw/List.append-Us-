/**
 * 諮詢單（服務需求）MCP Tool
 */
import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { apiPost } from '../api-client.js';

export function registerFeedbackTools(server: McpServer): void {
  server.registerTool(
    'create_service_request',
    {
      description: '為社區住戶建立一筆服務需求（諮詢單），系統會自動媒合廠商。可用於餐廳訂位、居家清潔、水電修繕、包裹寄送等',
      inputSchema: {
        form_id: z.number().describe('表單類型 ID（1=餐廳訂位, 2=商品購買, 3=居家服務, 4=包裹寄送）'),
        account_id: z.string().describe('用戶帳號 ID（如 "MBR001"）'),
        contact_name: z.string().describe('聯絡人姓名'),
        contact_mobile: z.string().describe('聯絡人手機號碼'),
        description: z.string().describe('需求描述（越詳細越好，包含時間、地點、特殊需求等）'),
      },
    },
    async ({ form_id, account_id, contact_name, contact_mobile, description }) => {
      const result = await apiPost('/feedback', {
        form_id,
        account_id,
        account_name: contact_name,
        contact_name,
        contact_mobile,
        description,
        data: [{ topicId: 1, type: '2', answer: description }],
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
