/**
 * 訂單相關 MCP Tools
 */
import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { apiGet, toToolResult } from '../api-client.js';

export function registerOrderTools(server: McpServer): void {
  server.registerTool(
    'list_orders',
    {
      description: '查詢指定用戶的訂單列表，可依狀態篩選（03=已確認, 80=已完成, 90=已取消）',
      inputSchema: {
        account_id: z.string().describe('用戶帳號 ID（如 "MBR001"）'),
        status: z.string().optional().describe('訂單狀態代碼，不傳則回傳全部'),
      },
    },
    async ({ account_id, status }) => {
      const statusParam = status ? `&status=${status}` : '';
      const result = await apiGet(`/orders?account_id=${encodeURIComponent(account_id)}${statusParam}`);
      return toToolResult(result);
    }
  );

  server.registerTool(
    'get_order_detail',
    {
      description: '查詢單筆訂單的完整資訊（含金額、時間軸、服務項目）',
      inputSchema: {
        order_id: z.string().describe('訂單 record_id（如 "ORD001"）'),
        account_id: z.string().describe('用戶帳號 ID'),
      },
    },
    async ({ order_id, account_id }) => {
      const result = await apiGet(`/orders/${order_id}?account_id=${encodeURIComponent(account_id)}`);
      return toToolResult(result);
    }
  );
}
