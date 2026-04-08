import React from 'react';
import { RefreshCw } from 'lucide-react';

export const GlobalSpinner = ({ text, fullPage = false, size = 40 }) => {
  const inlineStyle = { color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' };
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <RefreshCw size={size} style={inlineStyle} />
      {text && <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="app-loading" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {content}
      </div>
    );
  }

  return content;
};
