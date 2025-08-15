import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      try {
        const res = await api.get('/auth'); 
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Token is invalid, removing.", err);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuthToken(res.data.token);
      await loadUser();
      return true;
    } catch (err) {
      console.error(err.response?.data?.msg || 'Login failed');
      return false;
    }
  };
  
  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      setAuthToken(res.data.token);
      await loadUser();
      return true;
    } catch (err) {
      console.error(err.response?.data?.msg || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // --- NEW: Function to update challenge progress on the frontend ---
  const incrementWeeklyChallenge = () => {
    setUser(currentUser => {
      // Make sure user and weeklyChallenge exist before trying to update
      if (currentUser && currentUser.weeklyChallenge && currentUser.weeklyChallenge.progress < currentUser.weeklyChallenge.goal) {
        return {
          ...currentUser,
          weeklyChallenge: {
            ...currentUser.weeklyChallenge,
            progress: currentUser.weeklyChallenge.progress + 1,
          },
        };
      }
      // If no update is needed, return the user state as is
      return currentUser;
    });
  };
  
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    loadUser,
    incrementWeeklyChallenge, // <-- Expose the new function
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
