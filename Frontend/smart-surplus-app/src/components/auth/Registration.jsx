import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student', // Default role
  });
  const [error, setError] = useState('');
  const { register } = useAuth(); // We will create this function next
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    // The register function in AuthContext will handle the logic
    const success = register(formData);
    if (success) {
      alert('Registration successful! Please log in.');
      navigate('/login');
    } else {
      setError('An account with this email already exists.');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="role">I am a...</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="canteen-organizer">Canteen / Event Staff</option>
          </select>
        </div>
        <button type="submit" className="submit-button">Create Account</button>
      </form>
      {/* Reusing the same styles from LoginForm */}
      <style jsx>{`
        .auth-form { max-width: 400px; margin: 0 auto; }
        .error-message { color: #D32F2F; background-color: #FFCDD2; padding: 10px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 8px; }
        .form-group input, .form-group select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
        .submit-button { width: 100%; padding: 15px; background-color: #2C5E4A; color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: 600; cursor: pointer; }
      `}</style>
    </>
  );
};

export default RegistrationForm;
