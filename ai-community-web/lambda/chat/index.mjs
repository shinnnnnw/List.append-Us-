/**
 * AI Community API - Lambda Handler (ESM)
 * 處理 /ai/chat 多輪對話端點
 */
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrock = new BedrockRuntimeClient({ region: 'us-west-2' });
const MODEL_ID = 'anthropic.claude-3-5-sonnet-20241022-v2:0';

const CHAT_SYSTEM_PROMPT = `你是「Aî 智慧社區管家」，一個友善、專業的 AI 助手，服務於社區住戶。

你可以處理以下服務：餐廳訂位、居家清潔、水電修繕、包裹寄送、商城購物、美食外送。

對話規則：
1. 用自然親切的繁體中文對話，像朋友一樣聊天
2. 主動詢問用戶需求的細節（時間、地點、預算、人數、問題詳情等）
3. 用戶可能有錯別字，請自行判斷正確意思
4. 如果用戶描述不清楚，請進一步追問，不要猜測
5. 根據對話內容分析問題嚴重性，緊急情況（如漏水、停電）優先提醒用戶注意安全
6. 當你收集到足夠資訊（至少包含：需求類型、時間偏好、聯絡方式或地點）後，告訴用戶「我已為您記錄需求，廠商將在24小時內聯繫您確認細節」
7. 收集到足夠資訊時，在回覆最後加上一行標記：[SUBMIT:需求類型] （例如 [SUBMIT:餐廳訂位] 或 [SUBMIT:水電修繕]）
8. 如果用戶只是閒聊或問問題（不涉及服務需求），正常回答即可，不需要收集資訊
9. 不要提到「表單」、「填寫表單」等字眼，用自然對話方式收集資訊
10. 回覆純文字，不要用 JSON 格式，不要用 markdown 標記

記住：你的目標是讓用戶覺得在跟一個懂生活的朋友聊天，而不是在填表單。`;

export async function handler(event) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return corsResponse(200, '');
  }

  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';

  // Route: /ai/chat
  if (path === '/ai/chat' && method === 'POST') {
    return handleChat(event);
  }

  return corsResponse(404, { success: false, message: 'Not found' });
}

async function handleChat(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const text = (body.text || '').trim();
    const history = body.history || [];

    if (!text) {
      return corsResponse(400, { success: false, data: null, message: '訊息不能為空' });
    }

    // 組合 Bedrock messages（最多保留最近 30 條）
    const messages = [];
    const historySlice = history.slice(-30);

    for (const msg of historySlice) {
      if (msg.role && msg.content) {
        // 過濾掉 [SUBMIT:...] 標記，不讓 AI 看到自己之前的標記
        const cleanContent = msg.role === 'assistant'
          ? msg.content.replace(/\[SUBMIT:[^\]]+\]/g, '').trim()
          : msg.content;
        if (cleanContent) {
          messages.push({ role: msg.role, content: cleanContent });
        }
      }
    }

    // 加入當前用戶訊息（如果歷史最後一條不是同一條的話）
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== text) {
      messages.push({ role: 'user', content: text });
    }

    // 呼叫 Bedrock
    const aiReply = await callBedrock(messages);

    if (aiReply) {
      // 檢查是否有 [SUBMIT:...] 標記，如果有則自動儲存需求
      const submitMatch = aiReply.match(/\[SUBMIT:([^\]]+)\]/);
      let cleanReply = aiReply.replace(/\[SUBMIT:[^\]]+\]/g, '').trim();

      if (submitMatch) {
        // 非同步儲存需求（不阻塞回覆）
        const serviceType = submitMatch[1];
        console.log(`[Auto-submit] Service: ${serviceType}, History length: ${history.length}`);
        // TODO: Call /feedback API to save the collected info
      }

      return corsResponse(200, {
        success: true,
        data: { reply: cleanReply },
        message: null,
      });
    } else {
      // Fallback
      return corsResponse(200, {
        success: true,
        data: { reply: '不好意思，我現在有點忙不過來，可以請您再說一次嗎？' },
        message: null,
      });
    }
  } catch (err) {
    console.error('handleChat error:', err);
    return corsResponse(500, { success: false, data: null, message: '伺服器內部錯誤' });
  }
}

async function callBedrock(messages) {
  try {
    const requestBody = {
      anthropic_version: 'bedrock-2023-05-01',
      max_tokens: 1024,
      temperature: 0.7,
      system: CHAT_SYSTEM_PROMPT,
      messages,
    };

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody),
    });

    const response = await bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const content = responseBody.content || [];

    if (content.length > 0 && content[0].type === 'text') {
      return content[0].text.trim();
    }
    return null;
  } catch (err) {
    console.error('Bedrock error:', err);
    return null;
  }
}

function corsResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  };
}
