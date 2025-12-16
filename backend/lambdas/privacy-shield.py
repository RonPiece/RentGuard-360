import re
import json

def clean_and_split(text):
    if not text:
        return [], ""

    # 1. הסרת "רעשי סורק" ספציפיים (CamScanner וכו')
    # הסרה אגרסיבית יותר שכוללת גם תווים אחרי המילה
    text = re.sub(r'(?i)scanned with camscanner.*', '', text)
    text = re.sub(r'www\.camscanner\.com', '', text)
    
    # 2. ניקוי תווים לא רצויים ששוברים פורמט
    text = re.sub(r'[\u2000-\u200f]', '', text) # RTL Marks
    text = re.sub(r'[|~^]', '', text) # תווים נפוצים ב-OCR גרוע

    # 3. פיצול לפסקאות - שינינו ל-split לפי שורה בודדת כדי לסנן זבל טוב יותר
    raw_blocks = text.split('\n')
    
    clean_clauses = []
    for block in raw_blocks:
        block = block.strip()
        
        # ניקוי רווחים כפולים
        block = re.sub(r'\s+', ' ', block)
        
        # --- השיפור: סינון זבל ---
        # אם השורה קצרה מ-20 תווים או מכילה רק מספרים/סימנים - דלג עליה
        if len(block) < 20: 
            continue
        
        # מסנן שורות שהן רק מספרים (כמו מספרי עמודים)
        if re.match(r'^[\d\W]+$', block):
            continue

        clean_clauses.append(block)

    # מחזירים גם את הרשימה וגם את הטקסט המלא
    full_clean_text = "\n".join(clean_clauses)
    return clean_clauses, full_clean_text

def lambda_handler(event, context):
    try:
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
            'sanitizedText': clean_full_text,
            'clauses': clauses_list,          # הרשימה הנקייה (ללא camscanner)
            'bucket': bucket,
            'key': key
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        raise e