/**
 * ============================================
 *  GlobalSpinner Component
 *  Centered loading indicator
 * ============================================
 * 
 * STRUCTURE:
 * - Optional full-page centering
 * - Optional text label
 * 
 * DEPENDENCIES:
 * - lucide-react (RefreshCw)
 * ============================================
 */
import React from 'react';
import PropTypes from 'prop-types';
import { RefreshCw } from 'lucide-react';
import './GlobalSpinner.css';

export const GlobalSpinner = ({ text, fullPage = false, size = 40 }) => {
  const content = (
    <div className="global-spinner-container">
      <RefreshCw size={size} className="global-spinner-icon" />
      {text && <p className="global-spinner-text">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="app-loading global-spinner-fullpage">
        {content}
      </div>
    );
  }

  return content;
};

GlobalSpinner.propTypes = {
    text: PropTypes.string,
    fullPage: PropTypes.bool,
    size: PropTypes.number,
};
