'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) window.location.href = '/';
    else setError('Identifiant ou mot de passe incorrect');
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      background: 'linear-gradient(120deg,#e0e7ff 60%, white 100%)'
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'white',
          padding: '2rem 2.5rem',
          borderRadius: 15,
          boxShadow: '0 4px 24px #39398a22',
          maxWidth: 340,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '0.2em', color: '#39398a' }}>🔒 Connexion</h2>

        <input
          value={username} onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          required
          style={{
            padding: '0.7rem',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            fontSize: '1rem',
            background: '#f4f5fb'
          }}
          autoFocus
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={{
            padding: '0.7rem',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            fontSize: '1rem',
            background: '#f4f5fb'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.7rem',
            borderRadius: 8,
            border: 'none',
            background: loading ? '#bfcafe' : '#5262ea',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.05rem',
            marginTop: '0.5em',
            cursor: loading ? 'wait' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {loading ? 'Connexion...' : 'Login'}
        </button>
        <div style={{
          textAlign: 'center',
          margin: '0.8em 0 0 0',
          color: '#374151',
          fontSize: '0.93rem'
        }}>
          Ask for the <span style={{ fontWeight: 600, color: '#532af2'}}>user/pass</span> if you want to test this app.
          contact@nimaenglish.com
          <br></br>
          telegram: @jeraax
        </div>
        {error &&
          <div style={{
            color: '#e11d48', background: '#fee2e2',
            padding: '0.5em', borderRadius: 7, marginTop: '0.6em',
            textAlign: 'center', fontSize: "0.97rem"
          }}>{error}</div>
        }
      </form>
      <div style={{
        marginTop: '2.1em',
        opacity: 0.88, color: '#39398a', fontSize: '0.97rem'
      }}>
        © 2025 - Private test access only
      </div>
    </div>
  );
}
