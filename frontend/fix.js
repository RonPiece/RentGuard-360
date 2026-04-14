const fs = require('fs');

function fixTheme() {
    const f = 'src/pages/admin/AdminStripeInsightsPage.jsx';
    let code = fs.readFileSync(f, 'utf8');
    code = code.replace(/    const isDark = useTheme\(\);\n/, '');
    fs.writeFileSync(f, code);
}

function fixHe() {
    const f = 'src/contexts/LanguageContext/he.js';
    let code = fs.readFileSync(f, 'utf8');
    code = code.replace(/        \"copySuccessTitle\": \"האימייל הועתק\",\n        \"copySuccessMessage\": \"כתובת האימייל הועתקה ללוח הזיכרון\.\",\n        \"copyFailed\": \"לא ניתן להעתיק את האימייל\. אנא בחר והעתק ידנית\.\",\n/g, '');
    fs.writeFileSync(f, code);
}

function fixEn() {
    const f = 'src/contexts/LanguageContext/en.js';
    let code = fs.readFileSync(f, 'utf8');
    code = code.replace(/        \"copySuccessTitle\": \"Email copied\",\n        \"copySuccessMessage\": \"Email address was copied to clipboard\.\",\n        \"copyFailed\": \"Unable to copy email\. Please select and copy manually\.\",\n/g, '');
    fs.writeFileSync(f, code);
}

function fixSub() {
    const f = 'src/contexts/SubscriptionContext.jsx';
    let code = fs.readFileSync(f, 'utf8');
    if (!code.includes('/* eslint-disable react-refresh/only-export-components */')) {
        code = '/* eslint-disable react-refresh/only-export-components */\n' + code;
        fs.writeFileSync(f, code);
    }
}

fixTheme();
fixHe();
fixEn();
fixSub();
console.log('Done fixes!');
