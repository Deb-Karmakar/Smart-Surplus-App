import React from 'react';
import { useFood } from '../context/FoodContext.jsx'; // Import the context hook
import BookingCard from '../components/shared/BookingCard.jsx';
import { FaClipboardList } from 'react-icons/fa';

const BookingsPage = () => {
  // --- FIX: Get bookings and loading state directly from the context ---
  const { ngoBookings, loading } = useFood();

  return (
    <>
      <div className="bookings-container">
        <div className="page-header">
          <h1 className="page-title">Your Bookings</h1>
          <p className="page-subtitle">These are the surplus food items you have claimed for your organization.</p>
        </div>
        
        <div className="bookings-list">
            {loading ? (
                <p>Loading your bookings...</p>
            ) : ngoBookings.length > 0 ? (
                // Map over the ngoBookings array from the context
                ngoBookings.map(booking => <BookingCard key={booking._id} booking={booking} />)
            ) : (
                <div className="empty-state">
                    <FaClipboardList className="empty-icon" />
                    <p>No Bookings Found</p>
                    <span>You haven't claimed any food yet. Visit the "Browse Food" page to find available items.</span>
                </div>
            )}
        </div>
      </div>
      <style jsx>{`
        .bookings-container { max-width: 900px; margin: 40px auto; padding: 0 20px; }
        .page-header { text-align: center; margin-bottom: 40px; }
        .page-title { font-size: 2.8rem; font-weight: 700; color: #2C5E4A; margin: 0; }
        .page-subtitle { font-size: 1.1rem; color: #555; }
        .bookings-list { display: grid; gap: 20px; }
        .empty-state { text-align: center; padding: 50px; background: #f9f9f9; border-radius: 12px; }
        .empty-icon { font-size: 3rem; color: #ccc; margin-bottom: 20px; }
        .empty-state p { font-weight: 600; color: #555; margin-bottom: 5px; }
        .empty-state span { font-size: 0.9rem; color: #999; }
      `}</style>
    </>
  );
};

export default BookingsPage;
