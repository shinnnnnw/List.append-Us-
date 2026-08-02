#!/usr/bin/env node
/**
 * Aî 智慧社區服務平台 — MCP Server
 *
 * 將既有 API 包裝為標準 MCP 工具，供外部 AI Agent（如 Lumine one）呼叫。
 * Transport: stdio
 *
 * 提供的工具：
 *   - list_vendors         查詢服務廠商列表
 *   - get_vendor_detail    查詢廠商詳情
 *   - create_service_request  建立服務需求（諮詢單）
 *   - list_orders          查詢訂單列表
 *   - get_order_detail     查詢訂單詳情
 *   - ai_chat              AI 管家對話（意圖辨識 + 自動建單）
 */

import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';

import { registerVendorTools } from './tools/vendors.js';
import { registerOrderTools } from './tools/orders.js';
import { registerFeedbackTools } from './tools/feedback.js';
import { registerChatTools } from './tools/chat.js';

const server = new McpServer({
  name: 'ai-community-mcp-server',
  version: '1.0.0',
});

// 註冊所有工具
registerVendorTools(server);
registerOrderTools(server);
registerFeedbackTools(server);
registerChatTools(server);

// 啟動 stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[MCP] Aî 智慧社區 MCP Server 已啟動 (stdio)');
}

main().catch((err) => {
  console.error('[MCP] 啟動失敗:', err);
  process.exit(1);
});
