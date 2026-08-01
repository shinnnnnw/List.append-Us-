"""
AI 聊天 Lambda Function
透過 AWS Bedrock 呼叫 Claude 模型，提供智慧社區管家對話功能
"""
import json
import boto3

# Bedrock Runtime client
bedrock = boto3.client('bedrock-runtime', region_name='us-west-2')

# 模型 ID（Claude Sonnet 4.6 — 使用 US inference profile）
MODEL_ID = 'us.anthropic.claude-sonnet-4-6'

# System Prompt
SYSTEM_PROMPT = """你是「Aî 智慧社區管家」，一個友善、專業的 AI 助手，服務於社區住戶。

你的職責：
1. 通用聊天：回答住戶的各種問題，提供生活建議、知識解答等。
2. 意圖辨識：當使用者的訊息涉及以下服務需求時，你必須在回覆中自然地提及該服務，並在回覆的 JSON 結構中標記意圖。

可辨識的服務意圖：
- restaurant_booking（關鍵情境：想吃飯、訂位、餐廳、聚餐、用餐）→ form_id: 1, service: "餐廳訂位"
- shopping（關鍵情境：買東西、購物、商品、採買）→ form_id: 2, service: "商品購買"
- cleaning（關鍵情境：清潔、打掃、整理家裡、大掃除）→ form_id: 3, service: "社區服務"
- repair（關鍵情境：修繕、壞掉、漏水、水電維修）→ form_id: 3, service: "社區服務"
- elderly_care（關鍵情境：長者陪伴、老人照顧、看護）→ form_id: 3, service: "社區服務"
- pharmacy（關鍵情境：領藥、藥局、處方）→ form_id: 3, service: "社區服務"
- taxi（關鍵情境：叫車、計程車、接送）→ form_id: 3, service: "社區服務"

回覆格式規則：
- 你必須以 JSON 格式回覆，格式如下：
{
  "reply": "你的自然語言回覆內容",
  "intent": "辨識到的意圖代碼，沒有則填 none",
  "form_id": 對應的表單ID數字或null,
  "service": "服務名稱或null"
}

- reply 欄位要用自然、親切的語氣回答，使用繁體中文。
- 回覆內容請適當使用換行（\n）讓文字更好閱讀，特別是列出多個項目時每項一行。
- 如果辨識到服務需求，在 reply 中自然地引導使用者，例如「我可以幫您安排，請填寫需求表單讓我們為您服務」。
- 如果沒有辨識到特定服務意圖，intent 填 "none"，form_id 和 service 填 null，正常聊天即可。
- 只回傳 JSON，不要加任何其他文字或 markdown 標記。"""


def lambda_handler(event, context):
    """Lambda 進入點"""
    # 處理 CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return cors_response(200, '')

    try:
        # 解析請求（支援 body 為字串或已解析的 dict）
        raw_body = event.get('body', '{}')
        if isinstance(raw_body, dict):
            body = raw_body
        elif raw_body:
            body = json.loads(raw_body)
        else:
            body = {}

        message = body.get('message', '').strip()
        history = body.get('history', [])

        if not message:
            return cors_response(400, {
                'success': False,
                'data': None,
                'message': '訊息不能為空'
            })

        # 組合對話歷史
        messages = []

        # 加入歷史訊息（最多 20 條）
        history_slice = history[-20:]
        for msg in history_slice:
            role = 'user' if msg.get('sender') == 'user' else 'assistant'
            content = msg.get('text', '')
            if content:
                messages.append({'role': role, 'content': content})

        # 加入當前訊息
        messages.append({'role': 'user', 'content': message})

        # 呼叫 Bedrock Claude
        ai_response = call_bedrock(messages)

        if ai_response['success']:
            ai_content = ai_response['content']

            # 嘗試解析 JSON 回覆
            try:
                parsed = json.loads(ai_content)
                if 'reply' in parsed:
                    response_data = {
                        'reply': parsed['reply'],
                        'intent': parsed.get('intent', 'none'),
                        'form_id': parsed.get('form_id'),
                        'service': parsed.get('service'),
                        'has_form': bool(parsed.get('form_id')),
                    }
                else:
                    response_data = {
                        'reply': ai_content,
                        'intent': 'none',
                        'form_id': None,
                        'service': None,
                        'has_form': False,
                    }
            except json.JSONDecodeError:
                response_data = {
                    'reply': ai_content,
                    'intent': 'none',
                    'form_id': None,
                    'service': None,
                    'has_form': False,
                }

            return cors_response(200, {
                'success': True,
                'data': response_data,
                'message': None
            })
        else:
            # Bedrock 呼叫失敗，fallback 關鍵字比對
            response_data = fallback_keyword_match(message)
            return cors_response(200, {
                'success': True,
                'data': response_data,
                'message': None
            })

    except Exception as e:
        print(f"Error: {str(e)}")
        return cors_response(500, {
            'success': False,
            'data': None,
            'message': '伺服器內部錯誤'
        })


def call_bedrock(messages: list) -> dict:
    """呼叫 AWS Bedrock Claude API"""
    try:
        request_body = {
            'anthropic_version': 'bedrock-2023-05-31',
            'max_tokens': 800,
            'temperature': 0.7,
            'system': SYSTEM_PROMPT,
            'messages': messages,
        }

        response = bedrock.invoke_model(
            modelId=MODEL_ID,
            contentType='application/json',
            accept='application/json',
            body=json.dumps(request_body)
        )

        response_body = json.loads(response['body'].read())
        content = response_body.get('content', [])

        if content and content[0].get('type') == 'text':
            return {'success': True, 'content': content[0]['text'].strip()}

        return {'success': False, 'content': None}

    except Exception as e:
        print(f"Bedrock Error: {str(e)}")
        return {'success': False, 'content': None}


def fallback_keyword_match(message: str) -> dict:
    """Fallback：關鍵字比對（當 Bedrock 不可用時）"""
    intents = [
        {
            'keywords': ['吃', '餐廳', '訂位', '用餐', '聚餐', '晚餐', '午餐', '早餐'],
            'intent': 'restaurant_booking',
            'reply': '辨識到您有餐廳訂位需求，已為您產生專屬留資表單，請點擊下方按鈕填寫確認。',
            'form_id': 1,
            'service': '餐廳訂位',
        },
        {
            'keywords': ['買', '購物', '商品', '下單', '購買', '採買'],
            'intent': 'shopping',
            'reply': '辨識到您有商品採買需求，已為您產生動態需求表單。',
            'form_id': 2,
            'service': '商品購買',
        },
        {
            'keywords': ['清潔', '打掃', '整理', '洗衣機', '冷氣', '大掃除', '家事'],
            'intent': 'cleaning',
            'reply': '辨識到您有清潔服務需求，已為您媒合專業清潔團隊，請填寫需求表單。',
            'form_id': 3,
            'service': '社區服務',
        },
        {
            'keywords': ['修', '壞', '漏水', '水電', '修繕', '維修', '馬桶', '水龍頭'],
            'intent': 'repair',
            'reply': '辨識到您有修繕需求，已為您安排專業師傅，請填寫詳細狀況。',
            'form_id': 3,
            'service': '社區服務',
        },
        {
            'keywords': ['陪伴', '長者', '老人', '照顧', '看護'],
            'intent': 'elderly_care',
            'reply': '辨識到您有長者陪伴需求，我們的社區服務團隊可以協助，請填寫需求表單。',
            'form_id': 3,
            'service': '社區服務',
        },
        {
            'keywords': ['藥', '領藥', '藥局', '處方'],
            'intent': 'pharmacy',
            'reply': '辨識到您有藥局代領需求，請填寫相關資訊。',
            'form_id': 3,
            'service': '社區服務',
        },
        {
            'keywords': ['叫車', '計程車', '接送', '交通'],
            'intent': 'taxi',
            'reply': '辨識到您有叫車需求，正在為您媒合附近車輛。',
            'form_id': 3,
            'service': '社區服務',
        },
    ]

    for intent in intents:
        for keyword in intent['keywords']:
            if keyword in message:
                return {
                    'reply': intent['reply'],
                    'intent': intent['intent'],
                    'form_id': intent['form_id'],
                    'service': intent['service'],
                    'has_form': True,
                }

    return {
        'reply': '收到您的需求，請問能再具體描述一下嗎？例如：餐廳訂位、清潔服務、水電修繕等。',
        'intent': 'unknown',
        'form_id': None,
        'service': None,
        'has_form': False,
    }


def cors_response(status_code: int, body) -> dict:
    """回傳包含 CORS headers 的 response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
        'body': json.dumps(body, ensure_ascii=False) if isinstance(body, dict) else body,
    }
