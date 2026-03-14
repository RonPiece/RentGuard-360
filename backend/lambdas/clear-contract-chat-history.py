"""
=============================================================================
LAMBDA: clear-contract-chat-history
Deletes persisted chat history for a specific contract owned by the user.
=============================================================================

Trigger: API Gateway (DELETE /contract-chat/history)
Input: Query params { contractId }
Output: { clearedCount }

Security:
  - Requires Cognito-authenticated request
  - Verifies contract ownership via analysis table
=============================================================================
"""

import json
import os
import boto3

ANALYSIS_TABLE = os.environ.get("ANALYSIS_TABLE", "RentGuard-Analysis")
CHAT_HISTORY_TABLE = os.environ.get("CHAT_HISTORY_TABLE", "RentGuard-ContractChatHistory")


dynamodb = boto3.resource("dynamodb")
analysis_table = dynamodb.Table(ANALYSIS_TABLE)
chat_table = dynamodb.Table(CHAT_HISTORY_TABLE)

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,DELETE",
}


def _response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, ensure_ascii=False),
    }


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


def _verify_ownership(user_id, contract_id):
    item = analysis_table.get_item(Key={"contractId": contract_id}).get("Item")
    if not item:
        return _response(404, {"error": "Contract analysis not found"})

    stored_user_id = item.get("userId")
    if stored_user_id and stored_user_id != user_id:
        return _response(403, {"error": "Access denied - contract belongs to another user"})

    return None


def lambda_handler(event, context):
    if event.get("httpMethod") == "OPTIONS":
        return _response(200, {"ok": True})

    try:
        user_id = _extract_user_id(event)
        if not user_id:
            authorizer = event.get("requestContext", {}).get("authorizer", {}) or {}
            print(
                "clear-contract-chat-history unauthorized: "
                f"authorizer_keys={list(authorizer.keys())}"
            )
            return _response(401, {"error": "Unauthorized"})

        params = event.get("queryStringParameters") or {}
        contract_id = (params.get("contractId") or "").strip()
        if not contract_id:
            return _response(400, {"error": "Missing contractId"})

        ownership_error = _verify_ownership(user_id, contract_id)
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
        )

        items = result.get("Items", [])
        with chat_table.batch_writer() as batch:
            for item in items:
                batch.delete_item(
                    Key={
                        "userId": item.get("userId"),
                        "threadKey": item.get("threadKey"),
                    }
                )

        return _response(200, {"clearedCount": len(items)})

    except Exception as exc:
        print(f"clear-contract-chat-history error: {exc}")
        return _response(500, {"error": "Internal server error"})
