import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaLightbulb } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { IoBagCheck } from "react-icons/io5";

// --- Reusable FoodCard Component ---
const FoodCard = ({ foodItem }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const expiry = new Date(foodItem.expiresAt);
      const difference = expiry - now;

      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        return `${hours}h ${minutes}m left`;
      }
      return "Expired";
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000); // Update every minute

    return () => clearInterval(timer);
  }, [foodItem.expiresAt]);

  return (
    <div className="food-card">
      <img
        src={foodItem.imageUrl}
        alt={foodItem.title}
        className="food-card-image"
      />
      <div className="food-card-content">
        <div className="food-card-header">
          <h3 className="food-card-title">{foodItem.title}</h3>
          <span className="food-card-timer">
            <i className="far fa-clock"></i> {timeLeft}
          </span>
        </div>
        <p className="food-card-source">
          <i className="fas fa-store-alt"></i> {foodItem.source}
        </p>
        <p className="food-card-quantity">
          <i className="fas fa-box-open"></i> Quantity: {foodItem.quantity}
        </p>
        <button className="food-card-button">Claim Now</button>
      </div>
    </div>
  );
};

// --- Mock Data (Simulates API response) ---
const mockFoodListings = [
  {
    id: 1,
    title: "Veg Pulao & Dal",
    source: "Main Campus Canteen",
    quantity: "Serves 8-10",
    expiresAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
    imageUrl: "https://placehold.co/600x400/2C5E4A/FFFFFF?text=Veg+Pulao",
  },
  {
    id: 2,
    title: "Idli Sambar",
    source: "Hostel Mess Block-B",
    quantity: "Approx. 25 pieces",
    expiresAt: new Date(new Date().getTime() + 1 * 60 * 60 * 1000), // 1 hour from now
    imageUrl: "https://placehold.co/600x400/FF7A59/FFFFFF?text=Idli+Sambar",
  },
  {
    id: 3,
    title: "Leftover Sandwiches",
    source: "Event Hall Seminar",
    quantity: "15 Sandwiches",
    expiresAt: new Date(new Date().getTime() + 0.5 * 60 * 60 * 1000), // 30 mins from now
    imageUrl: "https://placehold.co/600x400/2C5E4A/FFFFFF?text=Sandwiches",
  },
  {
    id: 4,
    title: "Fresh Fruit Salad",
    source: "Juice Corner",
    quantity: "5 Large Bowls",
    expiresAt: new Date(new Date().getTime() + 3 * 60 * 60 * 1000), // 3 hours from now
    imageUrl: "https://placehold.co/600x400/FF7A59/FFFFFF?text=Fruit+Salad",
  },
];

// --- HomePage Component ---
const HomePage = () => {
  return (
    <>
      <div className="homepage-container">
        {/* --- Hero Section --- */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Don't Waste,{" "}
              <span className="highlight-text">Share a Plate.</span>
            </h1>
            <p className="hero-subtitle">
              Rescue surplus food from campus canteens and events. Help reduce
              waste and feed the community, one bite at a time.
            </p>
            <NavLink to="/add-food" className="hero-cta-button">
              List Surplus Food
            </NavLink>
          </div>
        </section>

        {/* --- How It Works Section --- */}
        <section className="how-it-works-section">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-icon">
                <FaLightbulb />
              </div>
              <h3>1. Discover</h3>
              <p>
                Browse available surplus food listings from across the campus in
                real-time.
              </p>
            </div>
            <div className="step">
              <div className="step-icon">
                <FaCheckCircle />
              </div>
              <h3>2. Claim</h3>
              <p>
                Found something you like? Click "Claim Now" to reserve your
                portion instantly.
              </p>
            </div>
            <div className="step">
              <div className="step-icon">
                <IoBagCheck />
              </div>
              <h3>3. Collect</h3>
              <p>
                Head to the pickup location within the specified time window and
                enjoy your meal.
              </p>
            </div>
          </div>
        </section>

        {/* --- Live Listings Section --- */}
        <section className="listings-section">
          <h2 className="section-title">Live Surplus Food</h2>
          <div className="food-grid">
            {mockFoodListings.map((item) => (
              <FoodCard key={item.id} foodItem={item} />
            ))}
          </div>
        </section>
      </div>

      <style jsx="true">{`
        .homepage-container {
          background-color: #f4f7f6;
          color: #333;
        }

        /* --- Hero Section --- */
        .hero-section {
          background: linear-gradient(
              rgba(44, 94, 74, 0.85),
              rgba(44, 94, 74, 0.85)
            ),
            url("https://images.unsplash.com/photo-1547573854-74d2a71d0826?q=80&w=2070");
          background-size: cover;
          background-position: center;
          padding: 80px 20px;
          text-align: center;
          color: #fff;
        }
        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }
        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .highlight-text {
          color: #ff7a59;
        }
        .hero-subtitle {
          font-size: 1.2rem;
          max-width: 600px;
          margin: 0 auto 2rem;
          line-height: 1.6;
          opacity: 0.9;
        }
        .hero-cta-button {
          background-color: #ff7a59;
          color: #fff;
          padding: 15px 35px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
        }
        .hero-cta-button:hover {
          background-color: #fff;
          color: #ff7a59;
          transform: translateY(-3px);
        }

        /* --- Section Titles & How It Works --- */
        .section-title {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 600;
          margin-bottom: 40px;
          color: #2c5e4a;
        }
        .how-it-works-section,
        .listings-section {
          padding: 60px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .steps-container {
          display: flex;
          justify-content: space-around;
          gap: 30px;
          flex-wrap: wrap;
        }
        .step {
          flex: 1;
          min-width: 250px;
          text-align: center;
        }
        .step-icon {
          background-color: #2c5e4a;
          color: #fff;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin: 0 auto 20px;
        }
        .step h3 {
          font-size: 1.5rem;
          margin-bottom: 10px;
          color: #333;
        }
        .step p {
          color: #555;
          line-height: 1.5;
        }

        /* --- Food Grid & Card --- */
        .food-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 30px;
        }
        .food-card {
          background-color: #fff;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .food-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        .food-card-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        .food-card-content {
          padding: 20px;
        }
        .food-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        .food-card-title {
          font-size: 1.4rem;
          font-weight: 600;
          margin: 0;
          color: #2c5e4a;
        }
        .food-card-timer {
          background-color: #ffeee8;
          color: #ff7a59;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          white-space: nowrap;
        }
        .food-card-source,
        .food-card-quantity {
          color: #666;
          margin-bottom: 15px;
          font-size: 0.95rem;
        }
        .food-card-source i,
        .food-card-quantity i {
          margin-right: 8px;
          color: #aaa;
        }
        .food-card-button {
          width: 100%;
          padding: 12px;
          background-color: #2c5e4a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .food-card-button:hover {
          background-color: #1a3a2c;
        }

        /* --- Responsive Adjustments --- */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          .hero-subtitle {
            font-size: 1rem;
          }
          .section-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </>
  );
};

export default HomePage;
