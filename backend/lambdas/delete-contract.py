import json
import boto3

# AWS Clients
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

# Configuration
BUCKET_NAME = 'rentguard-contracts-moty-101225'
contracts_table = dynamodb.Table('RentGuard-Contracts')
analysis_table = dynamodb.Table('RentGuard-Analysis')

def lambda_handler(event, context):
    """
    Delete a contract from S3 and DynamoDB
    
    Query Parameters:
    - contractId: The S3 key of the contract (e.g., uploads/user123/contract-uuid.pdf)
    - userId: The user's ID for DynamoDB lookup
    """
    
    # CORS Headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
    }
    
    # Handle CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    try:
        # 1. Get parameters - handle both proxy and non-proxy integration
        params = event.get('queryStringParameters') or {}
        
        # Also try to get from path parameters or body
        if not params:
            params = event.get('pathParameters') or {}
        
        # For non-proxy integration, params might be at root level
        contract_id = params.get('contractId') or event.get('contractId')
        user_id = params.get('userId') or event.get('userId')
        
        print(f"Event received: {json.dumps(event)}")
        print(f"Extracted contractId: {contract_id}, userId: {user_id}")
        
        if not contract_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Missing contractId parameter'})
            }
        
        print(f"Deleting contract: {contract_id} for user: {user_id}")
        
        # 2. Delete from S3
        try:
            s3.delete_object(Bucket=BUCKET_NAME, Key=contract_id)
            print(f"Deleted from S3: {contract_id}")
        except Exception as e:
            print(f"Warning: S3 delete failed: {e}")
        
        # 3. Delete from RentGuard-Contracts table
        if user_id:
            try:
                contracts_table.delete_item(
                    Key={
                        'userId': user_id,
                        'contractId': contract_id
                    }
                )
                print(f"Deleted from Contracts table")
            except Exception as e:
                print(f"Warning: Contracts table delete failed: {e}")
        
        # 4. Delete from RentGuard-Analysis table
        try:
            analysis_table.delete_item(
                Key={'contractId': contract_id}
            )
            print(f"Deleted from Analysis table")
        except Exception as e:
            print(f"Warning: Analysis table delete failed: {e}")
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'message': f'Contract {contract_id} deleted successfully'
            })
        }
        
    except Exception as e:
        print(f"Error deleting contract: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
