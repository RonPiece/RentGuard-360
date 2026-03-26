import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { getPackages } from '../services/stripeApi';
import './PricingPage.css';
import { useNavigate } from 'react-router-dom';
import { BadgeDollarSign } from 'lucide-react';

const FALLBACK_PACKAGES = [
  { id: 'free', name: 'Free', price: 0, scanLimit: 1, desc: 'Try basic analysis for free' },
  { id: 'basic', name: 'Basic', price: 39, scanLimit: 5, desc: 'Small plan for individuals' },
  { id: 'pro', name: 'Pro', price: 79, scanLimit: 15, desc: 'For power users and teams' },
];

const normalizePlanName = (value) => String(value || '').trim().toLowerCase();

const getPackageIcon = (name) => {
  switch (name) {
    case 'Free':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );
    case 'Basic':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case 'Pro':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      );
    default:
      return null;
  }
};

const getFeatures = (pkgName, t) => {
  const featuresByPlan = {
    free: t('pricing.featuresFree', { returnObjects: true }),
    basic: t('pricing.featuresBasic', { returnObjects: true }),
    pro: t('pricing.featuresPro', { returnObjects: true }),
  };
  return featuresByPlan[normalizePlanName(pkgName)] || [];
};

const PricingPublic = () => {
  const { t, isRTL } = useLanguage();
  const [packages, setPackages] = useState(FALLBACK_PACKAGES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        const data = await getPackages();
        if (data && Array.isArray(data) && data.length) {
          // Only show Free / Basic / Pro on public pricing
          const allowed = new Set(['free', 'basic', 'pro']);
          const filtered = data.filter((pkg) => {
            const name = (pkg.name || pkg.displayName || pkg.PackageName || String(pkg.id)).toString().toLowerCase();
            return allowed.has(name);
          });
          setPackages(filtered.length ? filtered : FALLBACK_PACKAGES);
        } else {
          setPackages(FALLBACK_PACKAGES);
        }
      } catch (err) {
        console.warn('PricingPublic: using fallback packages', err.message);
        setPackages(FALLBACK_PACKAGES);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleRegister = () => {
    navigate('/?auth=register');
  };

  const getDisplayPlanName = (pkgName) => {
    const normalized = normalizePlanName(pkgName);
    if (normalized === 'free' || normalized === 'basic' || normalized === 'pro') {
      return t(`pricing.${normalized}`);
    }
    return pkgName;
  };

  const getDisplayPlanDesc = (pkgName, fallbackDesc) => {
    const normalized = normalizePlanName(pkgName);
    if (normalized === 'free' || normalized === 'basic' || normalized === 'pro') {
      return t(`pricing.${normalized}Desc`);
    }
    return fallbackDesc || '';
  };

  return (
    <div className="pricing-page page-container" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="section-band">
        <section className="pricing-hero animate-fadeIn">
          <h1 className="pricing-title">
            <span>{t('pricing.title')}</span>
          </h1>
          <p className="pricing-subtitle">{t('pricing.subtitle')}</p>
        </section>
      </div>

      <div className="section-band-alt">
        <section className="pricing-cards-section">
          <div className="pricing-cards-grid">
            {packages.map((pkg, index) => (
              <div key={pkg.id} className={`pricing-card-wrapper animate-slideUp`} style={{ animationDelay: `${index * 120}ms` }}>
                <Card variant="elevated" padding="lg" className="pricing-card">
                  <div className="pricing-card-header">
                    <div className={`pricing-icon ${normalizePlanName(pkg.name)}`}>
                      {getPackageIcon(pkg.name)}
                    </div>
                    <h3 className="pricing-card-name">{getDisplayPlanName(pkg.name)}</h3>
                    <p className="pricing-card-desc">{getDisplayPlanDesc(pkg.name, pkg.desc)}</p>
                  </div>

                  <div className="pricing-card-price">
                    {pkg.price <= 0 ? (
                      <span className="price-amount free">{t('pricing.free')}</span>
                    ) : (
                      <>
                        <span className="price-currency">{isRTL ? '₪' : '$'}</span>
                        <span className="price-amount">{pkg.price}</span>
                      </>
                    )}
                  </div>

                  <div className="pricing-card-scans">
                    <span className={`scan-limit ${pkg.scanLimit === -1 ? 'unlimited' : ''}`}>
                      {pkg.scanLimit === -1 ? t('subscription.unlimited') : `${pkg.scanLimit} ${t('pricing.scans')}`}
                    </span>
                  </div>

                  <ul className="pricing-features">
                    {getFeatures(pkg.name, t).map((feature, i) => (
                      <li key={i} className="pricing-feature">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success)" strokeWidth="2.5">
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pricing-card-cta">
                    <Button variant="primary" fullWidth onClick={handleRegister}>
                      {pkg.price <= 0 ? t('pricing.getStarted') : (isRTL ? 'הירשמו לרכישה' : 'Register to purchase')}
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PricingPublic;
