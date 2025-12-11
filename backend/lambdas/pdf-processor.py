import json
import boto3
import PyPDF2
from io import BytesIO

s3 = boto3.client('s3')

def lambda_handler(event, context):
    bucket = event['bucket']
    key = event['key']
    
    pdf_object = s3.get_object(Bucket=bucket, Key=key)
    pdf_content = pdf_object['Body'].read()
    
    pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_content))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'contractId': key,
            'extractedText': text,
            'pageCount': len(pdf_reader.pages)
        })
    }