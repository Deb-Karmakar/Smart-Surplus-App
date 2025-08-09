import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const Navbar = () => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const navRef = useRef(null);
  const selectorRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // --- Dynamic Navigation Links ---
  const baseLinks = [
    { name: 'Home', path: '/', icon: 'fas fa-home' },
    { name: 'Surplus Food', path: '/browse', icon: 'fas fa-utensils' },
  ];
  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'fas fa-user-circle' },
    { name: 'Leaderboard', path: '/leaderboard', icon: 'fas fa-trophy' },
  ];
  const organizerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'fas fa-tachometer-alt' },
    { name: 'Add Food', path: '/add-food', icon: 'fas fa-plus-circle' },
    { name: 'Analytics', path: '/analytics', icon: 'far fa-chart-bar' },
    { name: 'Leaderboard', path: '/leaderboard', icon: 'fas fa-trophy' },
  ];
  
  let navLinks = baseLinks;
  if(user?.role === 'student') {
    navLinks = [...baseLinks, ...studentLinks];
  } else if (user?.role === 'canteen-organizer') {
    navLinks = [...baseLinks, ...organizerLinks];
  }

  useEffect(() => {
    const animateSelector = () => {
      const activeItem = navRef.current?.querySelector('li a.active');
      const selector = selectorRef.current;
      
      if (activeItem && selector) {
        selector.style.opacity = '1';
        selector.style.visibility = 'visible';
        selector.style.top = `${activeItem.offsetTop}px`;
        selector.style.left = `${activeItem.offsetLeft}px`;
        selector.style.height = `${activeItem.offsetHeight}px`;
        selector.style.width = `${activeItem.offsetWidth}px`;
      } else if (selector) {
        selector.style.opacity = '0';
        selector.style.visibility = 'hidden';
      }
    };

    const timer = setTimeout(animateSelector, 50);
    window.addEventListener('resize', animateSelector);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', animateSelector);
    };
  }, [location.pathname, isNavCollapsed, user]);

  return (
    <>
      <nav className="navbar navbar-expand-custom navbar-mainbg">
        <NavLink className="navbar-brand navbar-logo" to="/" aria-label="ZeroBite Home">
            <svg width="120" height="40" viewBox="0 0 145 50" xmlns="http://www.w3.org/2000/svg" fontFamily="'Poppins', sans-serif">
                <text x="0" y="35" fontSize="34" fontWeight="700">
                    <tspan fill="#F7F7F7">Zero</tspan>
                    <tspan fill="#FF7A59">Bite</tspan>
                </text>
            </svg>
        </NavLink>

        <button className="navbar-toggler" type="button" onClick={handleNavCollapse}>
          <i className="fas fa-bars text-white"></i>
        </button>

        <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarSupportedContent">
          <ul className="navbar-nav main-links" ref={navRef}>
            <div className="hori-selector" ref={selectorRef}></div>
            {navLinks.map((link) => (
              <li className="nav-item" key={link.path}>
                <NavLink className="nav-link" to={link.path} end={link.path === '/'} onClick={isNavCollapsed ? null : handleNavCollapse}>
                  <i className={link.icon}></i>{link.name}
                </NavLink>
              </li>
            ))}
          </ul>
          <ul className="navbar-nav auth-links">
             {user ? (
              <>
                <li className="nav-item"><span className="nav-link user-name">Hi, {user.name}</span></li>
                <li className="nav-item">
                  <button onClick={handleLogout} className="nav-link logout-button">
                    <i className="fas fa-sign-out-alt"></i>Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login"><i className="fas fa-sign-in-alt"></i>Login</NavLink>
                </li>
                 <li className="nav-item">
                  <NavLink className="nav-link" to="/register">Register</NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <style jsx>{`
        /* --- Base Styles & Font --- */
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .navbar-mainbg {
          font-family: 'Poppins', sans-serif;
          background-color: #2C5E4A;
          padding: 0px 15px;
          box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.1);
        }
        .navbar-logo { padding: 5px 0; }
        .navbar-toggler { border: none; outline: none !important; }

        /* --- Desktop Layout --- */
        #navbarSupportedContent {
          display: flex !important; /* Use important to override bootstrap */
          justify-content: space-between;
          width: 100%;
        }
        .navbar-nav {
          list-style-type: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        .main-links {
          position: relative; /* For the selector */
          flex-grow: 1;
        }
        .nav-item {
          float: left; /* Animation depends on this for offsetLeft */
        }
        .nav-link {
          color: rgba(247, 247, 247, 0.7);
          text-decoration: none;
          font-size: 16px;
          font-weight: 500;
          display: block;
          padding: 20px 25px;
          transition: all 0.4s ease;
          position: relative;
        }
        .nav-link:hover { color: #fff; }
        .nav-link.active { color: #2C5E4A; }

        /* --- Animated Selector --- */
        .hori-selector {
          display: inline-block;
          position: absolute;
          transition: 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.1s;
          background-color: #F7F7F7;
          border-radius: 12px;
          box-shadow: 0px 2px 10px rgba(0,0,0,0.05);
          opacity: 0;
          visibility: hidden;
        }
        
        /* --- Auth Links --- */
        .user-name { color: rgba(247, 247, 247, 0.8) !important; cursor: default; }
        .logout-button {
          background: none; border: none; cursor: pointer;
          font-family: 'Poppins', sans-serif;
          font-size: 16px; font-weight: 500;
        }

        /* --- Mobile Responsive Styles --- */
        @media (max-width: 991px) {
          .navbar-mainbg {
            align-items: center;
          }
          #navbarSupportedContent {
            flex-direction: column;
            align-items: flex-start;
          }
          .navbar-collapse {
            width: 100%;
          }
          .navbar-nav {
            width: 100%;
            flex-direction: column;
            align-items: flex-start;
          }
          .nav-item {
            width: 100%;
            float: none; /* Disable float on mobile */
          }
          .nav-link { padding: 15px 20px; }
          .hori-selector {
            width: 5px !important; 
            height: 40px !important;
            border-radius: 0 5px 5px 0;
            margin-top: 5px;
            box-shadow: none;
          }
          #navbarSupportedContent .nav-link.active {
            color: #FFFFFF;
            font-weight: 700;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
