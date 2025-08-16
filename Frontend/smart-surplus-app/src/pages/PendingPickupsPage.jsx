import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaClock, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const PendingClaimCard = ({ claim, onAction }) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleConfirm = async () => {
        if (!otp) return setError('Please enter the OTP.');
        try {
            await api.put(`/food/confirm-pickup/${claim._id}`, { otp });
            setSuccess('Pickup confirmed!');
            // --- FIX: Immediately tell the parent component which claim to remove ---
            onAction(claim._id); 
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to confirm.');
        }
    };

    const handleCancel = async () => {
        if (window.confirm('Are you sure you want to cancel this pickup?')) {
            try {
                await api.put(`/food/cancel-pickup/${claim._id}`);
                setSuccess('Pickup cancelled.');
                // --- FIX: Immediately tell the parent component which claim to remove ---
                onAction(claim._id);
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to cancel.');
            }
        }
    };

    return (
        <div className="claim-card">
            <div className="card-content">
                <p>
                    <strong>{claim.user?.name || 'A user'}</strong> wants to pick up 
                    <strong> {claim.quantity} of "{claim.foodTitle}"</strong>.
                </p>
                <small>Claimed On: {new Date(claim.claimedAt).toLocaleString()}</small>
                <div className="action-area">
                    <input 
                        type="text" 
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength="6"
                    />
                    <button className="btn-confirm" onClick={handleConfirm}><FaCheck /> Confirm</button>
                    <button className="btn-cancel" onClick={handleCancel}><FaTimes /> Cancel</button>
                </div>
                {error && <p className="message error">{error}</p>}
                {success && <p className="message success">{success}</p>}
            </div>
        </div>
    );
};

const PendingPickupsPage = () => {
    const [pendingClaims, setPendingClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // This function now only runs on the initial load
    useEffect(() => {
        const fetchPendingClaims = async () => {
            try {
                const res = await api.get('/food/pending-pickups');
                setPendingClaims(res.data);
            } catch (err) {
                console.error("Failed to fetch pending claims", err);
                setError(err.response?.data?.message || "Could not load pending pickups.");
            } finally {
                setLoading(false);
            }
        };
        fetchPendingClaims();
    }, []);

    // --- FIX: This new function handles the removal of a claim from the UI ---
    const handleAction = (claimIdToRemove) => {
        setPendingClaims(currentClaims => 
            currentClaims.filter(claim => claim._id !== claimIdToRemove)
        );
    };

    const renderContent = () => {
        if (loading) {
            return <p>Loading...</p>;
        }
        if (error) {
            return (
                <div className="empty-state error-state">
                    <FaExclamationTriangle />
                    <p>An Error Occurred</p>
                    <span>{error}</span>
                </div>
            );
        }
        if (pendingClaims.length > 0) {
            return pendingClaims.map(claim => (
                <PendingClaimCard key={claim._id} claim={claim} onAction={handleAction} />
            ));
        }
        return (
            <div className="empty-state">
                <FaClock />
                <p>No Pending Pickups</p>
                <span>All pickup requests have been processed.</span>
            </div>
        );
    };

    return (
        <div className="pending-pickups-container">
            <header className="page-header">
                <h1>Pending Pickups</h1>
                <p>Confirm or cancel pickup requests from students and NGOs.</p>
            </header>

            <div className="claims-list">
                {renderContent()}
            </div>
            <style jsx>{`
                .pending-pickups-container { max-width: 800px; margin: 2rem auto; padding: 2rem; }
                .page-header { text-align: center; margin-bottom: 2rem; }
                .claims-list { display: grid; gap: 1rem; }
                .claim-card { background: #fff; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-left: 5px solid #FF9800; }
                .card-content p { margin: 0 0 0.5rem 0; }
                .card-content strong { color: #2E7D32; }
                .card-content small { color: #666; }
                .action-area { margin-top: 1rem; display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
                .action-area input { padding: 8px; border-radius: 6px; border: 1px solid #ccc; }
                .action-area button { padding: 8px 12px; border: none; border-radius: 6px; color: white; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
                .btn-confirm { background-color: #4CAF50; }
                .btn-cancel { background-color: #F44336; }
                .message { margin-top: 1rem; padding: 0.5rem; border-radius: 6px; }
                .message.error { color: #D32F2F; background-color: #FFCDD2; }
                .message.success { color: #388E3C; background-color: #C8E6C9; }
                .empty-state { text-align: center; padding: 2rem; background-color: #f8f9fa; border-radius: 12px; }
                .empty-state svg { font-size: 2.5rem; color: #ccc; margin-bottom: 1rem; }
                .empty-state p { font-size: 1.2rem; font-weight: 500; margin: 0; }
                .empty-state span { color: #6c757d; }
                .error-state { border: 1px solid #fecaca; background-color: #fef2f2; }
                .error-state svg { color: #ef4444; }
                .error-state p { color: #b91c1c; }
                .error-state span { color: #dc2626; }
            `}</style>
        </div>
    );
};

export default PendingPickupsPage;
