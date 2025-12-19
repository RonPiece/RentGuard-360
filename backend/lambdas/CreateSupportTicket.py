import json
import boto3
import uuid
import logging
from datetime import datetime, timedelta, timezone
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# === שירותים ===
ses_client = boto3.client('ses', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

# === הגדרות ===
TABLE_NAME = 'SupportTickets'
SENDER_EMAIL = "projForruppin@gmail.com" 
SUPPORT_TEAM_EMAIL = "projForruppin@gmail.com" 

def lambda_handler(event, context):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
    }

    if event['httpMethod'] == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    try:
        if not event.get('body'):
             return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'No body provided'})}
             
        body = json.loads(event.get('body'))
        
        user_email = body.get('user_email')
        category = body.get('category', 'General')
        message_content = body.get('message')
        # מנסה למצוא contract_id, ואם לא - שם N/A
        contract_id = body.get('contract_id') or body.get('contractId') or 'N/A'
        
        if not user_email or not message_content:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Missing email or message'})}

        # === תיקון זמן ישראל (ללא pytz) ===
        utc_now = datetime.now(timezone.utc)
        israel_time = utc_now + timedelta(hours=2) # שעון חורף
        
        timestamp = int(israel_time.timestamp())
        date_str = israel_time.strftime('%d/%m/%Y %H:%M')

        ticket_id = str(uuid.uuid4())
        short_ticket_id = ticket_id[:8]

        # שמירה ב-DynamoDB
        try:
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
        except Exception as db_error:
            logger.error(f"DynamoDB Error: {str(db_error)}")
            return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': 'Database Error'})}

        # === בניית שורת החוזה למייל (רק אם קיים) ===
        contract_row_html = ""
        if contract_id != 'N/A':
            contract_row_html = f"""
            <tr>
                <td style="padding: 8px 0; color: #7f8c8d;"><strong>מס' חוזה:</strong></td>
                <td style="padding: 8px 0;">{contract_id}</td>
            </tr>
            """

        # === שליחת מייל לצוות התמיכה ===
        try:
            admin_subject = f"🔔 פנייה חדשה: {category} | #{short_ticket_id}"
            admin_body = f"""
            <div dir="rtl" style="font-family: sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #2c3e50; color: #ffffff; padding: 15px 20px;">
                        <h2 style="margin: 0; font-size: 20px;">התקבלה פנייה חדשה</h2>
                    </div>
                    <div style="padding: 20px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d; width: 100px;"><strong>מזהה:</strong></td>
                                <td style="padding: 8px 0;">#{short_ticket_id}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;"><strong>מאת:</strong></td>
                                <td style="padding: 8px 0;"><a href="mailto:{user_email}">{user_email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;"><strong>קטגוריה:</strong></td>
                                <td style="padding: 8px 0;">{category}</td>
                            </tr>
                            {contract_row_html} 
                        </table>
                        <div style="margin-top: 20px; background-color: #f8f9fa; border-left: 4px solid #3498db; padding: 15px;">
                            {message_content}
                        </div>
                        <div style="margin-top: 20px; text-align: center; color: #95a5a6; font-size: 12px;">
                            זמן יצירה (IL): {date_str}
                        </div>
                    </div>
                </div>
            </div>
            """
            
            ses_client.send_email(
                Source=SENDER_EMAIL,
                Destination={'ToAddresses': [SUPPORT_TEAM_EMAIL]},
                Message={
                    'Subject': {'Data': admin_subject, 'Charset': 'UTF-8'},
                    'Body': {'Html': {'Data': admin_body, 'Charset': 'UTF-8'}}
                },
                ReplyToAddresses=[user_email]
            )
        except Exception as e:
            logger.error(f"Failed sending Admin email: {str(e)}")

        # === שליחת מייל ללקוח (עם התוספות שביקשת) ===
        try:
            customer_subject = f"✅ קיבלנו את הפנייה שלך (מס' {short_ticket_id})"
            customer_body = f"""
            <div dir="rtl" style="font-family: sans-serif; background-color: #fdfdfd; padding: 20px;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 30px; text-align: center;">
                    <h2 style="color: #27ae60;">היי, ההודעה התקבלה!</h2>
                    <p style="color: #555;">מספר פנייה: <strong>{short_ticket_id}</strong></p>
                    <p style="color: #555;">נחזור אליך תוך 24 שעות.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 14px;">RentGuard Systems</p>
                </div>
            </div>
            """

            ses_client.send_email(
                Source=SENDER_EMAIL,
                Destination={'ToAddresses': [user_email]},
                Message={
                    'Subject': {'Data': customer_subject, 'Charset': 'UTF-8'},
                    'Body': {'Html': {'Data': customer_body, 'Charset': 'UTF-8'}}
                }
            )
        except Exception as e:
            logger.warning(f"Could not send email to user. Reason: {str(e)}")

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'Ticket created successfully', 'ticketId': ticket_id})
        }

    except Exception as e:
        logger.error(f"CRITICAL ERROR: {str(e)}")
        return {
            'statusCode': 500, 
            'headers': headers, 
            'body': json.dumps({'error': 'Internal Server Error', 'details': str(e)})
        }