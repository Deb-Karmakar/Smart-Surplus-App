import axios from 'axios';

const api = axios.create({
  baseURL: 'https://zerobite-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['x-auth-token'] = token;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['x-auth-token'];
    localStorage.removeItem('token');
  }
};

// --- Centralized Claim and Booking Logic ---
export const processFoodClaim = async (foodId, quantityToClaim, deliveryDetails, user) => {
  // Step 1: Perform the general claim action
  await api.put(`/food/claim/${foodId}`, { quantityToClaim, deliveryDetails });

  // Step 2: If the user is an NGO, also create a booking record
  if (user && user.role === 'ngo') {
    const bookingResponse = await api.post('/bookings', { 
      foodListingId: foodId, 
      quantity: quantityToClaim 
    });
    // Return the new booking object so the UI can update instantly
    return bookingResponse.data.data; 
  }

  // If not an NGO, return null
  return null;
};


// --- Other API Functions ---
export const getFoodListings = () => api.get('/food');
export const getMyBookings = () => api.get('/bookings/mybookings');
export const createBooking = (foodListingId, quantity) => api.post('/bookings', { foodListingId, quantity });

// You can add other functions like login, register, etc. here as well

export default api;
