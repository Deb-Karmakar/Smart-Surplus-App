import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    console.log('loadUser called, token exists:', !!token); // Debug log
    
    if (token) {
      setAuthToken(token);
      try {
        console.log('Making API call to /auth'); // Debug log
        const res = await api.get('/auth'); 
        console.log('User data received:', res.data); // Debug log
        
        // Ensure user has an ID field
        if (res.data && res.data._id) {
          const userData = {
            ...res.data,
            id: res.data._id // Ensure id field exists
          };
          console.log('Setting user data:', userData); // Debug log
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          console.error('User data missing _id field:', res.data);
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Token is invalid or API error:", err.response?.data || err.message);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      console.log('No token found in localStorage');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email); // Debug log
      const res = await api.post('/auth/login', { email, password });
      console.log('Login successful, token received'); // Debug log
      setAuthToken(res.data.token);
      await loadUser(); // This will set the user data
      return true;
    } catch (err) {
      console.error('Login failed:', err.response?.data?.msg || err.message);
      return false;
    }
  };
  
  const register = async (formData) => {
    try {
      console.log('Attempting registration for:', formData.email); // Debug log
      const res = await api.post('/auth/register', formData);
      console.log('Registration successful, token received'); // Debug log
      setAuthToken(res.data.token);
      await loadUser(); // This will set the user data
      return true;
    } catch (err) {
      console.error('Registration failed:', err.response?.data?.msg || err.message);
      return false;
    }
  };

  const logout = () => {
    console.log('Logging out user'); // Debug log
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const incrementWeeklyChallenge = () => {
    setUser(currentUser => {
      if (currentUser && currentUser.weeklyChallenge && currentUser.weeklyChallenge.progress < currentUser.weeklyChallenge.goal) {
        return {
          ...currentUser,
          weeklyChallenge: {
            ...currentUser.weeklyChallenge,
            progress: currentUser.weeklyChallenge.progress + 1,
          },
        };
      }
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
    incrementWeeklyChallenge,
  };

  // Debug log for every render
  console.log('AuthContext state:', { 
    userExists: !!user, 
    userId: user?.id || user?._id, 
    userRole: user?.role, 
    isAuthenticated, 
    loading 
  });

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};