import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext();

// --- FIX: Define role-specific badge lists ---

// Badges for Students
const studentBadges = [
    { id: 'first_meal_saved', icon: '🍔', title: 'First Meal Saved' },
    { id: 'five_meals_saved', icon: '🙌', title: 'High-Five Saver' },
    { id: 'eco_conscious', icon: '🌿', title: 'Eco-Conscious' },
    { id: 'weekly_champion', icon: '🏆', title: 'Weekly Champion' },
    { id: 'perfect_streak', icon: '🗓️', title: 'Perfect Streak' },
    { id: 'community_sharer', icon: '🤝', title: 'Community Sharer' },
];

// Badges for Canteen Organizers
const organizerBadges = [
    { id: 'first_listing', icon: '✅', title: 'First Listing' },
    { id: 'zero_waste_day', icon: '🌟', title: 'Zero-Waste Day' },
    { id: 'consistent_contributor', icon: '🔄', title: 'Consistent Contributor' },
    { id: 'community_favorite', icon: '💖', title: 'Community Favorite' },
    { id: 'surplus_superstar', icon: '🦸', title: 'Surplus Superstar' },
    { id: 'efficiency_expert', icon: '⚙️', title: 'Efficiency Expert' },
];

// Badges for NGOs
const ngoBadges = [
    { id: 'first_pickup', icon: '🚚', title: 'First Pickup' },
    { id: 'community_connector', icon: '🔗', title: 'Community Connector' },
    { id: 'impact_maker', icon: '🌍', title: 'Impact Maker' },
    { id: 'logistics_leader', icon: '🗺️', title: 'Logistics Leader' },
    { id: 'hunger_hero', icon: '❤️', title: 'Hunger Hero' },
    { id: 'outreach_champion', icon: '📣', title: 'Outreach Champion' },
];


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
        if (res.data && res.data._id) {
          const userData = { ...res.data, id: res.data._id };
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error("Token is invalid or API error:", err.response?.data || err.message);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  // --- FIX: Dynamically select badges based on user role ---
  const roleSpecificBadges = useMemo(() => {
    switch (user?.role) {
      case 'student':
        return studentBadges;
      case 'canteen-organizer':
        return organizerBadges;
      case 'ngo':
        return ngoBadges;
      default:
        return []; // Return an empty array if role is not set
    }
  }, [user]); // Recalculate only when the user object changes

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuthToken(res.data.token);
      await loadUser();
      return true;
    } catch (err) {
      console.error('Login failed:', err.response?.data?.msg || err.message);
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
      console.error('Registration failed:', err.response?.data?.msg || err.message);
      return false;
    }
  };

  const logout = () => {
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
  
  // --- FIX: Add the dynamic `roleSpecificBadges` to the context value ---
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    loadUser,
    incrementWeeklyChallenge,
    allBadges: roleSpecificBadges, // <-- EXPOSE THE ROLE-SPECIFIC BADGES
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
