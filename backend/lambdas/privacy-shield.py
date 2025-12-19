import re
import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# === 1. הגדרות Regex לניקוי וזיהוי ===

# דפוסים לזיהוי מידע רגיש (PII) להסתרה
PII_PATTERNS = {
    'israeli_id': (re.compile(r'\b[0-9]{8,9}\b'), '[ת.ז. הוסתר]'),
    'credit_card': (re.compile(r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b'), '[כ.אשראי הוסתר]'),
    'phone_mobile': (re.compile(r'\b05\d[-\s]?\d{3}[-\s]?\d{4}\b'), '[נייד הוסתר]'),
    'email': (re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'), '[אימייל הוסתר]'),
    'bank_account': (re.compile(r'\b\d{2,3}[-\s]?\d{3}[-\s]?\d{6,9}\b'), '[חשבון בנק הוסתר]'),
}

# דפוסים לניקוי "רעשי" סורק (OCR Noise)
OCR_NOISE_PATTERNS = [
    re.compile(r'(?i)scanned with camscanner.*'),
    re.compile(r'(?i)www\.camscanner\.com'),
    re.compile(r'[\u2000-\u200f]'),  # תווי כיווניות נסתרים
    re.compile(r'[|~^§`®©™]'),       # תווים מיוחדים שלרוב הם טעות סריקה
    re.compile(r'[_]{3,}'),          # קווים תחתונים ארוכים
]

# === תוספת: מילים לזיהוי כיוון הטקסט (רגיל מול הפוך) ===
KEYWORDS_NORMAL = ['חוזה', 'הסכם', 'שכירות', 'משכיר', 'שוכר', 'דירה']
KEYWORDS_REVERSED = ['הזוח', 'םכסה', 'תוריכש', 'ריכשמ', 'רכוש', 'הריד']

# מילות מפתח לחישוב ציון ביטחון (האם זה חוזה?)
CONTRACT_KEYWORDS = [
    ('חוזה שכירות', 20), ('הסכם שכירות', 20),
    ('המשכיר', 10), ('משגיר', 10), ('בעל הדירה', 10),
    ('השוכר', 10), ('השובר', 10),
    ('דמי שכירות', 15), ('תשלום חודשי', 10),
    ('תקופת השכירות', 10), ('תקופת האופציה', 5),
    ('פינוי', 5), ('ערבות', 5), ('צ\'ק ביטחון', 5),
    ('בלתי מוגנת', 10)
]

# === תוספת: פונקציה לתיקון כיוון הטקסט ===
def detect_and_fix_direction(text: str) -> str:
    """
    בודק אם הטקסט הפוך (כתב ראי). אם כן - הופך אותו חזרה.
    """
    score_normal = sum(1 for word in KEYWORDS_NORMAL if word in text)
    score_reversed = sum(1 for word in KEYWORDS_REVERSED if word in text)
    
    # אם יש יותר מילים הפוכות ממילים רגילות -> הטקסט הפוך
    if score_reversed > score_normal:
        logger.info(f"Reversed text detected (Score: {score_reversed} vs {score_normal}). Fixing...")
        # פיצול לשורות, היפוך כל שורה, וחיבור מחדש
        fixed_lines = [line[::-1] for line in text.split('\n')]
        return '\n'.join(fixed_lines)
    
    return text

def sanitize_pii(text: str) -> tuple[str, list[str]]:
    """מסתיר מידע אישי ורגיש"""
    pii_found = []
    for pii_type, (pattern, replacement) in PII_PATTERNS.items():
        if pattern.search(text):
            pii_found.append(pii_type)
            text = pattern.sub(replacement, text)
    return text, pii_found

def clean_ocr_noise(text: str) -> str:
    """מנקה לכלוך סריקה"""
    for pattern in OCR_NOISE_PATTERNS:
        text = pattern.sub(' ', text)
    
    # צמצום רווחים ושורות ריקות
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    return text.strip()

def split_to_clauses(text: str) -> list[str]:
    """מפרק את הטקסט לרשימת סעיפים לתצוגה"""
    raw_blocks = text.split('\n')
    clean_clauses = []
    for block in raw_blocks:
        block = block.strip()
        # סינון שורות קצרות מדי או כאלו שהן רק מספרים
        if len(block) > 15 and not re.match(r'^[\d\W]+$', block):
            clean_clauses.append(block)
    return clean_clauses

def calculate_contract_confidence(text: str) -> int:
    """מחשב כמה המערכת בטוחה שזה אכן חוזה שכירות"""
    score = 0
    text_lower = text.lower() # לחיפוש קל יותר
    
    for keyword, weight in CONTRACT_KEYWORDS:
        if keyword in text or keyword in text_lower:
            score += weight
            
    return min(100, score) # מקסימום 100

def lambda_handler(event, context):
    try:
        # קליטת הטקסט הגולמי
        text = event.get('extractedText', '')
        contract_id = event.get('contractId', 'unknown')
        bucket = event.get('bucket')
        key = event.get('key')
        
        logger.info(f"Processing contract {contract_id}, length: {len(text)}")
        
        if not text:
            return {
                'error': 'No text extracted',
                'contractConfidence': 0,
                'sanitizedText': ''
            }
        
        # === שלב חדש: תיקון כיוון הטקסט (לפני כל עיבוד אחר) ===
        text = detect_and_fix_direction(text)

        # 1. הסתרת פרטים אישיים
        text, pii_found = sanitize_pii(text)
        
        # 2. ניקוי רעשים
        text = clean_ocr_noise(text)
        
        # 3. יצירת רשימת סעיפים
        clauses_list = split_to_clauses(text)
        
        # 4. חישוב ציון ביטחון (האם זה חוזה?)
        # עכשיו הטקסט מתוקן, אז המילים "חוזה שכירות" יזוהו והציון יהיה גבוה
        contract_confidence = calculate_contract_confidence(text)
        logger.info(f"Contract Confidence Score: {contract_confidence}")
        
        return {
            'contractId': contract_id,
            'sanitizedText': text,
            'clauses': clauses_list,
            'contractConfidence': contract_confidence, # יועבר ללמבדה הבאה
            'piiFound': pii_found,
            'bucket': bucket,
            'key': key
        }
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise e