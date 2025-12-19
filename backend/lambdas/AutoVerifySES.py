import json
import boto3

# חיבור לשירות המיילים
ses = boto3.client('ses', region_name='us-east-1')

def lambda_handler(event, context):
    print("Event received from Cognito:", json.dumps(event))
    
    try:
        # 1. חילוץ המייל של המשתמש שנרשם
        # קוגניטו שולח את זה בתוך request -> userAttributes
        user_email = event['request']['userAttributes'].get('email')
        
        if user_email:
            print(f"Verifying email: {user_email}")
            # 2. שליחת הפקודה ל-SES לשלוח מייל אימות
            ses.verify_email_identity(EmailAddress=user_email)
            print("Verification email sent successfully.")
        else:
            print("No email found in event.")

    except Exception as e:
        # גם אם יש שגיאה, אנחנו לא רוצים לתקוע את ההרשמה
        print(f"Error: {str(e)}")
    
    # 3. חובה! להחזיר את ה-event לקוגניטו כדי שיסיים את ההרשמה
    return event
