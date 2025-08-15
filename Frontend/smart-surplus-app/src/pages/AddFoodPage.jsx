import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFood } from '../context/FoodContext.jsx';
import FoodForm from '../components/food/FoodForm.jsx';

// --- UPDATED: Stricter, rule-based freshness logic based on food safety guidelines ---
const FRESHNESS_RULES = {
  // High-risk foods (Values are in hours)
  cooked_meal:      { 'Uncovered Room Temp': 2, 'Covered Room Temp': 4, 'Refrigerated': 24, 'Frozen': 72 },
  dairy_sweets:     { 'Uncovered Room Temp': 2, 'Covered Room Temp': 3, 'Refrigerated': 24, 'Frozen': 48 },
  // Medium-risk foods
  fried_snacks:     { 'Uncovered Room Temp': 4, 'Covered Room Temp': 6, 'Refrigerated': 48, 'Frozen': 168 },
  baked_goods:      { 'Uncovered Room Temp': 6, 'Covered Room Temp': 12, 'Refrigerated': 72, 'Frozen': 336 },
  // Low-risk foods
  cut_fruits:       { 'Uncovered Room Temp': 2, 'Covered Room Temp': 4, 'Refrigerated': 12, 'Frozen': 24 },
  beverages:        { 'Uncovered Room Temp': 4, 'Covered Room Temp': 8, 'Refrigerated': 48, 'Frozen': 168 },
};


const AddFoodPage = () => {
  const { addFood } = useFood();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleListFood = async (formData) => {
    setIsSubmitting(true);

    // --- FIX: Use the correct fields from the form (preparedDate, preparedTime) ---
    const { foodType, storageCondition, preparedDate, preparedTime } = formData;

    // 1. Look up the safe duration in hours from the new rules
    const freshnessHours = FRESHNESS_RULES[foodType]?.[storageCondition] || 2;

    // 2. Construct the preparation Date object from the user-provided date & time
    const preparationDate = new Date(`${preparedDate}T${preparedTime}`);
    if (isNaN(preparationDate.getTime())) {
      alert('Invalid preparation date or time. Please check your input.');
      setIsSubmitting(false);
      return;
    }

    // 3. Calculate the expiry time by adding the freshness duration
    const expiresAt = new Date(preparationDate.getTime() + freshnessHours * 60 * 60 * 1000);

    const newFoodItem = {
      ...formData,
      preparationTime: preparationDate.toISOString(), // Send the full preparation date
      expiresAt: expiresAt.toISOString(),
      imageUrl: `https://placehold.co/600x400/2C5E4A/FFFFFF?text=${formData.title.replace(/ /g, '+')}`,
      points: 10,
    };

    const success = await addFood(newFoodItem);
    if (success) {
      alert('Food listed successfully!');
      navigate('/browse');
    } else {
      alert('Failed to list food. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="add-food-page-container">
        <div className="page-header">
          <h1 className="page-title">List New Surplus Food</h1>
          <p className="page-subtitle">
            Fill in the details below. We'll predict the freshness for you based on food safety guidelines.
          </p>
        </div>
        <FoodForm onSubmit={handleListFood} isSubmitting={isSubmitting} />
      </div>
      <style jsx>{`
        .add-food-page-container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .page-header { text-align: center; margin-bottom: 40px; }
        .page-title { font-size: 2.8rem; font-weight: 700; color: #2C5E4A; margin: 0; }
        .page-subtitle { font-size: 1.1rem; color: #555; max-width: 600px; margin: 10px auto 0; }
      `}</style>
    </>
  );
};

export default AddFoodPage;
