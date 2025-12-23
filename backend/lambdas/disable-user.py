import json
import boto3

cognito = boto3.client('cognito-idp')
ses = boto3.client('ses')

# Your Cognito User Pool ID - UPDATE THIS
USER_POOL_ID = 'us-east-1_rwsncOnh1'
# Your verified SES sender email
SENDER_EMAIL = 'noreply@rentguard360.com'

def lambda_handler(event, context):
    """
    Disable User - Admin Only
    
    Disables a user in Cognito and sends notification email.
    
    POST body:
    - username: The user's Cognito username (sub or email)
    - reason: Optional reason for disabling
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
        reason = body.get('reason', 'Policy violation')
        
        if not username:
            return {
                'statusCode': 400,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'Username is required'})
            }
        
        # --- Get user email before disabling ---
        user_email = None
        try:
            user_response = cognito.admin_get_user(
                UserPoolId=USER_POOL_ID,
                Username=username
            )
            for attr in user_response.get('UserAttributes', []):
                if attr['Name'] == 'email':
                    user_email = attr['Value']
                    break
        except cognito.exceptions.UserNotFoundException:
            return {
                'statusCode': 404,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'User not found'})
            }
        
        # --- Disable the user ---
        cognito.admin_disable_user(
            UserPoolId=USER_POOL_ID,
            Username=username
        )
        
        # --- Send notification email ---
        if user_email:
            try:
                ses.send_email(
                    Source=SENDER_EMAIL,
                    Destination={'ToAddresses': [user_email]},
                    Message={
                        'Subject': {
                            'Data': 'RentGuard 360 - Account Disabled',
                            'Charset': 'UTF-8'
                        },
                        'Body': {
                            'Html': {
                                'Data': f'''
                                <html>
                                <body dir="rtl" style="font-family: Arial, sans-serif;">
                                    <h2>החשבון שלך הושעה</h2>
                                    <p>שלום,</p>
                                    <p>החשבון שלך ב-RentGuard 360 הושעה.</p>
                                    <p><strong>סיבה:</strong> {reason}</p>
                                    <p>אם אתה סבור שזו טעות, אנא פנה לתמיכה.</p>
                                    <p>בברכה,<br>צוות RentGuard 360</p>
                                </body>
                                </html>
                                ''',
                                'Charset': 'UTF-8'
                            }
                        }
                    }
                )
            except Exception as e:
                print(f"Email send failed: {e}")
        
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps({
                'success': True,
                'message': f'User {username} has been disabled',
                'emailSent': user_email is not None
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
