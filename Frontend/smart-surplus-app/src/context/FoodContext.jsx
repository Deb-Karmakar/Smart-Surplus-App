import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext.jsx';
import { useNotifications } from './NotificationContext.jsx';

const FoodContext = createContext();

export const FoodProvider = ({ children }) => {
  const [foodListings, setFoodListings] = useState([]);
  const [myClaimedItems, setMyClaimedItems] = useState([]);
  const [ngoBookings, setNgoBookings] = useState([]);
  const [campusEvents, setCampusEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  // --- NEW: State to hold the calculated analytics ---
  const [analytics, setAnalytics] = useState({ foodSaved: 0, peopleFed: 0, carbonFootprintAvoided: 0 });
  const { user, loadUser } = useAuth();
  const { refreshNotifications } = useNotifications();

  const getListings = async () => {
    try {
      const res = await api.get('/food');
      setFoodListings(res.data);
    } catch (err) { console.error("Failed to fetch food listings", err); }
  };
  
  const fetchCampusEvents = async () => {
      try {
          const res = await api.get('/events');
          setCampusEvents(res.data);
      } catch (err) { console.error("Failed to fetch events", err); }
  }

  const fetchNgoBookings = async () => {
    if (user && user.role === 'ngo') {
      try {
        const res = await api.get('/bookings/mybookings');
        setNgoBookings(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch NGO bookings", err);
        setNgoBookings([]);
      }
    }
  };

  // --- NEW: useEffect to calculate analytics whenever food listings change ---
  useEffect(() => {
    if (foodListings.length > 0) {
        let totalQuantityClaimed = 0;
        foodListings.forEach(listing => {
            if (listing.claims) {
                listing.claims.forEach(claim => {
                    if (claim.pickupStatus === 'confirmed') {
                        totalQuantityClaimed += claim.quantity;
                    }
                });
            }
        });

        // Assuming 1 portion = 0.5 kg of food
        const foodSavedKg = (totalQuantityClaimed * 0.5).toFixed(1);
        const co2Prevented = (foodSavedKg * 2.5).toFixed(1);

        setAnalytics({
            foodSaved: foodSavedKg,
            peopleFed: totalQuantityClaimed,
            carbonFootprintAvoided: co2Prevented
        });
    }
  }, [foodListings]);

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await getListings();
      await fetchCampusEvents();
      if (user) {
        const claimedRes = await api.get('/food/myclaims');
        setMyClaimedItems(claimedRes.data);
        await fetchNgoBookings();
      } else {
        setMyClaimedItems([]);
        setNgoBookings([]);
      }
      setLoading(false);
    };
    initialLoad();
  }, [user]);

  const addFood = async (formData) => {
    try {
      const res = await api.post('/food', formData);
      setFoodListings(prev => [res.data, ...prev]);
      await refreshNotifications();
      return true;
    } catch (err) {
      console.error(err.response?.data?.msg || 'Failed to add food');
      return false;
    }
  };

  const addEvent = async (eventData) => {
      try {
          await api.post('/events', eventData);
          await fetchCampusEvents();
          return true;
      } catch (err) {
          console.error("Failed to add event:", err);
          return false;
      }
  };

  const claimFood = async (foodId, quantityToClaim, deliveryDetails) => {
    try {
      await api.put(`/food/claim/${foodId}`, { quantityToClaim, deliveryDetails });
      await getListings(); 
      await loadUser();
      await refreshNotifications();
      return true;
    } catch (err) {
      console.error("Claim failed:", err.response?.data || err.message);
      return false;
    }
  };
  
  const value = {
    foodListings,
    myClaimedItems,
    ngoBookings,
    campusEvents,
    loading,
    analytics, // <-- Expose the new dynamic analytics
    addFood,
    claimFood,
    addEvent,
  };

  return <FoodContext.Provider value={value}>{children}</FoodContext.Provider>;
};

export const useFood = () => {
  return useContext(FoodContext);
};
