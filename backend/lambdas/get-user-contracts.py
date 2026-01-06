"""
=============================================================================
LAMBDA: get-user-contracts
Retrieves all contracts belonging to the authenticated user
=============================================================================

Trigger: API Gateway (GET /contracts)
Input: None (userId extracted from JWT)
Output: List of contract metadata (fileName, uploadDate, status, etc.)

DynamoDB Tables:
  - RentGuard-Contracts: Query by userId (partition key)

Security:
  - Extracts userId from JWT claims (Cognito authorizer)
  - Users can only see their own contracts

=============================================================================
"""

# =============================================================================
# IMPORTS
# =============================================================================

import json
import boto3
from boto3.dynamodb.conditions import Key

# =============================================================================
# CONFIGURATION
# =============================================================================

TABLE_NAME = 'RentGuard-Contracts'

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)

# Standard CORS headers for API Gateway responses
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,GET"
}

# =============================================================================
# MAIN HANDLER
# =============================================================================

def lambda_handler(event, context):
    """
    Main Lambda entry point - fetches all contracts for the authenticated user.
    
    Args:
        event: API Gateway event with requestContext containing JWT claims
        context: AWS Lambda context object
    
    Returns:
        dict: API Gateway response with list of contracts
    """
    try:
        # 1. Extract userId from JWT token claims (security)
        claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
        user_id = claims.get('sub')
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': CORS_HEADERS,
                'body': json.dumps({"error": "Unauthorized - no valid user identity"})
            }

        print(f"Fetching contracts for user: {user_id}")

        # 2. Query contracts for this user only
        response = table.query(
            KeyConditionExpression=Key('userId').eq(user_id)
        )
        
        items = response.get('Items', [])
        print(f"Found {len(items)} contracts")

        # 3. Return the contracts list
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps(items, ensure_ascii=False, default=str)
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {"Access-Control-Allow-Origin": "*"},
            'body': json.dumps(f"Database Error: {str(e)}")
        }