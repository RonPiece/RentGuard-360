"""
=============================================================================
LAMBDA: get-contract-chat-history
Returns persisted chat history for a specific contract owned by the user.
=============================================================================

Trigger: API Gateway (GET /contract-chat/history)
Input: Query params { contractId, limit? }
Output: { items: [...] }

Security:
  - Requires Cognito-authenticated request
  - Verifies contract ownership via analysis table
=============================================================================
"""

import json
import os
import boto3
from decimal import Decimal

ANALYSIS_TABLE = os.environ.get("ANALYSIS_TABLE", "RentGuard-Analysis")
CHAT_HISTORY_TABLE = os.environ.get("CHAT_HISTORY_TABLE", "RentGuard-ContractChatHistory")
DEFAULT_LIMIT = 30
MAX_LIMIT = 100
CODE_VERSION = "history-v3-decimal-safe"


dynamodb = boto3.resource("dynamodb")
analysis_table = dynamodb.Table(ANALYSIS_TABLE)
chat_table = dynamodb.Table(CHAT_HISTORY_TABLE)

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,GET",
}


def _response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(_to_json_safe(body), ensure_ascii=False),
    }


def _to_json_safe(value):
    if isinstance(value, Decimal):
        # Keep integers as int, otherwise use float for JSON compatibility.
        if value % 1 == 0:
            return int(value)
        return float(value)

    if isinstance(value, dict):
        return {k: _to_json_safe(v) for k, v in value.items()}

    if isinstance(value, list):
        return [_to_json_safe(v) for v in value]

    return value


def _extract_user_id(event):
    authorizer = event.get("requestContext", {}).get("authorizer", {}) or {}

    claims = authorizer.get("claims") or {}
    if isinstance(claims, dict):
        user_id = claims.get("sub") or claims.get("cognito:username") or claims.get("username")
        if user_id:
            return user_id

    jwt_claims = (authorizer.get("jwt") or {}).get("claims") or {}
    if isinstance(jwt_claims, dict):
        user_id = jwt_claims.get("sub") or jwt_claims.get("cognito:username") or jwt_claims.get("username")
        if user_id:
            return user_id

    principal_id = authorizer.get("principalId")
    if isinstance(principal_id, str) and principal_id.strip():
        return principal_id.strip()

    return None


def _parse_limit(raw):
    try:
        parsed = int(raw)
        if parsed <= 0:
            return DEFAULT_LIMIT
        return min(parsed, MAX_LIMIT)
    except Exception:
        return DEFAULT_LIMIT


def _verify_ownership(user_id, contract_id):
    item = analysis_table.get_item(Key={"contractId": contract_id}).get("Item")
    if not item:
        return None, _response(404, {"error": "Contract analysis not found"})

    stored_user_id = item.get("userId")
    if stored_user_id and stored_user_id != user_id:
        return None, _response(403, {"error": "Access denied - contract belongs to another user"})

    return item, None


def lambda_handler(event, context):
    if event.get("httpMethod") == "OPTIONS":
        return _response(200, {"ok": True})

    try:
        print(f"get-contract-chat-history code_version={CODE_VERSION}")

        user_id = _extract_user_id(event)
        if not user_id:
            authorizer = event.get("requestContext", {}).get("authorizer", {}) or {}
            print(
                "get-contract-chat-history unauthorized: "
                f"authorizer_keys={list(authorizer.keys())}"
            )
            return _response(401, {"error": "Unauthorized"})

        params = event.get("queryStringParameters") or {}
        contract_id = (params.get("contractId") or "").strip()
        if not contract_id:
            return _response(400, {"error": "Missing contractId"})

        limit = _parse_limit(params.get("limit"))

        _, ownership_error = _verify_ownership(user_id, contract_id)
        if ownership_error:
            return ownership_error

        prefix = f"{contract_id}#"
        result = chat_table.query(
            KeyConditionExpression="userId = :uid AND begins_with(threadKey, :prefix)",
            ExpressionAttributeValues={
                ":uid": user_id,
                ":prefix": prefix,
            },
            ScanIndexForward=False,
            Limit=limit,
        )

        items = result.get("Items", [])
        normalized = []
        for item in reversed(items):
            normalized.append(
                {
                    "messageId": item.get("messageId"),
                    "contractId": item.get("contractId"),
                    "question": item.get("question", ""),
                    "answer": item.get("answer", ""),
                    "createdAt": item.get("createdAt", ""),
                    "meta": _to_json_safe(item.get("meta", {})),
                }
            )

        return _response(200, {"items": normalized})

    except Exception as exc:
        print(f"get-contract-chat-history error: {exc}")
        return _response(500, {"error": "Internal server error"})
