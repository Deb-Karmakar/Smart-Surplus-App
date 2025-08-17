import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import
import DashboardSummaryCard from '../shared/DashboardSummaryCard.jsx';
import { FaTrophy, FaHandshake, FaBoxOpen, FaHandsHelping } from 'react-icons/fa';

const NGODashboard = ({ user, myClaimedItems }) => {
    const { t } = useTranslation(); // Initialize
    const impactScore = myClaimedItems.length * 10;

    return (
        <>
            <div className="ngo-header">
                <div className="impact-card">
                    <FaTrophy className="impact-icon" />
                    <div>
                        <h3>{t('dashboard.ngo.impactScore')}</h3>
                        <div className="impact-score">{impactScore}</div>
                    </div>
                </div>
                <div className="org-card">
                    <FaHandshake className="org-icon" />
                    <h4>{user.organizationName || t('dashboard.ngo.ngoPartner')}</h4>
                </div>
            </div>

            <section className="pickups-section">
                <div className="section-header">
                    <h2><FaBoxOpen /> {t('dashboard.ngo.pickupsTitle')}</h2>
                    <Link to="/browse" className="btn-primary">{t('dashboard.ngo.findFood')}</Link>
                </div>
                <div className="items-grid">
                    {myClaimedItems.length > 0 ? (
                        myClaimedItems.map(item => (
                            <div key={item._id} className="item-card">
                                <DashboardSummaryCard item={item} />
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <FaHandsHelping className="empty-icon" />
                            <p>{t('dashboard.ngo.emptyState')}</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default NGODashboard;