import json
import boto3
from decimal import Decimal

# וודא שזה השם המדויק של הטבלה השנייה (של התוצאות)
TABLE_NAME = 'RentGuard-Analysis'

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)

# פונקציית עזר לטיפול במספרים (DynamoDB מחזיר Decimal ש-JSON לא אוהב)
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    try:
        # 1. קבלת ה-contractId מהבקשה
        query_params = event.get('queryStringParameters') or {}
        contract_id = query_params.get('contractId')
        
        if not contract_id:
            return {
                'statusCode': 400,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET"
                },
                'body': json.dumps("Error: Missing contractId parameter")
            }

        print(f"Fetching analysis for: {contract_id}")

        # 2. שליפת הפריט הבודד לפי המפתח
        response = table.get_item(
            Key={'contractId': contract_id}
        )
        
        item = response.get('Item')

        # 3. בדיקה אם קיים
        if not item:
            return {
                'statusCode': 404, # לא נמצא
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,GET"
                },
                'body': json.dumps({"message": "Analysis not found or still processing"})
            }

        # 4. החזרת התוצאה
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            # משתמשים ב-cls=DecimalEncoder כדי לטפל במספרים
            'body': json.dumps(item, ensure_ascii=False, cls=DecimalEncoder)
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