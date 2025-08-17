import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useFood } from '../context/FoodContext.jsx';
import { FaLeaf } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// Import the new dashboard components
import StudentImpactDashboard from '../components/dashboard/StudentImpactDashboard.jsx';
import OrganizerDashboard from '../components/dashboard/OrganizerDashboard.jsx';
import NGODashboard from '../components/dashboard/NgoDashboard.jsx';

// Import the new CSS file
import './DashboardPage.css';

// --- Main Dashboard Page Component ---
const DashboardPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { myClaimedItems, campusEvents } = useFood();

    if (!user) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
                {/* CHANGED: Translated loading text */}
                <p>{t('dashboard.loading')}</p>
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
                        {/* CHANGED: Translated welcome message */}
                        <h3>{t('dashboard.welcomeMessage')}</h3>
                    </div>
                );
        }
    };

    return (
        <div className="dashboard-page-wrapper">
            <div className="dashboard-container">
                <header className="page-header">
                    {/* CHANGED: Translated title */}
                    <h1>{t('dashboard.title')}</h1>
                    {/* CHANGED: Translated subtitle */}
                    <p>{t('dashboard.subtitle')}</p>
                </header>
                {renderDashboardByRole()}
            </div>
        </div>
    );
};

export default DashboardPage;