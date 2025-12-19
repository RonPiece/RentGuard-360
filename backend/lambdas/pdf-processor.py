import json
import boto3
import io
import PyPDF2
from urllib.parse import unquote_plus

s3 = boto3.client('s3')

def lambda_handler(event, context):
    try:
        # 1. חילוץ פרטי הקובץ מהאירוע
        bucket = event['bucket']
        key = unquote_plus(event['key'])
        
        print(f"Processing file: {key} from bucket: {bucket}")
        
        # 2. הגדרת contract_id (התיקון החשוב!)
        contract_id = key  # משתמשים בשם הקובץ כמזהה
        
        # 3. הורדת הקובץ מ-S3 לזיכרון
        response = s3.get_object(Bucket=bucket, Key=key)
        file_content = response['Body'].read()
        
        # 4. קריאת ה-PDF וחילוץ טקסט
        pdf_file = io.BytesIO(file_content)
        reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        num_pages = len(reader.pages)
        
        for page in reader.pages:
            text += page.extract_text() + "\n"
            
        print(f"Extracted {len(text)} characters from {num_pages} pages.")

        # 5. החזרת התוצאה (בלי body, מוכן ל-Step Functions)
        return {
            'contractId': contract_id,
            'extractedText': text,
            'pageCount': num_pages
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        # במקרה של שגיאה, נחזיר מבנה שהשלב הבא יידע להתמודד איתו או יכשיל את הריצה
        raise e