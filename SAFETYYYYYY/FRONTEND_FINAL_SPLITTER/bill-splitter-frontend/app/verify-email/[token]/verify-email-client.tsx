'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyEmailClient({ token }: { token: string }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:8000/api/auth/users/verify_email/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      credentials: 'include', // ensure cookies are sent
    })
      .then(res => (res.ok ? setStatus('success') : setStatus('error')))
      .catch(() => setStatus('error'));
  }, [token]);

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '1rem',
      }}
    >
      {status === 'loading' && <p style={{ fontSize: '1.5rem' }}>Verifying...</p>}
      {status === 'success' && (
        <>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'green' }}>
            ✅ Email verified!
          </p>
          <button
            onClick={handleLoginClick}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1.1rem',
              cursor: 'pointer',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: '#4F46E5', // Indigo-600
              color: 'white',
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#4338CA')} // Indigo-700
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#4F46E5')}
          >
            Login
          </button>
        </>
      )}
      {status === 'error' && (
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'red' }}>
          ❌ Invalid or expired verification link.
        </p>
      )}
    </div>
  );
}
