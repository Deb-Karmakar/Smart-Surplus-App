import React from 'react';
import { useFood } from '../context/FoodContext.jsx';
import FoodCard from '../components/food/FoodCard.jsx';

const BrowseFoodPage = () => {
  const { foodListings, loading } = useFood(); // Use the context to get data

  return (
    <>
      <div className="browse-page-container">
        <div className="page-header">
          <h1 className="page-title">Available Surplus Food</h1>
          <p className="page-subtitle">Find and claim fresh meals from around campus. Act fast before they expire!</p>
        </div>

        <div className="filters-container">
          <div className="search-wrapper">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search for biryani, sandwiches, etc..." className="search-bar" />
          </div>
          <select className="sort-dropdown">
            <option value="expiry">Sort by: Expiry (Soonest)</option>
            <option value="recent">Sort by: Newest</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-indicator">Fetching fresh opportunities...</div>
        ) : (
          <div className="food-grid">
            {foodListings.map(item => (
              <FoodCard key={item.id} foodItem={item} />
            ))}
          </div>
        )}
      </div>


      <style jsx>{`
        .browse-page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          min-height: 100vh;
        }
        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .page-title {
          font-size: 2.8rem;
          font-weight: 700;
          color: #2C5E4A;
          margin: 0;
        }
        .page-subtitle {
          font-size: 1.1rem;
          color: #555;
          max-width: 600px;
          margin: 10px auto 0;
        }

        /* --- START: UPDATED STYLES FOR FILTERS --- */
        .filters-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          gap: 20px;
        }
        .search-wrapper {
          position: relative;
          flex: 1; /* Allow search to grow and shrink */
          min-width: 280px; /* Prevent it from getting too small */
        }
        .sort-dropdown {
          flex-shrink: 0; /* This is the key: prevents the dropdown from being squished */
          min-width: 240px; /* Ensure it has enough space */
        }
        /* --- END: UPDATED STYLES FOR FILTERS --- */

        .search-wrapper i {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #aaa;
        }
        .search-bar, .sort-dropdown {
          padding: 14px 20px;
          border-radius: 12px;
          border: 1px solid #ddd;
          font-size: 1rem;
          font-family: 'Poppins', sans-serif;
          width: 100%;
          box-sizing: border-box; /* Ensures padding doesn't break layout */
        }
        .search-bar {
          padding-left: 40px;
        }
        .loading-indicator {
          text-align: center;
          font-size: 1.5rem;
          color: #777;
          padding: 80px 0;
          font-weight: 500;
        }
        .food-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 30px;
        }
        @media (max-width: 768px) {
          .page-title {
            font-size: 2.2rem;
          }
        }
      `}</style>
    </>
  );
};

export default BrowseFoodPage;