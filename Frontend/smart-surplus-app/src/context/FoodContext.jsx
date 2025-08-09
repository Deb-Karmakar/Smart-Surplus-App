import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext.jsx';

// --- Mock Data (This simulates fetching from your backend API) ---
const mockFoodListings = [
  {
    id: 1,
    title: 'Veg Pulao & Dal',
    source: 'Main Campus Canteen',
    quantity: 'Serves 8-10',
    expiresAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // Expires in 2 hours
    imageUrl: 'https://images.unsplash.com/photo-1631781119139-6849301b3b19?q=80&w=2070&auto=format&fit=crop',
    status: 'available',
    postedBy: 'canteen-user-1',
  },
  {
    id: 2,
    title: 'Idli Sambar',
    source: 'Hostel Mess Block-B',
    quantity: 'Approx. 25 pieces',
    expiresAt: new Date(new Date().getTime() + 1 * 60 * 60 * 1000), // Expires in 1 hour
    imageUrl: 'https://images.unsplash.com/photo-1668895283999-52d364739199?q=80&w=1974&auto=format&fit=crop',
    status: 'available',
    postedBy: 'canteen-user-2',
  },
  {
    id: 3,
    title: 'Surplus Sandwiches',
    source: 'Event Hall Seminar',
    quantity: '15 Sandwiches',
    expiresAt: new Date(new Date().getTime() + 0.5 * 60 * 60 * 1000), // Expires in 30 mins
    imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0907910?q=80&w=1925&auto=format&fit=crop',
    status: 'available',
    postedBy: 'canteen-user-1',
  },
  {
    id: 4,
    title: 'Fresh Fruit Salad',
    source: 'Juice Corner',
    quantity: '5 Large Bowls',
    expiresAt: new Date(new Date().getTime() + 3 * 60 * 60 * 1000), // Expires in 3 hours
    imageUrl: 'https://images.unsplash.com/photo-1562347810-18a0d370ba36?q=80&w=1974&auto=format&fit=crop',
    status: 'available',
    postedBy: 'canteen-user-2',
  },
];

const FoodContext = createContext();

export const FoodProvider = ({ children }) => {
  const { addPoints } = useAuth();
  const [foodListings, setFoodListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Mock analytics data ---
  const mockAnalyticsData = {
    foodSaved: 78,
    peopleFed: 130,
    carbonFootprintAvoided: 150,
    weeklyTrend: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [12, 19, 8, 15, 22, 9, 5],
    }
  };

  // --- FIXED: useEffect now correctly loads the mock data ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setFoodListings(mockFoodListings);
      setLoading(false);
    }, 1000); // Simulate network delay
    return () => clearTimeout(timer);
  }, []);

  const addFood = (newFoodItem) => {
    setFoodListings(prevListings => [newFoodItem, ...prevListings]);
  };

  const claimFood = (foodId, user) => {
    if (!user) return;

    const itemToClaim = foodListings.find(item => item.id === foodId);
    if (!itemToClaim) return;

    // Award points to the user
    addPoints(user.id, itemToClaim.points || 10); // Use item's points or default to 10

    // Update the food item's status
    setFoodListings(prevListings =>
      prevListings.map(item =>
        item.id === foodId
          ? { ...item, status: 'claimed', claimedBy: user.email }
          : item
      )
    );
  };


  const value = {
    foodListings,
    loading,
    addFood,
    claimFood,
    analytics: mockAnalyticsData,
  };

  return <FoodContext.Provider value={value}>{children}</FoodContext.Provider>;
};

export const useFood = () => {
  return useContext(FoodContext);
};
