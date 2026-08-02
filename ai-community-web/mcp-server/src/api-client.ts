/**
 * API Client — 封裝 fetch 呼叫現有 API Gateway
 */

const API_BASE = 'https://adjvx2bs1a.execute-api.us-west-2.amazonaws.com/prod';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
}

export async function apiGet<T = unknown>(path: string): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json() as Promise<ApiResponse<T>>;
}

export async function apiPost<T = unknown>(path: string, body: Record<string, unknown>): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<ApiResponse<T>>;
}

/**
 * 將 API 回應轉換為 MCP Tool 回傳格式
 * 成功時回傳資料 JSON，失敗時標記 isError: true
 */
export function toToolResult(result: ApiResponse) {
  if (result.success) {
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result.data, null, 2) }],
    };
  }
  return {
    content: [{ type: 'text' as const, text: `Error: ${result.message || 'Unknown error'}` }],
    isError: true,
  };
}
