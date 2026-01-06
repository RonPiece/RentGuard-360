"""
=============================================================================
LAMBDA: error-handler
Handles Step Functions errors and marks contracts as failed
=============================================================================

Trigger: Step Functions (Catch block on any step failure)
Input: Error info from Step Functions (Error, Cause, contractId)
Output: Success status (always succeeds to not break Step Function)

DynamoDB Tables:
  - RentGuard-Analysis: Update contract status to FAILED

Notes:
  - Should never fail itself to avoid cascading failures
  - Logs error details for debugging

=============================================================================
"""

# =============================================================================
# IMPORTS
# =============================================================================

import json
import boto3
import datetime

# =============================================================================
# CONFIGURATION
# =============================================================================

TABLE_NAME = 'RentGuard-Analysis'

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)

# =============================================================================
# MAIN HANDLER
# =============================================================================

def lambda_handler(event, context):
    """
    Main Lambda entry point - handles Step Functions errors.
    
    Marks the contract as FAILED in DynamoDB with error details.
    Always returns success to avoid breaking the Step Function.
    
    Args:
        event: Step Functions error event with Error, Cause, contractId
        context: AWS Lambda context object
    
    Returns:
        dict: Success status
    """
    try:
        print("Error Handler Triggered:", json.dumps(event))
        
        # 1. Extract error information
        contract_id = event.get('contractId') or event.get('key')
        error_message = event.get('Error', 'Unknown Error')
        error_details = event.get('Cause', 'No details provided')

        # 2. Update contract status to FAILED
        if contract_id:
            table.put_item(Item={
                'contractId': contract_id,
                'timestamp': str(datetime.datetime.now()),
                'status': 'FAILED',
                'error': error_message,
                'details': error_details
            })
            print(f"Marked contract {contract_id} as FAILED")
        
        return {
            'statusCode': 200,
            'body': json.dumps("Error handled and logged")
        }

    except Exception as e:
        print(f"Critical Error in Error Handler: {str(e)}")
        # Always return success to not cascade failures
        return {
            'statusCode': 200,
            'body': "Error handler finished with internal errors"
        }