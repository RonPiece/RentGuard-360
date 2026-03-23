"""
=============================================================================
LAMBDA: create-share-link
Creates a secure expiring share token for a contract
=============================================================================

Trigger: API Gateway (GET/POST/DELETE /contracts/share-link)
Input: JSON body with contractId and optional expiresInDays
Output: Share path containing opaque token (POST) or revocation confirmation (DELETE)

DynamoDB Tables:
  - RentGuard-Contracts: Update share token hash + expiration for user's contract

Security:
  - Requires Cognito authentication
  - User can create link only for their own contract

=============================================================================
"""

import json
import os
import boto3
import hashlib
import secrets
import time
from datetime import datetime

CONTRACTS_TABLE_NAME = os.environ.get('CONTRACTS_TABLE', 'RentGuard-Contracts')
dynamodb = boto3.resource('dynamodb')
contracts_table = dynamodb.Table(CONTRACTS_TABLE_NAME)

CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS'
}


def _clamp_days(days_value):
    try:
        days = int(days_value)
    except Exception:
        days = 7
    return max(1, min(30, days))


def _token_hash(token):
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def _parse_body(event):
    body = event.get('body') or '{}'
    if isinstance(body, str):
        return json.loads(body)
    if isinstance(body, dict):
        return body
    return {}


def lambda_handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': ''
        }

    try:
        claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
        user_id = claims.get('sub')
        if not user_id:
            return {
                'statusCode': 401,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Unauthorized'})
            }

        method = (event.get('httpMethod') or 'POST').upper()
        body = _parse_body(event)

        contract_id = (body.get('contractId') or '').strip()
        query_contract_id = ((event.get('queryStringParameters') or {}).get('contractId') or '').strip()
        if not contract_id and query_contract_id:
            contract_id = query_contract_id

        if not contract_id:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'contractId is required'})
            }

        # Verify ownership before issuing share token.
        current_item = contracts_table.get_item(Key={'userId': user_id, 'contractId': contract_id}).get('Item')
        if not current_item:
            return {
                'statusCode': 404,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Contract not found'})
            }

        updated_at = datetime.utcnow().isoformat()

        now_epoch = int(time.time())

        if method == 'GET':
            share_enabled = bool(current_item.get('shareEnabled'))
            share_token = current_item.get('shareToken')
            expires_at = int(current_item.get('shareTokenExpiresAt') or 0)

            if share_enabled and share_token and expires_at > now_epoch:
                return {
                    'statusCode': 200,
                    'headers': CORS_HEADERS,
                    'body': json.dumps({
                        'success': True,
                        'contractId': contract_id,
                        'active': True,
                        'shareToken': share_token,
                        'expiresAt': expires_at
                    })
                }

            # Best-effort cleanup for stale share state.
            if share_enabled or current_item.get('shareTokenHash') or current_item.get('shareToken'):
                contracts_table.update_item(
                    Key={'userId': user_id, 'contractId': contract_id},
                    UpdateExpression='SET shareEnabled = :disabled, shareUpdatedAt = :ts REMOVE shareTokenHash, shareTokenExpiresAt, shareToken',
                    ExpressionAttributeValues={
                        ':disabled': False,
                        ':ts': updated_at
                    }
                )

            return {
                'statusCode': 200,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'success': True,
                    'contractId': contract_id,
                    'active': False
                })
            }

        if method == 'DELETE':
            contracts_table.update_item(
                Key={'userId': user_id, 'contractId': contract_id},
                UpdateExpression='SET shareEnabled = :disabled, shareUpdatedAt = :ts REMOVE shareTokenHash, shareTokenExpiresAt, shareToken',
                ExpressionAttributeValues={
                    ':disabled': False,
                    ':ts': updated_at
                }
            )

            return {
                'statusCode': 200,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'success': True,
                    'contractId': contract_id,
                    'revoked': True
                })
            }

        if method != 'POST':
            return {
                'statusCode': 405,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': f'Method {method} is not allowed'})
            }

        # Reuse active link instead of issuing a new token every click.
        existing_enabled = bool(current_item.get('shareEnabled'))
        existing_token = current_item.get('shareToken')
        existing_expires_at = int(current_item.get('shareTokenExpiresAt') or 0)
        if existing_enabled and existing_token and existing_expires_at > now_epoch:
            return {
                'statusCode': 200,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'success': True,
                    'contractId': contract_id,
                    'shareToken': existing_token,
                    'expiresAt': existing_expires_at,
                    'expiresInDays': max(1, int((existing_expires_at - now_epoch + 86399) / 86400)),
                    'reused': True
                })
            }

        expires_in_days = _clamp_days(body.get('expiresInDays', 7))
        token = secrets.token_urlsafe(32)
        token_hash = _token_hash(token)
        expires_epoch = now_epoch + (expires_in_days * 24 * 60 * 60)

        contracts_table.update_item(
            Key={'userId': user_id, 'contractId': contract_id},
            UpdateExpression='SET shareEnabled = :enabled, shareToken = :token, shareTokenHash = :hash, shareTokenExpiresAt = :exp, shareUpdatedAt = :ts',
            ExpressionAttributeValues={
                ':enabled': True,
                ':token': token,
                ':hash': token_hash,
                ':exp': expires_epoch,
                ':ts': updated_at
            }
        )

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'success': True,
                'contractId': contract_id,
                'shareToken': token,
                'expiresAt': expires_epoch,
                'expiresInDays': expires_in_days
            })
        }

    except Exception as exc:
        print(f'Error creating share link: {str(exc)}')
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': str(exc)})
        }
