import React from 'react';
import { Link } from 'react-router-dom';
import DashboardSummaryCard from '../shared/DashboardSummaryCard.jsx';
import { FaTrophy, FaHandshake, FaBoxOpen, FaHandsHelping } from 'react-icons/fa';

const NGODashboard = ({ user, myClaimedItems }) => {
    const impactScore = myClaimedItems.length * 10;

    return (
        <>
            <div className="ngo-header">
                <div className="impact-card">
                    <FaTrophy className="impact-icon" />
                    <div>
                        <h3>Impact Score</h3>
                        <div className="impact-score">{impactScore}</div>
                    </div>
                </div>
                <div className="org-card">
                    <FaHandshake className="org-icon" />
                    <h4>{user.organizationName || 'NGO Partner'}</h4>
                </div>
            </div>

            <section className="pickups-section">
                <div className="section-header">
                    <h2><FaBoxOpen /> Your Organization's Pickups</h2>
                    <Link to="/browse" className="btn-primary">Find More Food</Link>
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
                            <p>Ready to help your community?</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default NGODashboard;