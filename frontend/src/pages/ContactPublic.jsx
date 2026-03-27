import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { sendContactMessage } from '../services/api';
import { emitAppToast } from '../utils/toast';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import './ContactPage.css';
import { Link } from 'react-router-dom';

const ContactPublic = () => {
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSubmitStatus(null);
    try {
      const response = await sendContactMessage(formData, { isPublic: true });
      if (response.ticketId || response.message === 'Ticket created') {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        emitAppToast({ type: 'success', title: t('notifications.contactSentTitle'), message: t('notifications.contactSentMessage') });
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Contact public error:', err);
      setError(err.message || (isRTL ? 'שליחת ההודעה נכשלה. נסו שוב.' : 'Failed to send message. Please try again.'));
      setSubmitStatus('error');
      emitAppToast({ type: 'error', title: t('notifications.contactFailedTitle'), message: err.message || t('notifications.contactFailedMessage') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page page-container" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="contact-header animate-fadeIn">
        <h1>
          <span className="contact-title-icon" aria-hidden="true">
            <Mail size={20} strokeWidth={2.2} />
          </span>
          <span>{t('nav.contact')}</span>
        </h1>
        <p>{isRTL ? 'יש לכם שאלה או צריכים עזרה? שלחו לנו הודעה.' : "Have a question or need help? Send us a message."}</p>
      </div>

      <div className="contact-content">
        <Card variant="elevated" padding="lg" className="contact-form-card animate-slideUp">
          {submitStatus === 'success' ? (
            <div className="success-message">
              <span className="success-icon" aria-hidden="true">
                <CheckCircle2 size={36} strokeWidth={2.4} />
              </span>
              <h3>{isRTL ? 'ההודעה נשלחה!' : 'Message Sent!'}</h3>
              <p>{isRTL ? 'נחזור אליכם תוך 24 שעות.' : "We'll get back to you within 24 hours."}</p>
              <Button variant="secondary" onClick={() => setSubmitStatus(null)}>
                {isRTL ? 'שליחת הודעה נוספת' : 'Send Another Message'}
              </Button>
              <div style={{ marginTop: '0.75rem' }}>
                <Link to="/?auth=register" className="cta-btn">
                  {isRTL ? 'הרשמה לקבלת גרסה חינמית' : 'Register to get the free plan'}
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3>{isRTL ? 'שלחו לנו הודעה' : 'Send Us a Message'}</h3>

              <div className="form-row">
                <Input label={isRTL ? 'שם' : 'Name'} name="name" value={formData.name} onChange={handleChange} required placeholder={isRTL ? 'ישראל ישראלי' : 'John Smith'} />
                <Input label={isRTL ? 'אימייל' : 'Email'} name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="example@email.com" />
              </div>

              <Input label={isRTL ? 'נושא' : 'Subject'} name="subject" value={formData.subject} onChange={handleChange} required placeholder={isRTL ? 'במה נוכל לעזור?' : 'How can we help?'} />

              <div className="textarea-wrapper">
                <label className="input-label">{isRTL ? 'הודעה' : 'Message'}</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder={isRTL ? 'תארו את הבעיה או השאלה שלכם בפירוט...' : 'Describe your issue or question in detail...'}
                  rows={5}
                  className="contact-textarea"
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <Button variant="primary" fullWidth loading={isSubmitting} type="submit">
                {isSubmitting ? (isRTL ? 'שולח...' : 'Sending...') : (isRTL ? 'שליחת הודעה' : 'Send Message')}
              </Button>

              <p style={{ marginTop: '0.75rem' }}>
                {isRTL ? 'או' : 'Or'} <Link to="/?auth=register" className="cta-btn">{isRTL ? 'הירשמו בחינם' : 'Register free'}</Link> {isRTL ? 'כדי להתחיל לנתח חוזים' : 'to start analyzing contracts'}.
              </p>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ContactPublic;
