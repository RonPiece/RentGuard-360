import json
import boto3

# חיבור לשירותים
ses = boto3.client('ses', region_name='us-east-1')
cognito = boto3.client('cognito-idp', region_name='us-east-1')

# ==========================================
# וודא שהפרטים האלו נכונים:
# ==========================================
SENDER_EMAIL = "powe3k@gmail.com" 
USER_POOL_ID = "us-east-1_rwsncOnh1"
# ==========================================

def get_user_email(user_id):
    """פונקציה חכמה שמוצאת אימייל גם לפי UUID וגם לפי Username"""
    print(f"DEBUG: Searching email for User ID: {user_id}")
    
    # 1. ניסיון ראשון: חיפוש לפי מזהה ייחודי (sub/UUID) - הכי סביר שזה המצב שלך
    try:
        response = cognito.list_users(
            UserPoolId=USER_POOL_ID,
            Filter=f'sub = "{user_id}"',
            Limit=1
        )
        if response['Users']:
            print("DEBUG: Found user by UUID (sub)!")
            for attr in response['Users'][0]['Attributes']:
                if attr['Name'] == 'email':
                    return attr['Value']
    except Exception as e:
        print(f"DEBUG: Search by sub failed: {e}")

    # 2. ניסיון שני: חיפוש לפי Username רגיל (למקרה שה-ID הוא בעצם האימייל)
    try:
        response = cognito.admin_get_user(
            UserPoolId=USER_POOL_ID,
            Username=user_id
        )
        print("DEBUG: Found user by Username!")
        for attr in response['UserAttributes']:
            if attr['Name'] == 'email':
                return attr['Value']
    except Exception as e:
        print(f"DEBUG: Search by username failed: {e}")

    return None

def lambda_handler(event, context):
    try:
        print("Starting NotifyUser...", json.dumps(event))
        
        user_id = event.get('userId')
        risk_score = event.get('risk_score', 0)
        
        # דילוג אם אין משתמש אמיתי
        if not user_id or user_id in ['guest', 'unknown', None]:
            return {'status': 'skipped', 'reason': 'guest_user'}

        # 1. מציאת כתובת המייל
        recipient_email = get_user_email(user_id)
        
        if not recipient_email:
            print(f"CRITICAL: Could not find email for ID {user_id}")
            return {'status': 'failed', 'reason': 'email_not_found', 'id_searched': user_id}

        # 2. עיצוב המייל
        subject = f"RentGuard: תוצאות הניתוח לחוזה שלך (ציון: {risk_score})"
        color = "#d9534f" if risk_score > 50 else "#5cb85c"
        
        body_html = f"""
        <div dir="rtl" style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="background-color: white; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h2 style="color: #333;">הניתוח הסתיים בהצלחה!</h2>
                <div style="text-align: center; margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 8px;">
                    <h3>ציון הסיכון:</h3>
                    <h1 style="color: {color}; margin: 0; font-size: 40px;">{risk_score}/100</h1>
                </div>
                <p>הכנס לאתר לצפייה בפרטים המלאים.</p>
                <p style="font-size: 12px; color: gray;">RentGuard Notification System</p>
            </div>
        </div>
        """

        # 3. שליחה
        ses.send_email(
            Source=SENDER_EMAIL,
            Destination={'ToAddresses': [recipient_email]},
            Message={
                'Subject': {'Data': subject, 'Charset': 'UTF-8'},
                'Body': {'Html': {'Data': body_html, 'Charset': 'UTF-8'}}
            }
        )
        
        print(f"Email sent successfully to {recipient_email}")
        return {'status': 'success', 'recipient': recipient_email}

    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return {'status': 'error', 'message': str(e)}