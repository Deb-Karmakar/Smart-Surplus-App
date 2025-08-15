import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';

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

  // Dynamic Navigation Links
  const baseLinks = [
    { name: 'Home', path: '/', icon: 'fas fa-home' },
    { name: 'Surplus Food', path: '/browse', icon: 'fas fa-utensils' },
  ];
  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'fas fa-user-circle' },
    { name: 'Notifications', path: '/notifications', icon: 'fas fa-bell', badge: unreadCount },
    { name: 'Volunteer', path: '/volunteer', icon: 'fas fa-hands-helping' },
    { name: 'Profile', path: '/profile', icon: 'fas fa-user-alt' },
    { name: 'Leaderboard', path: '/leaderboard', icon: 'fas fa-trophy' },
  ];
  const organizerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'fas fa-tachometer-alt' },
    { name: 'Add Food', path: '/add-food', icon: 'fas fa-plus-circle' },
    { name: 'Analytics', path: '/analytics', icon: 'far fa-chart-bar' },
    { name: 'Reach Out', path: '/reach-out', icon: 'fas fa-hands-helping' },
    { name: 'Notifications', path: '/notifications', icon: 'fas fa-bell', badge: unreadCount },
    { name: 'Summon Volunteer', path: '/summon-volunteer', icon: 'fas fa-shipping-fast' },
    { name: 'Profile', path: '/profile', icon: 'fas fa-user-alt' },
  ];
  // --- FIX: Corrected links for the NGO role ---
  const ngoLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'fas fa-tachometer-alt' },
    { name: 'Notifications', path: '/notifications', icon: 'fas fa-bell', badge: unreadCount },
    { name: 'Bookings', path: '/bookings', icon: 'fas fa-clipboard-check' },
    { name: 'Profile', path: '/profile', icon: 'fas fa-user-alt' },
  ];
  
  let navLinks = baseLinks;
  if(user?.role === 'student') {
    navLinks = [...baseLinks, ...studentLinks];
  } else if (user?.role === 'canteen-organizer') {
    navLinks = [...baseLinks, ...organizerLinks];
  } else if (user?.role === 'ngo') { // <-- Add condition for NGO
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
          opacity: 1
        });
      } else {
        setActiveIndicatorStyle({ opacity: 0 });
      }
    };

    const timer = setTimeout(updateActiveIndicator, 100);
    window.addEventListener('resize', updateActiveIndicator);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateActiveIndicator);
    };
  }, [location.pathname, isNavCollapsed, user, unreadCount]);

  return (
    <>
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
              {navLinks.map((link) => (
                <NavLink 
                  key={link.path}
                  className="nav-link"
                  to={link.path} 
                  end={link.path === '/'}
                  onClick={() => setIsNavCollapsed(true)}
                >
                  <i className={`${link.icon} nav-icon`}></i>
                  <span className="nav-text">{link.name}</span>
                  {link.badge > 0 && <span className="notification-badge">{link.badge}</span>}
                </NavLink>
              ))}
            </div>
            <div className="auth-links">
              {user ? (
                <>
                  <div className="user-info">
                    <div className="user-avatar">
                      <i className="fas fa-user"></i>
                    </div>
                    <span className="user-name">Hi, {user.name}</span>
                  </div>
                  <button onClick={handleLogout} className="logout-btn">
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <NavLink className="auth-link login-link" to="/login">
                    <i className="fas fa-sign-in-alt"></i>
                    <span>Login</span>
                  </NavLink>
                  <NavLink className="auth-link register-link" to="/register">
                    <i className="fas fa-user-plus"></i>
                    <span>Register</span>
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        /* ... (all your existing navbar styles) ... */

        /* --- NEW: Style for the notification badge --- */
        .notification-badge {
          background-color: #EF5350; /* Red color for attention */
          color: white;
          border-radius: 50%;
          padding: 2px 7px;
          font-size: 10px;
          font-weight: 700;
          margin-left: 8px;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        /* ... (rest of your existing styles) ... */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .zerobite-navbar {
          background: linear-gradient(135deg, #1e3a2e 0%, #2d5a44 100%);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
          font-family: 'Inter', sans-serif;
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          height: 70px;
        }

        /* Logo Styles */
        .navbar-brand {
          text-decoration: none;
          display: flex;
          align-items: center;
          z-index: 1001;
        }
        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-text {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .logo-zero { color: #ffffff; }
        .logo-bite { color: #4ADE80; }

        /* Mobile Toggle */
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          z-index: 1001;
        }
        .hamburger {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 24px;
          height: 18px;
          position: relative;
        }
        .hamburger span {
          background: #ffffff;
          height: 2px;
          width: 100%;
          border-radius: 1px;
          transition: all 0.3s ease;
          position: absolute;
          left: 0;
        }
        .hamburger span:nth-child(1) { top: 0; }
        .hamburger span:nth-child(2) { top: 50%; transform: translateY(-50%); }
        .hamburger span:nth-child(3) { bottom: 0; }
        .hamburger.active span:nth-child(1) { top: 50%; transform: translateY(-50%) rotate(45deg); }
        .hamburger.active span:nth-child(2) { opacity: 0; }
        .hamburger.active span:nth-child(3) { bottom: 50%; transform: translateY(50%) rotate(-45deg); }

        /* Navigation Menu */
        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .main-nav-links {
          display: flex;
          align-items: center;
          position: relative;
          gap: 0.5rem;
        }
        .active-indicator {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          visibility: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          border-radius: 20px;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.3s ease;
          position: relative;
          z-index: 2;
        }
        .nav-link:hover {
          color: #ffffff;
          transform: translateY(-1px);
        }
        .nav-link.active {
          color: #ffffff;
          font-weight: 600;
        }
        .nav-icon { font-size: 16px; }

        /* Auth Links */
        .auth-links {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          font-size: 14px;
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-1px);
        }
        .auth-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          border-radius: 16px;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .auth-link:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }
        .register-link {
          background: rgba(74, 222, 128, 0.1);
          border-color: rgba(74, 222, 128, 0.3);
          color: #4ADE80;
        }
        .register-link:hover {
          background: rgba(74, 222, 128, 0.2);
          color: #4ADE80;
        }

        /* Mobile Styles */
        @media (max-width: 991px) {
          .mobile-toggle { display: block; }
          .navbar-menu {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #1e3a2e 0%, #2d5a44 100%);
            flex-direction: column;
            gap: 0;
            padding: 2rem 1.5rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            transform: translateY(-110%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .navbar-menu.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }
          .main-nav-links {
            flex-direction: column;
            width: 100%;
            gap: 0.5rem;
            margin-bottom: 2rem;
          }
          .active-indicator { display: none; }
          .nav-link {
            width: 100%;
            justify-content: flex-start;
            padding: 16px 20px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.05);
            margin-bottom: 8px;
          }
          .nav-link.active {
            background: rgba(74, 222, 128, 0.1);
            border: 1px solid rgba(74, 222, 128, 0.3);
          }
          .nav-icon { font-size: 18px; width: 24px; }
          .nav-text { font-size: 16px; }
          .auth-links {
            flex-direction: column;
            width: 100%;
            gap: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
          .user-info {
            justify-content: center;
            padding: 16px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            width: 100%;
          }
          .logout-btn, .auth-link {
            justify-content: center;
            padding: 16px;
            font-size: 16px;
            width: 100%;
          }
        }
        @media (max-width: 480px) {
          .navbar-container { padding: 0 1rem; }
          .logo-text { font-size: 20px; }
          .navbar-menu { padding: 1.5rem 1rem; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
