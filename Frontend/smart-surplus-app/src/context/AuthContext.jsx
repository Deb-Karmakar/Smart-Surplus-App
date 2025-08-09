import React, { createContext, useState, useContext } from 'react';

// --- NEW: A mock "database" of all users in the system ---
const mockUsers = [
  { id: 1, name: 'Canteen Staff', email: 'canteen@test.com', password: 'password', role: 'canteen-organizer', points: 50 },
  { id: 2, name: 'Test Student', email: 'student@test.com', password: 'password', role: 'student', points: 120 },
  { id: 3, name: 'Riya Sharma', email: 'riya@test.com', password: 'password', role: 'student', points: 90 },
  { id: 4, name: 'Amit Singh', email: 'amit@test.com', password: 'password', role: 'student', points: 150 },
  { id: 5, name: 'Priya Patel', email: 'priya@test.com', password: 'password', role: 'student', points: 75 },
];

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // --- NEW: State to hold the list of all users ---
  const [users, setUsers] = useState(mockUsers);

  const login = (email, password) => {
    // The login function now uses the new `users` state array
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };
  
  const addPoints = (userId, pointsToAdd) => {
    setUsers(currentUsers =>
      currentUsers.map(u =>
        u.id === userId ? { ...u, points: u.points + pointsToAdd } : u
      )
    );
    // Also update the currently logged-in user's points in real-time
    if (user && user.id === userId) {
        setUser(currentUser => ({...currentUser, points: currentUser.points + pointsToAdd}));
    }
  };
  
  // Mock registration function
  const register = (formData) => {
      console.log("Registered (mock):", formData);
      return true;
  }

  const value = {
    user,
    users, // <-- Expose the full user list for the leaderboard
    isAuthenticated: !!user,
    login,
    logout,
    register,
    addPoints,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
