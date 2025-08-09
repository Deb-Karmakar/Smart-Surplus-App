import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useFood } from '../context/FoodContext.jsx';
import DashboardSummaryCard from '../components/shared/DashboardSummaryCard.jsx';

const DashboardPage = () => {
  const { user } = useAuth();
  const { foodListings, analytics } = useFood();

  if (!user) {
    return <div>Loading...</div>;
  }

  const myClaimedItems = foodListings.filter(item => item.claimedBy === user.email);
  const myListedItems = foodListings.filter(item => item.postedBy === user.email);

  return (
    <>
      <div className="dashboard-container">
        <div className="page-header">
          <h1 className="page-title">Welcome, {user.name}!</h1>
          <p className="page-subtitle">Here's a summary of your activity and impact.</p>
        </div>

        {/* --- Personal Stats Section (Visible to all) --- */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">My Stats</h2>
            <Link to="/leaderboard" className="view-details-btn">View Leaderboard →</Link>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{user.points}</h3>
              <p>Impact Points</p>
            </div>
            <div className="stat-card">
              <h3>{myClaimedItems.length}</h3>
              <p>Items Claimed</p>
            </div>
          </div>
        </div>

        {/* --- Analytics (Visible only to Canteen Organizers) --- */}
        {user.role === 'canteen-organizer' && (
          <div className="dashboard-section">
            <div className="section-header">
                <h2 className="section-title">Impact At-a-Glance</h2>
                <Link to="/analytics" className="view-details-btn">View Detailed Analytics →</Link>
            </div>
            <div className="stats-grid">
              <div className="stat-card"><h3>{analytics.foodSaved} kg</h3><p>Food Saved</p></div>
              <div className="stat-card"><h3>{analytics.peopleFed}</h3><p>People Fed</p></div>
              <div className="stat-card"><h3>{analytics.carbonFootprintAvoided} kg</h3><p>CO₂ Footprint Avoided</p></div>
            </div>
          </div>
        )}

        <div className="dashboard-content">
          {/* --- My Claimed Items (Visible only to Students) --- */}
          {user.role === 'student' && (
            <div className="dashboard-section">
              <h2 className="section-title">My Claimed Items</h2>
              <div className="summary-list">
                {myClaimedItems.length > 0 ? (
                  myClaimedItems.map(item => <DashboardSummaryCard key={item.id} item={item} />)
                ) : (
                  <p className="empty-message">You haven't claimed any food yet. Check the <Link to="/browse">browse page</Link>!</p>
                )}
              </div>
            </div>
          )}

          {/* --- My Listed Items (Visible only to Canteen Organizers) --- */}
          {user.role === 'canteen-organizer' && (
            <div className="dashboard-section">
              <h2 className="section-title">My Listed Items</h2>
              <div className="summary-list">
                {myListedItems.length > 0 ? (
                  myListedItems.map(item => <DashboardSummaryCard key={item.id} item={item} />)
                ) : (
                  <p className="empty-message">You haven't listed any food items yet. <Link to="/add-food">List one now</Link>!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Your existing styles remain the same --- */}
      <style jsx>{`
        .dashboard-container { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
        .page-header { text-align: center; margin-bottom: 20px; }
        .page-title { font-size: 2.8rem; font-weight: 700; color: #2C5E4A; margin: 0; }
        .page-subtitle { font-size: 1.1rem; color: #555; }
        .dashboard-content { display: grid; gap: 40px; }
        .dashboard-section { margin-top: 40px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;}
        .section-title { font-size: 1.8rem; font-weight: 600; color: #333; margin: 0; }
        .view-details-btn { background-color: #F1F8E9; color: #2C5E4A; padding: 8px 15px; border-radius: 8px; text-decoration: none; font-weight: 600; transition: background-color 0.3s; }
        .view-details-btn:hover { background-color: #E8F5E9; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; }
        .stat-card { background-color: #fff; padding: 25px; border-radius: 16px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .stat-card h3 { font-size: 2.5rem; color: #2C5E4A; margin: 0 0 5px 0; }
        .stat-card p { font-size: 1rem; color: #555; margin: 0; }
        .summary-list { display: grid; gap: 15px; }
        .empty-message { background-color: #f9f9f9; padding: 20px; border-radius: 12px; text-align: center; color: #777; }
        .empty-message a { color: #FF7A59; font-weight: 600; text-decoration: none; }
      `}</style>
    </>
  );
};

export default DashboardPage;
