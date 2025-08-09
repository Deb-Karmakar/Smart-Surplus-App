import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = login(email, password);
    if (success) {
      navigate('/browse'); // Redirect to browse page on successful login
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="e.g., canteen@test.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="e.g., password"
          />
        </div>
        <button type="submit" className="submit-button">Log In</button>
      </form>
      {/* You can share these styles with RegisterForm */}
      <style jsx>{`
        .auth-form { max-width: 400px; margin: 0 auto; }
        .error-message { color: #D32F2F; background-color: #FFCDD2; padding: 10px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 8px; }
        .form-group input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
        .submit-button { width: 100%; padding: 15px; background-color: #2C5E4A; color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: 600; cursor: pointer; }
      `}</style>
    </>
  );
};

export default LoginForm;