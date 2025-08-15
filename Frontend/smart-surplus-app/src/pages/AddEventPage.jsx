import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFood } from '../context/FoodContext.jsx';

const AddEventPage = () => {
  const { addEvent } = useFood(); // We will create this function next
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await addEvent(formData);
    if (success) {
      alert('Event added successfully!');
      navigate('/dashboard');
    } else {
      alert('Failed to add event. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="add-event-container">
        <div className="page-header">
          <h1 className="page-title">Add New Campus Event</h1>
          <p className="page-subtitle">This event will be visible to all users on their dashboards.</p>
        </div>
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Annual Tech Fest"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Event Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Adding Event...' : 'Add Event'}
          </button>
        </form>
      </div>
      <style jsx>{`
        .add-event-container { max-width: 700px; margin: 40px auto; padding: 0 20px; }
        .page-header { text-align: center; margin-bottom: 40px; }
        .page-title { font-size: 2.8rem; font-weight: 700; color: #2C5E4A; margin: 0; }
        .page-subtitle { font-size: 1.1rem; color: #555; }
        .event-form { background: #fff; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 8px; }
        .form-group input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
        .submit-button { width: 100%; padding: 15px; background-color: #2C5E4A; color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: 600; cursor: pointer; }
      `}</style>
    </>
  );
};

export default AddEventPage;
