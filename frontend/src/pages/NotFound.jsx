import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#f8fafc',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #0d9488, #0f172a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          marginBottom: '1.5rem',
        }}
      >
        <ShieldAlert size={36} />
      </div>

      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
        404 - Page Not Found
      </h1>
      <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '440px', marginBottom: '2rem' }}>
        The safety monitoring page or endpoint you are attempting to access does not exist or has been relocated.
      </p>

      <Link to="/" className="btn btn-teal">
        <ArrowLeft size={16} /> Return to Safety Portal
      </Link>
    </div>
  );
};

export default NotFound;
