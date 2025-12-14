import re
import json

def clean_and_split(text):
    if not text:
        return [], ""

    # 1. הסרת "רעשי סורק" ספציפיים ידועים
    text = re.sub(r'(?i)scanned with camscanner', '', text)
    text = re.sub(r'www\.camscanner\.com', '', text)
    
    # 2. הסרת תווים נסתרים (RTL Marks) ששוברים תצוגה
    text = re.sub(r'[\u2000-\u200f]', '', text)

    # 3. החלפת רצפים של תווים לא הגיוניים (ג'יבריש כמו §Qa§uw) ברווח
    # משאירים רק: עברית, אנגלית, מספרים, וסימני פיסוק בסיסיים
    text = re.sub(r'[^א-תa-zA-Z0-9\s\.\,\-\:\(\)\"\'\%\₪\/]+', ' ', text)

    # 4. פיצול לפסקאות לפי ירידות שורה כפולות (הדרך הכי בטוחה ב-OCR)
    raw_blocks = text.split('\n\n')
    
    clean_clauses = []
    for block in raw_blocks:
        # ניקוי רווחים מיותרים בתוך הבלוק
        block = re.sub(r'\s+', ' ', block).strip()
        
        # 5. מסננים שורות קצרות מדי (פחות מ-15 תווים זה כנראה זבל או מספר עמוד)
        if len(block) > 15:
            clean_clauses.append(block)

    # מחזירים גם את הרשימה וגם את הטקסט המלא (מחובר) לטובת ה-AI הכללי
    full_clean_text = "\n".join(clean_clauses)
    
    return clean_clauses, full_clean_text

def lambda_handler(event, context):
    try:
        # קריאה
        text = event.get('extractedText', '')
        contract_id = event.get('contractId', 'unknown')
        bucket = event.get('bucket')
        key = event.get('key')
        
        # --- לוגיקת צנזורה (PII) ---
        text = re.sub(r'\b\d{9}\b', '[ID_REDACTED]', text)
        text = re.sub(r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b', '[CC_REDACTED]', text)
        text = re.sub(r'\b05\d-?\d{7}\b', '[PHONE_REDACTED]', text)
        
        # --- ניקוי ופירוק לסעיפים ---
        clauses_list, clean_full_text = clean_and_split(text)
        
        return {
            'contractId': contract_id,
            'sanitizedText': clean_full_text, # טקסט מלא לניתוח הכללי
            'clauses': clauses_list,          # <--- הרשימה הנקייה לרון!
            'bucket': bucket,
            'key': key
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        raise e