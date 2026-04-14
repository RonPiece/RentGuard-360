import re, os
import codecs

# 1. contexts/LanguageContext/en.js
p = 'src/contexts/LanguageContext/en.js'
content = codecs.open(p, 'r', 'utf-8').read()
content = content.replace('          \"copySuccessTitle\": \"Email copied\",\\n          \"copySuccessMessage\": \"Email address was copied to clipboard.\",\\n          \"copyFailed\": \"Unable to copy email. Please select and copy manually.\",\\n', '', 1)
codecs.open(p, 'w', 'utf-8').write(content)

# 2. contexts/LanguageContext/he.js
p = 'src/contexts/LanguageContext/he.js'
content = codecs.open(p, 'r', 'utf-8').read()
content = content.replace('          \"copySuccessTitle\": \"האימייל הועתק\",\\n          \"copySuccessMessage\": \"כתובת האימייל הועתקה ללוח הזיכרון.\",\\n          \"copyFailed\": \"לא ניתן להעתיק את האימייל. אנא בחר והעתק ידנית.\",\\n', '', 1)
codecs.open(p, 'w', 'utf-8').write(content)

# 3. features/analysis/services/analysisApi.js
p = 'src/features/analysis/services/analysisApi.js'
content = codecs.open(p, 'r', 'utf-8').read()
content = re.sub(r'publicApiCall, ', '', content)
content = re.sub(r'const.*? shareToken =.*?;\\n', '', content)
codecs.open(p, 'w', 'utf-8').write(content)

# 4. features/chat/components/ChatInputForm.jsx
p = 'src/features/chat/components/ChatInputForm.jsx'
content = codecs.open(p, 'r', 'utf-8').read()
content = re.sub(r', isAsking', '', content)
codecs.open(p, 'w', 'utf-8').write(content)

# 5. features/chat/components/ChatMessage.jsx
p = 'src/features/chat/components/ChatMessage.jsx'
content = codecs.open(p, 'r', 'utf-8').read()
content = re.sub(r', extractClauseReference', '', content)
codecs.open(p, 'w', 'utf-8').write(content)

# 6. pages/admin/AdminStripeInsightsPage.jsx
p = 'src/pages/admin/AdminStripeInsightsPage.jsx'
content = codecs.open(p, 'r', 'utf-8').read()
content = re.sub(r'const isDark =.*?\\n', '', content)
codecs.open(p, 'w', 'utf-8').write(content)

# 7. contexts/SubscriptionContext.jsx
p = 'src/contexts/SubscriptionContext.jsx'
content = codecs.open(p, 'r', 'utf-8').read()
content = content.replace('export const SubscriptionProvider =', '// eslint-disable-next-line react-refresh/only-export-components\\nexport const SubscriptionProvider =')
codecs.open(p, 'w', 'utf-8').write(content)

