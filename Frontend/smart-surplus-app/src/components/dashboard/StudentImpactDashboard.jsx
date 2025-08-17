import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api';
import DashboardSummaryCard from '../shared/DashboardSummaryCard.jsx';
import {
    FaTrophy, FaLeaf, FaSeedling, FaTree, FaLock, FaUtensils, FaGlobe, FaWater,
    FaBullseye, FaBoxOpen, FaCalendarAlt, FaHandsHelping, FaBell, FaHandHoldingUsd, FaTimes
} from 'react-icons/fa';

// --- Redeem Modal Component ---
const RedeemModal = ({ isOpen, onClose, user, onRedeem }) => {
    const { t } = useTranslation();
    const [pointsToRedeem, setPointsToRedeem] = useState(50);
    const [redeemError, setRedeemError] = useState('');
    const [isRedeeming, setIsRedeeming] = useState(false);

    const handleRedeem = async () => {
        if (pointsToRedeem < 50 || pointsToRedeem > user.cashbackPoints) {
            setRedeemError(t('dashboard.student.redeemModal.errorRange', { maxPoints: user.cashbackPoints }));
            return;
        }
        
        setIsRedeeming(true);
        setRedeemError('');
        
        try {
            const res = await api.post('/redeem', { pointsToRedeem });
            alert(res.data.msg);
            await onRedeem();
            onClose();
        } catch (err) {
            setRedeemError(err.response?.data?.msg || t('dashboard.student.redeemModal.errorGeneric'));
        } finally {
            setIsRedeeming(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{t('dashboard.student.redeemModal.title')}</h3>
                    <button className="modal-close" onClick={onClose}><FaTimes /></button>
                </div>
                
                <div className="modal-body">
                    <p>{t('dashboard.student.redeemModal.description')}</p>
                    <div className="balance-info">
                        <span>{t('dashboard.student.redeemModal.balance')}</span>
                        <strong>{user.cashbackPoints} {t('dashboard.student.points', { count: '' }).trim()}</strong>
                    </div>
                    <div className="input-group">
                        <label>{t('dashboard.student.redeemModal.pointsToRedeem')}</label>
                        <input type="number" value={pointsToRedeem} onChange={(e) => setPointsToRedeem(Number(e.target.value))} min="50" max={user.cashbackPoints} step="10" />
                    </div>
                    <div className="conversion-info">
                        <p>{t('dashboard.student.redeemModal.youWillReceive')} <strong>₹{(pointsToRedeem / 10).toFixed(2)}</strong></p>
                        <small>{t('dashboard.student.redeemModal.conversionRate')}</small>
                    </div>
                    {redeemError && <div className="error-message">{redeemError}</div>}
                </div>
                
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>{t('dashboard.student.redeemModal.cancel')}</button>
                    <button className="btn-confirm" onClick={handleRedeem} disabled={isRedeeming || pointsToRedeem < 50 || pointsToRedeem > user.cashbackPoints}>
                        {isRedeeming ? t('dashboard.student.redeemModal.processing') : t('dashboard.student.redeemModal.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- A constant array defining all possible achievements ---
const ALL_ACHIEVEMENTS = [
    { id: 'firstStep', mealsRequired: 1, Icon: FaSeedling },
    { id: 'ecoWarrior', mealsRequired: 5, Icon: FaLeaf },
    { id: 'greenGuardian', mealsRequired: 10, Icon: FaTree },
    { id: 'sustainabilityChampion', mealsRequired: 25, Icon: FaTrophy },
];

// --- Student Impact Dashboard Component ---
const StudentImpactDashboard = ({ user, myClaimedItems, campusEvents }) => {
    const { t, ready } = useTranslation();
    const { loadUser } = useAuth();
    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);

    const mealsSaved = myClaimedItems.length;
    const co2Prevented = (mealsSaved * 2.5).toFixed(1);
    const waterSaved = (mealsSaved * 250 / 1000).toFixed(1);
    const pointsInCurrentLevel = (user.points || 0) % 100;
    const progressPercentage = (pointsInCurrentLevel / 100) * 100;
    const weeklyChallenge = user.weeklyChallenge || { progress: 0, goal: 5, reward: 200, title: t('dashboard.student.challengeTitle') };
    const challengeProgress = (weeklyChallenge.progress / weeklyChallenge.goal) * 100;

    const handleRedeemSuccess = async () => {
        await loadUser();
    };

    useEffect(() => {
        if (pointsInCurrentLevel < 10 && user.points > 90) {
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 3000);
        }
    }, [user.points, pointsInCurrentLevel]);

    const earnedBadges = ALL_ACHIEVEMENTS
        .filter(ach => mealsSaved >= ach.mealsRequired)
        .slice(-3);

    const renderAchievements = () => {
        if (!ready) {
            return null;
        }

        return (
            <div className="badges-grid">
                {earnedBadges.map((badge) => (
                    <div key={badge.id} className="badge earned">
                        <div className="badge-icon"><badge.Icon /></div>
                        <div>
                            <h5>{t(`dashboard.student.achievementsList.${badge.id}.title`)}</h5>
                            <p>{t(`dashboard.student.achievementsList.${badge.id}.desc`)}</p>
                        </div>
                    </div>
                ))}
                
                {earnedBadges.length === 0 && (
                    <div className="badge locked">
                        <div className="badge-icon"><FaLock /></div>
                        <div>
                            <h5>{t('dashboard.student.achievementsList.firstStep.title')}</h5>
                            <p>{t('dashboard.student.achievementsList.firstStep.desc')}</p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {showLevelUp && (
                <div className="level-up-notification">
                    <FaTrophy className="level-up-icon" />
                    <h3>{t('dashboard.student.levelUp.title')}</h3>
                    <p>{t('dashboard.student.levelUp.body', { level: user.level || 1 })}</p>
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
                                    style={{ strokeDasharray: '314', strokeDashoffset: `${314 - (314 * progressPercentage) / 100}` }}
                                />
                            </svg>
                            <div className="level-number">{user.level || 1}</div>
                        </div>
                        <div className="level-info">
                            {/* --- THIS IS THE FIX --- */}
                            <h3>{user.title === 'Food Saver' ? t('dashboard.student.foodSaver') : (user.title || t('dashboard.student.foodSaver'))}</h3>
                            
                            <div className="points">{t('dashboard.student.points', { count: user.points || 0 })}</div>
                            <small>{t('dashboard.student.pointsToNextLevel', { count: 100 - pointsInCurrentLevel })}</small>
                        </div>
                    </div>
                </div>

                <div className="challenge-card">
                    <div className="challenge-header">
                        <FaBullseye className="challenge-icon" />
                        <div>
                            <h4>{t('dashboard.student.weeklyChallenge')}</h4>
                            <p>{weeklyChallenge.title}</p>
                        </div>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${challengeProgress}%` }} />
                    </div>
                    <div className="challenge-stats">
                        <span>{weeklyChallenge.progress}/{weeklyChallenge.goal}</span>
                        <span>+{weeklyChallenge.reward} 💎</span>
                    </div>
                </div>
            </div>

            <section className="achievements-section">
                <h2>{t('dashboard.student.achievements')}</h2>
                {renderAchievements()}
            </section>

            <section className="stats-section">
                <div className="stats-grid">
                    <div className="stat-card">
                        <FaUtensils className="stat-icon" />
                        <h3>{mealsSaved}</h3>
                        <p>{t('dashboard.student.stats.mealsSaved')}</p>
                    </div>
                    <div className="stat-card">
                        <FaGlobe className="stat-icon" />
                        <h3>{co2Prevented} kg</h3>
                        <p>{t('dashboard.student.stats.co2Prevented')}</p>
                    </div>
                    <div className="stat-card">
                        <FaWater className="stat-icon" />
                        <h3>{waterSaved} kL</h3>
                        <p>{t('dashboard.student.stats.waterSaved')}</p>
                    </div>
                    <div className="stat-card cashback-card">
                        <FaHandHoldingUsd className="stat-icon" />
                        <h3>{user.cashbackPoints || 0}</h3>
                        <p>{t('dashboard.student.stats.volunteerPoints')}</p>
                        <button 
                            className="redeem-button"
                            onClick={() => setIsRedeemModalOpen(true)}
                            disabled={(user.cashbackPoints || 0) < 50}
                        >
                            {t('dashboard.student.stats.redeem')}
                        </button>
                    </div>
                </div>
            </section>

            <div className="action-grid">
                <div className="action-card">
                    <div className="card-header">
                        <h3><FaBoxOpen /> {t('dashboard.student.pickupRequests')}</h3>
                        <Link to="/browse" className="btn-primary">{t('dashboard.student.browseFood')}</Link>
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
                                <p>{t('dashboard.student.emptyRequests')}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="action-card">
                    <div className="card-header">
                        <h3><FaCalendarAlt /> {t('dashboard.student.campusEvents')}</h3>
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
                                <p>{t('dashboard.student.noEvents')}</p>
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