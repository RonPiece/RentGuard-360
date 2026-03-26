"""
=============================================================================
LAMBDA: list-users
Lists all users from Cognito User Pool (admin only)
=============================================================================

Trigger: API Gateway (GET /admin/users)
Input: Optional query parameters: search, limit
Output: List of users with email, name, status, enabled, createdAt

External Services:
  - Cognito: List users with pagination

Security:
  - Requires 'Admins' group membership in Cognito
  - Returns 403 if user is not an admin

=============================================================================
"""

# =============================================================================
# IMPORTS
# =============================================================================

import json
import os
import boto3
import traceback
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

# =============================================================================
# CONFIGURATION
# =============================================================================

cognito = boto3.client('cognito-idp')
STRIPE_API_URL = (os.environ.get('STRIPE_API_URL') or '').rstrip('/')
PAYMENT_INTERNAL_API_KEY = os.environ.get('PAYMENT_INTERNAL_API_KEY', '')

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def get_attribute(user, attr_name):
    """
    Get a specific attribute from Cognito user object.
    
    Args:
        user: Cognito user object
        attr_name: Name of the attribute to retrieve
    
    Returns:
        str: Attribute value or None if not found
    """
    for attr in user.get('Attributes', []):
        if attr['Name'] == attr_name:
            return attr['Value']
    return None


def cors_headers():
    """Returns standard CORS headers for API Gateway responses."""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
    }


def user_in_admin_group(raw_groups):
    """Safely check whether Cognito groups include exactly 'Admins'."""
    if isinstance(raw_groups, list):
        return any(str(group).strip() == 'Admins' for group in raw_groups)

    groups_text = str(raw_groups or '').strip()
    if not groups_text:
        return False

    try:
        parsed = json.loads(groups_text)
        if isinstance(parsed, list):
            return any(str(group).strip() == 'Admins' for group in parsed)
    except Exception:
        pass

    normalized = groups_text.replace('[', '').replace(']', '').replace('"', '')
    parts = [part.strip() for part in normalized.split(',') if part.strip()]
    return 'Admins' in parts


def parse_auth_provider(user):
    identities_raw = get_attribute(user, 'identities')
    if identities_raw:
        try:
            identities = json.loads(identities_raw)
            if isinstance(identities, list) and identities:
                provider = str((identities[0] or {}).get('providerName') or '').strip()
                if provider.lower() == 'google':
                    return 'Google'
                if provider.lower() == 'facebook':
                    return 'Facebook'
                return 'Email'
        except Exception:
            pass

    username = str(user.get('Username') or '')
    if '_' in username:
        prefix = username.split('_', 1)[0].lower()
        if prefix == 'google':
            return 'Google'
        if prefix == 'facebook':
            return 'Facebook'

    return 'Email'


def fetch_social_group_users(user_pool_id):
    results = []

    try:
        groups_resp = cognito.list_groups(UserPoolId=user_pool_id, Limit=60)
        groups = groups_resp.get('Groups', [])

        social_group_names = []
        for group in groups:
            name = str(group.get('GroupName') or '')
            lowered = name.lower()
            if lowered.endswith('_google') or lowered.endswith('_facebook'):
                social_group_names.append(name)

        for group_name in social_group_names:
            next_token = None
            while True:
                kwargs = {
                    'UserPoolId': user_pool_id,
                    'GroupName': group_name,
                    'Limit': 60,
                }
                if next_token:
                    kwargs['NextToken'] = next_token

                page = cognito.list_users_in_group(**kwargs)
                results.extend(page.get('Users', []))

                next_token = page.get('NextToken')
                if not next_token:
                    break
    except Exception as e:
        print(f"Warning: failed to load social group users: {e}")

    return results


def fetch_subscriptions_map(user_ids):
    if not user_ids or not STRIPE_API_URL or not PAYMENT_INTERNAL_API_KEY:
        return {}

    endpoint = f"{STRIPE_API_URL}/api/payments/subscriptions-internal"
    payload = json.dumps({'userIds': user_ids}).encode('utf-8')
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Internal-Api-Key': PAYMENT_INTERNAL_API_KEY,
    }
    request = Request(endpoint, data=payload, method='POST', headers=headers)

    try:
        with urlopen(request, timeout=6) as response:
            raw = response.read().decode('utf-8')
            data = json.loads(raw) if raw else {}
            subscriptions = data.get('subscriptions', [])
            out = {}
            for item in subscriptions:
                key = str(item.get('userId') or '').strip()
                if key:
                    out[key] = item
            return out
    except HTTPError as e:
        print(f"subscriptions-internal HTTPError: {e.code}")
        return {}
    except URLError as e:
        print(f"subscriptions-internal URLError: {e.reason}")
        return {}
    except Exception as e:
        print(f"subscriptions-internal error: {e}")
        return {}

# =============================================================================
# MAIN HANDLER
# =============================================================================

def lambda_handler(event, context):
    """
    Main Lambda entry point - lists all users from Cognito.
    
    Query Parameters:
        - search (optional): Filter users by email or name
        - limit (optional): Maximum number of users to return (default: 50)
    
    Args:
        event: API Gateway event with authorization claims
        context: AWS Lambda context object
    
    Returns:
        dict: API Gateway response with list of users
    """
    try:
        user_pool_id = os.environ.get('USER_POOL_ID')
        if not user_pool_id:
            return {
                'statusCode': 500,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'USER_POOL_ID environment variable is not set'})
            }

        # 1. Verify admin group membership
        claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
        groups = claims.get('cognito:groups', '')

        if not user_in_admin_group(groups):
            return {
                'statusCode': 403,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'Admin access required'})
            }
        
        # 2. Get query parameters
        params = event.get('queryStringParameters') or {}
        search_query = params.get('search', '').lower()
        limit = int(params.get('limit', 50))
        
        # 3. List users from Cognito with pagination
        users = []
        cognito_keys = []
        seen_usernames = set()
        paginator = cognito.get_paginator('list_users')
        
        for page in paginator.paginate(UserPoolId=user_pool_id, Limit=min(limit, 60)):
            for user in page['Users']:
                username = user['Username']
                if username in seen_usernames:
                    continue

                email_verified = str(get_attribute(user, 'email_verified') or '').lower() == 'true'
                cognito_sub = get_attribute(user, 'sub')
                provider = parse_auth_provider(user)

                user_data = {
                    'username': username,
                    'sub': cognito_sub,
                    'email': get_attribute(user, 'email'),
                    'name': get_attribute(user, 'name'),
                    'emailVerified': email_verified,
                    'authProvider': provider,
                    'status': user['UserStatus'],
                    'enabled': user['Enabled'],
                    'createdAt': user['UserCreateDate'].isoformat() if user.get('UserCreateDate') else None
                }
                
                # Apply search filter if provided
                if search_query:
                    searchable = f"{user_data['email']} {user_data['name']}".lower()
                    if search_query not in searchable:
                        continue
                
                users.append(user_data)
                seen_usernames.add(username)

                if cognito_sub:
                    cognito_keys.append(cognito_sub)
                if user['Username']:
                    cognito_keys.append(user['Username'])
                
                if len(users) >= limit:
                    break
            
            if len(users) >= limit:
                break

        # 3.1 Best-effort merge for social users from Cognito social groups.
        if len(users) < limit:
            for user in fetch_social_group_users(user_pool_id):
                username = user.get('Username')
                if not username or username in seen_usernames:
                    continue

                email_verified = str(get_attribute(user, 'email_verified') or '').lower() == 'true'
                cognito_sub = get_attribute(user, 'sub')
                provider = parse_auth_provider(user)

                user_data = {
                    'username': username,
                    'sub': cognito_sub,
                    'email': get_attribute(user, 'email'),
                    'name': get_attribute(user, 'name'),
                    'emailVerified': email_verified,
                    'authProvider': provider,
                    'status': user.get('UserStatus'),
                    'enabled': user.get('Enabled'),
                    'createdAt': user['UserCreateDate'].isoformat() if user.get('UserCreateDate') else None
                }

                if search_query:
                    searchable = f"{user_data['email']} {user_data['name']}".lower()
                    if search_query not in searchable:
                        continue

                users.append(user_data)
                seen_usernames.add(username)

                if cognito_sub:
                    cognito_keys.append(cognito_sub)
                cognito_keys.append(username)

                if len(users) >= limit:
                    break

        # 4. Enrich users with package/subscription status when subscription service is configured
        subscriptions_map = fetch_subscriptions_map(cognito_keys)
        for user_data in users:
            lookup_keys = [str(user_data.get('sub') or ''), str(user_data.get('username') or '')]
            subscription = None
            for key in lookup_keys:
                if key and key in subscriptions_map:
                    subscription = subscriptions_map[key]
                    break

            if subscription:
                user_data['packageId'] = subscription.get('packageId')
                user_data['packageName'] = subscription.get('packageName')
                user_data['scansRemaining'] = subscription.get('scansRemaining')
                user_data['isUnlimited'] = bool(subscription.get('isUnlimited'))
                user_data['packageExpired'] = bool(subscription.get('isExpired'))
            else:
                user_data['packageId'] = None
                user_data['packageName'] = None
                user_data['scansRemaining'] = None
                user_data['isUnlimited'] = False
                user_data['packageExpired'] = False
        
        # 5. Return users list
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
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)})
        }
