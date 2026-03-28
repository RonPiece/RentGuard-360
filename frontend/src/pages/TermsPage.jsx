/**
 * ============================================
 *  TermsPage
 *  Terms of Service & Privacy Policy
 * ============================================
 */
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Calendar } from 'lucide-react';
import './TermsPage.css';

const TermsPage = () => {
    const { t, isRTL } = useLanguage();

    const sections = isRTL ? [
        {
            id: 'acceptance',
            title: '1. הסכמה לתנאים',
            content: 'בשימוש באתר ובשירותי RentGuard 360, אתה מסכים לתנאי שימוש אלה. אם אינך מסכים לתנאים, אנא הימנע משימוש בשירותים.',
        },
        {
            id: 'service',
            title: '2. תיאור השירות',
            content: 'RentGuard 360 מספקת שירות ניתוח חוזי שכירות באמצעות בינה מלאכותית. השירות כולל:',
            list: [
                'סריקה אוטומטית של חוזי שכירות בפורמט PDF',
                'זיהוי סעיפים בעייתיים וניגודי אינטרסים',
                'דירוג סיכון מפורט לכל סעיף',
                'המלצות ותיקונים מוצעים',
                'יצוא דוחות בפורמט PDF ו-Word',
            ],
        },
        {
            id: 'purchases',
            title: '3. רכישות ותשלומים',
            content: 'כל הרכישות באתר הן רכישות חד-פעמיות של חבילות סריקה. לא מתבצע חיוב חוזר או מנוי מתחדש אוטומטית. התשלומים מעובדים באמצעות Stripe ומאובטחים בהתאם לתקני PCI DSS. RentGuard 360 אינה שומרת את פרטי כרטיס האשראי שלך — כל המידע הרגיש מנוהל ישירות על ידי Stripe.',
        },
        {
            id: 'refund',
            title: '4. מדיניות החזרים',
            content: 'מאחר שהשירות מספק ניתוח מיידי לאחר רכישה, החזרים יינתנו רק במקרים יוצאי דופן (למשל כשל טכני שמנע מהמערכת להשלים את הניתוח). לבקשות החזר, פנו אלינו דרך עמוד צור קשר.',
        },
        {
            id: 'data',
            title: '5. שמירת מידע ופרטיות',
            content: 'אנו מחויבים להגנה על פרטיותך. הנקודות העיקריות:',
            list: [
                'חוזים שהועלו מאוחסנים מוצפנים בשרתי AWS',
                'המידע משמש אך ורק לצורך מתן השירות המבוקש',
                'אנו לא מוכרים או משתפים מידע אישי עם צדדים שלישיים',
                'תוכלו לבקש מחיקת המידע שלכם בכל עת',
                'אנו משתמשים ב-cookies הכרחיים בלבד לתפעול האתר',
            ],
        },
        {
            id: 'security',
            title: '6. אבטחת מידע',
            content: 'אנו מיישמים אמצעי אבטחה מתקדמים כדי להגן על המידע שלכם, כולל הצפנת SSL/TLS, אחסון מוצפן, אימות רב-שלבי (MFA) וניטור אבטחה שוטף. השרתים שלנו מתארחים ב-AWS ועומדים בתקני אבטחה בינלאומיים.',
        },
        {
            id: 'disclaimer',
            title: '7. הגבלת אחריות',
            content: 'הניתוח המסופק על ידי RentGuard 360 הוא בגדר מידע כללי בלבד ואינו מהווה ייעוץ משפטי. מומלץ בחום להתייעץ עם עורך דין לפני חתימה על כל חוזה. RentGuard 360 אינה אחראית להחלטות שהתקבלו על בסיס הניתוח בלבד.',
        },
        {
            id: 'ip',
            title: '8. קניין רוחני',
            content: 'כל הזכויות בשירות, כולל עיצוב, קוד, אלגוריתמים ותוכן, שייכות ל-RentGuard 360. אין להעתיק, להפיץ או לשכפל כל חלק מהשירות ללא אישור בכתב.',
        },
        {
            id: 'changes',
            title: '9. שינויים בתנאים',
            content: 'אנו שומרים לעצמנו את הזכות לעדכן תנאים אלה מעת לעת. שינויים מהותיים יפורסמו באתר ו/או ישלחו בדוא"ל. המשך השימוש בשירות לאחר עדכון התנאים מהווה הסכמה לתנאים המעודכנים.',
        },
        {
            id: 'contact',
            title: '10. יצירת קשר',
            content: 'לשאלות בנוגע לתנאי שימוש אלה או לכל נושא אחר, ניתן לפנות אלינו דרך עמוד צור קשר באתר או במייל.',
        },
    ] : [
        {
            id: 'acceptance',
            title: '1. Acceptance of Terms',
            content: 'By using the RentGuard 360 website and services, you agree to these Terms of Service. If you do not agree, please refrain from using our services.',
        },
        {
            id: 'service',
            title: '2. Service Description',
            content: 'RentGuard 360 provides AI-powered rental contract analysis. The service includes:',
            list: [
                'Automated scanning of rental contracts in PDF format',
                'Identification of problematic clauses and conflicts of interest',
                'Detailed risk scoring for each clause',
                'Recommendations and suggested amendments',
                'Report export in PDF and Word formats',
            ],
        },
        {
            id: 'purchases',
            title: '3. Purchases & Payments',
            content: 'All purchases on the site are one-time purchases of scan bundles. There is no recurring billing or auto-renewing subscriptions. Payments are processed through Stripe and are secured according to PCI DSS standards. RentGuard 360 does not store your credit card details — all sensitive information is handled directly by Stripe.',
        },
        {
            id: 'refund',
            title: '4. Refund Policy',
            content: 'Since the service provides instant analysis upon purchase, refunds are only issued in exceptional circumstances (e.g., a technical failure that prevented the system from completing the analysis). For refund requests, please contact us through the Contact page.',
        },
        {
            id: 'data',
            title: '5. Data Storage & Privacy',
            content: 'We are committed to protecting your privacy. Key points:',
            list: [
                'Uploaded contracts are stored encrypted on AWS servers',
                'Information is used solely to provide the requested service',
                'We do not sell or share personal data with third parties',
                'You may request deletion of your data at any time',
                'We use only essential cookies for site operation',
            ],
        },
        {
            id: 'security',
            title: '6. Data Security',
            content: 'We implement advanced security measures to protect your information, including SSL/TLS encryption, encrypted storage, multi-factor authentication (MFA), and continuous security monitoring. Our servers are hosted on AWS and comply with international security standards.',
        },
        {
            id: 'disclaimer',
            title: '7. Limitation of Liability',
            content: 'The analysis provided by RentGuard 360 is for informational purposes only and does not constitute legal advice. It is strongly recommended to consult with a lawyer before signing any contract. RentGuard 360 is not liable for decisions made based solely on the analysis.',
        },
        {
            id: 'ip',
            title: '8. Intellectual Property',
            content: 'All rights in the service, including design, code, algorithms, and content, belong to RentGuard 360. No part of the service may be copied, distributed, or reproduced without written permission.',
        },
        {
            id: 'changes',
            title: '9. Changes to Terms',
            content: 'We reserve the right to update these terms from time to time. Material changes will be published on the site and/or sent by email. Continued use of the service after terms are updated constitutes acceptance of the updated terms.',
        },
        {
            id: 'contact',
            title: '10. Contact Us',
            content: 'For questions regarding these Terms of Service or any other matter, please contact us through the Contact page on the site or by email.',
        },
    ];

    return (
        <div className="terms-container" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="terms-header">
                <h1>{isRTL ? 'תנאי שירות ומדיניות פרטיות' : 'Terms of Service & Privacy Policy'}</h1>
                <span className="terms-updated">
                    <Calendar size={14} />
                    {isRTL ? 'עודכן לאחרונה: מרץ 2026' : 'Last updated: March 2026'}
                </span>
            </div>

            {/* Table of Contents */}
            <nav className="terms-toc">
                <h3>{isRTL ? 'תוכן עניינים' : 'Table of Contents'}</h3>
                <ol className="terms-toc-list">
                    {sections.map((section, idx) => (
                        <li key={section.id}>
                            <a href={`#${section.id}`}>
                                <span className="toc-number">{idx + 1}</span>
                                {section.title.replace(/^\d+\.\s*/, '')}
                            </a>
                        </li>
                    ))}
                </ol>
            </nav>

            {/* Sections */}
            <div className="terms-sections">
                {sections.map((section, idx) => (
                    <section key={section.id} id={section.id} className="terms-section">
                        <div className="section-header">
                            <span className="section-number">{idx + 1}</span>
                            <h2>{section.title.replace(/^\d+\.\s*/, '')}</h2>
                        </div>
                        <p>{section.content}</p>
                        {section.list && (
                            <ul>
                                {section.list.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        )}
                    </section>
                ))}
            </div>

            {/* Contact Footer */}
            <div className="terms-contact-bar">
                <p>
                    {isRTL
                        ? <>לשאלות נוספות, פנו אלינו דרך <a href="/contact">עמוד צור קשר</a> או במייל ל- <a href="mailto:support@rentguard360.com">support@rentguard360.com</a></>
                        : <>For additional questions, reach us via the <a href="/contact">Contact page</a> or email us at <a href="mailto:support@rentguard360.com">support@rentguard360.com</a></>
                    }
                </p>
            </div>
        </div>
    );
};

export default TermsPage;
