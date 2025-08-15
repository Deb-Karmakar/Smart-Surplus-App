import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useFood } from '../context/FoodContext.jsx';
import DashboardSummaryCard from '../components/shared/DashboardSummaryCard.jsx';

// React Icons (assuming you have react-icons installed)
import {
    FaTrophy, FaLeaf, FaSeedling, FaTree, FaLock, FaUtensils, FaGlobe, FaWater,
    FaBullseye, FaBoxOpen, FaCalendarAlt, FaChartBar, FaUsers, FaClipboardList,
    FaHandsHelping, FaBell, FaPlus, FaHandshake
} from 'react-icons/fa';

// --- Student Impact Dashboard Component ---
const StudentImpactDashboard = ({ user, myClaimedItems, campusEvents }) => {
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [animateStats, setAnimateStats] = useState(false);

    const mealsSaved = myClaimedItems.length;
    const co2Prevented = (mealsSaved * 2.5).toFixed(1);
    const waterSaved = (mealsSaved * 250 / 1000).toFixed(1);
    const pointsInCurrentLevel = (user.points || 0) % 100;
    const progressPercentage = (pointsInCurrentLevel / 100) * 100;
    const weeklyChallenge = user.weeklyChallenge || { progress: 0, goal: 5, reward: 200, title: 'Claim 5 Food Items' };
    const challengeProgress = (weeklyChallenge.progress / weeklyChallenge.goal) * 100;

    const getAchievementBadges = () => {
        const badges = [];
        if (mealsSaved >= 1) badges.push({ icon: <FaSeedling />, title: 'First Step', desc: 'Saved your first meal' });
        if (mealsSaved >= 5) badges.push({ icon: <FaLeaf />, title: 'Eco Warrior', desc: 'Saved 5 meals' });
        if (mealsSaved >= 10) badges.push({ icon: <FaTree />, title: 'Green Guardian', desc: 'Saved 10 meals' });
        if (mealsSaved >= 25) badges.push({ icon: <FaTrophy />, title: 'Sustainability Champion', desc: 'Saved 25 meals' });
        return badges.slice(-3);
    };

    useEffect(() => {
        setAnimateStats(true);
        if (pointsInCurrentLevel < 10 && user.points > 90) {
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 3000);
        }
    }, []);

    return (
        <>
            {showLevelUp && (
                <div className="level-up-notification">
                    <div className="level-up-content">
                        <div className="level-up-icon"><FaTrophy /></div>
                        <h3>Level Up!</h3>
                        <p>You've reached Level {user.level || 1}!</p>
                    </div>
                </div>
            )}

            <div className="impact-dashboard">
                <div className="hero-section">
                    <div className="impact-level-card premium">
                        <div className="card-glow"></div>
                        <div className="level-badge">
                            <div className="level-icon animated"><FaTrophy /></div>
                            <div className="level-ring">
                                <svg className="progress-ring" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="50" className="progress-ring-bg" />
                                    <circle cx="60" cy="60" r="50" className="progress-ring-fill"
                                        style={{ '--progress': progressPercentage }} />
                                </svg>
                                <div className="level-number">{user.level || 1}</div>
                            </div>
                        </div>
                        <div className="level-info">
                            <h4 className="user-title">{user.title || 'Food Saver'}</h4>
                            <div className="points-display">
                                <span className="points-number">{user.points || 0}</span>
                                <span className="points-label">points</span>
                            </div>
                            <div className="next-level-info">
                                <small>{100 - pointsInCurrentLevel} points to next level</small>
                                <div className="xp-bar">
                                    <div className="xp-fill" style={{ width: `${progressPercentage}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="weekly-challenge-card challenge-active">
                        <div className="challenge-header">
                            <div className="challenge-badge">
                                <div className="challenge-icon bouncing"><FaBullseye /></div>
                            </div>
                            <div className="challenge-info">
                                <h5>Weekly Challenge</h5>
                                <p>{weeklyChallenge.title}</p>
                            </div>
                        </div>
                        <div className="challenge-progress">
                            <div className="progress-track">
                                <div className="progress-fill" style={{ width: `${challengeProgress}%` }}></div>
                                <div className="progress-indicator" style={{ left: `${challengeProgress}%` }}>
                                    <div className="indicator-dot"></div>
                                </div>
                            </div>
                            <div className="challenge-stats">
                                <span className="progress-text">{weeklyChallenge.progress}/{weeklyChallenge.goal}</span>
                                <span className="reward-text">+{weeklyChallenge.reward} 💎</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="achievements-section">
                    <h3 className="section-title"><FaTrophy /> Recent Achievements</h3>
                    <div className="badges-container">
                        {getAchievementBadges().map((badge, index) => (
                            <div key={index} className="achievement-badge earned">
                                <div className="badge-icon">{badge.icon}</div>
                                <div className="badge-info">
                                    <h6>{badge.title}</h6>
                                    <p>{badge.desc}</p>
                                </div>
                            </div>
                        ))}
                        {getAchievementBadges().length === 0 && (
                            <div className="achievement-badge locked">
                                <div className="badge-icon"><FaLock /></div>
                                <div className="badge-info">
                                    <h6>First Step</h6>
                                    <p>Save your first meal</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="impact-stats-grid">
                    <div className={`impact-stat-card meals ${animateStats ? 'animate' : ''}`}>
                        <div className="stat-icon"><FaUtensils /></div>
                        <h3 className="counter-number">{mealsSaved}</h3>
                        <p>Meals Saved</p>
                    </div>
                    <div className={`impact-stat-card co2 ${animateStats ? 'animate' : ''}`} style={{ '--delay': '0.1s' }}>
                        <div className="stat-icon"><FaGlobe /></div>
                        <h3 className="counter-number">{co2Prevented} kg</h3>
                        <p>CO₂ Prevented</p>
                    </div>
                    <div className={`impact-stat-card water ${animateStats ? 'animate' : ''}`} style={{ '--delay': '0.2s' }}>
                        <div className="stat-icon"><FaWater /></div>
                        <h3 className="counter-number">{waterSaved} kL</h3>
                        <p>Water Saved</p>
                    </div>
                </div>

                <div className="action-cards-grid">
                    <div className="action-card pickup-card">
                        <div className="action-card-header">
                            <h4><span className="card-icon"><FaBoxOpen /></span> Your Pickup Requests</h4>
                            <Link to="/browse" className="action-btn primary">
                                <span>Browse Food</span>
                            </Link>
                        </div>
                        <div className="action-card-body">
                            {myClaimedItems.length > 0 ? (
                                <div className="items-list">
                                    {myClaimedItems.slice(0, 3).map(item =>
                                        <div key={item._id} className="item-wrapper">
                                            <DashboardSummaryCard item={item} />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="empty-state gamified">
                                    <div className="empty-icon"><FaUtensils /></div>
                                    <p>Ready to start your food saving journey?</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="action-card events-card">
                        <div className="action-card-header">
                            <h4><span className="card-icon"><FaCalendarAlt /></span> Campus Events</h4>
                            <button className="action-btn secondary"><FaBell /></button>
                        </div>
                        <div className="action-card-body">
                            {campusEvents && campusEvents.length > 0 ? (
                                <div className="events-list">
                                    {campusEvents.map(event =>
                                        <div key={event._id} className="event-item enhanced">
                                            <div className="event-dot"></div>
                                            <div className="event-details">
                                                <span className="event-title">{event.title}</span>
                                                <span className="event-date">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                            <div className="event-indicator"><FaHandsHelping /></div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="empty-state gamified">
                                    <div className="empty-icon"><FaCalendarAlt /></div>
                                    <p>No upcoming events</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// --- Canteen Organizer Dashboard ---
const OrganizerDashboard = ({ user, analytics, foodListings, campusEvents }) => {
    const myListedItems = foodListings.filter(item => item.postedBy === user._id);
    const [animateStats, setAnimateStats] = useState(false);

    useEffect(() => { setAnimateStats(true); }, []);

    return (
        <>
            <div className="dashboard-section">
                <div className="section-header enhanced">
                    <div className="title-group">
                        <div className="section-icon"><FaChartBar /></div>
                        <h2 className="section-title">Impact Dashboard</h2>
                    </div>
                    <Link to="/analytics" className="view-details-btn premium">Detailed Analytics</Link>
                </div>
                <div className="stats-grid gamified">
                    <div className={`stat-card food-saved ${animateStats ? 'animate' : ''}`}>
                        <div className="stat-header"><FaUtensils /><span>↗</span></div>
                        <h3>{analytics?.foodSaved || 0} kg</h3>
                        <p>Food Saved</p>
                    </div>
                    <div className={`stat-card people-fed ${animateStats ? 'animate' : ''}`} style={{ '--delay': '0.1s' }}>
                        <div className="stat-header"><FaUsers /><span>↗</span></div>
                        <h3>{analytics?.peopleFed || 0}</h3>
                        <p>People Fed</p>
                    </div>
                    <div className={`stat-card carbon-saved ${animateStats ? 'animate' : ''}`} style={{ '--delay': '0.2s' }}>
                        <div className="stat-header"><FaLeaf /><span>↗</span></div>
                        <h3>{analytics?.carbonFootprintAvoided || 0} kg</h3>
                        <p>CO₂ Footprint Avoided</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="section-header enhanced">
                    <div className="title-group">
                        <div className="section-icon"><FaClipboardList /></div>
                        <h2 className="section-title">My Listed Items</h2>
                    </div>
                    <Link to="/add-food" className="action-btn primary"><FaPlus /> Add Food</Link>
                </div>
                <div className="summary-list enhanced">
                    {myListedItems.length > 0 ? (
                        myListedItems.map(item =>
                            <div key={item._id} className="item-wrapper organizer">
                                <DashboardSummaryCard item={item} />
                            </div>
                        )
                    ) : (
                        <div className="empty-message gamified">
                            <div className="empty-icon"><FaUtensils /></div>
                            <p>Ready to make an impact?</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- UPDATED: Upcoming Events Section for Organizers --- */}
            <div className="dashboard-section">
                <div className="section-header enhanced">
                    <div className="title-group">
                        <div className="section-icon"><FaCalendarAlt /></div>
                        <h2 className="section-title">Campus Events</h2>
                    </div>
                    {/* --- NEW: Add Event Button --- */}
                    <Link to="/add-event" className="action-btn primary" title="Add New Event">
                        <FaPlus />
                    </Link>
                </div>
                <div className="action-card events-organizer">
                    <div className="action-card-body">
                        {campusEvents && campusEvents.length > 0 ? (
                            <div className="events-grid">
                                {campusEvents.map(event =>
                                    <div key={event._id} className="event-card">
                                        <div className="event-header">
                                            <div className="event-icon"><FaHandsHelping /></div>
                                            <div className="event-date-badge">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                                        </div>
                                        <h5>{event.title}</h5>
                                        {/* --- NEW: Details Button --- */}
                                        <Link to={`/events/${event._id}`} className="action-btn primary">Details</Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="empty-state gamified">
                                <div className="empty-icon"><FaCalendarAlt /></div>
                                <p>No upcoming events with catering</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

// --- NGO Dashboard ---
const NGODashboard = ({ user, myClaimedItems }) => {
    const impactScore = myClaimedItems.length * 10;
    const [animateImpact, setAnimateImpact] = useState(false);

    useEffect(() => { setAnimateImpact(true); }, []);

    return (
        <>
            <div className="dashboard-section">
                <div className="ngo-impact-header">
                    <div className="impact-score-card">
                        <div className="score-icon"><FaTrophy /></div>
                        <div className="score-info">
                            <h3>Impact Score</h3>
                            <div className={`score-number ${animateImpact ? 'animate' : ''}`}>{impactScore}</div>
                        </div>
                    </div>
                    <div className="organization-badge">
                        <div className="org-icon"><FaHandshake /></div>
                        <div className="org-info">
                            <h4>{user.organizationName || 'NGO Partner'}</h4>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="section-header enhanced">
                    <div className="title-group">
                        <div className="section-icon"><FaBoxOpen /></div>
                        <h2 className="section-title">Your Organization's Pickups</h2>
                    </div>
                    <Link to="/browse" className="action-btn primary">Find More Food</Link>
                </div>
                <div className="summary-list enhanced">
                    {myClaimedItems.length > 0 ? (
                        myClaimedItems.map(item =>
                            <div key={item._id} className="item-wrapper ngo">
                                <DashboardSummaryCard item={item} />
                            </div>
                        )
                    ) : (
                        <div className="empty-message gamified ngo">
                            <div className="empty-icon"><FaHandsHelping /></div>
                            <p>Ready to help your community?</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// --- Main Dashboard Page ---
const DashboardPage = () => {
    const { user } = useAuth();
    const { foodListings, myClaimedItems, analytics, campusEvents } = useFood();

    if (!user) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    const renderDashboardByRole = () => {
        switch (user.role) {
            case 'student':
                return <StudentImpactDashboard user={user} myClaimedItems={myClaimedItems} campusEvents={campusEvents} />;
            case 'canteen-organizer':
                return <OrganizerDashboard user={user} analytics={analytics} foodListings={foodListings} campusEvents={campusEvents} />;
            case 'ngo':
                return <NGODashboard user={user} myClaimedItems={myClaimedItems} />;
            default:
                return (
                    <div className="welcome-card">
                        <div className="welcome-icon"><FaLeaf /></div>
                        <h3>Welcome!</h3>
                    </div>
                );
        }
    };

    return (
        <div className="dashboard-container">
            <div className="page-header gamified">
                <div className="header-content">
                    <h1 className="page-title">Your Dashboard</h1>
                    <p className="page-subtitle">Track your contribution to campus sustainability</p>
                </div>
            </div>
            {renderDashboardByRole()}

            <style jsx>{`
                /* Base Styles */
                .dashboard-container { 
                    max-width: 1200px; 
                    margin: 0 auto; 
                    padding: 20px; 
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                }

                /* Loading */
                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 50vh;
                    gap: 20px;
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #e0e0e0;
                    border-top: 3px solid #2C5E4A;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                /* Header */
                .page-header.gamified { 
                    text-align: center; 
                    margin-bottom: 40px; 
                    position: relative;
                    padding: 40px 20px;
                    background: linear-gradient(135deg, #2C5E4A 0%, #4A7C59 100%);
                    border-radius: 20px;
                    color: white;
                    overflow: hidden;
                }
                .header-content { position: relative; z-index: 2; }
                .page-title { 
                    font-size: 3.2rem; 
                    font-weight: 800; 
                    margin: 0; 
                    text-shadow: 0 2px 10px rgba(0,0,0,0.3);
                }
                .page-subtitle { 
                    font-size: 1.2rem; 
                    margin: 10px 0 0 0; 
                    opacity: 0.9;
                }

                /* Level Up Notification */
                .level-up-notification {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 1000;
                    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
                    padding: 30px;
                    border-radius: 20px;
                    text-align: center;
                    color: white;
                    box-shadow: 0 10px 50px rgba(255, 215, 0, 0.5);
                    animation: levelUpPop 3s ease-out forwards;
                }
                .level-up-icon { font-size: 3rem; margin-bottom: 10px; }

                /* Hero Section */
                .hero-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 25px;
                    margin-bottom: 40px;
                }

                /* Level Card */
                .impact-level-card.premium {
                    background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
                    padding: 30px;
                    border-radius: 24px;
                    position: relative;
                    box-shadow: 0 8px 32px rgba(44, 94, 74, 0.15);
                    border: 2px solid rgba(44, 94, 74, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 25px;
                    overflow: hidden;
                }
                .card-glow {
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(44, 94, 74, 0.05) 0%, transparent 70%);
                    animation: pulse 4s ease-in-out infinite;
                }
                .level-badge {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .level-ring {
                    position: relative;
                    width: 120px;
                    height: 120px;
                }
                .progress-ring {
                    width: 100%;
                    height: 100%;
                    transform: rotate(-90deg);
                }
                .progress-ring-bg {
                    fill: none;
                    stroke: #e0e0e0;
                    stroke-width: 8;
                }
                .progress-ring-fill {
                    fill: none;
                    stroke: #2C5E4A;
                    stroke-width: 8;
                    stroke-linecap: round;
                    stroke-dasharray: 314;
                    stroke-dashoffset: calc(314 - (314 * var(--progress)) / 100);
                    transition: stroke-dashoffset 2s ease-out;
                }
                .level-number {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #2C5E4A;
                }
                .level-icon.animated {
                    position: absolute;
                    font-size: 1.5rem;
                    animation: bounce 2s infinite;
                    top: 10px;
                    right: 10px;
                }
                .user-title {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #2C5E4A;
                    margin: 0 0 10px 0;
                }
                .points-display {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                    margin: 15px 0;
                }
                .points-number {
                    font-size: 2.8rem;
                    font-weight: 800;
                    color: #FF7A59;
                    text-shadow: 0 2px 10px rgba(255, 122, 89, 0.3);
                }
                .points-label {
                    font-size: 1.1rem;
                    color: #666;
                    font-weight: 500;
                }
                .xp-bar {
                    background: #e0e0e0;
                    height: 8px;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-top: 8px;
                }
                .xp-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #2C5E4A 0%, #4A7C59 100%);
                    border-radius: 4px;
                    transition: width 2s ease-out;
                    position: relative;
                }
                .xp-fill::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    animation: shimmer 3s infinite;
                }

                /* Challenge Card */
                .weekly-challenge-card.challenge-active {
                    background: linear-gradient(135deg, #FF7A59 0%, #FF9A7B 100%);
                    padding: 25px;
                    border-radius: 24px;
                    color: white;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 8px 32px rgba(255, 122, 89, 0.3);
                }
                .challenge-header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .challenge-badge {
                    width: 60px;
                    height: 60px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .challenge-icon.bouncing {
                    font-size: 1.8rem;
                    animation: bounce 2s infinite;
                }
                .challenge-info h5 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                    opacity: 0.9;
                }
                .challenge-info p {
                    margin: 5px 0 0 0;
                    font-size: 1.4rem;
                    font-weight: 700;
                }
                .challenge-progress {
                    position: relative;
                }
                .progress-track {
                    background: rgba(255, 255, 255, 0.2);
                    height: 12px;
                    border-radius: 6px;
                    position: relative;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 6px;
                    transition: width 2s ease-out;
                }
                .progress-indicator {
                    position: absolute;
                    top: -2px;
                    transform: translateX(-50%);
                    transition: left 2s ease-out;
                }
                .indicator-dot {
                    width: 16px;
                    height: 16px;
                    background: white;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    animation: pulse 2s infinite;
                }
                .challenge-stats {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 15px;
                }
                .progress-text {
                    font-weight: 700;
                    font-size: 1.1rem;
                }
                .reward-text {
                    font-weight: 600;
                    background: rgba(255, 255, 255, 0.2);
                    padding: 4px 12px;
                    border-radius: 12px;
                }

                /* Achievements Section */
                .achievements-section {
                    margin: 30px 0;
                }
                .section-title {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #2C5E4A;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .badges-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 15px;
                }
                .achievement-badge {
                    background: white;
                    padding: 20px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                .achievement-badge.earned {
                    border: 2px solid #2C5E4A;
                    background: linear-gradient(135deg, #fff 0%, #f0f8f0 100%);
                }
                .achievement-badge.earned::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(44, 94, 74, 0.05) 0%, transparent 70%);
                    animation: pulse 3s ease-in-out infinite;
                }
                .achievement-badge.locked {
                    opacity: 0.5;
                    border: 2px dashed #ccc;
                }
                .badge-icon {
                    font-size: 2.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 60px;
                    height: 60px;
                    background: #f8f9fa;
                    border-radius: 50%;
                }
                .achievement-badge.earned .badge-icon {
                    background: linear-gradient(135deg, #2C5E4A 0%, #4A7C59 100%);
                    color: white;
                    animation: bounce 0.6s ease-out;
                }
                .badge-info h6 {
                    margin: 0 0 5px 0;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #2C5E4A;
                }
                .badge-info p {
                    margin: 0;
                    color: #666;
                    font-size: 0.9rem;
                }

                /* Impact Stats Grid */
                .impact-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin: 30px 0;
                }
                .impact-stat-card {
                    background: white;
                    padding: 30px;
                    border-radius: 20px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 6px 25px rgba(0,0,0,0.1);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 2px solid transparent;
                }
                .impact-stat-card.animate {
                    animation: statCardEntrance 0.8s ease-out forwards;
                    animation-delay: var(--delay, 0s);
                    opacity: 0;
                    transform: translateY(30px);
                }
                .impact-stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
                }
                .impact-stat-card.meals { border-color: #FF7A59; }
                .impact-stat-card.co2 { border-color: #2C5E4A; }
                .impact-stat-card.water { border-color: #4FC3F7; }
                .stat-icon {
                    font-size: 3rem;
                    margin-bottom: 15px;
                    display: block;
                    animation: float 3s ease-in-out infinite;
                }
                .counter-number {
                    font-size: 2.8rem;
                    font-weight: 800;
                    color: #2C5E4A;
                    margin: 10px 0 5px 0;
                    position: relative;
                }
                .impact-stat-card p {
                    color: #666;
                    font-weight: 600;
                    font-size: 1.1rem;
                    margin: 0;
                }

                /* Action Cards */
                .action-cards-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 25px;
                    margin-top: 30px;
                }
                .action-card {
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 6px 25px rgba(0,0,0,0.08);
                    transition: all 0.3s ease;
                    border: 2px solid #f0f0f0;
                }
                .action-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 35px rgba(0,0,0,0.12);
                    border-color: #2C5E4A;
                }
                .action-card-header {
                    padding: 25px 25px 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #f0f0f0;
                }
                .action-card-header h4 {
                    margin: 0;
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: #2C5E4A;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .card-icon {
                    font-size: 1.5rem;
                }
                .action-btn {
                    padding: 10px 20px;
                    border-radius: 12px;
                    font-weight: 600;
                    text-decoration: none;
                    border: none;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                .action-btn.primary {
                    background: linear-gradient(135deg, #2C5E4A 0%, #4A7C59 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(44, 94, 74, 0.3);
                }
                .action-btn.primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(44, 94, 74, 0.4);
                }
                .action-btn.secondary {
                    background: #f8f9fa;
                    color: #2C5E4A;
                    border: 2px solid #e9ecef;
                }
                .action-btn.secondary:hover {
                    background: #e9ecef;
                    border-color: #2C5E4A;
                }
                .action-card-body {
                    padding: 20px 25px 25px;
                }

                /* Empty States */
                .empty-state.gamified {
                    text-align: center;
                    padding: 40px 20px;
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    border-radius: 16px;
                    border: 2px dashed #dee2e6;
                }
                .empty-icon {
                    font-size: 3rem;
                    margin-bottom: 15px;
                    opacity: 0.7;
                    animation: bounce 2s infinite;
                }
                .empty-state p {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #495057;
                    margin: 0 0 8px 0;
                }
                .empty-state span {
                    color: #6c757d;
                    font-size: 0.95rem;
                }

                /* Items and Events */
                .items-list, .events-list {
                    display: grid;
                    gap: 10px;
                }
                .item-wrapper {
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 15px;
                    transition: all 0.3s ease;
                    border: 1px solid #e9ecef;
                }
                .item-wrapper:hover {
                    background: #fff;
                    border-color: #2C5E4A;
                    transform: translateX(5px);
                }
                .event-item.enhanced {
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 12px;
                    margin-bottom: 10px;
                    gap: 15px;
                    transition: all 0.3s ease;
                    border-left: 4px solid #2C5E4A;
                }
                .event-item.enhanced:hover {
                    background: white;
                    transform: translateX(5px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .event-dot {
                    width: 12px;
                    height: 12px;
                    background: #2C5E4A;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }
                .event-details {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .event-title {
                    font-weight: 600;
                    color: #2C5E4A;
                    font-size: 1rem;
                }
                .event-date {
                    font-weight: 500;
                    color: #666;
                    font-size: 0.9rem;
                    background: #e8f5e8;
                    padding: 2px 8px;
                    border-radius: 6px;
                    width: fit-content;
                }
                .event-indicator {
                    font-size: 1.2rem;
                    animation: bounce 2s infinite;
                }

                /* Organizer Dashboard Styles */
                .dashboard-section { 
                    margin-bottom: 40px; 
                }
                .section-header.enhanced {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                    padding: 20px 0;
                    border-bottom: 2px solid #f0f0f0;
                }
                .title-group {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .section-icon {
                    font-size: 2rem;
                    padding: 10px;
                    background: linear-gradient(135deg, #2C5E4A 0%, #4A7C59 100%);
                    color: white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .section-title {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #2C5E4A;
                    margin: 0;
                }
                .view-details-btn.premium {
                    background: linear-gradient(135deg, #2C5E4A 0%, #4A7C59 100%);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 12px;
                    text-decoration: none;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(44, 94, 74, 0.2);
                }
                .view-details-btn.premium:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(44, 94, 74, 0.3);
                }

                /* Stats Grid for Organizers */
                .stats-grid.gamified {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 20px;
                }
                .stat-card {
                    background: white;
                    padding: 25px;
                    border-radius: 18px;
                    box-shadow: 0 6px 25px rgba(0,0,0,0.08);
                    position: relative;
                    overflow: hidden;
                    border: 2px solid transparent;
                    transition: all 0.4s ease;
                }
                .stat-card.animate {
                    animation: statCardEntrance 0.8s ease-out forwards;
                    animation-delay: var(--delay, 0s);
                    opacity: 0;
                    transform: translateY(20px);
                }
                .stat-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.12);
                }
                .stat-card.food-saved { border-color: #4CAF50; }
                .stat-card.people-fed { border-color: #FF7A59; }
                .stat-card.carbon-saved { border-color: #2C5E4A; }
                .stat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                .stat-trend {
                    font-size: 1.2rem;
                    color: #4CAF50;
                    background: #e8f5e9;
                    padding: 4px 8px;
                    border-radius: 8px;
                }
                .stat-glow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(circle at center, rgba(44, 94, 74, 0.05) 0%, transparent 70%);
                    animation: pulse 4s ease-in-out infinite;
                }

                /* Events for Organizers */
                .events-organizer .action-card-body {
                    padding: 20px;
                }
                .events-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 15px;
                }
                .event-card {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 12px;
                    border: 1px solid #e9ecef;
                    transition: all 0.3s ease;
                }
                .event-card:hover {
                    background: white;
                    border-color: #2C5E4A;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .event-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .event-icon {
                    font-size: 1.5rem;
                    padding: 8px;
                    background: #2C5E4A;
                    color: white;
                    border-radius: 8px;
                }
                .event-date-badge {
                    background: #FF7A59;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .event-card h5 {
                    margin: 0 0 15px 0;
                    color: #2C5E4A;
                    font-weight: 600;
                }
                .mini-btn {
                    background: #2C5E4A;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .mini-btn:hover {
                    background: #1e4034;
                    transform: translateY(-1px);
                }

                /* NGO Dashboard Styles */
                .ngo-impact-header {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 25px;
                    margin-bottom: 30px;
                }
                .impact-score-card {
                    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
                    padding: 30px;
                    border-radius: 20px;
                    color: white;
                    text-align: center;
                    box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
                    position: relative;
                    overflow: hidden;
                }
                .score-icon {
                    font-size: 3rem;
                    margin-bottom: 15px;
                    animation: bounce 2s infinite;
                }
                .score-info h3 {
                    margin: 0 0 10px 0;
                    font-size: 1.5rem;
                    font-weight: 700;
                    opacity: 0.9;
                }
                .score-number {
                    font-size: 3.5rem;
                    font-weight: 800;
                    margin: 10px 0;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.3);
                }
                .score-number.animate {
                    animation: countUp 2s ease-out;
                }
                .score-info p {
                    margin: 0;
                    opacity: 0.9;
                    font-weight: 500;
                }
                .organization-badge {
                    background: white;
                    padding: 30px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    box-shadow: 0 6px 25px rgba(0,0,0,0.08);
                    border: 2px solid #e9ecef;
                }
                .org-icon {
                    font-size: 2.5rem;
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #2C5E4A 0%, #4A7C59 100%);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .org-info h4 {
                    margin: 0 0 5px 0;
                    color: #2C5E4A;
                    font-weight: 700;
                    font-size: 1.3rem;
                }
                .org-info p {
                    margin: 0;
                    color: #666;
                    font-weight: 500;
                }

                /* Enhanced Lists */
                .summary-list.enhanced {
                    display: grid;
                    gap: 12px;
                }
                .item-wrapper.organizer {
                    background: linear-gradient(135deg, #fff 0%, #f8fcf8 100%);
                    border-left: 4px solid #2C5E4A;
                }
                .item-wrapper.ngo {
                    background: linear-gradient(135deg, #fff 0%, #fffaf8 100%);
                    border-left: 4px solid #FF7A59;
                }
                .empty-message.gamified.ngo {
                    border-color: #FF7A59;
                    background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
                }

                /* Welcome Card */
                .welcome-card {
                    background: white;
                    padding: 60px 40px;
                    border-radius: 24px;
                    text-align: center;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    border: 2px solid #f0f0f0;
                }
                .welcome-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                    animation: bounce 2s infinite;
                }
                .welcome-card h3 {
                    font-size: 2rem;
                    color: #2C5E4A;
                    margin: 0 0 15px 0;
                    font-weight: 700;
                }
                .welcome-card p {
                    color: #666;
                    font-size: 1.1rem;
                    margin: 0;
                }

                /* Animations */
                @keyframes spin { 
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); } 
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-8px); }
                    60% { transform: translateY(-4px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes shimmer {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
                @keyframes shine {
                    0% { left: -100%; }
                    50% { left: -100%; }
                    100% { left: 100%; }
                }
                @keyframes sparkle {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                }
                @keyframes levelUpPop {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
                }
                @keyframes statCardEntrance {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes countUp {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .dashboard-container { padding: 15px; }
                    .hero-section { grid-template-columns: 1fr; }
                    .action-cards-grid { grid-template-columns: 1fr; }
                    .ngo-impact-header { grid-template-columns: 1fr; }
                    .impact-level-card.premium { flex-direction: column; text-align: center; }
                    .page-title { font-size: 2.5rem; }
                    .stats-grid.gamified { grid-template-columns: 1fr; }
                    .events-grid { grid-template-columns: 1fr; }
                    .section-header.enhanced { 
                        flex-direction: column; 
                        gap: 15px; 
                        text-align: center; 
                    }
                }
            `}</style>
        </div>
    );
};

export default DashboardPage;


