/**
 * ============================================
 * ContactPage
 * Customer Support Contact Form
 * ============================================
 */
import React, { useState } from 'react';
import { Mail, CheckCircle2, MapPin, Phone, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { sendContactMessage } from '../services/api';
import { emitAppToast } from '../utils/toast';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import './ContactPage.css';

const ContactPage = () => {
    const { userAttributes } = useAuth();
    const { t, isRTL } = useLanguage();
    const [formData, setFormData] = useState({
        name: userAttributes?.name || '',
        email: userAttributes?.email || '',
        phone: '', // Added phone field from the new design
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSubmitStatus(null);

        try {
            const response = await sendContactMessage({
                ...formData,
                email: userAttributes?.email || formData.email,
                // Defaulting subject since it's removed from UI but might be needed by API
                subject: isRTL ? 'פנייה חדשה מדף צור קשר' : 'New Contact Page Inquiry'
            });

            if (response.ticketId || response.message === 'Ticket created') {
                setSubmitStatus('success');
                setFormData({ ...formData, phone: '', message: '' });
                emitAppToast({
                    type: 'success',
                    title: t('notifications.contactSentTitle'),
                    message: t('notifications.contactSentMessage'),
                });
            } else {
                throw new Error(response.error || 'Failed to send message');
            }
        } catch (err) {
            console.error('Contact form error:', err);
            setError(err.message || (isRTL ? 'שליחת ההודעה נכשלה. נסו שוב.' : 'Failed to send message. Please try again.'));
            setSubmitStatus('error');
            emitAppToast({
                type: 'error',
                title: t('notifications.contactFailedTitle'),
                message: err.message || t('notifications.contactFailedMessage'),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-page page-container" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* Header Section */}
            <div className="contact-header animate-fadeIn">
                <h1 className="headline-font">
                    {isRTL ? 'אנחנו כאן בשבילך' : 'We are here for you'}
                </h1>
                <p>
                    {isRTL
                        ? 'יש לך שאלות לגבי ניהול השכירות שלך? הצוות המקצועי של RentGuard זמין לסייע לך בכל נושא משפטי או טכני.'
                        : 'Have questions about your rental management? The RentGuard professional team is available to assist you with any legal or technical issue.'}
                </p>
            </div>

            {/* Main Layout Grid */}
            <div className="contact-grid">

                {/* Left/Right Column: Contact Form */}
                <div className="contact-form-column animate-slideUp">
                    <Card variant="elevated" padding="lg" className="contact-form-card">
                        {submitStatus === 'success' ? (
                            <div className="success-message">
                                <span className="success-icon" aria-hidden="true">
                                    <CheckCircle2 size={48} strokeWidth={2} />
                                </span>
                                <h3>{isRTL ? 'ההודעה נשלחה בהצלחה!' : 'Message Sent Successfully!'}</h3>
                                <p>{isRTL ? 'נחזור אליכם בהקדם האפשרי.' : 'We\'ll get back to you as soon as possible.'}</p>
                                <Button
                                    variant="secondary"
                                    onClick={() => setSubmitStatus(null)}
                                >
                                    {isRTL ? 'שליחת הודעה נוספת' : 'Send Another Message'}
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-row-2col">
                                    <Input
                                        label={isRTL ? 'שם מלא' : 'Full Name'}
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder={isRTL ? 'ישראל ישראלי' : 'John Smith'}
                                    />
                                    <Input
                                        label={isRTL ? 'טלפון' : 'Phone'}
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        dir="ltr"
                                        placeholder="054-7820346"
                                    />
                                </div>

                                <Input
                                    label={isRTL ? 'אימייל' : 'Email'}
                                    name="email"
                                    type="email"
                                    value={userAttributes?.email || formData.email}
                                    onChange={handleChange}
                                    disabled={!!userAttributes?.email}
                                    required
                                    dir="ltr"
                                    placeholder="name@company.com"
                                />

                                <div className="textarea-wrapper">
                                    <label className="input-label">{isRTL ? 'הודעה' : 'Message'}</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        placeholder={isRTL ? 'איך נוכל לעזור לך היום?' : 'How can we help you today?'}
                                        rows={5}
                                        className="contact-textarea"
                                    />
                                </div>

                                {error && <p className="form-error">{error}</p>}

                                <Button
                                    variant="primary"
                                    fullWidth
                                    loading={isSubmitting}
                                    type="submit"
                                    className="submit-btn"
                                >
                                    <span>{isSubmitting ? (isRTL ? 'שולח...' : 'Sending...') : (isRTL ? 'שלח הודעה' : 'Send Message')}</span>
                                    {!isSubmitting && <Send size={18} className={isRTL ? 'icon-rtl' : 'icon-ltr'} />}
                                </Button>
                            </form>
                        )}
                    </Card>
                </div>

                {/* Left/Right Column: Info & Branding */}
                <div className="contact-info-column animate-slideUp" style={{ animationDelay: '100ms' }}>

                    {/* Contact Details Card */}
                    <div className="info-details-card">
                        <h2 className="headline-font">{isRTL ? 'פרטי התקשרות' : 'Contact Details'}</h2>
                        <ul className="info-list">
                            <li>
                                <div className="info-icon">
                                    <MapPin size={20} />
                                </div>
                                <div className="info-text">
                                    <p className="info-label">{isRTL ? 'כתובתנו' : 'Address'}</p>
                                    <p className="info-value">{isRTL ? 'אור עקיבא, המרכז המשפטי, ישראל' : 'Or Akiva, The Legal Center, Israel'}</p>
                                </div>
                            </li>
                            <li>
                                <div className="info-icon">
                                    <Mail size={20} />
                                </div>
                                <div className="info-text">
                                    <p className="info-label">{isRTL ? 'דואר אלקטרוני' : 'Email'}</p>
                                    <p className="info-value" dir="ltr">rentguard360@gmail.com</p>
                                </div>
                            </li>
                            <li>
                                <div className="info-icon">
                                    <Phone size={20} />
                                </div>
                                <div className="info-text">
                                    <p className="info-label">{isRTL ? 'טלפון' : 'Phone'}</p>
                                    <p className="info-value" dir="ltr">050-0000000</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Office Image Branding Box */}
                    <div className="brand-image-card">
                        <img
                            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
                            alt="Office"
                            className="office-bg"
                        />
                        <div className="brand-image-overlay">
                            <p>
                                {isRTL
                                    ? 'הצטרפו לאלפי בעלי נכסים שבוחרים בשקט נפשי עם RentGuard.'
                                    : 'Join thousands of property owners who choose peace of mind with RentGuard.'}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ContactPage;