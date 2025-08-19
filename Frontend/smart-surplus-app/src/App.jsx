import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom'; // Changed import
import { FoodProvider } from './context/FoodContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import axios from 'axios';
import { subscribeUser } from './services/pushService.js';


import './App.css';
// Import Components
import Navbar from './components/layout/Navbar.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import Chatbot from './components/shared/Chatbot.jsx';

// Import All Pages
import HomePage from './pages/HomePage.jsx';
import BrowseFoodPage from './pages/BrowseFoodPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AddFoodPage from './pages/AddFoodPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ReachOutPage from './pages/ReachOutPage.jsx';
import VolunteerPage from './pages/VolunteerPage.jsx';
import SummonVolunteerPage from './pages/SummonVolunteerPage.jsx';
import BookingsPage from './pages/BookingsPage.jsx';
import PendingPickupsPage from './pages/PendingPickupsPage.jsx';

// A component to handle the subscription logic
const PushSubscriptionHandler = () => {
  const { isAuthenticated, user } = useAuth();
  const [subscriptionAttempted, setSubscriptionAttempted] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && !subscriptionAttempted) {
      setSubscriptionAttempted(true);
      
      setTimeout(() => {
        subscribeUser()
          .then(() => {
            console.log('✅ Push notification subscription successful');
          })
          .catch((error) => {
            console.error('❌ Push notification subscription failed:', error);
          });
      }, 1000);
    }
  }, [isAuthenticated, user, subscriptionAttempted]);

  return null;
};

const App = () => {
  const [backendStatus, setBackendStatus] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/test')
      .then(res => setBackendStatus(res.data.message))
      .catch(err => {
        console.error(err);
        setBackendStatus('❌ Cannot connect to backend');
      });
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <FoodProvider>
          {/* The <Router> component has been removed from here */}
          <Navbar />
          <PushSubscriptionHandler />
          
          <div style={{ background: '#222', color: '#fff', padding: '5px', textAlign: 'center', fontSize: '14px' }}>
            Backend Status: {backendStatus || 'Checking...'}
          </div>

          <main>
            <Routes>
              {/* --- Public Routes --- */}
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowseFoodPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />

              {/* --- Protected Routes --- */}
              <Route path="/profile" element={ <ProtectedRoute> <ProfilePage /> </ProtectedRoute> } />
              <Route path="/dashboard" element={ <ProtectedRoute> <DashboardPage /> </ProtectedRoute> } />
              <Route path="/notifications" element={ <ProtectedRoute> <NotificationsPage /> </ProtectedRoute> } />
              <Route path="/add-food" element={ <ProtectedRoute allowedRoles={['canteen-organizer']}> <AddFoodPage /> </ProtectedRoute> } />
              <Route path="/analytics" element={ <ProtectedRoute allowedRoles={['canteen-organizer']}> <AnalyticsPage /> </ProtectedRoute> } />
              <Route path="/reach-out" element={ <ProtectedRoute allowedRoles={['canteen-organizer']}> <ReachOutPage /> </ProtectedRoute> } />
              <Route
                path="/volunteer"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <VolunteerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/summon-volunteer"
                element={
                  <ProtectedRoute allowedRoles={['canteen-organizer']}>
                    <SummonVolunteerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute allowedRoles={['ngo']}>
                    <BookingsPage />
                  </ProtectedRoute>
                }
              />
              
              {/* --- ADD THE NEW ROUTE FOR PENDING PICKUPS --- */}
              <Route
                path="/pending-pickups"
                element={
                  <ProtectedRoute allowedRoles={['canteen-organizer']}>
                    <PendingPickupsPage />
                  </ProtectedRoute>
                }
              />
            
            </Routes>
          </main>
          
          <Chatbot />
        </FoodProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;