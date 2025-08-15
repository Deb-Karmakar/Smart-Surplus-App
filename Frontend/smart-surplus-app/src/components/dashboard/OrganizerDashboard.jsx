import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardSummaryCard from '../shared/DashboardSummaryCard.jsx';
import {
    FaLeaf, FaChartBar, FaUsers, FaClipboardList, FaHandsHelping,
    FaPlus, FaCalendarAlt, FaUtensils
} from 'react-icons/fa';

const OrganizerDashboard = ({ user, campusEvents }) => {
    const [myListedItems, setMyListedItems] = useState([]);
    const [myStats, setMyStats] = useState({
        foodSaved: 0,
        peopleFed: 0,
        carbonFootprintAvoided: 0,
        pendingPickups: 0,
        confirmedPickups: 0,
        totalClaims: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMyData = async () => {
            try {
                const res = await api.get('/food/my-listings');
                const items = res.data;
                setMyListedItems(items);

                let totalConfirmedPickups = 0;
                let totalPendingPickups = 0;
                let totalClaims = 0;
                
                items.forEach(listing => {
                    if (listing.claims && listing.claims.length > 0) {
                        listing.claims.forEach(claim => {
                            totalClaims += 1;
                            if (claim.pickupStatus === 'confirmed') {
                                totalConfirmedPickups += claim.quantity || 1;
                            } else if (claim.pickupStatus === 'pending') {
                                totalPendingPickups += claim.quantity || 1;
                            }
                        });
                    }
                });
                
                const totalPotentialPeopleFed = totalConfirmedPickups + totalPendingPickups;
                const foodSavedKg = (totalPotentialPeopleFed * 0.5).toFixed(1);
                const carbonFootprintAvoided = (totalPotentialPeopleFed * 2.5).toFixed(1);

                setMyStats({
                    foodSaved: foodSavedKg,
                    peopleFed: totalPotentialPeopleFed,
                    carbonFootprintAvoided,
                    pendingPickups: totalPendingPickups,
                    confirmedPickups: totalConfirmedPickups,
                    totalClaims
                });

            } catch (err) {
                console.error("Failed to fetch organizer's listings", err);
                setMyStats({
                    foodSaved: 0, peopleFed: 0, carbonFootprintAvoided: 0,
                    pendingPickups: 0, confirmedPickups: 0, totalClaims: 0
                });
            } finally {
                setIsLoading(false);
            }
        };
        
        if (user && user._id) { // Use user._id for a more robust check
            fetchMyData();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
                <p>Loading your stats...</p>
            </div>
        );
    }

    // --- FIX: Create a new list that only contains 'available' items ---
    const availableItems = myListedItems.filter(item => item.status === 'available');

    return (
        <>
            <section className="analytics-section">
                <div className="section-header">
                    <h2><FaChartBar /> Your Impact Dashboard</h2>
                    <Link to="/analytics" className="btn-primary">Detailed Analytics</Link>
                </div>
                
                <div className="stats-grid">
                    <div className="stat-card">
                        <FaUtensils className="stat-icon" />
                        <h3>{myStats.foodSaved} kg</h3>
                        <p>Food Saved (Potential)</p>
                        <small>Based on all claims</small>
                    </div>
                    <div className="stat-card">
                        <FaUsers className="stat-icon" />
                        <h3>{myStats.peopleFed}</h3>
                        <p>People Fed (Potential)</p>
                        <small>Claimed + Pending pickups</small>
                    </div>
                    <div className="stat-card">
                        <FaLeaf className="stat-icon" />
                        <h3>{myStats.carbonFootprintAvoided} kg</h3>
                        <p>CO₂ Footprint Avoided</p>
                        <small>Environmental impact</small>
                    </div>
                </div>

                <div className="breakdown-section">
                    <h3>Pickup Status Breakdown</h3>
                    <div className="breakdown-grid">
                        <div className="breakdown-card confirmed">
                            <div className="breakdown-number">{myStats.confirmedPickups}</div>
                            <div className="breakdown-label">Confirmed Pickups</div>
                            <div className="breakdown-desc">Students picked up food</div>
                        </div>
                        <div className="breakdown-card pending">
                            <div className="breakdown-number">{myStats.pendingPickups}</div>
                            <div className="breakdown-label">Pending Pickups</div>
                            <div className="breakdown-desc">Awaiting confirmation</div>
                        </div>
                        <div className="breakdown-card total">
                            <div className="breakdown-number">{myStats.totalClaims}</div>
                            <div className="breakdown-label">Total Claims</div>
                            <div className="breakdown-desc">All pickup requests</div>
                        </div>
                    </div>
                </div>

                {myStats.pendingPickups > 0 && (
                    <div className="alert-card">
                        <div className="alert-icon">⏰</div>
                        <div className="alert-content">
                            <h4>Action Required</h4>
                            <p>You have {myStats.pendingPickups} pending pickup confirmations. Students are waiting to collect their food!</p>
                            <Link to="/notifications" className="btn-primary">
                                View Pickup Requests →
                            </Link>
                        </div>
                    </div>
                )}
            </section>

            <section className="listings-section">
                <div className="section-header">
                    {/* --- FIX: Show the count of available items only --- */}
                    <h2><FaClipboardList /> Your Active Listings ({availableItems.length})</h2>
                    <Link to="/add-food" className="btn-primary"><FaPlus /> Add Food</Link>
                </div>
                <div className="items-grid">
                    {/* --- FIX: Map over the new 'availableItems' list --- */}
                    {availableItems.length > 0 ? (
                        availableItems.map(item => (
                            <div key={item._id} className="item-card enhanced">
                                <DashboardSummaryCard item={item} />
                                <div className="item-stats">
                                    <div className="stat-item">
                                        <span className="stat-value">{item.claims?.length || 0}</span>
                                        <span className="stat-label">Total Claims</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">
                                            {item.claims?.filter(c => c.pickupStatus === 'confirmed').length || 0}
                                        </span>
                                        <span className="stat-label">Confirmed</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">
                                            {item.claims?.filter(c => c.pickupStatus === 'pending').length || 0}
                                        </span>
                                        <span className="stat-label">Pending</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <FaUtensils className="empty-icon" />
                            <p>You have no active food listings. Click "Add Food" to help reduce food waste!</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="events-section">
                <div className="section-header">
                    <h2><FaCalendarAlt /> Campus Events</h2>
                    <Link to="/add-event" className="btn-primary"><FaPlus /></Link>
                </div>
                <div className="events-grid">
                    {campusEvents && campusEvents.length > 0 ? (
                        campusEvents.map(event => (
                            <div key={event._id} className="event-card">
                                <div className="event-header">
                                    <FaHandsHelping className="event-icon" />
                                    <span className="event-date">
                                        {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <h4>{event.title}</h4>
                                <Link to={`/events/${event._id}`} className="btn-primary">Details</Link>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <FaCalendarAlt className="empty-icon" />
                            <p>No upcoming events</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default OrganizerDashboard;
