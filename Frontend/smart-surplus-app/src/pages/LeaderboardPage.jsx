import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

// A small component for the medal icons
const RankIcon = ({ rank }) => {
  if (rank === 0) return <span>🥇</span>;
  if (rank === 1) return <span>🥈</span>;
  if (rank === 2) return <span>🥉</span>;
  return <span className="rank-number">{rank + 1}</span>;
};

const LeaderboardPage = () => {
  const { users } = useAuth();

  const sortedUsers = useMemo(() => {
    // Make sure users is an array before trying to sort
    if (!Array.isArray(users)) return [];
    return [...users].sort((a, b) => b.points - a.points);
  }, [users]);

  return (
    <>
      <div className="leaderboard-container">
        <div className="page-header">
          <h1 className="page-title">Top Food Rescuers</h1>
          <p className="page-subtitle">A big thank you to our most active community members!</p>
        </div>
        <div className="leaderboard">
          {sortedUsers.map((user, index) => (
            <div key={user.id} className="leaderboard-row">
              <div className="rank">
                <RankIcon rank={index} />
              </div>
              <div className="user-name">{user.name}</div>
              <div className="user-points">{user.points} pts</div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .leaderboard-container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        .page-header { text-align: center; margin-bottom: 40px; }
        .page-title { font-size: 2.8rem; font-weight: 700; color: #2C5E4A; margin: 0; }
        .page-subtitle { font-size: 1.1rem; color: #555; }
        .leaderboard { display: grid; gap: 10px; }
        .leaderboard-row { display: flex; align-items: center; background: #fff; padding: 15px 20px; border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .rank { font-size: 1.5rem; font-weight: 700; color: #FF7A59; width: 50px; text-align: center; }
        .rank-number { font-size: 1.2rem; color: #555; }
        
        /* --- FIX: Made the selector more specific to prevent overrides --- */
        .leaderboard-row .user-name { 
          flex-grow: 1; 
          font-size: 1.1rem; 
          font-weight: 500;
          color: #333 !important; /* Use a dark color */
        }
        
        .user-points { font-size: 1.2rem; font-weight: 600; color: #2C5E4A; }
      `}</style>
    </>
  );
};

export default LeaderboardPage;
