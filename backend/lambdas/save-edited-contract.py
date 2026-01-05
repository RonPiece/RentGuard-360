import json
import boto3
from datetime import datetime

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

BUCKET_NAME = 'rentguard-contracts-moty-101225'
TABLE_NAME = 'RentGuard-Contracts'

def lambda_handler(event, context):
    print(f"FULL EVENT: {json.dumps(event, default=str)}")
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    }
    
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    try:
        # Read directly from event (Lambda Integration, not Proxy)
        contract_id = event.get('contractId', '')
        user_id = event.get('userId', '')
        edited_clauses = event.get('editedClauses', {})
        full_edited_text = event.get('fullEditedText', '')
        
        print(f"DATA: contractId={contract_id}, userId={user_id}")
        
        if not contract_id:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'contractId required'})}
        if not user_id:
            return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'userId required'})}
        
        timestamp = datetime.utcnow().isoformat()
        table = dynamodb.Table(TABLE_NAME)
        
        # Get original S3 key
        try:
            resp = table.get_item(Key={'userId': user_id, 'contractId': contract_id})
            s3_key = resp.get('Item', {}).get('s3Key')
            print(f"FOUND s3Key: {s3_key}")
        except:
            s3_key = None

        if not s3_key:
            s3_key = f"uploads/{user_id}/contract-{contract_id}.pdf"
            print(f"FALLBACK s3Key: {s3_key}")
            
        edited_key = s3_key.replace('.pdf', '_edited.txt')
        print(f"SAVING TO: {edited_key}")
        
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=edited_key,
            Body=full_edited_text.encode('utf-8'),
            ContentType='text/plain; charset=utf-8'
        )
        
        table.update_item(
            Key={'userId': user_id, 'contractId': contract_id},
            UpdateExpression='SET lastEditedAt = :ts, editedVersion = :v, editsCount = :c',
            ExpressionAttributeValues={':ts': timestamp, ':v': edited_key, ':c': len(edited_clauses or {})}
        )
        
        print(f"SUCCESS: Saved to {edited_key}")
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'success': True, 'editedKey': edited_key})}
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': str(e)})}