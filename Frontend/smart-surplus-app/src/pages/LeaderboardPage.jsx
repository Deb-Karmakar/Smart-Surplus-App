import React, { useState, useEffect } from 'react';
import api from '../services/api'; // This will connect to your actual backend API

// A small component for the medal icons
const RankIcon = ({ rank }) => {
  if (rank === 0) return <span className="text-3xl">🥇</span>;
  if (rank === 1) return <span className="text-3xl">🥈</span>;
  if (rank === 2) return <span className="text-3xl">🥉</span>;
  return <span className="text-xl text-gray-500 font-semibold">{rank + 1}</span>;
};

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        // Fetches real data from your /api/leaderboard endpoint
        const res = await api.get('/leaderboard');
        setLeaderboard(res.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setError('Could not load the leaderboard. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return <div className="text-center py-20 text-xl text-gray-500">Loading Leaderboard...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-xl text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
            Top Food Rescuers
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            A big thank you to our most active community members!
          </p>
        </div>
        
        <div className="space-y-4">
          {leaderboard.length > 0 ? (
            leaderboard.map((user, index) => (
              <div 
                key={user._id} 
                className="flex items-center bg-white p-4 rounded-xl shadow-md transition-transform transform hover:scale-105"
              >
                <div className="w-16 text-center text-2xl font-bold text-gray-700">
                  <RankIcon rank={index} />
                </div>
                <div className="flex-grow ml-4">
                  <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                </div>
                <div className="text-xl font-bold text-emerald-600">
                  {user.points} pts
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-xl text-gray-500">
              The leaderboard is empty. Be the first to earn points!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
