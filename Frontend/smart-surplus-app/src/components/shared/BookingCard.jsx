import React from 'react';
import { FaUtensils, FaStoreAlt, FaBoxOpen, FaCalendarAlt } from 'react-icons/fa';

const BookingCard = ({ booking }) => {
  
  const { foodListing } = booking;

  // A check in case the original food listing was deleted.
  if (!foodListing) {
    return (
      <div className="booking-card status-archived">
        {/* ... existing archived card JSX ... */}
      </div>
    );
  }

  return (
    <>
      <div className="booking-card status-confirmed">
        <div className="card-header">
          {/* --- FIX: Added the food title here --- */}
          <h3><FaUtensils /> {foodListing.title}</h3>
          <span className="status-badge status-confirmed">
            Confirmed
          </span>
        </div>
        <div className="card-body">
          <p><FaStoreAlt /> <strong>Provider:</strong> {foodListing.provider?.name || 'N/A'}</p>
          <p><FaBoxOpen /> <strong>Quantity Booked:</strong> {booking.quantity}</p>
          {/* --- FIX: Changed to toLocaleString() to include the time --- */}
          <p><FaCalendarAlt /> <strong>Booked On:</strong> {new Date(booking.bookedAt).toLocaleString()}</p>
        </div>
      </div>
      <style jsx>{`
        .booking-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 6px 25px rgba(0,0,0,0.07);
          border-left: 5px solid;
          overflow: hidden;
        }
        .booking-card.status-confirmed { border-color: #4CAF50; }
        .booking-card.status-archived { border-color: #9E9E9E; }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #eee;
        }
        .card-header h3 { margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 8px; }
        
        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: capitalize;
        }
        .status-badge.status-confirmed { background-color: #E8F5E9; color: #4CAF50; }

        .card-body { padding: 20px; display: grid; gap: 10px; }
        .card-body p { margin: 0; color: #555; display: flex; align-items: center; gap: 8px; }
      `}</style>
    </>
  );
};

export default BookingCard;
