import React, { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationContext.jsx';
import api from '../services/api';
import './NotificationsPage.css';
import { Link } from 'react-router-dom'; // <-- 1. IMPORT LINK

// --- This component now handles ALL notification types ---
const NotificationCard = ({ notification, onAction }) => {
    const getIcon = (type) => {
        switch(type) {
            case 'claim_student': return 'fas fa-receipt';
            case 'pickup_confirmation': return 'fas fa-question-circle'; // Icon for pickup requests
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
            onAction();
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
                
                {/* Action buttons for delivery requests */}
                {notification.type === 'delivery_request' && (
                    <div className="action-buttons">
                        <button onClick={() => handleDeliveryResponse('accepted')} className="btn-accept">Accept</button>
                        <button onClick={() => handleDeliveryResponse('rejected')} className="btn-reject">Reject</button>
                    </div>
                )}

                {/* --- 2. NEW: Add a link for pickup confirmations --- */}
                {notification.type === 'pickup_confirmation' && (
                    <div className="action-buttons">
                        <Link to="/pending-pickups" className="btn-primary">
                            Go to Pending Pickups
                        </Link>
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
  }, [notifications, markAllAsRead]);

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
        try {
            await api.delete('/notifications/all');
            refreshNotifications();
        } catch (err) {
            alert('Failed to clear notifications.');
        }
    }
  };

  return (
    <div className="notifications-page-wrapper">
      <div className="notifications-container">
        <div className="page-header">
          <h1>Your Notifications</h1>
          <p>Stay updated with the latest activity.</p>
          {notifications.length > 0 && (
            <button onClick={handleClearAll} className="btn-clear-all">Clear All</button>
          )}
        </div>
        
        <div className="notifications-list">
            {loading ? (
                <p>Loading notifications...</p>
            ) : notifications.length > 0 ? (
                // --- 3. SIMPLIFIED: The page now only uses the single NotificationCard ---
                notifications.map(notif => (
                    <NotificationCard key={notif._id} notification={notif} onAction={refreshNotifications} />
                ))
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
                .notifications-container { max-width: 800px; margin: 2rem auto; padding: 2rem; }
                .page-header { text-align: center; margin-bottom: 2rem; position: relative; }
                .btn-clear-all {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background-color: #e0e0e0;
                    color: #333;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                }
                .notifications-list { display: grid; gap: 1rem; }
                .notification-card {
                    background: #fff;
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                    border-left: 5px solid #2E7D32;
                }
                .icon-container i { font-size: 1.5rem; color: #2E7D32; }
                .content-container p { margin: 0 0 0.5rem 0; }
                .content-container .timestamp { color: #666; font-size: 0.9rem; }
                .action-buttons { margin-top: 1rem; display: flex; gap: 0.5rem; }
                .action-buttons button, .action-buttons a {
                    padding: 8px 12px;
                    border: none;
                    border-radius: 6px;
                    color: white;
                    cursor: pointer;
                    text-decoration: none;
                }
                .btn-accept, .btn-primary { background-color: #4CAF50; }
                .btn-reject { background-color: #F44336; }
                .empty-state { text-align: center; padding: 2rem; }
                .empty-state i { font-size: 2rem; color: #ccc; }
            `}</style>
    </div>
  );
};

export default NotificationsPage;
