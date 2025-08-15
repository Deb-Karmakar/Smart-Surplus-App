import React, { useState } from 'react';
import api from '../services/api';
import { useFood } from '../context/FoodContext.jsx';
import { useNavigate } from 'react-router-dom';
import { FaUtensils, FaMapMarkerAlt, FaPaperPlane, FaSpinner } from 'react-icons/fa';

const SummonVolunteerPage = () => {
    const { foodListings } = useFood();
    const [formData, setFormData] = useState({
        foodItem: '', pickupLocation: 'Main Canteen', dropOffLocation: ''
    });
    const [status, setStatus] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Finding a volunteer...');
        try {
            const res = await api.post('/deliveries/request', formData);
            setStatus(res.data.msg);
            setTimeout(() => navigate('/dashboard'), 2500);
        } catch (err) {
            setStatus(err.response?.data?.msg || 'Request failed. Please try again.');
        }
    };

    return (
        <div className="form-container">
            <div className="form-wrapper">
                <h2><FaPaperPlane /> Summon a Delivery Volunteer</h2>
                <p>Find an available volunteer to deliver surplus food to a nearby NGO.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><FaUtensils /> Select Food Item</label>
                        <select name="foodItem" onChange={handleChange} required>
                            <option value="">Select from available listings...</option>
                            {foodListings.filter(item => item.quantity > 0).map(item => (
                                <option key={item._id} value={item._id}>{item.title} (Qty: {item.quantity})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label><FaMapMarkerAlt /> Pickup Location</label>
                        <input name="pickupLocation" onChange={handleChange} value={formData.pickupLocation} />
                    </div>
                    <div className="form-group">
                        <label><FaMapMarkerAlt /> Drop-off Location / NGO Address</label>
                        <input name="dropOffLocation" onChange={handleChange} placeholder="e.g., Hope Foundation, Park Street" required />
                    </div>
                    <button type="submit" disabled={status === 'Finding a volunteer...'}>
                        {status === 'Finding a volunteer...' ? <FaSpinner className="spinner" /> : 'Request Delivery'}
                    </button>
                    {status && <p className="status-text">{status}</p>}
                </form>
            </div>
            <style jsx>{`
                .form-container { max-width: 600px; margin: 40px auto; padding: 20px; }
                .form-wrapper { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                .form-wrapper h2 { text-align: center; margin-bottom: 10px; color: #2C5E4A; display: flex; align-items: center; justify-content: center; gap: 10px; }
                .form-wrapper p { text-align: center; color: #555; margin-bottom: 30px; }
                .form-wrapper form { display: flex; flex-direction: column; gap: 20px; }
                .form-wrapper .form-group { display: flex; flex-direction: column; }
                .form-wrapper label { font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
                .form-wrapper input, .form-wrapper select { padding: 15px; border-radius: 10px; border: 1px solid #ddd; font-size: 1rem; }
                .form-wrapper button { padding: 15px; border-radius: 10px; font-weight: 600; cursor: pointer; background: #2C5E4A; color: white; border: none; font-size: 1.1rem; display: flex; justify-content: center; align-items: center; }
                .status-text { text-align: center; margin-top: 20px; font-weight: 500; }
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default SummonVolunteerPage;
