import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // Import
import api from '../services/api';
import { useFood } from '../context/FoodContext.jsx';
import { useNavigate } from 'react-router-dom';
import { FaUtensils, FaMapMarkerAlt, FaPaperPlane, FaSpinner, FaLeaf, FaHeart } from 'react-icons/fa';

const SummonVolunteerPage = () => {
    const { t } = useTranslation(); // Initialize
    const { foodListings } = useFood();
    const [formData, setFormData] = useState({
        foodItem: '', pickupLocation: 'Main Canteen', dropOffLocation: ''
    });
    const [status, setStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Use a boolean for loading state
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus(t('summonPage.status.finding'));
        try {
            const res = await api.post('/deliveries/request', formData);
            setStatus(res.data.msg); // API should return a success message
            setTimeout(() => navigate('/dashboard'), 2500);
        } catch (err) {
            setStatus(err.response?.data?.msg || t('summonPage.status.fail'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1A3C34] to-[#2E4F4F] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated Background Icons */}
            <div className="absolute inset-0 pointer-events-none">
                <FaLeaf className="absolute text-[#A3BFFA] text-4xl float-animation opacity-20" style={{ left: '10%', top: '20%', animationDelay: '0s' }} />
                <FaHeart className="absolute text-[#FF6F61] text-4xl float-animation opacity-20" style={{ right: '15%', top: '40%', animationDelay: '2s' }} />
                <FaUtensils className="absolute text-[#F28C38] text-4xl float-animation opacity-20" style={{ left: '20%', bottom: '25%', animationDelay: '4s' }} />
            </div>

            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl relative z-10">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-[#2C5E4A] mb-2 flex items-center justify-center gap-2">
                        <FaPaperPlane /> {t('summonPage.title')}
                    </h2>
                    <p className="text-lg text-gray-600">{t('summonPage.subtitle')}</p>
                    <div className="mt-4 flex justify-center">
                        <div className="w-16 h-1 bg-[#FF7A59] rounded-full"></div>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FaUtensils /> {t('summonPage.labels.foodItem')}
                        </label>
                        <select 
                            name="foodItem" 
                            onChange={handleChange} 
                            required 
                            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F28C38] focus:border-transparent transition-all duration-300 bg-white"
                        >
                            <option value="">{t('summonPage.placeholders.selectItem')}</option>
                            {foodListings.filter(item => item.quantity > 0).map(item => (
                                <option key={item._id} value={item._id}>{item.title} (Qty: {item.quantity})</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FaMapMarkerAlt /> {t('summonPage.labels.pickup')}
                        </label>
                        <input 
                            name="pickupLocation" 
                            onChange={handleChange} 
                            value={formData.pickupLocation} 
                            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F28C38] focus:border-transparent transition-all duration-300 bg-white"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FaMapMarkerAlt /> {t('summonPage.labels.dropOff')}
                        </label>
                        <input 
                            name="dropOffLocation" 
                            onChange={handleChange} 
                            placeholder={t('summonPage.placeholders.dropOff')} 
                            required 
                            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F28C38] focus:border-transparent transition-all duration-300 bg-white"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full py-3 bg-[#F28C38] text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-[#FF6F61] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <FaSpinner className="animate-spin" /> : t('summonPage.button.request')}
                    </button>
                    {status && <p className="text-center text-sm font-medium text-gray-700">{status}</p>}
                </form>
            </div>
        </div>
    );
};

export default SummonVolunteerPage;