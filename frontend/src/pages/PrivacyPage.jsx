/**
 * ============================================
 *  PrivacyPage
 *  Privacy Policy
 * ============================================
 */
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Calendar } from 'lucide-react';
import './TermsPage.css';

const PrivacyPage = () => {
    const { translations, isRTL } = useLanguage();
    const { title, updated, tocTitle, sections, contactPrefix, contactLinkText, contactMiddle } = translations.privacy;

    return (
        <div className="terms-container" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="terms-header">
                <h1>{title}</h1>
                <span className="terms-updated">
                    <Calendar size={14} />
                    {updated}
                </span>
            </div>

            {/* Table of Contents */}
            <nav className="terms-toc">
                <h3>{tocTitle}</h3>
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
                    {contactPrefix} <a href="/contact">{contactLinkText}</a> {contactMiddle} <a href="mailto:support@rentguard360.com">support@rentguard360.com</a>
                </p>
            </div>
        </div>
    );
};

export default PrivacyPage;
