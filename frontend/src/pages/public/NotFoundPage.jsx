import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h1>404 - Page Not Found</h1>
      <p style={{ margin: '20px 0' }}>The page you are looking for does not exist or has been moved.</p>
      <Link 
        to="/" 
        style={{ padding: '10px 20px', background: '#1976d2', color: 'white', textDecoration: 'none', borderRadius: '4px' }}
      >
        Return Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
