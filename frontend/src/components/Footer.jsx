import React from 'react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <span className="footer-logo">🛡️</span>
                    <span className="footer-name">RentGuard 360</span>
                </div>
                <div className="footer-info">
                    <p>AI-Powered Lease Analysis Platform</p>
                    <p className="footer-credits">
                        Built with ❤️ by{' '}
                        <a href="https://github.com/RonPiece" target="_blank" rel="noopener noreferrer" className="footer-link">
                            Ron
                        </a>
                        {' & '}
                        <a href="https://github.com/MoTy" target="_blank" rel="noopener noreferrer" className="footer-link">
                            Moty
                        </a>
                    </p>
                </div>
                <div className="footer-meta">
                    <p>© {currentYear} RentGuard 360. Cloud Computing Final Project.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
