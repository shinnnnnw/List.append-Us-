/**
 * AI 管家對話 MCP Tool
 */
import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { apiPost } from '../api-client.js';

export function registerChatTools(server: McpServer): void {
  server.registerTool(
    'ai_chat',
    {
      description: 'AI 智慧社區管家對話。可進行自然語言需求辨識、多輪資訊收集、自動建立訂單。支援餐廳訂位、清潔、修繕、寄件、購物、叫車、領藥等服務',
      inputSchema: {
        text: z.string().describe('使用者的對話訊息'),
        account_id: z.string().optional().describe('用戶帳號 ID（如有登入）'),
        history: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })).optional().describe('對話歷史紀錄（用於多輪對話）'),
      },
    },
    async ({ text, account_id, history }) => {
      const result = await apiPost('/ai/chat', {
        text,
        account_id: account_id || '',
        history: history || [],
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
