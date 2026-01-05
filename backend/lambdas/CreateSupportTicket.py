import json
import boto3
import uuid
import time
import logging
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# === Services ===
ses_client = boto3.client('ses', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

# === Configuration ===
TABLE_NAME = 'SupportTickets'
SENDER_EMAIL = "rentguard360@gmail.com"  # Verified sender email
SUPPORT_TEAM_EMAIL = "rentguard360@gmail.com"  # Verified recipient email

def lambda_handler(event, context):
    # CORS headers for frontend connection
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
    }

    if event['httpMethod'] == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    try:
        body = json.loads(event.get('body', '{}'))
        user_email = body.get('user_email')
        category = body.get('category', 'General')
        message_content = body.get('message')
        contract_id = body.get('contract_id', 'N/A')
        
        if not user_email or not message_content:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Missing email or message'})}

        # Generate unique ticket ID
        ticket_id = str(uuid.uuid4())
        timestamp = int(time.time())
        date_str = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(timestamp))

        # Save to DynamoDB
        table = dynamodb.Table(TABLE_NAME)
        item = {
            'ticketId': ticket_id,
            'userEmail': user_email,
            'category': category,
            'message': message_content,
            'contractId': contract_id,
            'status': 'OPEN',
            'createdAt': timestamp,
            'createdAtReadable': date_str
        }
        table.put_item(Item=item)

        # Send email to admin via SES - Beautiful branded design
        email_subject = f"�️ פנייה חדשה: {category} (מס' {ticket_id[:8]})"
        email_body = f"""
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🛡️ פנייה חדשה</h1>
            </div>
            <div style="padding: 30px; text-align: center;">
                <h2 style="color: #10b981; margin: 0 0 10px 0; font-size: 24px;">היי, התקבלה פנייה חדשה!</h2>
                <p style="color: #6b7280; margin: 0 0 25px 0; font-size: 14px;">מספר פנייה: {ticket_id[:8]}</p>
                
                <div style="background: #f9fafb; border-radius: 12px; padding: 20px; text-align: right; margin-bottom: 20px;">
                    <p style="margin: 8px 0;"><strong>מאת:</strong> {user_email}</p>
                    <p style="margin: 8px 0;"><strong>קטגוריה:</strong> {category}</p>
                    <p style="margin: 8px 0;"><strong>תוכן:</strong></p>
                    <p style="background: #ffffff; padding: 12px; border-radius: 8px; border-right: 3px solid #10b981;">{message_content}</p>
                </div>
                
                <p style="color: #6b7280; font-size: 13px;">לחץ "השב" כדי לענות ללקוח.</p>
            </div>
            <div style="text-align: center; padding: 20px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; margin: 0; font-size: 12px;">RentGuard Systems</p>
            </div>
        </div>
        """

        ses_client.send_email(
            Source=SENDER_EMAIL,
            Destination={'ToAddresses': [SUPPORT_TEAM_EMAIL]},
            Message={
                'Subject': {'Data': email_subject, 'Charset': 'UTF-8'},
                'Body': {'Html': {'Data': email_body, 'Charset': 'UTF-8'}}
            },
            ReplyToAddresses=[user_email]
        )

        # Send confirmation email to user - Beautiful branded design
        user_email_subject = f"✅ קיבלנו את הפנייה שלך (מס' {ticket_id[:8]})"
        user_email_body = f"""
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🛡️ RentGuard 360</h1>
            </div>
            <div style="padding: 30px; text-align: center;">
                <h2 style="color: #10b981; margin: 0 0 10px 0; font-size: 24px;">היי, ההודעה התקבלה!</h2>
                <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 14px;">מספר פנייה: {ticket_id[:8]}</p>
                <p style="color: #6b7280; margin: 0 0 25px 0; font-size: 14px;">נחזור אליך תוך 24 שעות</p>
                
                <div style="background: #f9fafb; border-radius: 12px; padding: 20px; text-align: right; margin-bottom: 20px;">
                    <p style="margin: 8px 0;"><strong>קטגוריה:</strong> {category}</p>
                    <p style="margin: 8px 0;"><strong>תוכן הפנייה:</strong></p>
                    <p style="background: #ffffff; padding: 12px; border-radius: 8px; border-right: 3px solid #10b981;">{message_content}</p>
                </div>
            </div>
            <div style="text-align: center; padding: 20px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; margin: 0; font-size: 12px;">RentGuard Systems</p>
            </div>
        </div>
        """
        
        try:
            ses_client.send_email(
                Source=SENDER_EMAIL,
                Destination={'ToAddresses': [user_email]},
                Message={
                    'Subject': {'Data': user_email_subject, 'Charset': 'UTF-8'},
                    'Body': {'Html': {'Data': user_email_body, 'Charset': 'UTF-8'}}
                }
            )
            logger.info(f"Confirmation email sent to {user_email}")
        except ClientError as e:
            # Don't fail the ticket creation if user email fails (sandbox mode)
            logger.warning(f"Could not send confirmation to user: {e}")

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'Ticket created', 'ticketId': ticket_id})
        }

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': str(e)})}
