import React from "react";
import { NavLink } from "react-router-dom";
import { FaLightbulb, FaCheckCircle, FaUtensils, FaHeart, FaRecycle } from "react-icons/fa";
import { IoBagCheck } from "react-icons/io5";
import { MdRestaurant } from "react-icons/md";
import "./HomePage.css";

const HomePage = ({ userRole }) => {
  // Function to determine the main CTA button based on user role
  const getMainCTA = () => {
    switch (userRole) {
      case 'canteen-organizer':
        return (
          <NavLink to="/add-food" className="hero-cta-button primary">
            <MdRestaurant className="cta-icon" />
            List Surplus Food
          </NavLink>
        );
      case 'student':
        return (
          <NavLink to="/browse" className="hero-cta-button primary">
            <FaUtensils className="cta-icon" />
            Browse Available Food
          </NavLink>
        );
      case 'ngo':
        return (
          <NavLink to="/browse" className="hero-cta-button primary">
            <FaHeart className="cta-icon" />
            Find Food to Distribute
          </NavLink>
        );
      default:
        return (
          <div className="cta-buttons-group">
            <NavLink to="/browse" className="hero-cta-button primary">
              <FaUtensils className="cta-icon" />
              Browse Available Food
            </NavLink>
            <NavLink to="/add-food" className="hero-cta-button secondary">
              <MdRestaurant className="cta-icon" />
              List Surplus Food
            </NavLink>
          </div>
        );
    }
  };

  // Function to get role-specific subtitle
  const getSubtitle = () => {
    switch (userRole) {
      case 'canteen-organizer':
        return "Transform your surplus food into community impact. List your excess inventory and help reduce waste while feeding those in need.";
      case 'student':
        return "Discover fresh, affordable meals from campus canteens and events. Never let good food go to waste while satisfying your hunger.";
      case 'ngo':
        return "Connect with surplus food sources to support your community programs. Help bridge the gap between food waste and food security.";
      default:
        return "Join our mission to eliminate food waste on campus. Whether you're sharing surplus or finding your next meal, every action counts.";
    }
  };

  return (
    <div className="homepage-wrapper">
      <div className="homepage-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <FaRecycle className="badge-icon" />
            Zero Waste Campus Initiative
          </div>
          <h1 className="hero-title">
            Don't Waste,{" "}
            <span className="highlight-text">Share the Taste</span>
          </h1>
          <p className="hero-subtitle">
            {getSubtitle()}
          </p>
          {getMainCTA()}
          
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">2,500+</span>
              <span className="stat-label">Meals Saved</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Active Members</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">95%</span>
              <span className="stat-label">Waste Reduction</span>
            </div>
          </div>
        </div>
        
        <div className="hero-image">
          <div className="floating-card card-1">
            <FaUtensils className="card-icon" />
            <span>Fresh Meals</span>
          </div>
          <div className="floating-card card-2">
            <FaRecycle className="card-icon" />
            <span>Zero Waste</span>
          </div>
          <div className="floating-card card-3">
            <FaHeart className="card-icon" />
            <span>Community</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Three simple steps to make a difference in your community
          </p>
        </div>
        
        <div className="steps-container">
          <div className="step">
            <div className="step-number">01</div>
            <div className="step-icon">
              <FaLightbulb />
            </div>
            <h3 className="step-title">Discover</h3>
            <p className="step-description">
              Browse real-time listings of surplus food from campus canteens, 
              events, and dining halls with detailed information and pickup times.
            </p>
          </div>
          
          <div className="step-connector"></div>
          
          <div className="step">
            <div className="step-number">02</div>
            <div className="step-icon">
              <FaCheckCircle />
            </div>
            <h3 className="step-title">Claim</h3>
            <p className="step-description">
              Reserve your portion instantly with our smart booking system. 
              Get confirmation and pickup details delivered to your phone.
            </p>
          </div>
          
          <div className="step-connector"></div>
          
          <div className="step">
            <div className="step-number">03</div>
            <div className="step-icon">
              <IoBagCheck />
            </div>
            <h3 className="step-title">Collect</h3>
            <p className="step-description">
              Visit the pickup location within your time window and enjoy 
              fresh, quality food while contributing to sustainability.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose FoodShare?</h2>
          <p className="section-subtitle">
            Built for the modern campus community with sustainability in mind
          </p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaUtensils />
            </div>
            <h3 className="feature-title">Quality Assured</h3>
            <p className="feature-description">
              All listed food items are fresh and safe, with clear expiry times and quality standards maintained.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaRecycle />
            </div>
            <h3 className="feature-title">Environmental Impact</h3>
            <p className="feature-description">
              Reduce food waste by up to 95% and contribute to a more sustainable campus ecosystem.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaHeart />
            </div>
            <h3 className="feature-title">Community Building</h3>
            <p className="feature-description">
              Connect with fellow students, staff, and local organizations to build a stronger community network.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Make a Difference?</h2>
          <p className="cta-description">
            Join thousands of students and organizations already making an impact on campus
          </p>
          <div className="cta-buttons">
            <NavLink to="/browse" className="cta-btn primary-btn">
              <FaUtensils className="btn-icon" />
              Start Browsing
            </NavLink>
            {(userRole === 'canteen-organizer' || !userRole) && (
              <NavLink to="/add-food" className="cta-btn secondary-btn">
                <MdRestaurant className="btn-icon" />
                List Your Food
              </NavLink>
            )}
          </div>
        </div>
        <div className="cta-visual">
          <div className="visual-circle circle-1"></div>
          <div className="visual-circle circle-2"></div>
          <div className="visual-circle circle-3"></div>
        </div>
      </section>
    </div>
    </div>
  );
};

export default HomePage;