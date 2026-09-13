import { API_URL } from '../config';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({ setAdminToken }) => {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setAdminToken(data.token);
        setLoginError('');
        navigate('/super-admin/dashboard');
      } else {
        setLoginError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setLoginError('Server error, please try again later');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', paddingTop: '50px', paddingBottom: '50px' }}>
      <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h1 className="section-title" style={{ margin: 0, textAlign: 'center' }}>Super Admin Login</h1>
        {loginError && <p style={{ color: '#ff6b6b', textAlign: 'center', margin: 0 }}>{loginError}</p>}
        <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="email" placeholder="Email" required value={adminEmail} onChange={e => setAdminEmail(e.target.value)} style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }} />
          <input type="password" placeholder="Password" required value={adminPassword} onChange={e => setAdminPassword(e.target.value)} style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }} />
          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '10px' }}>Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
