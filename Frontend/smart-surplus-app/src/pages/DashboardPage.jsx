import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useFood } from '../context/FoodContext.jsx';
import { FaLeaf } from 'react-icons/fa';

// Import the new dashboard components
import StudentImpactDashboard from '../components/dashboard/StudentImpactDashboard.jsx';
import OrganizerDashboard from '../components/dashboard/OrganizerDashboard.jsx';
import NGODashboard from '../components/dashboard/NgoDashboard.jsx';

// Import the new CSS file
import './DashboardPage.css';

// --- Main Dashboard Page Component ---
const DashboardPage = () => {
    const { user } = useAuth();
    const { myClaimedItems, campusEvents } = useFood();

    // The loading state is now handled inside each specific dashboard component
    // except for the initial user load.
    if (!user) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    const renderDashboardByRole = () => {
        switch (user.role) {
            case 'student':
                return <StudentImpactDashboard 
                            user={user} 
                            myClaimedItems={myClaimedItems} 
                            campusEvents={campusEvents} 
                        />;
            case 'canteen-organizer':
                return <OrganizerDashboard 
                            user={user} 
                            campusEvents={campusEvents} 
                        />;
            case 'ngo':
                return <NGODashboard 
                            user={user} 
                            myClaimedItems={myClaimedItems} 
                        />;
            default:
                return (
                    <div className="welcome-card">
                        <FaLeaf className="welcome-icon" />
                        <h3>Welcome!</h3>
                    </div>
                );
        }
    };

    return (
        <div className="dashboard-page-wrapper">
            <div className="dashboard-container">
                <header className="page-header">
                    <h1>Your Dashboard</h1>
                    <p>Track your contribution to campus sustainability</p>
                </header>
                {renderDashboardByRole()}
            </div>
        </div>
    );
};

export default DashboardPage;