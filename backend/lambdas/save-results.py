import json
import boto3
import datetime

# חיבור ל-DynamoDB
dynamodb = boto3.resource('dynamodb')
# וודא שהשם כאן זהה בדיוק לשם הטבלה שיצרת!
table = dynamodb.Table('RentGuard-Analysis')

def lambda_handler(event, context):
    try:
        print("Received event:", json.dumps(event))
        
        # 1. חילוץ המידע מהשלבים הקודמים
        # אנחנו מניחים שהמידע יגיע משורשר (מה-Step Function שנבנה תכף)
        contract_id = event.get('contractId') or event.get('key')
        
        # התוצאה של ה-AI יכולה להגיע בכמה צורות, תלוי איך שרשרנו
        # כאן אנחנו מנסים לחלץ את הניתוח עצמו
        ai_analysis_raw = event.get('analysis')
        
        if not contract_id:
            return {'statusCode': 400, 'body': "Error: Missing contractId"}
            
        if not ai_analysis_raw:
            return {'statusCode': 400, 'body': "Error: Missing analysis data"}

        # 2. המרה לאובייקט שאפשר לשמור (JSON)
        # אם הניתוח הגיע כמחרוזת (String), ננסה להפוך אותו ל-Dict
        if isinstance(ai_analysis_raw, str):
            try:
                analysis_data = json.loads(ai_analysis_raw)
            except:
                # אם אי אפשר לפרסר, נשמור כטקסט גולמי
                analysis_data = {"raw_text": ai_analysis_raw}
        else:
            analysis_data = ai_analysis_raw

        # 3. שמירה בטבלה
        item = {
            'contractId': contract_id,
            'timestamp': str(datetime.datetime.now()),
            'analysis': analysis_data,
            'status': 'COMPLETED'
        }
        
        table.put_item(Item=item)
        print(f"Successfully saved analysis for {contract_id}")

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Analysis saved successfully',
                'contractId': contract_id
            })
        }

    except Exception as e:
        print(f"Error saving to DB: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Database Error: {str(e)}")
        }