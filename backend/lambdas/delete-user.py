import json
import boto3
import os

cognito = boto3.client('cognito-idp')

USER_POOL_ID = os.environ.get('USER_POOL_ID', 'us-east-1_rwsncOnh1')

def handler(event, context):
    """
    Delete a user from Cognito (admin only).
    This action is PERMANENT and cannot be undone.
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        username = body.get('username')
        
        if not username:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                },
                'body': json.dumps({'error': 'Username is required'})
            }
        
        # Delete user from Cognito
        cognito.admin_delete_user(
            UserPoolId=USER_POOL_ID,
            Username=username
        )
        
        print(f"User {username} deleted successfully")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            },
            'body': json.dumps({
                'message': f'User {username} deleted successfully',
                'username': username
            })
        }
        
    except cognito.exceptions.UserNotFoundException:
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            },
            'body': json.dumps({'error': 'User not found'})
        }
    except Exception as e:
        print(f"Error deleting user: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            },
            'body': json.dumps({'error': str(e)})
        }
