import React, { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationContext.jsx';
import api from '../services/api';
import './NotificationsPage.css';

// --- Card for Pickup Confirmations ---
const PickupConfirmationCard = ({ notification, onAction }) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleConfirm = async () => {
        setError('');
        setSuccess('');
        if (otp.length !== 6) {
            return setError('Please enter the 6-digit OTP.');
        }
        try {
            await api.put(`/food/confirm-pickup/${notification.relatedClaimId}`, { otp });
            setSuccess('Pickup confirmed successfully!');
            setTimeout(() => onAction(), 1500); // Refresh notifications after a delay
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred.');
        }
    };

    return (
        <div className="notification-card type-pickup_confirmation">
            <div className="icon-container"><i className="fas fa-question-circle"></i></div>
            <div className="content-container">
                <p>{notification.message}</p>
                <span className="timestamp">{new Date(notification.createdAt).toLocaleString()}</span>
                <div className="otp-input-section">
                    <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        maxLength="6"
                    />
                    <button onClick={handleConfirm}>Confirm Pickup</button>
                </div>
                {error && <p className="message error">{error}</p>}
                {success && <p className="message success">{success}</p>}
            </div>
        </div>
    );
};


// --- Card for Delivery Requests and other notifications ---
const NotificationCard = ({ notification, onAction }) => {
    const getIcon = (type) => {
        switch(type) {
            case 'claim_student': return 'fas fa-receipt';
            case 'claim_organizer': return 'fas fa-concierge-bell';
            case 'new_listing': return 'fas fa-utensils';
            case 'delivery_request': return 'fas fa-truck';
            case 'delivery_accepted': return 'fas fa-check-circle';
            case 'delivery_rejected': return 'fas fa-times-circle';
            default: return 'fas fa-info-circle';
        }
    };

    const handleDeliveryResponse = async (response) => {
        try {
            await api.put(`/food/delivery-response/${notification.relatedClaimId}`, { response });
            onAction(); // Trigger a refresh of the notification list
        } catch (err) {
            console.error(`Failed to ${response} delivery`, err);
            alert(`Failed to ${response} delivery request. Please try again.`);
        }
    };

    return (
        <div className={`notification-card type-${notification.type} ${!notification.isRead ? 'unread' : 'read'}`}>
            <div className="icon-container"><i className={getIcon(notification.type)}></i></div>
            <div className="content-container">
                <p>{notification.message}</p>
                <span className="timestamp">{new Date(notification.createdAt).toLocaleString()}</span>
                
                {notification.type === 'delivery_request' && (
                    <div className="action-buttons">
                        <button onClick={() => handleDeliveryResponse('accepted')} className="btn-accept">Accept</button>
                        <button onClick={() => handleDeliveryResponse('rejected')} className="btn-reject">Reject</button>
                    </div>
                )}
            </div>
        </div>
    );
};


const NotificationsPage = () => {
  const { notifications, loading, markAllAsRead, refreshNotifications } = useNotifications();

  useEffect(() => {
    const timer = setTimeout(() => {
        markAllAsRead();
    }, 500);
    return () => clearTimeout(timer);
  }, [markAllAsRead]); // Added dependency to useEffect for best practice

  return (
    // CAREFUL UPDATE: Added the main wrapper div to scope the CSS rules.
    <div className="notifications-page-wrapper">
      <div className="notifications-container">
        <div className="page-header">
          <h1>Your Notifications</h1>
          <p>Stay updated with the latest activity.</p>
        </div>
        
        <div className="notifications-list">
            {loading ? (
                <p>Loading notifications...</p>
            ) : notifications.length > 0 ? (
                notifications.map(notif => {
                    if (notif.type === 'pickup_confirmation') {
                        return <PickupConfirmationCard key={notif._id} notification={notif} onAction={refreshNotifications} />
                    }
                    return <NotificationCard key={notif._id} notification={notif} onAction={refreshNotifications} />
                })
            ) : (
                <div className="empty-state">
                    <i className="fas fa-bell-slash"></i>
                    <p>No notifications yet</p>
                    <span>New food listings and claim confirmations will appear here.</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;