import React, { useState } from 'react';

const FoodForm = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: '',
    source: '',
    quantity: '',
    foodType: 'cooked_meal',
    preparedDate: '',
    preparedTime: '',
    storageCondition: 'Covered Room Temp', // Default value matches the rules
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <>
      <form className="food-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Food Title</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Veg Pulao & Dal" required />
        </div>
        <div className="form-group">
          <label htmlFor="source">Source</label>
          <input type="text" id="source" name="source" value={formData.source} onChange={handleChange} placeholder="e.g., Main Campus Canteen" required />
        </div>
        <div className="form-group">
          <label htmlFor="quantity">Quantity (Number of items)</label>
          <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="e.g., 10" required min="1"/>
        </div>

        <div className="form-group">
          <label htmlFor="foodType">Type of Food</label>
          <select id="foodType" name="foodType" value={formData.foodType} onChange={handleChange}>
            <option value="cooked_meal">Cooked Meal (Rice, Curry)</option>
            <option value="dairy_sweets">Dairy / Sweets</option>
            <option value="fried_snacks">Fried Snacks</option>
            <option value="baked_goods">Baked Goods (Bread, Puffs)</option>
            <option value="cut_fruits">Salads & Cut Fruits</option>
            <option value="beverages">Beverages</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="preparedDate">Date Prepared</label>
            <input type="date" id="preparedDate" name="preparedDate" value={formData.preparedDate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="preparedTime">Time Prepared</label>
            <input type="time" id="preparedTime" name="preparedTime" value={formData.preparedTime} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="storageCondition">Storage Condition</label>
          <select id="storageCondition" name="storageCondition" value={formData.storageCondition} onChange={handleChange}>
            <option value="Covered Room Temp">Covered (Room Temp)</option>
            <option value="Uncovered Room Temp">Uncovered (Room Temp)</option>
            <option value="Refrigerated">Refrigerated</option>
            <option value="Frozen">Frozen</option>
          </select>
        </div>

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Listing...' : 'List Surplus Food'}
        </button>
      </form>

      <style jsx>{`
        .food-form { max-width: 600px; margin: 0 auto; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 8px; color: #333; }
        .form-group input, .form-group select {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
            font-family: 'Poppins', sans-serif;
            box-sizing: border-box;
        }
        .form-row { display: flex; flex-wrap: wrap; gap: 20px; }
        .form-row .form-group { flex: 1; min-width: 200px; }
        .submit-button {
            width: 100%;
            padding: 15px;
            background-color: #2C5E4A;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        .submit-button:hover { background-color: #1A3A2C; }
        .submit-button:disabled { background-color: #999; cursor: not-allowed; }
      `}</style>
    </>
  );
};

export default FoodForm;
