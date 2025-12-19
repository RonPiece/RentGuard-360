import json
import boto3
from datetime import datetime
import uuid

bedrock = boto3.client(service_name='bedrock-runtime', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('RentGuard-Contracts')

# Use same model as ai-analyzer (Claude Haiku 4.5)
MODEL_ID = "us.anthropic.claude-haiku-4-5-20251001-v1:0"

def lambda_handler(event, context):
    """
    ConsultClause - AI-powered clause explanation
    Uses Claude Haiku 4.5 (same as ai-analyzer)
    """
    try:
        # 1. Parse request body
        body = json.loads(event.get('body', '{}'))
        contract_id = body.get('contractId')
        clause_text = body.get('clauseText')
        
        if not clause_text:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'No clause text provided'})
            }

        # 2. Build prompt for AI
        system_prompt = """You are an expert Israeli real estate lawyer.
Explain contract clauses in simple Hebrew.
Keep answers short (2-3 sentences) and friendly.
Format: Brief explanation, risk level (נמוך/בינוני/גבוה), and recommendation."""

        user_message = {
            "role": "user",
            "content": [{
                "text": f"""הסבר בבקשה את הסעיף הזה מחוזה שכירות:
"{clause_text}"

ענה בעברית בקצרה:
1. מה הסעיף אומר
2. האם זה סטנדרטי או מסוכן
3. המלצה קצרה"""
            }]
        }

        # 3. Call Bedrock (Claude Haiku 4.5)
        response = bedrock.converse(
            modelId=MODEL_ID,
            system=[{"text": system_prompt}],
            messages=[user_message],
            inferenceConfig={"maxTokens": 512, "temperature": 0.5}
        )
        
        ai_answer = response['output']['message']['content'][0]['text']

        # 4. Save consultation to history (optional - uses userId+contractId key)
        # Skip DB save to avoid key issues
        
        # 5. Return AI response
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            'body': json.dumps({'explanation': ai_answer})
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
