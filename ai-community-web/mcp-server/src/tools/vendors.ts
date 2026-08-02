/**
 * 廠商相關 MCP Tools
 */
import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { apiGet, toToolResult } from '../api-client.js';

export function registerVendorTools(server: McpServer): void {
  server.registerTool(
    'list_vendors',
    {
      description: '查詢社區服務廠商列表，可依服務類型篩選（1=清潔, 2=家電, 3=寄件, 6=餐廳, 10=修繕, 11=購物）',
      inputSchema: {
        service_type: z.string().optional().describe('服務類型代碼，不傳則回傳全部'),
      },
    },
    async ({ service_type }) => {
      const query = service_type ? `?service_type=${service_type}` : '';
      const result = await apiGet(`/vendors${query}`);
      return toToolResult(result);
    }
  );

  server.registerTool(
    'get_vendor_detail',
    {
      description: '查詢單一服務廠商的詳細資訊（含聯絡人、電話、服務地區、評分）',
      inputSchema: {
        vendor_id: z.string().describe('廠商 ID（數字字串，如 "4"）'),
      },
    },
    async ({ vendor_id }) => {
      const result = await apiGet(`/vendors/${vendor_id}`);
      return toToolResult(result);
    }
  );
}
