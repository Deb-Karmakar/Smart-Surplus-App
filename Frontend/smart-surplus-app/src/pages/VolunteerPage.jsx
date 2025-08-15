import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaHandsHelping, FaCheckCircle, FaArrowLeft, FaSpinner, FaShippingFast } from 'react-icons/fa';

const UpdateStatusModal = ({ task, onClose, onUpdate }) => {
    const [newStatus, setNewStatus] = useState(task.status);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            await api.put(`/deliveries/updateStatus/${task._id}`, { status: newStatus });
            onUpdate();
            onClose();
        } catch (err) {
            alert('Failed to update status. Please try again.');
        }
        setIsUpdating(false);
    };

    const statusOptions = ['Pending', 'On the Way', 'Picked Up', 'Delivered'];
    const currentStatusIndex = statusOptions.indexOf(task.status);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Update Status</h3>
                <div className="task-info">
                    <strong>{task.foodItem.title}</strong>
                    <p>{task.pickupLocation} → {task.dropOffLocation}</p>
                </div>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="status-select">
                    {statusOptions.map((status, index) => (
                        <option key={status} value={status} disabled={index < currentStatusIndex}>{status}</option>
                    ))}
                </select>
                <div className="modal-actions">
                    <button onClick={onClose} className="btn-cancel">Cancel</button>
                    <button onClick={handleUpdate} className="btn-update" disabled={isUpdating}>
                        {isUpdating ? <><FaSpinner className="spin" /> Updating...</> : 'Update'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const VolunteerDashboard = ({ volunteer, tasks, onStatusChange, onTaskUpdate }) => {
    const [selectedTask, setSelectedTask] = useState(null);

    return (
        <>
            {selectedTask && <UpdateStatusModal task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={onTaskUpdate} />}
            <div className="dashboard">
                <div className="header">
                    <div className="welcome">
                        <h1><FaHandsHelping /> Dashboard</h1>
                        <p>Welcome, {volunteer.fullName}!</p>
                    </div>
                    <div className="status-card">
                        <label>Status:</label>
                        <select value={volunteer.status} onChange={e => onStatusChange(e.target.value)} className={`status-btn ${volunteer.status.toLowerCase()}`}>
                            <option value="Available">Available</option>
                            <option value="Busy">Busy</option>
                        </select>
                    </div>
                </div>

                <div className="stats">
                    <div className="stat"><span className="count">{tasks.length}</span><span>Active</span></div>
                    <div className="stat"><span className="count">{tasks.filter(t => t.status === 'On the Way').length}</span><span>In Transit</span></div>
                    <div className="stat"><span className="count">{tasks.filter(t => t.status === 'Delivered').length}</span><span>Delivered</span></div>
                </div>

                <div className="tasks-section">
                    <h2>Active Tasks ({tasks.length})</h2>
                    {tasks.length > 0 ? (
                        <div className="tasks-grid">
                            {tasks.map((task, index) => (
                                <div key={task._id} className="task-card">
                                    <div className="task-header">
                                        <span className="task-num">#{index + 1}</span>
                                        <span className={`status ${task.status.toLowerCase().replace(/ /g, '-')}`}>{task.status}</span>
                                    </div>
                                    <h3>{task.foodItem.title}</h3>
                                    <div className="locations">
                                        <div className="location">📍 {task.pickupLocation}</div>
                                        <div className="arrow">↓</div>
                                        <div className="location">🎯 {task.dropOffLocation}</div>
                                    </div>
                                    <button onClick={() => setSelectedTask(task)} className="update-btn">Update Status</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty">
                            <FaShippingFast className="empty-icon" />
                            <h3>No Active Tasks</h3>
                            <p>You'll be notified when new tasks are assigned!</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .dashboard { max-width: 1200px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
                .header { background: linear-gradient(135deg, #2C5E4A 0%, #4A7C59 100%);; border-radius: 20px; padding: 30px; color: white; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; }
                .welcome h1 { margin: 0 0 5px 0; font-size: 1.8rem; display: flex; align-items: center; gap: 10px; }
                .welcome p { margin: 0; opacity: 0.9; }
                .status-card { background: rgba(255,255,255,0.2); padding: 15px 20px; border-radius: 12px; backdrop-filter: blur(10px); }
                .status-card label { display: block; margin-bottom: 8px; font-size: 0.9rem; opacity: 0.9; }
                .status-btn { padding: 8px 15px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
                .status-btn.available { background: #4caf50; color: white; }
                .status-btn.busy { background: #f44336; color: white; }
                
                .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px; }
                .stat { background: white; padding: 20px; border-radius: 15px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                .stat .count { display: block; font-size: 2rem; font-weight: 700; color: #667eea; margin-bottom: 5px; }
                .stat span:last-child { color: #666; font-size: 0.9rem; }

                .tasks-section { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
                .tasks-section h2 { margin: 0 0 20px 0; color: #333; font-size: 1.4rem; }
                .tasks-grid { display: grid; gap: 20px; }
                
                .task-card { border: 2px solid #f0f0f0; border-radius: 15px; padding: 20px; transition: all 0.2s; position: relative; }
                .task-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); border-color: #667eea; }
                .task-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 2px 0 0 2px; }
                
                .task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                .task-num { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 8px 12px; border-radius: 50px; font-weight: 700; font-size: 0.9rem; }
                .task-card h3 { margin: 0 0 15px 0; color: #333; font-size: 1.2rem; }
                
                .locations { margin-bottom: 15px; }
                .location { background: #f8f9fa; padding: 10px 15px; border-radius: 8px; margin-bottom: 5px; font-size: 0.9rem; color: #555; }
                .arrow { text-align: center; color: #999; font-size: 1.2rem; margin: 5px 0; }
                
                .status { padding: 5px 12px; border-radius: 15px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
                .status.pending { background: #fff3e0; color: #ff9800; }
                .status.on-the-way { background: #e3f2fd; color: #2196f3; }
                .status.picked-up { background: #e8eaf6; color: #3f51b5; }
                .status.delivered { background: #e8f5e9; color: #4caf50; }
                
                .update-btn { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
                .update-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); }

                .empty { text-align: center; padding: 50px 20px; color: #999; }
                .empty-icon { font-size: 3rem; margin-bottom: 15px; color: #ddd; }
                .empty h3 { margin: 0 0 10px 0; color: #666; }
                .empty p { margin: 0; font-size: 0.9rem; }

                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-content { background: white; border-radius: 15px; padding: 25px; width: 90%; max-width: 400px; }
                .modal-content h3 { margin: 0 0 15px 0; color: #333; }
                .task-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
                .task-info strong { color: #333; display: block; margin-bottom: 5px; }
                .task-info p { margin: 0; color: #666; font-size: 0.9rem; }
                .status-select { width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; margin-bottom: 20px; }
                .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
                .btn-cancel, .btn-update { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
                .btn-cancel { background: #f5f5f5; border: 1px solid #ddd; color: #666; }
                .btn-update { background: linear-gradient(135deg, #667eea, #764ba2); border: none; color: white; }
                .spin { animation: spin 1s linear infinite; }
                
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @media (max-width: 768px) { 
                    .dashboard { padding: 15px; }
                    .header { flex-direction: column; text-align: center; }
                    .stats { grid-template-columns: repeat(3, 1fr); }
                    .tasks-section { padding: 20px; }
                }
            `}</style>
        </>
    );
};

const VolunteerPage = () => {
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
            alert('Registration successful!');
            checkVolunteerStatus();
        } catch (err) {
            alert(err.response?.data?.msg || 'Registration failed.');
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const res = await api.put('/volunteers/status', { status: newStatus });
            setVolunteerProfile(res.data);
        } catch (err) {
            alert('Failed to update status.');
        }
    };

    if (isLoading) {
        return (
            <div className="loading">
                <FaSpinner className="spinner" />
                <p>Loading dashboard...</p>
                <style jsx>{`
                    .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; color: #667eea; }
                    .spinner { font-size: 2rem; animation: spin 1s linear infinite; margin-bottom: 15px; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    if (volunteerProfile) {
        return <VolunteerDashboard volunteer={volunteerProfile} tasks={tasks} onStatusChange={handleStatusChange} onTaskUpdate={checkVolunteerStatus} />;
    }

    if (!showForm) {
        return (
            <div className="consent">
                <div className="popup">
                    <FaHandsHelping className="icon" />
                    <h2>Become a Volunteer!</h2>
                    <p>Help redistribute surplus food to those in need.</p>
                    <div className="actions">
                        <button onClick={() => navigate(-1)} className="btn-no"><FaArrowLeft /> Not Now</button>
                        <button onClick={() => setShowForm(true)} className="btn-yes"><FaCheckCircle /> Join Us!</button>
                    </div>
                </div>
                <style jsx>{`
                    .consent { display: flex; align-items: center; justify-content: center; min-height: 80vh; background: linear-gradient(135deg, #667eea, #764ba2); }
                    .popup { background: white; padding: 40px; border-radius: 20px; text-align: center; max-width: 400px; margin: 20px; }
                    .icon { font-size: 4rem; color: #667eea; margin-bottom: 20px; }
                    .popup h2 { margin: 0 0 15px 0; color: #333; font-size: 1.8rem; }
                    .popup p { margin: 0 0 30px 0; color: #666; }
                    .actions { display: flex; gap: 15px; justify-content: center; }
                    .btn-no, .btn-yes { padding: 12px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
                    .btn-no { background: #f5f5f5; border: 1px solid #ddd; color: #666; }
                    .btn-yes { background: linear-gradient(135deg, #667eea, #764ba2); border: none; color: white; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="form-page">
            <div className="form">
                <FaHandsHelping className="form-icon" />
                <h2>Registration</h2>
                <form onSubmit={handleRegister}>
                    <input onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Full Name" required />
                    <input onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Phone Number" required />
                    <input onChange={e => setFormData({...formData, rollNumber: e.target.value})} placeholder="Roll Number" required />
                    <input onChange={e => setFormData({...formData, yearDept: e.target.value})} placeholder="Year & Department" required />
                    <button type="submit"><FaCheckCircle /> Register</button>
                </form>
            </div>
            <style jsx>{`
                .form-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; }
                .form { background: white; padding: 40px; border-radius: 20px; max-width: 400px; width: 100%; text-align: center; }
                .form-icon { font-size: 3rem; color: #667eea; margin-bottom: 20px; }
                .form h2 { margin: 0 0 30px 0; color: #333; }
                .form input { width: 100%; padding: 15px; margin-bottom: 15px; border: 2px solid #e0e0e0; border-radius: 10px; box-sizing: border-box; }
                .form input:focus { outline: none; border-color: #667eea; }
                .form button { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 15px 30px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin: 20px auto 0; }
            `}</style>
        </div>
    );
};

export default VolunteerPage;