import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FoodProvider } from './context/FoodContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Import Components
import Navbar from './components/layout/Navbar.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// Import All Pages
import HomePage from './pages/HomePage.jsx';
import BrowseFoodPage from './pages/BrowseFoodPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AddFoodPage from './pages/AddFoodPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx'; // <-- Import the new page

const App = () => {
  return (
    <AuthProvider>
      <FoodProvider>
        <Router>
          <Navbar />
          <main>
            <Routes>
              {/* --- Public Routes --- */}
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowseFoodPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} /> {/* <-- Add the new route */}
              
              {/* --- Protected Routes --- */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-food"
                element={
                  <ProtectedRoute allowedRoles={['canteen-organizer']}>
                    <AddFoodPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={['canteen-organizer']}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </Router>
      </FoodProvider>
    </AuthProvider>
  );
};

export default App;
