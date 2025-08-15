import React, { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationContext.jsx';
import api from '../services/api';

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
                        placeholder="Enter Student's OTP"
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
        <div className={`notification-card type-${notification.type} ${notification.isRead ? 'read' : ''}`}>
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
  }, []);

  return (
    <>
      <div className="notifications-container">
        <div className="page-header">
          <h1 className="page-title">Your Notifications</h1>
          <p className="page-subtitle">Stay updated with the latest activity.</p>
        </div>
        
        <div className="notifications-list">
            {loading ? (
                <p>Loading notifications...</p>
            ) : notifications.length > 0 ? (
                notifications.map(notif => {
                    // --- UPDATED: Render the correct card based on notification type ---
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
      <style jsx>{`
        .notifications-container { max-width: 800px; margin: 40px auto; padding: 0 20px; }
        .page-header { text-align: center; margin-bottom: 40px; }
        .page-title { font-size: 2.8rem; font-weight: 700; color: #2C5E4A; margin: 0; }
        .page-subtitle { font-size: 1.1rem; color: #555; }
        .notifications-list { display: grid; gap: 15px; }
        .notification-card { 
            display: flex; 
            align-items: flex-start; 
            background: #fff; 
            padding: 20px; 
            border-radius: 12px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            transition: opacity 0.3s ease;
            border-left: 5px solid transparent;
        }
        .notification-card.unread {
            border-left-color: #4CAF50;
        }
        .notification-card.read {
            opacity: 0.7;
        }
        .icon-container { font-size: 1.5rem; margin-right: 20px; width: 40px; text-align: center; }
        .content-container p { margin: 0 0 5px 0; line-height: 1.5; }
        .content-container .timestamp { font-size: 0.8rem; color: #999; }
        .type-claim_student .icon-container { color: #4CAF50; }
        .type-claim_organizer .icon-container { color: #2196F3; }
        .type-delivery_request .icon-container { color: #FF9800; }
        .type-delivery_accepted .icon-container { color: #4CAF50; }
        .type-delivery_rejected .icon-container { color: #F44336; }
        .type-pickup_confirmation .icon-container { color: #673AB7; } /* Purple for confirmation */
        .empty-state { text-align: center; padding: 50px; background: #f9f9f9; border-radius: 12px; }
        .empty-state i { font-size: 3rem; color: #ccc; margin-bottom: 20px; }
        .empty-state p { font-weight: 600; color: #555; margin-bottom: 5px; }
        .empty-state span { font-size: 0.9rem; color: #999; }
        .action-buttons { margin-top: 15px; display: flex; gap: 10px; }
        .action-buttons button { padding: 8px 15px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
        .action-buttons button:hover { opacity: 0.8; }
        .btn-accept { background-color: #4CAF50; color: white; }
        .btn-reject { background-color: #F44336; color: white; }
        .otp-input-section { margin-top: 15px; display: flex; gap: 10px; align-items: center; }
        .otp-input-section input { flex-grow: 1; padding: 8px; border-radius: 8px; border: 1px solid #ccc; font-size: 1rem; }
        .otp-input-section button { padding: 8px 15px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; background-color: #2C5E4A; color: white; }
        .message { margin-top: 10px; font-weight: 500; padding: 8px; border-radius: 6px; }
        .error { color: #D32F2F; background-color: #FFCDD2; }
        .success { color: #388E3C; background-color: #C8E6C9; }
      `}</style>
    </>
  );
};

export default NotificationsPage;
