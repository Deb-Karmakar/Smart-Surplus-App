import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import DashboardSummaryCard from '../shared/DashboardSummaryCard.jsx';
import {
    FaLeaf, FaChartBar, FaUsers, FaClipboardList, FaHandsHelping,
    FaPlus, FaCalendarAlt, FaUtensils
} from 'react-icons/fa';

const OrganizerDashboard = ({ user, campusEvents }) => {
    const { t } = useTranslation();
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
            // Set loading to true at the beginning of the fetch
            setIsLoading(true);
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
                setMyStats({ foodSaved: 0, peopleFed: 0, carbonFootprintAvoided: 0, pendingPickups: 0, confirmedPickups: 0, totalClaims: 0 });
            } finally {
                // Set loading to false once the fetch is complete (success or fail)
                setIsLoading(false);
            }
        };
        
        // Only trigger the fetch if a user ID is present
        if (user?.id) {
            fetchMyData();
        } else {
            // If there's no user, we are not loading anything.
            setIsLoading(false);
        }
    // Depend only on the stable user ID
    }, [user?.id]);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
                <p>{t('dashboard.organizer.loading')}</p>
            </div>
        );
    }

    const availableItems = myListedItems.filter(item => item.status === 'available');

    return (
        <>
            <section className="analytics-section">
                <div className="section-header">
                    <h2><FaChartBar /> {t('dashboard.organizer.impactTitle')}</h2>
                    <Link to="/analytics" className="btn-primary">{t('dashboard.organizer.analyticsLink')}</Link>
                </div>
                
                <div className="stats-grid">
                    <div className="stat-card">
                        <FaUtensils className="stat-icon" />
                        <h3>{myStats.foodSaved} kg</h3>
                        <p>{t('dashboard.organizer.foodSaved')}</p>
                        <small>{t('dashboard.organizer.basedOnClaims')}</small>
                    </div>
                    <div className="stat-card">
                        <FaUsers className="stat-icon" />
                        <h3>{myStats.peopleFed}</h3>
                        <p>{t('dashboard.organizer.peopleFed')}</p>
                        <small>{t('dashboard.organizer.claimedPending')}</small>
                    </div>
                    <div className="stat-card">
                        <FaLeaf className="stat-icon" />
                        <h3>{myStats.carbonFootprintAvoided} kg</h3>
                        <p>{t('dashboard.organizer.co2Avoided')}</p>
                        <small>{t('dashboard.organizer.environmentalImpact')}</small>
                    </div>
                </div>

                <div className="breakdown-section">
                    <h3>{t('dashboard.organizer.breakdownTitle')}</h3>
                    <div className="breakdown-grid">
                        <div className="breakdown-card confirmed">
                            <div className="breakdown-number">{myStats.confirmedPickups}</div>
                            <div className="breakdown-label">{t('dashboard.organizer.confirmedPickups')}</div>
                            <div className="breakdown-desc">{t('dashboard.organizer.confirmedDesc')}</div>
                        </div>
                        <div className="breakdown-card pending">
                            <div className="breakdown-number">{myStats.pendingPickups}</div>
                            <div className="breakdown-label">{t('dashboard.organizer.pendingPickups')}</div>
                            <div className="breakdown-desc">{t('dashboard.organizer.pendingDesc')}</div>
                        </div>
                        <div className="breakdown-card total">
                            <div className="breakdown-number">{myStats.totalClaims}</div>
                            <div className="breakdown-label">{t('dashboard.organizer.totalClaims')}</div>
                            <div className="breakdown-desc">{t('dashboard.organizer.totalDesc')}</div>
                        </div>
                    </div>
                </div>

                {myStats.pendingPickups > 0 && (
                    <div className="alert-card">
                        <div className="alert-icon">⏰</div>
                        <div className="alert-content">
                            <h4>{t('dashboard.organizer.actionRequired')}</h4>
                            <p>{t('dashboard.organizer.actionRequiredText', { count: myStats.pendingPickups })}</p>
                            <Link to="/pending-pickups" className="btn-primary">
                                {t('dashboard.organizer.viewRequests')}
                            </Link>
                        </div>
                    </div>
                )}
            </section>

            <section className="listings-section">
                <div className="section-header">
                    <h2><FaClipboardList /> {t('dashboard.organizer.activeListingsTitle', { count: availableItems.length })}</h2>
                    <Link to="/add-food" className="btn-primary"><FaPlus /> {t('dashboard.organizer.addFood')}</Link>
                </div>
                <div className="items-grid">
                    {availableItems.length > 0 ? (
                        availableItems.map(item => (
                            <div key={item._id} className="item-card enhanced">
                                <DashboardSummaryCard item={item} />
                                <div className="item-stats">
                                    <div className="stat-item">
                                        <span className="stat-value">{item.claims?.length || 0}</span>
                                        <span className="stat-label">{t('dashboard.organizer.totalClaimsStat')}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">{item.claims?.filter(c => c.pickupStatus === 'confirmed').length || 0}</span>
                                        <span className="stat-label">{t('dashboard.organizer.confirmedStat')}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">{item.claims?.filter(c => c.pickupStatus === 'pending').length || 0}</span>
                                        <span className="stat-label">{t('dashboard.organizer.pendingStat')}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <FaUtensils className="empty-icon" />
                            <p>{t('dashboard.organizer.emptyListings')}</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="events-section">
                <div className="section-header">
                    <h2><FaCalendarAlt /> {t('dashboard.organizer.eventsTitle')}</h2>
                    <Link to="/add-event" className="btn-primary"><FaPlus /></Link>
                </div>
                <div className="events-grid">
                    {campusEvents && campusEvents.length > 0 ? (
                        campusEvents.map(event => (
                            <div key={event._id} className="event-card">
                                <h4>{event.title}</h4>
                                {/* I've added the event date display below */}
                                <p style={{ fontSize: '0.9rem', color: '#555', margin: '8px 0' }}>
                                    {new Date(event.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                                <Link to={`/events/${event._id}`} className="btn-primary">{t('dashboard.organizer.details')}</Link>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <FaCalendarAlt className="empty-icon" />
                            <p>{t('dashboard.organizer.noEvents')}</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default OrganizerDashboard;
