import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useTranslation } from 'react-i18next';
import { 
  FaHome, FaUtensils, FaUserCircle, FaHandsHelping, FaTrophy, FaPlusCircle, 
  FaTachometerAlt, FaTruck, FaShippingFast, FaClipboardCheck, FaBell, FaUser, 
  FaSignOutAlt, FaSignInAlt, FaUserPlus, FaGlobe
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState({});
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  
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

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangDropdownOpen(false);
    setIsNavCollapsed(true);
  };

  const baseLinks = [
    { name: t('navbar.home'), path: '/', icon: FaHome },
    { name: t('navbar.surplusFood'), path: '/browse', icon: FaUtensils },
  ];

  const studentLinks = [
    { name: t('navbar.dashboard'), path: '/dashboard', icon: FaUserCircle },
    { name: t('navbar.volunteer'), path: '/volunteer', icon: FaHandsHelping },
    { name: t('navbar.leaderboard'), path: '/leaderboard', icon: FaTrophy },
  ];

  const organizerLinks = [
    { name: t('navbar.addFood'), path: '/add-food', icon: FaPlusCircle },
    { name: t('navbar.dashboard'), path: '/dashboard', icon: FaTachometerAlt },
    { name: t('navbar.pendingPickups'), path: '/pending-pickups', icon: FaTruck },
    { name: t('navbar.reachOut'), path: '/reach-out', icon: FaHandsHelping },
    { name: t('navbar.summonVolunteer'), path: '/summon-volunteer', icon: FaShippingFast },
  ];

  const ngoLinks = [
    { name: t('navbar.dashboard'), path: '/dashboard', icon: FaTachometerAlt },
    { name: t('navbar.bookings'), path: '/bookings', icon: FaClipboardCheck },
  ];
  
  let navLinks = baseLinks;
  if(user?.role === 'student') {
    navLinks = [...baseLinks, ...studentLinks];
  } else if (user?.role === 'canteen-organizer') {
    navLinks = [...baseLinks, ...organizerLinks];
  } else if (user?.role === 'ngo') {
    navLinks = [...baseLinks, ...ngoLinks];
  }

  // This useEffect contains all the logic for the animated indicator
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

    updateActiveIndicator();
    const timer = setTimeout(updateActiveIndicator, 150);
    
    window.addEventListener('resize', updateActiveIndicator);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateActiveIndicator);
    };
    // CRITICAL CHANGE: Added i18n.language to ensure the effect re-runs on language change
  }, [location.pathname, isNavCollapsed, user, i18n.language]);

  return (
    <nav className="zerobite-navbar">
      <div className="navbar-container">
        <NavLink className="navbar-brand" to="/" aria-label="ZeroBite Home">
          <div className="logo-container">
            <span className="logo-text">
              <span className="logo-zero">Zero</span>
              <span className="logo-bite">Bite</span>
            </span>
          </div>
        </NavLink>

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

        <div className={`navbar-menu ${!isNavCollapsed ? 'active' : ''}`}>
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

          <div className="auth-section">
            <div className="language-selector">
              <button onClick={() => setLangDropdownOpen(!langDropdownOpen)} className="icon-button" aria-label="Change language">
                <FaGlobe />
              </button>
              {langDropdownOpen && (
                <div className="language-dropdown">
                  <button onClick={() => changeLanguage('en')}>English</button>
                  <button onClick={() => changeLanguage('hi')}>हिन्दी (Hindi)</button>
                </div>
              )}
            </div>
            
            {user ? (
              <div className="user-controls">
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
                <button onClick={handleLogout} className="logout-btn">
                  <FaSignOutAlt />
                  <span>{t('navbar.logout')}</span>
                </button>
              </div>
            ) : (
              <div className="auth-links">
                <NavLink className="auth-link login-link" to="/login">
                  <FaSignInAlt />
                  <span>{t('navbar.login')}</span>
                </NavLink>
                <NavLink className="auth-link register-link" to="/register">
                  <FaUserPlus />
                  <span>{t('navbar.register')}</span>
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