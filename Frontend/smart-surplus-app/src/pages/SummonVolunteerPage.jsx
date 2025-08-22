import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useFood } from '../context/FoodContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { FaUtensils, FaMapMarkerAlt, FaPaperPlane, FaSpinner, FaLeaf, FaHeart, FaUsers, FaTimes } from 'react-icons/fa';

const SummonVolunteerPage = () => {
    const { t } = useTranslation();
    const { foodListings } = useFood();
    const { user } = useAuth();
    const navigate = useNavigate();

    // State for the summon form
    const [formData, setFormData] = useState({
        foodItem: '', pickupLocation: 'Main Canteen', dropOffLocation: ''
    });
    const [status, setStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for the volunteer list and modal
    const [volunteers, setVolunteers] = useState([]);
    const [isLoadingVolunteers, setIsLoadingVolunteers] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchVolunteers = async () => {
            if (volunteers.length > 0) return;
            setIsLoadingVolunteers(true);
            try {
                const res = await api.get('/volunteers');
                setVolunteers(res.data);
            } catch (error) {
                console.error("Failed to fetch volunteers:", error);
            } finally {
                setIsLoadingVolunteers(false);
            }
        };

        if (user?.role === 'canteen-organizer') {
            fetchVolunteers();
        }
    }, [user, volunteers.length]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus(t('summonPage.status.finding'));
        try {
            const res = await api.post('/deliveries/request', formData);
            setStatus(res.data.msg);
            setTimeout(() => navigate('/dashboard'), 2500);
        } catch (err) {
            setStatus(err.response?.data?.msg || t('summonPage.status.fail'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-[#1A3C34] to-[#2E4F4F] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Animated Background Icons */}
                <div className="absolute inset-0 pointer-events-none">
                    <FaLeaf className="absolute text-[#A3BFFA] text-4xl animate-float opacity-20" style={{ left: '10%', top: '20%', animationDelay: '0s' }} />
                    <FaHeart className="absolute text-[#FF6F61] text-4xl animate-float opacity-20" style={{ right: '15%', top: '40%', animationDelay: '2s' }} />
                    <FaUtensils className="absolute text-[#F28C38] text-4xl animate-float opacity-20" style={{ left: '20%', bottom: '25%', animationDelay: '4s' }} />
                </div>

                {/* Main Form Card */}
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
                            <select name="foodItem" onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F28C38] focus:border-transparent transition-all duration-300 bg-white">
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
                            <input name="pickupLocation" onChange={handleChange} value={formData.pickupLocation} className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F28C38] focus:border-transparent transition-all duration-300 bg-white" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <FaMapMarkerAlt /> {t('summonPage.labels.dropOff')}
                            </label>
                            <input name="dropOffLocation" onChange={handleChange} placeholder={t('summonPage.placeholders.dropOff')} required className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F28C38] focus:border-transparent transition-all duration-300 bg-white" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#F28C38] text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-[#FF6F61] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? <><FaSpinner className="animate-spin" /> {t('summonPage.button.requesting')}</> : t('summonPage.button.request')}
                        </button>
                        {status && <p className="text-center text-sm font-medium text-gray-700">{status}</p>}
                    </form>

                    {user?.role === 'canteen-organizer' && (
                        <div className="mt-6 border-t pt-6">
                            <button
                                type="button" 
                                onClick={() => setIsModalOpen(true)}
                                className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-teal-700 transition-all duration-300"
                            >
                                <FaUsers /> {t('summonPage.viewVolunteersButton')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                            aria-label="Close modal"
                        >
                            <FaTimes size={24} />
                        </button>

                        <h3 className="text-2xl font-bold text-[#2C5E4A] mb-4 flex items-center gap-3">
                            <FaUsers /> {t('summonPage.volunteerList.title')}
                        </h3>
                        <div className="overflow-y-auto max-h-[70vh]">
                            {isLoadingVolunteers ? (
                                <div className="flex justify-center items-center py-10">
                                    <FaSpinner className="animate-spin text-3xl text-[#2C5E4A]" />
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('summonPage.volunteerList.name')}</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('summonPage.volunteerList.status')}</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('summonPage.volunteerList.contact')}</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('summonPage.volunteerList.department')}</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('summonPage.volunteerList.vehicle')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {volunteers.map((volunteer) => (
                                            <tr key={volunteer._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{volunteer.fullName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${volunteer.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{volunteer.status}</span></td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{volunteer.phone}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{volunteer.yearDept}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{volunteer.vehicleType}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            {(!isLoadingVolunteers && volunteers.length === 0) && (
                                <p className="text-center py-10 text-gray-500">{t('summonPage.volunteerList.none')}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

             <style jsx>{`
                @keyframes float {
                  0% { transform: translateY(0) rotate(0deg); }
                  50% { transform: translateY(-20px) rotate(180deg); }
                  100% { transform: translateY(0) rotate(360deg); }
                }
                .animate-float {
                  animation: float 6s ease-in-out infinite;
                }
              `}</style>
        </>
    );
};

export default SummonVolunteerPage;