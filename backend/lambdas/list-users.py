import json
import boto3

cognito = boto3.client('cognito-idp')

# Your Cognito User Pool ID - UPDATE THIS
USER_POOL_ID = 'us-east-1_rwsncOnh1'

def lambda_handler(event, context):
    """
    List All Users - Admin Only
    
    Returns list of users with:
    - Username (sub)
    - Email
    - Name
    - Status (CONFIRMED, FORCE_CHANGE_PASSWORD, etc.)
    - Enabled (true/false)
    - Created date
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
        
        # --- Get query parameters ---
        params = event.get('queryStringParameters') or {}
        search_query = params.get('search', '').lower()
        limit = int(params.get('limit', 50))
        
        # --- List Users from Cognito ---
        users = []
        paginator = cognito.get_paginator('list_users')
        
        for page in paginator.paginate(UserPoolId=USER_POOL_ID, Limit=min(limit, 60)):
            for user in page['Users']:
                user_data = {
                    'username': user['Username'],
                    'email': get_attribute(user, 'email'),
                    'name': get_attribute(user, 'name'),
                    'status': user['UserStatus'],
                    'enabled': user['Enabled'],
                    'createdAt': user['UserCreateDate'].isoformat() if user.get('UserCreateDate') else None
                }
                
                # Apply search filter
                if search_query:
                    searchable = f"{user_data['email']} {user_data['name']}".lower()
                    if search_query not in searchable:
                        continue
                
                users.append(user_data)
                
                if len(users) >= limit:
                    break
            
            if len(users) >= limit:
                break
        
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps({
                'users': users,
                'count': len(users)
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


def get_attribute(user, attr_name):
    """Get user attribute from Cognito user object."""
    for attr in user.get('Attributes', []):
        if attr['Name'] == attr_name:
            return attr['Value']
    return None


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
    }
