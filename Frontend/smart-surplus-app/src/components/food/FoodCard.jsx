import React, { useState, useEffect } from "react";
import { useFood } from "../../context/FoodContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { FaStoreAlt, FaBoxOpen, FaUtensils, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { MdOutlineCancel, MdOutlineCheckCircle, MdDeliveryDining } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";
import { createBooking } from '../../services/api';

// --- Helper function to determine freshness tag ---
const getFreshnessTag = (preparationTime, expiresAt) => {
    const prepTime = new Date(preparationTime).getTime();
    const expiryTime = new Date(expiresAt).getTime();
    const now = new Date().getTime();

    if (now >= expiryTime) {
        return { text: 'Expired', className: 'expired' };
    }

    const totalLifespan = expiryTime - prepTime;
    const timeLeft = expiryTime - now;
    
    if (totalLifespan <= 0) {
        return { text: 'Consume Soon', className: 'consume-soon' };
    }

    const percentageLeft = (timeLeft / totalLifespan) * 100;

    if (percentageLeft <= 25) {
        return { text: 'Consume Soon', className: 'consume-soon' };
    }
    if (percentageLeft <= 50) {
        return { text: 'Good', className: 'good' };
    }
    return { text: 'Fresh', className: 'fresh' };
};

const FoodCard = ({ foodItem }) => {
  const { claimFood } = useFood(); 
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantityToClaim, setQuantityToClaim] = useState(1);
  const [error, setError] = useState("");
  const [freshness, setFreshness] = useState({ text: '', className: '' });
  const [deliveryRequested, setDeliveryRequested] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");

  useEffect(() => {
    const updateFreshness = () => {
      const newFreshness = getFreshnessTag(foodItem.preparationTime, foodItem.expiresAt);
      setFreshness(newFreshness);
    };

    updateFreshness();
    const intervalId = setInterval(updateFreshness, 60000);
    return () => clearInterval(intervalId);
  }, [foodItem.preparationTime, foodItem.expiresAt]);

  const handleClaimClick = () => {
    if (!user) {
      alert("Please log in to claim food.");
      navigate("/login");
      return;
    }
    if (user.role !== "student" && user.role !== "ngo") {
        return;
    }

    setError("");
    setQuantityToClaim(1);
    setDeliveryRequested(false);
    setDeliveryAddress("");
    setIsModalOpen(true);
  };

  const handleConfirmClaim = async () => {
    if (!quantityToClaim || quantityToClaim > foodItem.quantity || quantityToClaim <= 0) {
      setError(`Please enter a number between 1 and ${foodItem.quantity}.`);
      return;
    }

    if (deliveryRequested && deliveryAddress.trim() === "") {
      setError("Please enter a delivery address.");
      return;
    }

    const success = await claimFood(foodItem._id, quantityToClaim, {
      deliveryRequested,
      deliveryAddress: deliveryRequested ? deliveryAddress : null,
    });

    if (success) {
      if (user.role === 'ngo') {
        try {
          await createBooking(foodItem._id, quantityToClaim);
          console.log("NGO Booking record created successfully.");
        } catch (bookingError) {
          console.error("Failed to create a booking record for NGO:", bookingError);
        }
      }
      
      setIsModalOpen(false);
      alert("Food claimed successfully!");
    } else {
      setError(
        "Failed to claim. The item might no longer be available or quantity is too high."
      );
    }
  };

  const isExpired = freshness.className === "expired";
  const canClaim = user && (user.role === 'student' || user.role === 'ngo');
  const isDisabled = isExpired || !canClaim;

  const getTimeUntilExpiry = () => {
    const now = new Date().getTime();
    const expiryTime = new Date(foodItem.expiresAt).getTime();
    const timeDiff = expiryTime - now;
    
    if (timeDiff <= 0) return "Expired";
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h left`;
    return `${hours}h left`;
  };

  return (
    <>
      <div className={`food-card ${isDisabled && !isExpired ? "disabled-role" : ""} ${isExpired ? "disabled" : ""}`}>
        <div className="card-image-container">
          {/* --- FINAL FIX: Display the image from Cloudinary --- */}
          <img
            src={foodItem.imageUrl || 'https://placehold.co/600x400/EEE/31343C?text=No+Image'}
            alt={foodItem.title}
            className="food-card-image"
            // This is a fallback in case the image URL is broken
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/EEE/31343C?text=Image+Error'; }}
          />
          <div className="image-overlay"></div>
          <span className={`freshness-badge ${freshness.className}`}>
            <HiSparkles className="sparkle-icon" />
            {freshness.text}
          </span>
          <div className="time-badge">
            <FaClock />
            {getTimeUntilExpiry()}
          </div>
        </div>

        <div className="food-card-content">
          <div className="card-header">
            <h3 className="food-card-title">
              <FaUtensils className="title-icon" />
              {foodItem.title}
            </h3>
          </div>
          
          <div className="card-details">
            <div className="detail-item">
              <div className="detail-icon">
                <FaStoreAlt />
              </div>
              <span className="detail-text">{foodItem.source}</span>
            </div>
            
            <div className="detail-item">
              <div className="detail-icon">
                <FaBoxOpen />
              </div>
              <span className="detail-text">
                <span className="quantity-number">{foodItem.quantity}</span> portions available
              </span>
            </div>
          </div>

          <button
            onClick={handleClaimClick}
            className={`food-card-button ${freshness.className}`}
            disabled={isDisabled}
          >
            <div className="button-content">
              {isExpired ? (
                <>
                  <MdOutlineCancel />
                  <span>Expired</span>
                </>
              ) : (
                <>
                  <HiSparkles />
                  <span>Claim Now</span>
                </>
              )}
            </div>
            <div className="button-glow"></div>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                <HiSparkles className="modal-title-icon" />
                Claim <span className="highlight-text">{foodItem.title}</span>
              </h2>
              <p className="modal-subtitle">Select your preferred quantity and delivery options</p>
            </div>

            <div className="modal-body">
              <div className="quantity-selector">
                <label className="input-label">
                  <FaBoxOpen />
                  Quantity <span className="available-text">(Available: {foodItem.quantity})</span>
                </label>
                <div className="quantity-input-wrapper">
                  <input
                    type="number"
                    id="quantity"
                    value={quantityToClaim}
                    onChange={(e) => setQuantityToClaim(parseInt(e.target.value))}
                    min="1"
                    max={foodItem.quantity}
                    className="modern-input"
                  />
                </div>
              </div>


{user && user.role === 'ngo' && (
  <div className="delivery-section">
    <div className="delivery-toggle">
      <label className="toggle-label">
        <input
          type="checkbox"
          checked={deliveryRequested}
          onChange={(e) => setDeliveryRequested(e.target.checked)}
          className="modern-checkbox"
        />
        <span className="checkmark"></span>
        <MdDeliveryDining className="delivery-icon" />
        <span>Request delivery service</span>
      </label>
    </div>

    {deliveryRequested && (
      <div className="delivery-address animate-slide-in">
        <label className="input-label">
          <FaMapMarkerAlt />
          Delivery Address
        </label>
        <input
          type="text"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          placeholder="Enter your complete delivery address"
          className="modern-input"
        />
      </div>
    )}
  </div>
)}

              {error && (
                <div className="error-message animate-shake">
                  <MdOutlineCancel />
                  {error}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
              >
                <MdOutlineCancel />
                <span>Cancel</span>
              </button>
              <button onClick={handleConfirmClaim} className="btn-primary">
                <MdOutlineCheckCircle />
                <span>Confirm Claim</span>
                <div className="button-shine"></div>
              </button>
            </div>
          </div>
        </div>
      )}


      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        }

        .food-card {
          background: linear-gradient(145deg, #ffffff 0%, #fafafa 100%);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 
            0 4px 20px rgba(44, 94, 74, 0.08),
            0 1px 3px rgba(0, 0, 0, 0.05);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
        
        .food-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 
            0 20px 40px rgba(44, 94, 74, 0.15),
            0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .food-card.disabled {
          opacity: 0.6;
          filter: grayscale(0.3);
        }
        
        .food-card.disabled-role {
            opacity: 1; /* Keep card fully visible for non-claiming roles */
            filter: none;
        }

        .card-image-container {
          width: 100%;
          height: 220px;
          overflow: hidden;
          position: relative;
        }
        
        .food-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        
        .food-card:hover .food-card-image {
          transform: scale(1.1);
        }
        
        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.1) 70%,
            rgba(0, 0, 0, 0.3) 100%
          );
        }
        
        .freshness-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          color: white;
          display: flex;
          align-items: center;
          gap: 6px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }
        
        .sparkle-icon {
          animation: sparkle 2s infinite;
        }
        
        @keyframes sparkle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
        }
        
        .freshness-badge.fresh { 
          background: linear-gradient(135deg, #4CAF50, #66BB6A);
        }
        .freshness-badge.good { 
          background: linear-gradient(135deg, #FFC107, #FFD54F);
          color: #333;
        }
        .freshness-badge.consume-soon { 
          background: linear-gradient(135deg, #FF9800, #FFB74D);
        }
        .freshness-badge.expired { 
          background: linear-gradient(135deg, #F44336, #EF5350);
        }
        
        .time-badge {
          position: absolute;
          bottom: 16px;
          left: 16px;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          color: white;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .food-card-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
        }
        
        .card-header {
          margin-bottom: 4px;
        }
        
        .food-card-title {
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0;
          color: #1a2b23;
          display: flex;
          align-items: center;
          gap: 12px;
          line-height: 1.3;
        }
        
        .title-icon {
          color: #2c5e4a;
          font-size: 1.2rem;
        }
        
        .card-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #64748b;
          font-size: 0.95rem;
          font-weight: 500;
        }
        
        .detail-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          flex-shrink: 0;
        }
        
        .detail-text {
          flex: 1;
        }
        
        .quantity-number {
          font-weight: 700;
          color: #2c5e4a;
          font-size: 1.1em;
        }
        
        .food-card-button {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: auto;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #2c5e4a 0%, #1a3a2c 100%);
          color: white;
          box-shadow: 0 4px 16px rgba(44, 94, 74, 0.3);
        }
        
        .button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          z-index: 2;
        }
        
        .button-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.6s ease;
        }
        
        .food-card-button:hover:not(:disabled) .button-glow {
          left: 100%;
        }
        
        .food-card-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(44, 94, 74, 0.4);
        }
        
        .food-card-button:disabled {
          background: linear-gradient(135deg, #94a3b8, #64748b);
          cursor: not-allowed;
          box-shadow: none;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .modal-content {
          background: linear-gradient(145deg, #ffffff 0%, #fafafa 100%);
          padding: 32px;
          border-radius: 24px;
          width: 90%;
          max-width: 480px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 8px 32px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.8);
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(32px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .modal-header {
          text-align: center;
          margin-bottom: 28px;
        }
        
        .modal-header h2 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #1a2b23;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        
        .modal-title-icon {
          color: #2c5e4a;
          animation: sparkle 2s infinite;
        }
        
        .highlight-text {
          color: #2c5e4a;
          background: linear-gradient(135deg, #2c5e4a, #4ade80);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .modal-subtitle {
          color: #64748b;
          font-size: 0.95rem;
          margin: 0;
        }
        
        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .quantity-selector, .delivery-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .input-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 0.95rem;
        }
        
        .available-text {
          font-weight: 400;
          color: #64748b;
          font-size: 0.85rem;
        }
        
        .quantity-input-wrapper {
          position: relative;
        }
        
        .modern-input {
          width: 100%;
          padding: 16px;
          font-size: 1rem;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          background: rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
          font-weight: 500;
          box-sizing: border-box;
        }
        
        .modern-input:focus {
          outline: none;
          border-color: #2c5e4a;
          box-shadow: 0 0 0 3px rgba(44, 94, 74, 0.1);
          background: white;
        }
        
        .delivery-toggle {
          padding: 16px;
          background: rgba(44, 94, 74, 0.05);
          border-radius: 12px;
          border: 2px solid rgba(44, 94, 74, 0.1);
          transition: all 0.3s ease;
        }
        
        .toggle-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-weight: 500;
          color: #374151;
        }
        
        .modern-checkbox {
          display: none;
        }
        
        .checkmark {
          width: 20px;
          height: 20px;
          border: 2px solid #cbd5e1;
          border-radius: 6px;
          position: relative;
          transition: all 0.3s ease;
          background: white;
        }
        
        .modern-checkbox:checked + .checkmark {
          background: #2c5e4a;
          border-color: #2c5e4a;
        }
        
        .modern-checkbox:checked + .checkmark::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-weight: bold;
          font-size: 12px;
        }
        
        .delivery-icon {
          color: #2c5e4a;
          font-size: 1.2rem;
        }
        
        .delivery-address {
          padding-left: 32px;
        }
        
        .animate-slide-in {
          animation: slideInDown 0.3s ease;
        }
        
        @keyframes slideInDown {
          from {
            transform: translateY(-16px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .error-message {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #fca5a5;
        }
        
        .animate-shake {
          animation: shake 0.5s ease;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 32px;
        }
        
        .btn-primary, .btn-secondary {
          padding: 14px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
          position: relative;
          overflow: hidden;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #2c5e4a, #1a3a2c);
          color: white;
          box-shadow: 0 4px 16px rgba(44, 94, 74, 0.3);
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(44, 94, 74, 0.4);
        }
        
        .btn-secondary {
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          color: #475569;
          border: 2px solid #e2e8f0;
        }
        
        .btn-secondary:hover {
          background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
          transform: translateY(-1px);
        }
        
        .button-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.6s ease;
        }
        
        .btn-primary:hover .button-shine {
          left: 100%;
        }
        
        @media (max-width: 640px) {
          .modal-content {
            margin: 16px;
            padding: 24px;
          }
          
          .modal-actions {
            flex-direction: column;
            gap: 12px;
          }
          
          .btn-primary, .btn-secondary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default FoodCard;
