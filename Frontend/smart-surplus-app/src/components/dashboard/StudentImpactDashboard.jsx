import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api';
import DashboardSummaryCard from '../shared/DashboardSummaryCard.jsx';
import {
    FaTrophy, FaLeaf, FaSeedling, FaTree, FaLock, FaUtensils, FaGlobe, FaWater,
    FaBullseye, FaBoxOpen, FaCalendarAlt, FaHandsHelping, FaBell, FaHandHoldingUsd, FaTimes
} from 'react-icons/fa';

// --- Redeem Modal Component (Moved here as it's only used by students) ---
const RedeemModal = ({ isOpen, onClose, user, onRedeem }) => {
    const [pointsToRedeem, setPointsToRedeem] = useState(50);
    const [redeemError, setRedeemError] = useState('');
    const [isRedeeming, setIsRedeeming] = useState(false);

    const handleRedeem = async () => {
        if (pointsToRedeem < 50 || pointsToRedeem > user.cashbackPoints) {
            setRedeemError(`Please enter a value between 50 and ${user.cashbackPoints}.`);
            return;
        }
        
        setIsRedeeming(true);
        setRedeemError('');
        
        try {
            const res = await api.post('/redeem', { pointsToRedeem });
            alert(res.data.msg);
            await onRedeem(); // Refresh user data
            onClose();
        } catch (err) {
            setRedeemError(err.response?.data?.msg || 'Redemption failed. Please try again.');
        } finally {
            setIsRedeeming(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Redeem Cashback Points</h3>
                    <button className="modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className="modal-body">
                    <p>Convert your volunteer points into canteen discounts.</p>
                    
                    <div className="balance-info">
                        <span>Available Balance:</span>
                        <strong>{user.cashbackPoints} points</strong>
                    </div>
                    
                    <div className="input-group">
                        <label>Points to Redeem:</label>
                        <input 
                            type="number" 
                            value={pointsToRedeem}
                            onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                            min="50"
                            max={user.cashbackPoints}
                            step="10"
                        />
                    </div>
                    
                    <div className="conversion-info">
                        <p>You will receive: <strong>₹{(pointsToRedeem / 10).toFixed(2)}</strong></p>
                        <small>Conversion rate: 10 points = ₹1</small>
                    </div>
                    
                    {redeemError && <div className="error-message">{redeemError}</div>}
                </div>
                
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button 
                        className="btn-confirm" 
                        onClick={handleRedeem}
                        disabled={isRedeeming || pointsToRedeem < 50 || pointsToRedeem > user.cashbackPoints}
                    >
                        {isRedeeming ? 'Processing...' : 'Confirm Redemption'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Student Impact Dashboard Component ---
const StudentImpactDashboard = ({ user, myClaimedItems, campusEvents }) => {
    const { loadUser } = useAuth();
    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);

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

    const handleRedeemSuccess = async () => {
        await loadUser();
    };

    useEffect(() => {
        if (pointsInCurrentLevel < 10 && user.points > 90) {
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 3000);
        }
    }, [user.points, pointsInCurrentLevel]);

    return (
        <>
            {showLevelUp && (
                <div className="level-up-notification">
                    <FaTrophy className="level-up-icon" />
                    <h3>Level Up!</h3>
                    <p>You've reached Level {user.level || 1}!</p>
                </div>
            )}

            <div className="hero-section">
                <div className="level-card">
                    <div className="level-display">
                        <div className="level-ring">
                            <svg viewBox="0 0 120 120" className="progress-ring">
                                <circle cx="60" cy="60" r="50" className="ring-bg" />
                                <circle 
                                    cx="60" cy="60" r="50" 
                                    className="ring-progress"
                                    style={{ 
                                        strokeDasharray: '314',
                                        strokeDashoffset: `${314 - (314 * progressPercentage) / 100}`
                                    }}
                                />
                            </svg>
                            <div className="level-number">{user.level || 1}</div>
                        </div>
                        <div className="level-info">
                            <h3>{user.title || 'Food Saver'}</h3>
                            <div className="points">{user.points || 0} points</div>
                            <small>{100 - pointsInCurrentLevel} points to next level</small>
                        </div>
                    </div>
                </div>

                <div className="challenge-card">
                    <div className="challenge-header">
                        <FaBullseye className="challenge-icon" />
                        <div>
                            <h4>Weekly Challenge</h4>
                            <p>{weeklyChallenge.title}</p>
                        </div>
                    </div>
                    <div className="progress-bar">
                        <div 
                            className="progress-fill"
                            style={{ width: `${challengeProgress}%` }}
                        />
                    </div>
                    <div className="challenge-stats">
                        <span>{weeklyChallenge.progress}/{weeklyChallenge.goal}</span>
                        <span>+{weeklyChallenge.reward} 💎</span>
                    </div>
                </div>
            </div>

            <section className="achievements-section">
                <h2>Recent Achievements</h2>
                <div className="badges-grid">
                    {getAchievementBadges().map((badge, index) => (
                        <div key={index} className="badge earned">
                            <div className="badge-icon">{badge.icon}</div>
                            <div>
                                <h5>{badge.title}</h5>
                                <p>{badge.desc}</p>
                            </div>
                        </div>
                    ))}
                    {getAchievementBadges().length === 0 && (
                        <div className="badge locked">
                            <div className="badge-icon"><FaLock /></div>
                            <div>
                                <h5>First Step</h5>
                                <p>Save your first meal</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="stats-section">
                <div className="stats-grid">
                    <div className="stat-card">
                        <FaUtensils className="stat-icon" />
                        <h3>{mealsSaved}</h3>
                        <p>Meals Saved</p>
                    </div>
                    <div className="stat-card">
                        <FaGlobe className="stat-icon" />
                        <h3>{co2Prevented} kg</h3>
                        <p>CO₂ Prevented</p>
                    </div>
                    <div className="stat-card">
                        <FaWater className="stat-icon" />
                        <h3>{waterSaved} kL</h3>
                        <p>Water Saved</p>
                    </div>
                    <div className="stat-card cashback-card">
                        <FaHandHoldingUsd className="stat-icon" />
                        <h3>{user.cashbackPoints || 0}</h3>
                        <p>Volunteer Points</p>
                        <button 
                            className="redeem-button"
                            onClick={() => setIsRedeemModalOpen(true)}
                            disabled={(user.cashbackPoints || 0) < 50}
                        >
                            Redeem
                        </button>
                    </div>
                </div>
            </section>

            <div className="action-grid">
                <div className="action-card">
                    <div className="card-header">
                        <h3><FaBoxOpen /> Your Pickup Requests</h3>
                        <Link to="/browse" className="btn-primary">Browse Food</Link>
                    </div>
                    <div className="card-body">
                        {myClaimedItems.length > 0 ? (
                            <div className="items-list">
                                {myClaimedItems.slice(0, 3).map(item => (
                                    <div key={item._id} className="item-card">
                                        <DashboardSummaryCard item={item} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <FaUtensils className="empty-icon" />
                                <p>Ready to start your food saving journey?</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="action-card">
                    <div className="card-header">
                        <h3><FaCalendarAlt /> Campus Events</h3>
                        <button className="btn-secondary"><FaBell /></button>
                    </div>
                    <div className="card-body">
                        {campusEvents && campusEvents.length > 0 ? (
                            <div className="events-list">
                                {campusEvents.map(event => (
                                    <div key={event._id} className="event-item">
                                        <div className="event-details">
                                            <span className="event-title">{event.title}</span>
                                            <span className="event-date">
                                                {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <FaHandsHelping className="event-icon" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <FaCalendarAlt className="empty-icon" />
                                <p>No upcoming events</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <RedeemModal 
                isOpen={isRedeemModalOpen}
                onClose={() => setIsRedeemModalOpen(false)}
                user={user}
                onRedeem={handleRedeemSuccess}
            />
        </>
    );
};

export default StudentImpactDashboard;