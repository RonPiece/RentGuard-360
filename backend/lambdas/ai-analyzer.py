import json
import boto3
import traceback
import re

# Initialize Bedrock client
bedrock = boto3.client(service_name='bedrock-runtime', region_name='us-east-1')

# =============================================================================
# COMPREHENSIVE ISRAELI RENTAL LAW KNOWLEDGE BASE
# Based on Fair Rental Law Amendment 2017 (תיקון תשע"ז) - Sections 25א-25טו
# =============================================================================

SOURCE_HIERARCHY = """
MANDATORY SOURCE HIERARCHY - YOU MUST FOLLOW THIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. PRIMARY (COGENT): Fair Rental Law Amendment 2017 (סימן ו' לחוק השכירות והשאילה - סעיפים 25א-25טו)
   - These provisions CANNOT be waived by contract (except 25ז(א) and 25יב(א))
   - If contract contradicts these sections → VOID

2. SECONDARY (DISPOSITIVE): Rental and Loan Law 1971 (חוק השכירות והשאילה התשל"א)
   - Applies when 2017 amendment doesn't cover the topic
   - Sections 1-25 of the original law

3. ⛔ EXCLUDED - DO NOT USE: Tenant Protection Law 1972 (חוק הגנת הדייר)
   - This law deals with "Key Money" (דמי מפתח) and protected tenants
   - IRRELEVANT to modern rental contracts
   - NEVER cite this law or its concepts
"""

MATH_VERIFICATION = """
MANDATORY CALCULATION PROTOCOL - DO THESE BEFORE FLAGGING VIOLATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FOR DEPOSIT VALIDATION (Rule F1):
1. Extract from contract:
   - MonthlyRent = X (in NIS)
   - LeaseDuration = T (in months)
   - RequestedDeposit = D (in NIS)
2. Calculate limits:
   - Limit1 = X × 3
   - Limit2 = (X × T) ÷ 3
3. MaxAllowed = MIN(Limit1, Limit2)
4. Decision:
   - If D ≤ MaxAllowed → LEGAL, do NOT flag as violation
   - If D > MaxAllowed → ILLEGAL, flag as F1 violation

EXAMPLE: Rent=5,000, Lease=12 months, Deposit=15,000
- Limit1 = 5,000 × 3 = 15,000
- Limit2 = (5,000 × 12) ÷ 3 = 20,000
- MaxAllowed = MIN(15,000, 20,000) = 15,000
- 15,000 ≤ 15,000 → LEGAL ✓

FOR NOTICE PERIODS:
- Tenant extension notice (E1): Must give ≥ 60 days → LEGAL
- Landlord option notice (E2): Must give ≥ 90 days → LEGAL
- Only flag if contract requires LESS notice than law mandates

FOR REPAIR DEADLINES:
- Regular repairs (L2): Must complete within ≤ 30 days → LEGAL
- Urgent repairs (L3): Must complete within ≤ 3 days → LEGAL
"""

KNOWLEDGE_BASE = """
COMPREHENSIVE ISRAELI RENTAL LAW RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FINANCIAL RULES (F1-F7):
- F1: [סעיף 25ט(ב)] Maximum security deposit is the LOWER of: (a) 3 months' rent, OR (b) 1/3 of total lease rent.
      Example: Rent=4,000, 12-month lease → Max = MIN(12,000, 16,000) = 12,000 NIS
- F2: [סעיף 25ט(ז)] Deposit must be returned within 60 days after lease ends.
- F3: [סעיף 25ח(א)] Rent amount must be clearly specified. Cannot increase arbitrarily during lease.
- F4: [נוהג מקובל] Late payment penalties must be reasonable (typically max ~2% per week, not daily compounding).
- F5: [סעיף 25ח(ב)(3)] Tenant NOT liable for broker fees if broker was hired by landlord (דמי תיווך).
- F6: [סעיף 25ט(ד)] Deposit can ONLY be used for: unpaid rent, tenant-caused repairs, unpaid utilities, or non-vacating.
      Landlord must notify tenant before using deposit [סעיף 25ט(ה)].
- F7: [סעיף 25ט(ג)] Deposit cannot be transferred to landlord BEFORE key handover date.

TENANT RIGHTS (T1-T7):
- T1: [נוהג מקובל] Landlord must give reasonable notice (24-48 hours) before entering the property.
- T2: [סעיף 25יב] Complete prohibition on subletting without reasonable grounds may be unfair.
      Landlord must provide written consent for subletting [סעיף 25יב(א)].
- T3: [אסור בחוק] Landlord CANNOT cut off essential utilities (electricity, water, gas) to force eviction.
- T4: [נוהג מקובל] Tenant has right to make minor, non-damaging modifications (hanging pictures, shelves).
- T5: [סעיף 25ה] Tenant has remedies for property defects (אי-התאמה). Sale Law remedies apply.
- T6: [סעיף 25ח(ב)] Tenant is NOT liable for: (1) Building insurance, (2) Fixed installations, (3) Landlord's broker fees.
- T7: [סעיף 25ו(ה)] Landlord must provide maintenance and usage instructions for property, fixtures, and appliances.

TERMINATION RULES (E1-E5):
- E1: [סעיף 25י(ג)] Tenant must give at least 60 days notice if they want to use extension option.
- E2: [סעיף 25י(ב)] Landlord must give at least 90 days notice if they want to use extension option.
      Extension terms must be pre-agreed in original contract.
- E3: [סעיף 25יא] Landlord CANNOT cancel contract early except for material breach (הפרה יסודית).
      Exception: Renewal contracts up to 5 years total may include early termination clause.
- E4: [נוהג מקובל] Tenant should not pay full remaining rent if valid replacement tenant is found and approved.
- E5: [סעיף 25י(א)] Landlord must notify tenant reasonable time before lease end about renewal intentions and terms.

LIABILITY & REPAIRS (L1-L6):
- L1: [סעיף 25ז(א)+(ב)] Landlord is MANDATORILY responsible for all defects and repairs in the property.
      Tenant only responsible for repairs if caused by unreasonable use.
- L2: [סעיף 25ז(ג)] Regular repairs must be completed within 30 days of tenant's request.
- L3: [סעיף 25ז(ד)] URGENT repairs (preventing reasonable habitation) must be completed within 3 days.
- L4: [נוהג מקובל] Normal wear and tear (בלאי סביר) is NOT the tenant's responsibility.
- L5: [סעיף 25ח(ב)(1)] Building/structure insurance is landlord's responsibility, NOT tenant's.
- L6: [סעיף 25ז(ה)] If landlord fails to repair in time, tenant may repair and deduct costs (סעיף 9 לחוק).

LEGAL COMPLIANCE (C1-C8):
- C1: [סעיף 25יד] ANTI-WAIVER: Clauses waiving sections 25ה-25יד are VOID (except 25ז(א) and 25יב(א)).
      Even if tenant signed, these rights cannot be waived.
- C2: [סעיף 25ו(ג)] Property must be HABITABLE per First Schedule (תוספת ראשונה):
      Running water, electricity, ventilation, natural light, working toilet, lockable entrance.
- C3: [סעיף 25ב] Contract must be in writing and signed. Both parties must receive signed copy.
- C4: [סעיף 25ג] Contract must include details per Second Schedule (תוספת שנייה).
- C5: [סעיף 25ו(ד)] Delivering an uninhabitable property = CONTRACT BREACH (הפרת חוזה).
- C6: [סעיף 25יג] Law DOES NOT APPLY to: <3 months, >10 years, rent >20,000 NIS/month, dorms, hotels, retirement homes.
- C7: [סעיף 25ט(ה)] Before using deposit, landlord must notify tenant and give reasonable time to fix issue.
- C99: [כלל כללי] Any clause that explicitly contradicts the Fair Rental Law 2017 or violates Contract Law principles.

WHAT LAW SAYS IS VOID (Key Anti-Waiver Provisions):
- Any clause waiving tenant's right to habitable property [סעיף 25ו]
- Any clause waiving landlord's repair obligations [סעיף 25ז(ב)-(ה)]
- Any clause exceeding deposit limits [סעיף 25ט]
- Any clause adding prohibited payments to tenant [סעיף 25ח(ב)]
- Any clause allowing early landlord cancellation without breach [סעיף 25יא]
"""

SCORING_RUBRIC = """
SCORING METHOD:
- Start at 100 points (perfect contract)
- Deduct points for each violated rule
- Each violation: cite rule ID (F1, T1, etc.), quote text, explain penalty

PENALTY GUIDELINES:
- Severe violation (illegal/major harm): -7 to -10 points
- Moderate violation (unfair but legal): -4 to -6 points  
- Minor concern (unusual but negotiable): -2 to -3 points

SCORE INTERPRETATION:
- 0-30: HIGH RISK - Major legal concerns
- 31-50: MEDIUM-HIGH RISK - Several concerning clauses
- 51-70: MEDIUM RISK - Some issues to negotiate
- 71-85: LOW-MEDIUM RISK - Minor issues, generally acceptable
- 86-100: LOW RISK - Fair and balanced contract
"""

# =============================================================================
# MODEL CONFIGURATION - Validated for AWS Bedrock
# =============================================================================
# IMPORTANT NOTES:
# 1. Haiku 4.5 requires regional prefix "us." for us-east-1
# 2. Does NOT support both temperature AND topP - use only temperature
# 3. maxTokens can be up to 8192
# =============================================================================

MODEL_ID = "us.anthropic.claude-haiku-4-5-20251001-v1:0"

# Inference config - ONLY temperature, no topP (not allowed for Haiku 4.5)
INFERENCE_CONFIG = {
    "maxTokens": 8192,
    "temperature": 0.0  # Deterministic output for consistent analysis
}


def call_bedrock(model_id, system_prompt, user_message):
    """
    Call Bedrock with the specified model.
    Returns the response text or raises an exception.
    """
    response = bedrock.converse(
        modelId=model_id,
        system=[{"text": system_prompt}],
        messages=[user_message],
        inferenceConfig=INFERENCE_CONFIG
    )
    return response['output']['message']['content'][0]['text']


def parse_json_response(ai_output_text):
    """
    Parse JSON from AI response, handling markdown wrappers and edge cases.
    """
    # Clean markdown wrappers
    clean_text = ai_output_text.replace("```json", "").replace("```", "").strip()
    
    # Find JSON object
    match = re.search(r'\{.*\}', clean_text, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in response")
    
    analysis_json = json.loads(match.group(0))
    
    # Validate and add missing required fields
    if 'is_contract' not in analysis_json:
        analysis_json['is_contract'] = True
    
    if 'overall_risk_score' not in analysis_json:
        analysis_json['overall_risk_score'] = 50  # Default middle score
    
    if 'score_breakdown' not in analysis_json:
        analysis_json['score_breakdown'] = {
            "financial_terms": {"score": 20},
            "tenant_rights": {"score": 20},
            "termination_clauses": {"score": 20},
            "liability_repairs": {"score": 20},
            "legal_compliance": {"score": 20}
        }
    
    if 'issues' not in analysis_json:
        analysis_json['issues'] = []
    
    if 'summary' not in analysis_json:
        analysis_json['summary'] = "הניתוח הושלם."
    
    return analysis_json


def create_fallback_response(error_message, raw_response=""):
    """
    Create a fallback response when parsing fails.
    """
    return {
        "is_contract": True,
        "overall_risk_score": 0,
        "score_breakdown": {
            "financial_terms": {"score": 20},
            "tenant_rights": {"score": 20},
            "termination_clauses": {"score": 20},
            "liability_repairs": {"score": 20},
            "legal_compliance": {"score": 20}
        },
        "summary": "הניתוח הושלם אך יש שגיאת פורמט טכנית.",
        "issues": [],
        "parse_error": error_message,
        "raw_ai_response": raw_response[:1000] if raw_response else ""
    }


def recalculate_scores(analysis_json):
    """
    Recalculate scores based on penalty_points from issues.
    Don't trust AI's math - calculate it ourselves!
    
    Each category starts at 20 points.
    Deduct penalty_points based on rule_id prefix:
    - F → financial_terms
    - T → tenant_rights
    - E → termination_clauses
    - L → liability_repairs
    - C → legal_compliance
    """
    if not analysis_json.get('is_contract', True):
        return analysis_json
    
    # Initialize category scores (max 20 each)
    categories = {
        'financial_terms': 20,
        'tenant_rights': 20,
        'termination_clauses': 20,
        'liability_repairs': 20,
        'legal_compliance': 20
    }
    
    # Map rule_id prefix to category
    prefix_to_category = {
        'F': 'financial_terms',
        'T': 'tenant_rights',
        'E': 'termination_clauses',
        'L': 'liability_repairs',
        'C': 'legal_compliance'
    }
    
    # Deduct penalty_points from each category
    issues = analysis_json.get('issues', [])
    for issue in issues:
        rule_id = issue.get('rule_id', '')
        
        # Safe conversion - handle both int and string
        try:
            penalty = int(issue.get('penalty_points', 0))
        except (ValueError, TypeError):
            penalty = 0
        
        if rule_id and len(rule_id) > 0 and penalty > 0:
            prefix = rule_id[0].upper()
            category = prefix_to_category.get(prefix)
            
            if category:
                categories[category] = max(0, categories[category] - penalty)
    
    # Calculate overall score (sum of all categories)
    overall_score = sum(categories.values())
    
    # Update analysis_json with recalculated scores
    analysis_json['score_breakdown'] = {
        'financial_terms': {'score': categories['financial_terms']},
        'tenant_rights': {'score': categories['tenant_rights']},
        'termination_clauses': {'score': categories['termination_clauses']},
        'liability_repairs': {'score': categories['liability_repairs']},
        'legal_compliance': {'score': categories['legal_compliance']}
    }
    analysis_json['overall_risk_score'] = overall_score
    
    # Log for debugging
    print(f"Recalculated scores: {categories}")
    print(f"Overall risk score: {overall_score}")
    
    return analysis_json


def lambda_handler(event, context):
    """
    Main Lambda handler for AI contract analysis.
    """
    try:
        # 1. Extract input data
        sanitized_text = event.get('sanitizedText') or event.get('extractedText', '')
        contract_id = event.get('contractId', 'unknown')
        bucket = event.get('bucket')
        key = event.get('key')
        clauses_list = event.get('clauses', [])
        
        # 2. Validate input - just check empty
        if not sanitized_text:
            return {
                'contractId': contract_id, 
                'analysis_result': {
                    'error': 'No contract text found',
                    'is_contract': False,
                    'overall_risk_score': 0,
                    'issues': []
                },
                'bucket': bucket,
                'key': key,
                'clauses': clauses_list,
                'sanitizedText': ''
            }

        # 3. Budget protection: limit text length (saves tokens = saves money)
        MAX_TEXT_LENGTH = 25000
        if len(sanitized_text) > MAX_TEXT_LENGTH:
            print(f"Truncating text from {len(sanitized_text)} to {MAX_TEXT_LENGTH} chars")
            sanitized_text = sanitized_text[:MAX_TEXT_LENGTH] + "... [Text Truncated]"

        system_prompt = f"""You are an expert Israeli real estate lawyer analyzing rental contracts.

{SOURCE_HIERARCHY}

{MATH_VERIFICATION}

{KNOWLEDGE_BASE}

{SCORING_RUBRIC}

TASK: Analyze the contract and return ONLY valid JSON with this EXACT structure:

{{
  "is_contract": true,
  "overall_risk_score": <MUST equal sum of all 5 category scores below>,
  "score_breakdown": {{
    "financial_terms": {{"score": <0-20, start at 20 and deduct for F-rule violations>}},
    "tenant_rights": {{"score": <0-20, start at 20 and deduct for T-rule violations>}},
    "termination_clauses": {{"score": <0-20, start at 20 and deduct for E-rule violations>}},
    "liability_repairs": {{"score": <0-20, start at 20 and deduct for L-rule violations>}},
    "legal_compliance": {{"score": <0-20, start at 20 and deduct for C-rule violations>}}
  }},
  "summary": "<Hebrew summary of 2-3 sentences>",
  "issues": [
    {{
      "rule_id": "<F1-F7/T1-T7/E1-E5/L1-L6/C1-C99>",
      "clause_topic": "<Hebrew topic>",
      "original_text": "<exact quote from contract>",
      "risk_level": "High/Medium/Low",
      "penalty_points": <number - this is the amount deducted from the category score>,
      "legal_basis": "<Hebrew - which section of 2017 law this violates, e.g. סעיף 25ט(ב)>",
      "explanation": "<Hebrew explanation why this is risky>",
      "suggested_fix": "<Hebrew - actual corrected clause text>"
    }}
  ]
}}

SCORING RULES (CRITICAL - YOU MUST FOLLOW THESE EXACTLY):
1. Each category starts at 20 points (perfect score)
2. For each issue, deduct penalty_points from the relevant category based on rule_id prefix:
   - F-rules (F1-F7) -> deduct from financial_terms
   - T-rules (T1-T7) -> deduct from tenant_rights
   - E-rules (E1-E5) -> deduct from termination_clauses
   - L-rules (L1-L6) -> deduct from liability_repairs
   - C-rules (C1-C99) -> deduct from legal_compliance

3. MATH VERIFICATION (YOU MUST DO THIS):
   - Sum all penalty_points from F-rules -> deduct from financial_terms (20 - sum = category score)
   - Sum all penalty_points from T-rules -> deduct from tenant_rights (20 - sum = category score)
   - Sum all penalty_points from E-rules -> deduct from termination_clauses (20 - sum = category score)
   - Sum all penalty_points from L-rules -> deduct from liability_repairs (20 - sum = category score)
   - Sum all penalty_points from C-rules -> deduct from legal_compliance (20 - sum = category score)
   - Minimum category score is 0 (never negative)

4. overall_risk_score = financial_terms.score + tenant_rights.score + termination_clauses.score + liability_repairs.score + legal_compliance.score

5. EXAMPLE: If you have issues F1 (8 pts) and F4 (5 pts), then financial_terms.score = 20 - 8 - 5 = 7

ANTI-HALLUCINATION RULES (CRITICAL):
1. ONLY cite rule IDs from the knowledge base: F1-F7, T1-T7, E1-E5, L1-L6, C1-C8, C99
2. ONLY cite law sections from the 2017 amendment (25א-25טו) or 1971 law (1-25)
3. NEVER cite "1972", "חוק הגנת הדייר", "דמי מפתח", or any Key Money provisions
4. If a clause doesn't fit a specific rule, use C99 with "הפרה כללית של חוק השכירות 2017"
5. For legal_basis: ALWAYS include the Hebrew section reference (e.g., "סעיף 25ט(ב)")

RULES FOR ANALYSIS:
1. ONLY cite rules from the knowledge base above
2. If a violation doesn't match a specific rule, use C99
3. Each issue MUST include rule_id and legal_basis in HEBREW
4. If document is NOT a rental contract, return is_contract: false with score 0
5. For suggested_fix: Write the CORRECTED clause text directly. Do NOT write "יש לשנות" or "יש להסיר"
6. CRITICAL: Only include ACTUAL PROBLEMS in the issues array. Do NOT include compliant clauses.
7. Issues array should ONLY contain clauses with penalty_points > 0
8. ALL TEXT in JSON (except rule_id/risk_level) MUST BE IN HEBREW

IMPORTANT: Return ONLY the JSON, no markdown, no explanation outside JSON."""

        user_message = {
            "role": "user",
            "content": [{"text": f"Analyze this rental contract:\n\n{sanitized_text}"}]
        }

        # 5. Call Bedrock
        print(f"Calling model: {MODEL_ID}")
        ai_output_text = call_bedrock(MODEL_ID, system_prompt, user_message)
        print("Model call succeeded")

        # 6. Parse JSON response
        try:
            analysis_json = parse_json_response(ai_output_text)
        except Exception as parse_error:
            print(f"JSON Parse Error: {str(parse_error)}")
            print(f"Raw response: {ai_output_text[:500] if ai_output_text else 'None'}")
            analysis_json = create_fallback_response(str(parse_error), ai_output_text)
        
        # 7. RECALCULATE SCORES - Don't trust AI's math!
        analysis_json = recalculate_scores(analysis_json)

        # 7. Return success response
        return {
            'contractId': contract_id,
            'analysis_result': analysis_json,
            'bucket': bucket,
            'key': key,
            'clauses': clauses_list,
            'sanitizedText': sanitized_text
        }
        
    except Exception as e:
        traceback.print_exc()
        print(f"Lambda handler error: {str(e)}")
        raise e