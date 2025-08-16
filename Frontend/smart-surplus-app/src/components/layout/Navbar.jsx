import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { 
  FaHome, 
  FaUtensils, 
  FaUserCircle, 
  FaHandsHelping, 
  FaTrophy, 
  FaPlusCircle, 
  FaTachometerAlt, 
  FaTruck, 
  FaShippingFast, 
  FaClipboardCheck, 
  FaBell, 
  FaUser, 
  FaSignOutAlt, 
  FaSignInAlt, 
  FaUserPlus 
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navRef = useRef(null);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsNavCollapsed(true);
  };

  // Dynamic Navigation Links
  const baseLinks = [
    { name: 'Home', path: '/', icon: FaHome },
    { name: 'Surplus Food', path: '/browse', icon: FaUtensils },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: FaUserCircle },
    { name: 'Volunteer', path: '/volunteer', icon: FaHandsHelping },
    { name: 'Leaderboard', path: '/leaderboard', icon: FaTrophy },
  ];

  const organizerLinks = [
    { name: 'Add Food', path: '/add-food', icon: FaPlusCircle },
    { name: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt },
    { name: 'Pending Pickups', path: '/pending-pickups', icon: FaTruck },
    { name: 'Reach Out', path: '/reach-out', icon: FaHandsHelping },
    { name: 'Summon Volunteer', path: '/summon-volunteer', icon: FaShippingFast },
  ];

  const ngoLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt },
    { name: 'Bookings', path: '/bookings', icon: FaClipboardCheck },
  ];
  
  let navLinks = baseLinks;
  if(user?.role === 'student') {
    navLinks = [...baseLinks, ...studentLinks];
  } else if (user?.role === 'canteen-organizer') {
    navLinks = [...baseLinks, ...organizerLinks];
  } else if (user?.role === 'ngo') {
    navLinks = [...baseLinks, ...ngoLinks];
  }

  // Update active indicator position
  useEffect(() => {
    const updateActiveIndicator = () => {
      const activeLink = navRef.current?.querySelector('.nav-link.active');
      
      if (activeLink && navRef.current && window.innerWidth > 991) {
        const navRect = navRef.current.getBoundingClientRect();
        const rect = activeLink.getBoundingClientRect();
        
        setActiveIndicatorStyle({
          left: rect.left - navRect.left,
          width: rect.width,
          opacity: 1,
          visibility: 'visible'
        });
      } else {
        setActiveIndicatorStyle({ 
          opacity: 0,
          visibility: 'hidden'
        });
      }
    };

    // Initial update
    updateActiveIndicator();

    // Delay for route transition
    const timer = setTimeout(updateActiveIndicator, 150);
    
    // Handle window resize
    window.addEventListener('resize', updateActiveIndicator);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateActiveIndicator);
    };
  }, [location.pathname, isNavCollapsed, user]);

  return (
    <nav className="zerobite-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <NavLink className="navbar-brand" to="/" aria-label="ZeroBite Home">
          <div className="logo-container">
            <span className="logo-text">
              <span className="logo-zero">Zero</span>
              <span className="logo-bite">Bite</span>
            </span>
          </div>
        </NavLink>

        {/* Mobile Toggle */}
        <button 
          className="mobile-toggle"
          onClick={handleNavCollapse}
          aria-label="Toggle navigation"
        >
          <span className={`hamburger ${!isNavCollapsed ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Navigation Menu */}
        <div className={`navbar-menu ${!isNavCollapsed ? 'active' : ''}`}>
          {/* Main Navigation Links */}
          <div className="main-nav-links" ref={navRef}>
            <div 
              className="active-indicator" 
              style={activeIndicatorStyle}
            ></div>
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <NavLink 
                  key={link.path}
                  className="nav-link"
                  to={link.path} 
                  end={link.path === '/'}
                  onClick={() => setIsNavCollapsed(true)}
                >
                  <IconComponent className="nav-icon" />
                  <span className="nav-text">{link.name}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Auth Section */}
          <div className="auth-section">
            {user ? (
              <div className="user-controls">
                {/* Notifications Bell */}
                <NavLink 
                  to="/notifications" 
                  className="notification-btn"
                  onClick={() => setIsNavCollapsed(true)}
                  aria-label="Notifications"
                >
                  <FaBell />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </NavLink>

                {/* User Profile */}
                <div className="user-profile">
                  <button 
                    onClick={handleProfileClick}
                    className="profile-btn"
                    aria-label="Go to Profile"
                  >
                    <div className="user-avatar">
                      <FaUser />
                    </div>
                    <span className="user-name">{user.name}</span>
                  </button>
                </div>

                {/* Logout Button */}
                <button onClick={handleLogout} className="logout-btn">
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="auth-links">
                <NavLink className="auth-link login-link" to="/login">
                  <FaSignInAlt />
                  <span>Login</span>
                </NavLink>
                <NavLink className="auth-link register-link" to="/register">
                  <FaUserPlus />
                  <span>Register</span>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;