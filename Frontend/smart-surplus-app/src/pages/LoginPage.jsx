import React from 'react';
import LoginForm from '../components/auth/LoginForm.jsx';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <>
      <div className="auth-page-container">
        <div className="page-header">
          <h1 className="page-title">Welcome Back!</h1>
          <p className="page-subtitle">Log in to manage or claim surplus food.</p>
        </div>
        <LoginForm />
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
      <style jsx>{`
        .auth-page-container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .page-header { text-align: center; margin-bottom: 40px; }
        .page-title { font-size: 2.8rem; font-weight: 700; color: #2C5E4A; margin: 0; }
        .page-subtitle { font-size: 1.1rem; color: #555; }
        .auth-switch { text-align: center; margin-top: 25px; }
        .auth-switch a { color: #FF7A59; text-decoration: none; font-weight: 600; }
      `}</style>
    </>
  );
};

export default LoginPage;