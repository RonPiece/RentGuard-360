import re
import json

def lambda_handler(event, context):
    text = event['extractedText']
    
    # Israeli ID pattern
    text = re.sub(r'\b\d{9}\b', '[ID_REDACTED]', text)
    # Credit card
    text = re.sub(r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b', '[CC_REDACTED]', text)
    # Phone numbers
    text = re.sub(r'\b05\d-?\d{7}\b', '[PHONE_REDACTED]', text)
    # Email
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL_REDACTED]', text)
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'sanitizedText': text,
            'redactionCount': text.count('_REDACTED]')
        })
    }