import json
import boto3

cognito = boto3.client('cognito-idp')

# Your Cognito User Pool ID - UPDATE THIS
USER_POOL_ID = 'us-east-1_rwsncOnh1'

def lambda_handler(event, context):
    """
    Enable User - Admin Only
    
    Re-enables a disabled user in Cognito.
    
    POST body:
    - username: The user's Cognito username (sub or email)
    """
    try:
        # --- SECURITY: Verify Admin Group ---
        claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
        groups = claims.get('cognito:groups', '')
        
        if 'Admins' not in str(groups):
            return {
                'statusCode': 403,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'Admin access required'})
            }
        
        # --- Parse request ---
        body = json.loads(event.get('body', '{}'))
        username = body.get('username')
        
        if not username:
            return {
                'statusCode': 400,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'Username is required'})
            }
        
        # --- Enable the user ---
        try:
            cognito.admin_enable_user(
                UserPoolId=USER_POOL_ID,
                Username=username
            )
        except cognito.exceptions.UserNotFoundException:
            return {
                'statusCode': 404,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'User not found'})
            }
        
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps({
                'success': True,
                'message': f'User {username} has been enabled'
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)})
        }


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    }
