import json
import boto3
import datetime

# שם טבלת התוצאות
TABLE_NAME = 'RentGuard-Analysis'
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    try:
        print("Error Handler Triggered:", json.dumps(event))
        
        # ה-Step Functions שולח את השגיאה בתוך אובייקט ErrorInfo או דומה
        # ננסה לחלץ מזהה חוזה אם קיים
        # הערה: זה תלוי איך נגדיר את ה-Catch ב-Step Function
        # כברירת מחדל ננסה לחלץ מהקלט הישיר
        contract_id = event.get('contractId') or event.get('key')
        error_message = event.get('Error', 'Unknown Error')
        error_details = event.get('Cause', 'No details provided')

        if contract_id:
            # עדכון הסטטוס ב-DynamoDB ל-FAILED
            table.put_item(Item={
                'contractId': contract_id,
                'timestamp': str(datetime.datetime.now()),
                'status': 'FAILED',
                'error': error_message,
                'details': error_details
            })
            print(f"Marked contract {contract_id} as FAILED")
        
        return {
            'statusCode': 200,
            'body': json.dumps("Error handled and logged")
        }

    except Exception as e:
        print(f"Critical Error in Error Handler: {str(e)}")
        # אנחנו לא רוצים שה-Error Handler עצמו ייכשל ויפיל את המכונה
        return {'statusCode': 200, 'body': "Error handler finished with internal errors"}