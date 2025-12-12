import json
import boto3
import traceback
import re

bedrock = boto3.client(service_name='bedrock-runtime', region_name='us-east-1')

def lambda_handler(event, context):
    try:
        # 1. קליטת המידע
        sanitized_text = event.get('sanitizedText') or event.get('extractedText', '')
        contract_id = event.get('contractId', 'unknown')
        bucket = event.get('bucket')
        key = event.get('key')
        
        if not sanitized_text:
            return {
                'contractId': contract_id, 
                'analysis_result': {'error': 'No text found'},
                'bucket': bucket,
                'key': key
            }

        # --- הגנת תקציב ---
        if len(sanitized_text) > 25000:
            sanitized_text = sanitized_text[:25000] + "... [Text Truncated]"

        model_id = "us.meta.llama3-1-8b-instruct-v1:0"

        # --- התיקון הגדול בפרומפט: הוראות סיווג ברורות ---
        system_prompts = [{
            "text": """
            You are an expert Israeli real estate lawyer.
            
            Task: Analyze the text provided.
            
            STEP 1: CLASSIFICATION
            Determine if the text is a Residential Lease Agreement (חוזה שכירות).
            - If it is a Resume (CV), Recipe, News Article, Code, or junk text -> It is NOT a contract.
            
            STEP 2: OUTPUT GENERATION
            Return ONLY valid JSON based on the classification.

            --- SCENARIO A: IT IS A CONTRACT ---
            JSON Structure:
            {
              "is_contract": true,
              "overall_risk_score": (Integer 0-100),
              "summary": "Hebrew summary of the contract",
              "issues": [
                {
                    "clause_topic": "Hebrew topic", 
                    "original_text": "Quote", 
                    "risk_level": "High/Medium/Low", 
                    "explanation": "Hebrew explanation", 
                    "negotiation_tip": "Hebrew tip"
                }
              ]
            }

            --- SCENARIO B: IT IS NOT A CONTRACT (e.g. CV, Resume, Junk) ---
            JSON Structure:
            {
              "is_contract": false,
              "overall_risk_score": 0,
              "summary": "המסמך אינו מזוהה כחוזה שכירות (נראה כמו קורות חיים או מסמך אחר).",
              "issues": []
            }
            """
        }]

        user_message = {
            "role": "user",
            "content": [{"text": f"Analyze this text:\n{sanitized_text}"}]
        }

        response = bedrock.converse(
            modelId=model_id,
            system=system_prompts,
            messages=[user_message],
            inferenceConfig={"maxTokens": 8192, "temperature": 0.0, "topP": 1.0}
        )

        ai_output_text = response['output']['message']['content'][0]['text']
        
        # --- מנגנון חילוץ (Regex) ---
        try:
            match = re.search(r'\{.*\}', ai_output_text, re.DOTALL)
            if match:
                clean_json = match.group(0)
                analysis_json = json.loads(clean_json)
            else:
                raise Exception("No JSON found in response")
        except Exception as e:
            print(f"JSON Parse Error: {str(e)}")
            analysis_json = {
                "is_contract": True, # במקרה שגיאה נניח שזה חוזה כדי לא לאבד מידע
                "overall_risk_score": 0,
                "summary": "הניתוח הושלם אך יש שגיאת פורמט טכנית.",
                "issues": [],
                "raw_ai_response": ai_output_text
            }

        # 3. החזרה (כולל סגירת הסוגריים שהייתה חסרה לך קודם!)
        return {
            'contractId': contract_id,
            'analysis_result': analysis_json,
            'bucket': bucket,
            'key': key
        }

    except Exception as e:
        traceback.print_exc()
        raise e