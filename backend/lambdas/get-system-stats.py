import json
import boto3
from datetime import datetime, timedelta
from decimal import Decimal

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
cognito = boto3.client('cognito-idp')

contracts_table = dynamodb.Table('RentGuard-Contracts')
analysis_table = dynamodb.Table('RentGuard-Analysis')

# Your Cognito User Pool ID - UPDATE THIS
USER_POOL_ID = 'us-east-1_rwsncOnh1'  # Get from environment or hardcode

def lambda_handler(event, context):
    """
    Get System Statistics - Admin Only
    
    Returns:
    - Total contracts, analyzed, pending, failed counts
    - Average risk score
    - Total users
    - Active users (last 30 days)
    """
    try:
        # --- SECURITY: Verify Admin Group ---
        # Debug: Log the full event structure
        print(f"Full event keys: {list(event.keys())}")
        print(f"Full requestContext: {event.get('requestContext', {})}")
        
        # Try multiple paths for authorizer claims (different API Gateway configurations)
        claims = {}
        
        # Path 1: Standard Cognito Authorizer
        if 'requestContext' in event:
            auth = event['requestContext'].get('authorizer', {})
            print(f"Authorizer structure: {auth}")
            claims = auth.get('claims', auth)  # Some configs put claims directly in authorizer
        
        # Path 2: JWT Authorizer (HTTP API)
        if not claims and 'requestContext' in event:
            jwt_claims = event['requestContext'].get('authorizer', {}).get('jwt', {}).get('claims', {})
            if jwt_claims:
                claims = jwt_claims
        
        print(f"Claims found: {claims}")
        groups = claims.get('cognito:groups', '')
        print(f"Groups value: {groups}, type: {type(groups)}")
        
        # Handle groups - could be string "[Admins]" or list ["Admins"]
        is_admin = False
        if isinstance(groups, list):
            is_admin = 'Admins' in groups
        elif isinstance(groups, str) and groups:
            is_admin = 'Admins' in groups
        
        print(f"Is admin: {is_admin}")
        
        if not is_admin:
            return {
                'statusCode': 403,
                'headers': cors_headers(),
                'body': json.dumps({
                    'error': 'Admin access required',
                    'debug': {
                        'groups_found': str(groups),
                        'claims_keys': list(claims.keys()) if claims else []
                    }
                })
            }
        
        # --- Scan Contracts Table ---
        contracts = scan_all_items(contracts_table)
        
        total_contracts = len(contracts)
        analyzed = sum(1 for c in contracts if c.get('status') == 'analyzed')
        pending = sum(1 for c in contracts if c.get('status') in ['pending', 'uploaded', 'processing'])
        failed = sum(1 for c in contracts if c.get('status') == 'failed')
        
        # Average risk score
        risk_scores = [float(c.get('riskScore', 0)) for c in contracts if c.get('riskScore')]
        avg_risk_score = round(sum(risk_scores) / len(risk_scores), 1) if risk_scores else 0
        
        # Average analysis time (from uploadDate to analyzedDate)
        analysis_times = []
        for c in contracts:
            if c.get('uploadDate') and c.get('analyzedDate'):
                try:
                    upload = datetime.fromisoformat(c['uploadDate'].replace('Z', '+00:00'))
                    analyzed_date = datetime.fromisoformat(c['analyzedDate'].replace('Z', '+00:00'))
                    diff_seconds = (analyzed_date - upload).total_seconds()
                    if diff_seconds > 0:
                        analysis_times.append(diff_seconds)
                except:
                    pass
        avg_analysis_time = round(sum(analysis_times) / len(analysis_times), 1) if analysis_times else 0
        
        # --- Cognito User Stats ---
        user_count = 0
        active_users_30d = set()
        
        try:
            # Count total users
            paginator = cognito.get_paginator('list_users')
            for page in paginator.paginate(UserPoolId=USER_POOL_ID):
                user_count += len(page['Users'])
        except Exception as e:
            print(f"Cognito error: {e}")
        
        # Active users = unique userIds with contracts in last 30 days
        thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
        for c in contracts:
            if c.get('uploadDate', '') >= thirty_days_ago:
                active_users_30d.add(c.get('userId'))
        
        # --- Contracts by Day (last 30 days) for Line Chart ---
        contracts_by_day = {}
        thirty_days_ago_date = (datetime.utcnow() - timedelta(days=30)).date()
        
        for c in contracts:
            if c.get('analyzedDate'):
                try:
                    analyzed_date = datetime.fromisoformat(c['analyzedDate'].replace('Z', '+00:00')).date()
                    if analyzed_date >= thirty_days_ago_date:
                        date_str = analyzed_date.isoformat()
                        contracts_by_day[date_str] = contracts_by_day.get(date_str, 0) + 1
                except:
                    pass
        
        # Fill in missing days with 0 and sort by date
        current_date = thirty_days_ago_date
        today = datetime.utcnow().date()
        time_series = []
        while current_date <= today:
            date_str = current_date.isoformat()
            time_series.append({
                'date': date_str,
                'analyzed': contracts_by_day.get(date_str, 0)
            })
            current_date += timedelta(days=1)
        
        # --- Build Response ---
        stats = {
            'contracts': {
                'total': total_contracts,
                'analyzed': analyzed,
                'pending': pending,
                'failed': failed
            },
            'analysis': {
                'avgRiskScore': avg_risk_score,
                'avgAnalysisTimeSeconds': avg_analysis_time
            },
            'users': {
                'total': user_count,
                'activeLast30Days': len(active_users_30d)
            },
            'contractsByDay': time_series,
            'generatedAt': datetime.utcnow().isoformat()
        }
        
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps(stats, cls=DecimalEncoder)
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


def scan_all_items(table):
    """Scan entire DynamoDB table (handles pagination)."""
    items = []
    response = table.scan()
    items.extend(response.get('Items', []))
    
    while 'LastEvaluatedKey' in response:
        response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        items.extend(response.get('Items', []))
    
    return items


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
    }


class DecimalEncoder(json.JSONEncoder):
    """Handle DynamoDB Decimal types."""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)
