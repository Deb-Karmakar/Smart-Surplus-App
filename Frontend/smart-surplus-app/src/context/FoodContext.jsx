import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { createBooking } from '../services/api';
import { useAuth } from './AuthContext.jsx';
import { useNotifications } from './NotificationContext.jsx';

const FoodContext = createContext();

export const FoodProvider = ({ children }) => {
  const [foodListings, setFoodListings] = useState([]);
  const [myClaimedItems, setMyClaimedItems] = useState([]);
  const [ngoBookings, setNgoBookings] = useState([]);
  const [campusEvents, setCampusEvents] = useState([]);
  const [loading, setLoading] = useState(true);
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
      // Step 1: Perform the general claim
      await api.put(`/food/claim/${foodId}`, { quantityToClaim, deliveryDetails });

      // --- FINAL FIX: Manually update state for an instant, single UI change ---
      if (user && user.role === 'ngo') {
        // Step 2: Create the booking. The API returns the new booking object.
        const response = await createBooking(foodId, quantityToClaim);
        const newBooking = response.data.data;

        // Step 3: Add the new booking to the start of the local state array.
        // This forces React to re-render the BookingsPage with the new item ONCE.
        setNgoBookings(prevBookings => [newBooking, ...prevBookings]);
      }

      // Step 4: Refresh other data in the background. This no longer affects the bookings list directly.
      await getListings(); 
      await refreshNotifications();

      return true;
    } catch (err) {
      console.error("Claim failed:", err.response?.data || err.message);
      // If the claim fails, re-fetch the bookings to ensure data consistency.
      if (user && user.role === 'ngo') {
        await fetchNgoBookings();
      }
      return false;
    }
  };
  
  const analytics = { foodSaved: 0, peopleFed: 0, carbonFootprintAvoided: 0 };

  const value = {
    foodListings,
    myClaimedItems,
    ngoBookings,
    campusEvents,
    loading,
    addFood,
    claimFood,
    addEvent,
    analytics
  };

  return <FoodContext.Provider value={value}>{children}</FoodContext.Provider>;
};

export const useFood = () => {
  return useContext(FoodContext);
};
