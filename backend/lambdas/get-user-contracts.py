import json
import boto3
from boto3.dynamodb.conditions import Key

# וודא שזה השם המדויק של הטבלה הראשונה שיצרת
TABLE_NAME = 'RentGuard-Contracts'

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    try:
        # 1. קבלת ה-userId מהבקשה
        # (במערכת אמיתית זה מגיע מה-Token, כאן נסמוך על הפרמטר)
        query_params = event.get('queryStringParameters') or {}
        user_id = query_params.get('userId')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET"
                },
                'body': json.dumps("Error: Missing userId parameter")
            }

        print(f"Fetching contracts for user: {user_id}")

        # 2. שליפת כל החוזים של המשתמש הזה
        # אנחנו משתמשים ב-Query כי זה הרבה יותר יעיל מ-Scan
        response = table.query(
            KeyConditionExpression=Key('userId').eq(user_id)
        )
        
        items = response.get('Items', [])
        print(f"Found {len(items)} contracts")

        # 3. החזרת הרשימה
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*", # חובה ל-React
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            # ensure_ascii=False מאפשר להחזיר טקסט בעברית (כמו שם קובץ) בצורה קריאה
            'body': json.dumps(items, ensure_ascii=False, default=str)
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
            },
            'body': json.dumps(f"Database Error: {str(e)}")
        }