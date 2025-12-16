import json
import boto3
import traceback
import re

bedrock = boto3.client(service_name='bedrock-runtime', region_name='us-east-1')

def lambda_handler(event, context):
    try:
        # קליטת נתונים
        sanitized_text = event.get('sanitizedText') or event.get('extractedText', '')
        contract_id = event.get('contractId', 'unknown')
        bucket = event.get('bucket')
        key = event.get('key')
        clauses_list = event.get('clauses', []) 
        
        if not sanitized_text:
            return {'error': 'No text found'}

        # הגנת תקציב
        if len(sanitized_text) > 25000:
            sanitized_text = sanitized_text[:25000] + "... [Text Truncated]"

        model_id = "us.meta.llama3-1-8b-instruct-v1:0"

        # --- הפרומפט המלוטש (גרסת Production) ---
        system_prompts = [{
            "text": """
            You are an expert Israeli Real Estate Lawyer.
            
            Instruction:
            1. Analyze the attached Hebrew text (which contains OCR errors/typos).
            2. OUTPUT LANGUAGE: HEBREW ONLY.

            --- STEP 1: VALIDATION ---
            Identify if this is a Lease Agreement.
            Accept typos like "משגיר" (Landlord) or "שובר" (Tenant).
            If NOT a contract -> Return "is_contract": false.

            --- STEP 2: ANALYSIS & CLEANING ---
            Analyze the clauses. When you find a risk:
            1. Copy the "original_text" exactly as it appears (even with errors).
            2. Create a "corrected_text" version: fix spelling/grammar for display purposes.
            
            SCORING:
            - Start with 100.
            - High Risk (-15): Immediate eviction, Unreasonable fines.
            - Medium Risk (-5): Strict maintenance responsibilities.
            
            JSON Output Format:
            {
              "is_contract": true,
              "overall_risk_score": (0-100),
              "summary": "סיכום מקצועי וברור של החוזה בעברית תקנית...",
              "issues": [
                {
                    "clause_topic": "נושא הסעיף (למשל: פינוי הנכס)", 
                    "original_text": "הציטוט המקורי עם השגיאות", 
                    "corrected_text": "הציטוט המתוקן והקריא (ללא שגיאות כתיב)",
                    "risk_level": "High/Medium/Low", 
                    "explanation": "הסבר ברור למה זה מסוכן", 
                    "negotiation_tip": "מה לבקש מהמשכיר"
                }
              ]
            }
            """
        }]

        user_message = {
            "role": "user",
            "content": [{"text": f"Analyze this text (fix typos in output):\n{sanitized_text}"}]
        }

        response = bedrock.converse(
            modelId=model_id,
            system=system_prompts,
            messages=[user_message],
            inferenceConfig={"maxTokens": 4096, "temperature": 0.0}
        )

        ai_output_text = response['output']['message']['content'][0]['text']
        
        # ניקוי JSON
        ai_output_text = ai_output_text.replace("```json", "").replace("```", "").strip()
        
        try:
            match = re.search(r'\{.*\}', ai_output_text, re.DOTALL)
            if match:
                analysis_json = json.loads(match.group(0))
            else:
                raise Exception("No JSON found")
        except Exception as e:
            print(f"JSON Parse Error: {str(e)}")
            analysis_json = {
                "is_contract": False,
                "overall_risk_score": 0,
                "summary": "לא ניתן היה לפענח את הקובץ. איכות הסריקה נמוכה מדי.",
                "issues": []
            }

        return {
            'contractId': contract_id,
            'analysis_result': analysis_json,
            'bucket': bucket,
            'key': key,
            'sanitizedText': sanitized_text,  
            'clauses': clauses_list           
        }

    except Exception as e:
        traceback.print_exc()
        raise e