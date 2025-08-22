import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

// A small reusable component for the badge display
const Badge = ({ badge, earned }) => (
  <div className={`badge ${earned ? 'earned' : 'unearned'}`}>
    <div className="badge-icon">{badge.icon}</div>
    <p className="badge-title">{badge.title}</p>
  </div>
);

const ProfilePage = () => {
  const { user, allBadges } = useAuth();

  // Loading state check
  if (!user) {
    return (
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.5rem' }}>
            Loading Profile...
        </div>
    );
  }
  
  // Provide default values for gamification fields
  const userBadges = user.badges || [];
  const userTitle = user.title || 'New Member';
  const userLevel = user.level || 1;
  const userPoints = user.points || 0;

  return (
    <>
      <div className="profile-container">
        <h1 className="main-title">Your ZeroBite Profile</h1>

        {/* --- Profile Header Card --- */}
        <div className="profile-header">
          <div className="profile-avatar">
            <i className="fas fa-user"></i>
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-details">
              {userTitle} • {userPoints} points
            </p>
            <p className="profile-level">Level {userLevel} Food Hero</p>
          </div>
        </div>

        {/* --- Achievements & Badges Section --- */}
        <div className="badges-section">
          <h3 className="section-title">Achievements & Badges</h3>
          <div className="badges-grid">
            {allBadges && allBadges.map(badge => (
              <Badge key={badge.id} badge={badge} earned={userBadges.includes(badge.id)} />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-container { max-width: 800px; margin: 40px auto; padding: 0 20px; }
        .main-title { font-size: 2.5rem; font-weight: 700; color: #333; margin-bottom: 30px; }
        
        /* Profile Header */
        .profile-header {
          display: flex;
          align-items: center;
          background: linear-gradient(90deg, #4caf50, #8bc34a);
          color: white;
          padding: 30px;
          border-radius: 20px;
          margin-bottom: 40px;
        }
        .profile-avatar {
          font-size: 3rem;
          margin-right: 25px;
          background: rgba(255,255,255,0.2);
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .profile-name { font-size: 2rem; font-weight: 600; margin: 0; }
        .profile-details { font-size: 1.1rem; margin: 5px 0; opacity: 0.9; }
        .profile-level { font-size: 1rem; font-weight: 600; margin: 5px 0 0 0; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 20px; display: inline-block; }

        /* Badges Section */
        .badges-section { background: #fff; padding: 30px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .section-title { font-size: 1.5rem; font-weight: 600; margin: 0 0 20px 0; }
        .badges-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 20px; }
        
        .badge { 
          text-align: center; 
          padding: 20px; 
          border-radius: 15px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .badge:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        /* --- FIX: Improved Badge Styles --- */
        .badge.earned { 
          background-color: #E8F5E9; /* Softer green background */
          border: 1px solid #A5D6A7;
        }
        .badge.earned .badge-title {
          color: #2E7D32; /* Darker green text for contrast */
          font-weight: 600;
        }

        .badge.unearned { 
          background-color: #F5F5F5; /* Light grey background */
          border: 1px solid #EEEEEE;
        }
        /* Only dim the content, not the whole container */
        .badge.unearned .badge-icon,
        .badge.unearned .badge-title {
          opacity: 0.5;
        }
        
        .badge-icon { font-size: 2.5rem; margin-bottom: 10px; }
        .badge-title { font-weight: 500; margin: 0; color: #333; }
      `}</style>
    </>
  );
};

export default ProfilePage;
