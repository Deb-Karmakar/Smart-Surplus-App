import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaHandsHelping, FaCheckCircle, FaArrowLeft, FaSpinner, FaShippingFast, FaUserPlus, FaTruck, FaGift, FaStar, FaHeart, FaAward } from 'react-icons/fa';

const UpdateStatusModal = ({ task, onClose, onUpdate }) => {
    const { t } = useTranslation();
    const [newStatus, setNewStatus] = useState(task.status);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            await api.put(`/deliveries/updateStatus/${task._id}`, { status: newStatus });
            onUpdate();
            onClose();
        } catch (err) {
            alert(t('volunteerPage.modal.error'));
        }
        setIsUpdating(false);
    };

    const statusOptions = ['Pending', 'On the Way', 'Picked Up', 'Delivered'];
    const currentStatusIndex = statusOptions.indexOf(task.status);
    
    const statusTranslationKeys = {
        'Pending': 'volunteerPage.modal.status.pending',
        'On the Way': 'volunteerPage.modal.status.onTheWay',
        'Picked Up': 'volunteerPage.modal.status.pickedUp',
        'Delivered': 'volunteerPage.modal.status.delivered',
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-3xl p-8 w-full max-w-md transform transition-all duration-500 scale-100 hover:scale-[1.02] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#F28C38] to-[#FF7A59] rounded-xl flex items-center justify-center">
                        <FaShippingFast className="text-white text-xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#2C5E4A]">{t('volunteerPage.modal.title')}</h3>
                </div>
                
                <div className="bg-gradient-to-r from-[#1A3C34]/10 to-[#2E4F4F]/10 p-6 rounded-2xl mb-6 border border-[#1A3C34]/10">
                    <h4 className="text-xl font-semibold text-gray-800 mb-3">{task.foodItem.title}</h4>
                    <div className="flex items-center gap-3 text-gray-600">
                        <span className="bg-green-100 px-3 py-1 rounded-full text-sm">{task.pickupLocation}</span>
                        <FaArrowLeft className="rotate-180 text-[#F28C38]" />
                        <span className="bg-blue-100 px-3 py-1 rounded-full text-sm">{task.dropOffLocation}</span>
                    </div>
                </div>

                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">{t('volunteerPage.modal.label')}</label>
                    <select 
                        value={newStatus} 
                        onChange={(e) => setNewStatus(e.target.value)} 
                        className="w-full p-4 border-2 border-[#1A3C34]/20 rounded-2xl focus:outline-none focus:border-[#F28C38] focus:ring-4 focus:ring-[#F28C38]/20 transition-all text-lg font-medium text-gray-800 bg-white"
                    >
                        {statusOptions.map((status, index) => (
                            <option key={status} value={status} disabled={index < currentStatusIndex} className="text-gray-800 bg-white">
                                {t(statusTranslationKeys[status])}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-4">
                    <button 
                        onClick={onClose} 
                        className="px-8 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
                    >
                        {t('volunteerPage.modal.cancel')}
                    </button>
                    <button 
                        onClick={handleUpdate} 
                        className="px-8 py-3 bg-gradient-to-r from-[#F28C38] to-[#FF7A59] text-white rounded-2xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100" 
                        disabled={isUpdating}
                    >
                        {isUpdating ? <><FaSpinner className="animate-spin" /> {t('volunteerPage.modal.updating')}</> : <><FaCheckCircle /> {t('volunteerPage.modal.update')}</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const VolunteerDashboard = ({ volunteer, tasks, onStatusChange, onTaskUpdate }) => {
    const { t } = useTranslation();
    const [selectedTask, setSelectedTask] = useState(null);
    
    // Map backend status values to translation keys for the status badge
    const statusBadgeTranslationKeys = {
        'Pending': 'volunteerPage.modal.status.pending',
        'On the Way': 'volunteerPage.modal.status.onTheWay',
        'Picked Up': 'volunteerPage.modal.status.pickedUp',
        'Delivered': 'volunteerPage.modal.status.delivered',
    };

    return (
        <>
            {selectedTask && <UpdateStatusModal task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={onTaskUpdate} />}
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto p-6">
                    <div className="bg-gradient-to-r from-[#1A3C34] via-[#2E4F4F] to-[#1A3C34] rounded-3xl p-4 sm:p-8 text-white mb-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
                            <div className="welcome flex-1">
                                <div className="flex items-center gap-3 sm:gap-4 mb-3">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-[#F28C38] to-[#FF7A59] rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                        <FaHandsHelping className="text-lg sm:text-2xl" />
                                    </div>
                                    <div className="min-w-0">
                                        <h1 className="text-xl sm:text-4xl font-bold leading-tight">{t('volunteerPage.dashboard.title')}</h1>
                                        <div className="flex items-center gap-2 mt-1">
                                            <FaHeart className="text-red-400 text-sm sm:text-base flex-shrink-0" />
                                            <p className="text-sm sm:text-xl text-white/90 truncate">{t('volunteerPage.dashboard.welcome', { name: volunteer.fullName })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="status-card bg-white/20 backdrop-blur-sm p-3 sm:p-6 rounded-2xl border border-white/20 shadow-xl w-full sm:w-auto">
                                <label className="block text-xs sm:text-sm text-white/80 mb-2 sm:mb-3 font-medium">{t('volunteerPage.dashboard.currentStatus')}</label>
                                <select 
                                    value={volunteer.status} 
                                    onChange={e => onStatusChange(e.target.value)} 
                                    className={`w-full p-2 sm:p-4 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-4 focus:ring-white/30 text-sm sm:text-lg transition-all ${
                                        volunteer.status.toLowerCase() === 'available' 
                                            ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                            : 'bg-gradient-to-r from-red-500 to-red-600'
                                    }`}
                                >
                                    <option value="Available">{t('volunteerPage.dashboard.status.available')}</option>
                                    <option value="Busy">{t('volunteerPage.dashboard.status.busy')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8">
                        <div className="stat bg-white rounded-2xl p-4 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
                            <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-2 sm:mb-4">
                                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-[#F28C38] to-[#FF7A59] rounded-xl flex items-center justify-center mb-2 sm:mb-0 flex-shrink-0">
                                    <FaShippingFast className="text-sm sm:text-xl text-white" />
                                </div>
                                <span className="text-2xl sm:text-4xl font-bold text-[#F28C38]">{tasks.length}</span>
                            </div>
                            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 mb-1 text-center sm:text-left">{t('volunteerPage.dashboard.stats.active')}</h3>
                        </div>
                        
                        <div className="stat bg-white rounded-2xl p-4 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
                            <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-2 sm:mb-4">
                                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-2 sm:mb-0 flex-shrink-0">
                                    <FaTruck className="text-sm sm:text-xl text-white" />
                                </div>
                                <span className="text-2xl sm:text-4xl font-bold text-blue-500">{tasks.filter(t => t.status === 'On the Way').length}</span>
                            </div>
                            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 mb-1 text-center sm:text-left">{t('volunteerPage.dashboard.stats.transit')}</h3>
                        </div>
                        
                        <div className="stat bg-white rounded-2xl p-4 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
                            <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-2 sm:mb-4">
                                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-2 sm:mb-0 flex-shrink-0">
                                    <FaCheckCircle className="text-sm sm:text-xl text-white" />
                                </div>
                                <span className="text-2xl sm:text-4xl font-bold text-green-500">{tasks.filter(t => t.status === 'Delivered').length}</span>
                            </div>
                            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 mb-1 text-center sm:text-left">{t('volunteerPage.dashboard.stats.delivered')}</h3>
                        </div>
                    </div>

                    <div className="tasks-section bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#1A3C34] to-[#2E4F4F] rounded-xl flex items-center justify-center">
                                <FaShippingFast className="text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-[#2C5E4A]">{t('volunteerPage.dashboard.tasksTitle', { count: tasks.length })}</h2>
                        </div>
                        
                        {tasks.length > 0 ? (
                            <div className="tasks-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {tasks.map((task, index) => (
                                    <div key={task._id} className="task-card bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
                                        <div className="task-header flex justify-between items-center mb-6">
                                            <div className="flex items-center gap-3">
                                                <span className="task-num bg-gradient-to-r from-[#F28C38] to-[#FF7A59] text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">#{index + 1}</span>
                                            </div>
                                            <span className={`status px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                                                task.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                task.status.toLowerCase() === 'on the way' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                task.status.toLowerCase() === 'picked up' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                                'bg-green-100 text-green-800 border border-green-200'
                                            }`}>
                                                {t(statusBadgeTranslationKeys[task.status] || task.status)}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">{task.foodItem.title}</h3>
                                        <div className="locations space-y-3 mb-6">
                                            <div className="location bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-600">📍</span>
                                                    <span className="font-medium text-gray-700">{t('volunteerPage.dashboard.pickup')}</span>
                                                </div>
                                                <p className="text-gray-800 ml-6">{task.pickupLocation}</p>
                                            </div>
                                            <div className="flex justify-center">
                                                <div className="w-8 h-8 bg-[#F28C38] rounded-full flex items-center justify-center">
                                                    <FaArrowLeft className="rotate-90 text-white text-sm" />
                                                </div>
                                            </div>
                                            <div className="location bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-blue-600">🎯</span>
                                                    <span className="font-medium text-gray-700">{t('volunteerPage.dashboard.dropOff')}</span>
                                                </div>
                                                <p className="text-gray-800 ml-6">{task.dropOffLocation}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedTask(task)} className="update-btn w-full bg-gradient-to-r from-[#F28C38] to-[#FF7A59] text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                                            <FaShippingFast />
                                            {t('volunteerPage.dashboard.updateStatus')}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty flex flex-col items-center justify-center p-16 bg-gradient-to-br from-[#1A3C34]/5 to-[#2E4F4F]/5 rounded-2xl border-2 border-dashed border-gray-200">
                                <div className="w-24 h-24 bg-gradient-to-r from-[#A3BFFA] to-[#667EEA] rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                                    <FaShippingFast className="text-3xl text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-700 mb-2">{t('volunteerPage.dashboard.empty.title')}</h3>
                                <p className="text-gray-500 text-center">{t('volunteerPage.dashboard.empty.subtitle')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

const InfoCard = ({ icon: Icon, title, description, gradient, iconBg, delay }) => (
    <div 
        className={`info-card bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-100 ${delay}`}
        style={{ animationDelay: delay }}
    >
        <div className={`w-10 h-10 sm:w-20 sm:h-20 ${iconBg} rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-6 shadow-lg transform transition-transform hover:rotate-6 mx-auto sm:mx-0 flex-shrink-0`}>
            <Icon className="text-sm sm:text-3xl text-white" />
        </div>
        <h3 className="text-xs sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-4 text-center sm:text-left leading-tight">{title}</h3>
        <p className="text-xs sm:text-base text-gray-600 leading-relaxed text-center sm:text-left hidden sm:block">{description}</p>
        <div className={`h-0.5 sm:h-1 ${gradient} rounded-full mt-2 sm:mt-6 transform scale-x-0 hover:scale-x-100 transition-transform duration-300`}></div>
    </div>
);

const VolunteerPage = () => {
    const { t } = useTranslation();
    const [volunteerProfile, setVolunteerProfile] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', phone: '', rollNumber: '', yearDept: '' });
    const navigate = useNavigate();

    const checkVolunteerStatus = useCallback(async () => {
        try {
            const profileRes = await api.get('/volunteers/me');
            setVolunteerProfile(profileRes.data);
            const tasksRes = await api.get('/volunteers/tasks');
            setTasks(tasksRes.data);
        } catch (err) {
            setVolunteerProfile(null);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        checkVolunteerStatus();
    }, [checkVolunteerStatus]);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/volunteers/register', formData);
            alert(t('volunteerPage.form.success'));
            checkVolunteerStatus();
        } catch (err) {
            alert(err.response?.data?.msg || t('volunteerPage.form.error'));
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const res = await api.put('/volunteers/status', { status: newStatus });
            setVolunteerProfile(res.data);
        } catch (err) {
            alert('Failed to update status. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="loading flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#1A3C34] to-[#2E4F4F]">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
                    <FaSpinner className="text-4xl text-[#F28C38] animate-spin" />
                </div>
                <h2 className="text-white text-2xl font-bold mb-2">{t('volunteerPage.loading.title')}</h2>
                <p className="text-white/80 text-lg">{t('volunteerPage.loading.subtitle')}</p>
            </div>
        );
    }

    if (volunteerProfile) {
        return <VolunteerDashboard volunteer={volunteerProfile} tasks={tasks} onStatusChange={handleStatusChange} onTaskUpdate={checkVolunteerStatus} />;
    }

    if (!showForm) {
        return (
            <div className="consent min-h-screen bg-gradient-to-br from-[#1A3C34] via-[#2E4F4F] to-[#1A3C34] flex items-center justify-center p-4">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform rotate-12"></div>
                </div>
                <div className="relative w-full max-w-6xl">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-4 mb-8">
                            <div className="w-20 h-20 bg-gradient-to-r from-[#F28C38] to-[#FF7A59] rounded-3xl flex items-center justify-center shadow-2xl transform hover:rotate-6 transition-transform">
                                <FaHandsHelping className="text-3xl text-white" />
                            </div>
                        </div>
                        <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
                            {t('volunteerPage.consent.title')}{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F28C38] to-[#FF7A59]">{t('volunteerPage.consent.highlight')}</span>
                        </h1>
                        <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                            {t('volunteerPage.consent.subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-16">
                        <InfoCard icon={FaUserPlus} title={t('volunteerPage.consent.cards.registerTitle')} description={t('volunteerPage.consent.cards.registerDesc')} gradient="bg-gradient-to-r from-blue-500 to-purple-600" iconBg="bg-gradient-to-r from-blue-500 to-purple-600" delay="animate-fade-in-up delay-100" />
                        <InfoCard icon={FaTruck} title={t('volunteerPage.consent.cards.deliveriesTitle')} description={t('volunteerPage.consent.cards.deliveriesDesc')} gradient="bg-gradient-to-r from-green-500 to-teal-600" iconBg="bg-gradient-to-r from-green-500 to-teal-600" delay="animate-fade-in-up delay-200" />
                        <InfoCard icon={FaGift} title={t('volunteerPage.consent.cards.rewardsTitle')} description={t('volunteerPage.consent.cards.rewardsDesc')} gradient="bg-gradient-to-r from-[#F28C38] to-[#FF7A59]" iconBg="bg-gradient-to-r from-[#F28C38] to-[#FF7A59]" delay="animate-fade-in-up delay-300" />
                    </div>

                    <div className="text-center">
                        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl max-w-md mx-auto">
                            <div className="flex items-center justify-center gap-2 mb-6">
                                <FaStar className="text-yellow-400 text-2xl" />
                                <FaHeart className="text-red-400 text-2xl" />
                                <FaAward className="text-green-400 text-2xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{t('volunteerPage.consent.cta.title')}</h3>
                            <p className="text-white/80 mb-8">{t('volunteerPage.consent.cta.subtitle')}</p>
                            <div className="actions flex justify-center gap-4">
                                <button onClick={() => navigate(-1)} className="btn-no flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20">
                                    <FaArrowLeft /> {t('volunteerPage.consent.cta.later')}
                                </button>
                                <button onClick={() => setShowForm(true)} className="btn-yes flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#F28C38] to-[#FF7A59] text-white rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold">
                                    <FaCheckCircle /> {t('volunteerPage.consent.cta.join')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="form-page min-h-screen bg-gradient-to-br from-[#1A3C34] via-[#2E4F4F] to-[#1A3C34] flex items-center justify-center p-4">
            <div className="form bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl border border-gray-100 transform transition-all duration-300 hover:scale-105">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#F28C38] to-[#FF7A59] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <FaHandsHelping className="text-2xl text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#2C5E4A] mb-2">{t('volunteerPage.form.title')}</h2>
                    <p className="text-gray-600">{t('volunteerPage.form.subtitle')}</p>
                </div>
                
                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('volunteerPage.form.labels.fullName')}</label>
                        <input onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder={t('volunteerPage.form.placeholders.fullName')} required className="w-full p-4 border-2 border-[#1A3C34]/20 rounded-2xl focus:outline-none focus:border-[#F28C38] focus:ring-4 focus:ring-[#F28C38]/20 transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('volunteerPage.form.labels.phone')}</label>
                        <input onChange={e => setFormData({...formData, phone: e.target.value})} placeholder={t('volunteerPage.form.placeholders.phone')} required className="w-full p-4 border-2 border-[#1A3C34]/20 rounded-2xl focus:outline-none focus:border-[#F28C38] focus:ring-4 focus:ring-[#F28C38]/20 transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('volunteerPage.form.labels.roll')}</label>
                        <input onChange={e => setFormData({...formData, rollNumber: e.target.value})} placeholder={t('volunteerPage.form.placeholders.roll')} required className="w-full p-4 border-2 border-[#1A3C34]/20 rounded-2xl focus:outline-none focus:border-[#F28C38] focus:ring-4 focus:ring-[#F28C38]/20 transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('volunteerPage.form.labels.yearDept')}</label>
                        <input onChange={e => setFormData({...formData, yearDept: e.target.value})} placeholder={t('volunteerPage.form.placeholders.yearDept')} required className="w-full p-4 border-2 border-[#1A3C34]/20 rounded-2xl focus:outline-none focus:border-[#F28C38] focus:ring-4 focus:ring-[#F28C38]/20 transition-all" />
                    </div>
                    <button type="submit" className="w-full py-4 bg-gradient-to-r from-[#F28C38] to-[#FF7A59] text-white rounded-2xl flex items-center justify-center gap-2 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold text-lg">
                        <FaCheckCircle /> {t('volunteerPage.form.submit')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VolunteerPage;