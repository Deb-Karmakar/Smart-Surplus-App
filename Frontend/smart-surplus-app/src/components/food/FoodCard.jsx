import React, { useState, useEffect } from 'react';
import { useFood } from '../../context/FoodContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const FoodCard = ({ foodItem }) => {
  const { claimFood } = useFood();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(foodItem.expiresAt) - new Date();
      if (difference <= 0) return 'Expired';
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      return `${hours}h ${minutes}m left`;
    };
    setTimeLeft(calculateTimeLeft());
    const intervalId = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
    return () => clearInterval(intervalId);
  }, [foodItem.expiresAt]);

  const handleClaim = () => {
    if (user) {
      claimFood(foodItem.id, user);
    } else {
      alert("Please log in to claim food.");
      navigate('/login');
    }
  };

  const isClaimed = foodItem.status === 'claimed';
  const isExpired = timeLeft === 'Expired';
  // --- UPDATED: Disable button if user is not a student ---
  const isNotStudent = user && user.role !== 'student';
  const isDisabled = isClaimed || isExpired || isNotStudent;

  const getButtonText = () => {
    if (isClaimed) return 'Claimed';
    if (isExpired) return 'Expired';
    if (isNotStudent) return 'View Listing'; // Different text for canteen staff
    return 'Claim Now';
  };

  return (
    <>
      <div className={`food-card ${isDisabled ? 'disabled' : ''}`}>
        <div className="card-image-container">
          <img src={foodItem.imageUrl} alt={foodItem.title} className="food-card-image" />
        </div>
        <div className="food-card-content">
          <div className="food-card-header">
            <h3 className="food-card-title">{foodItem.title}</h3>
            {!isExpired && (
              <span className="food-card-timer">
                <i className="far fa-clock"></i> {timeLeft}
              </span>
            )}
          </div>
          <p className="food-card-source">
            <i className="fas fa-store-alt"></i> {foodItem.source}
          </p>
          <p className="food-card-quantity">
            <i className="fas fa-box-open"></i> Quantity: {foodItem.quantity}
          </p>
          <button onClick={handleClaim} className="food-card-button" disabled={isDisabled}>
            {getButtonText()}
          </button>
        </div>
      </div>
      {/* --- Your existing styles remain the same --- */}
      <style jsx>{`
        .food-card {
          background-color: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(44, 94, 74, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        .food-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(44, 94, 74, 0.15);
        }
        .food-card.disabled {
          opacity: 0.65;
        }
        .card-image-container {
          width: 100%;
          height: 200px;
          overflow: hidden;
        }
        .food-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .food-card:hover .food-card-image {
          transform: scale(1.05);
        }
        .food-card-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .food-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 12px;
        }
        .food-card-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin: 0;
          color: #2C5E4A;
        }
        .food-card-timer {
          background-color: #FFF5F1;
          color: #FF7A59;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .food-card-source, .food-card-quantity {
          color: #555;
          margin-bottom: 15px;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
        }
        .food-card-source i, .food-card-quantity i {
          margin-right: 10px;
          color: #aaa;
        }
        .food-card-button {
          width: 100%;
          padding: 14px;
          background-color: #2C5E4A;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.2s ease;
          margin-top: auto;
        }
        .food-card-button:hover:not(:disabled) {
          background-color: #1A3A2C;
          transform: scale(1.02);
        }
        .food-card-button:disabled {
          background-color: #B0BEC5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
};

export default FoodCard;
