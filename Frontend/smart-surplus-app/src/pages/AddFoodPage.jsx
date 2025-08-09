import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFood } from '../context/FoodContext.jsx';
import FoodForm from '../components/food/FoodForm.jsx';

const FRESHNESS_RULES = {
  cooked_meal: {
    'Room Temperature': 2,
    'Covered': 3,
    'Refrigerated': 5
  },
  baked_goods: {
    'Room Temperature': 6,
    'Covered': 8,
    'Refrigerated': 10
  },
  fried_snacks: {
    'Room Temperature': 2,
    'Covered': 3,
    'Refrigerated': 4
  },
  dairy_sweets: {
    'Room Temperature': 1,
    'Covered': 2,
    'Refrigerated': 3
  },
  cut_fruits: {
    'Room Temperature': 1,
    'Covered': 2,
    'Refrigerated': 2
  }
};


const AddFoodPage = () => {
  const { addFood } = useFood();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleListFood = (formData) => {
  setIsSubmitting(true);

  const { foodType, preparationPeriod, storageCondition } = formData;
  const freshnessMap = FRESHNESS_RULES[foodType] || {};
  const freshnessHours = freshnessMap[storageCondition] || 2; // default fallback

  const prepHour = parseInt(preparationPeriod, 10);
  const now = new Date();
  const cookedTime = new Date(now);
  cookedTime.setHours(prepHour, 0, 0, 0); // reset to meal period

  const expiresAt = new Date(cookedTime.getTime() + freshnessHours * 60 * 60 * 1000);

  const newFoodItem = {
    id: Date.now(),
    ...formData,
    expiresAt: expiresAt.toISOString(),
    imageUrl: `https://placehold.co/600x400/2C5E4A/FFFFFF?text=${formData.title.replace(' ', '+')}`,
  };

  setTimeout(() => {
    addFood(newFoodItem);
    setIsSubmitting(false);
    alert('Food listed successfully!');
    navigate('/browse');
  }, 1000);
};


  return (
    <>
      <div className="add-food-page-container">
        <div className="page-header">
          <h1 className="page-title">List New Surplus Food</h1>
        </div>
        <FoodForm onSubmit={handleListFood} isSubmitting={isSubmitting} />
      </div>
      {/* --- Keep the existing <style jsx> block --- */}
      <style jsx>{`
        .add-food-page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .page-header { text-align: center; margin-bottom: 40px; }
        .page-title { font-size: 2.8rem; font-weight: 700; color: #2C5E4A; margin: 0; }
        .page-subtitle { font-size: 1.1rem; color: #555; max-width: 600px; margin: 10px auto 0; }
      `}</style>
    </>
  );
};

export default AddFoodPage;