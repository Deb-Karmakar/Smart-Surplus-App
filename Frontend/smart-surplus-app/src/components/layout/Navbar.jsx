import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useTranslation } from 'react-i18next';
import {
  FaHome, FaUtensils, FaUserCircle, FaHandsHelping, FaTrophy, FaPlusCircle,
  FaTachometerAlt, FaTruck, FaShippingFast, FaClipboardCheck, FaBell, FaUser,
  FaSignOutAlt, FaSignInAlt, FaUserPlus, FaGlobe, FaChevronDown
} from 'react-icons/fa';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState({});
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
 
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navRef = useRef(null);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserDropdownOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsNavCollapsed(true);
    setUserDropdownOpen(false);
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

  // Active indicator logic for desktop
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
  }, [location.pathname, isNavCollapsed, user, i18n.language]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.language-selector')) {
        setLangDropdownOpen(false);
      }
      if (!event.target.closest('.user-dropdown-container')) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink 
            to="/" 
            className="flex items-center space-x-3 z-50"
            aria-label="ZeroBite Home"
          >
            <div className="flex items-center">
              
              <span className="ml-3 text-2xl font-bold tracking-tight">
                <span className="text-white">Zero</span>
                <span className="text-emerald-400">Bite</span>
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="relative flex items-center space-x-1" ref={navRef}>
              {/* Active indicator */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-10 bg-white/10 rounded-full border border-white/20 backdrop-blur-md transition-all duration-500 ease-out"
                style={activeIndicatorStyle}
              />
              
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.path === '/'}
                    className={({ isActive }) => 
                      `nav-link relative z-10 flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:text-white hover:-translate-y-0.5 ${
                        isActive 
                          ? 'text-white font-semibold' 
                          : 'text-white/70'
                      }`
                    }
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{link.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Right side actions - Hidden on mobile except hamburger */}
          <div className="flex items-center space-x-4">
            {/* Desktop-only: Language Selector */}
            <div className="language-selector relative hidden lg:block">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/80 hover:text-white transition-all duration-300 hover:scale-105"
                aria-label="Change language"
              >
                <FaGlobe className="w-4 h-4" />
              </button>
              
              {langDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2">
                  <button
                    onClick={() => changeLanguage('en')}
                    className="w-full px-4 py-2.5 text-left text-white/90 hover:bg-white/5 hover:text-white transition-colors duration-200 text-sm font-medium"
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage('hi')}
                    className="w-full px-4 py-2.5 text-left text-white/90 hover:bg-white/5 hover:text-white transition-colors duration-200 text-sm font-medium"
                  >
                    हिन्दी (Hindi)
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <>
                {/* Desktop-only: Notifications */}
                <NavLink
                  to="/notifications"
                  className={({ isActive }) =>
                    `relative hidden lg:flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 hover:scale-105 ${
                      isActive 
                        ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400' 
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
                    }`
                  }
                  aria-label="Notifications"
                >
                  <FaBell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-slate-900">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>

                {/* Desktop-only: User Menu */}
                <div className="user-dropdown-container relative hidden lg:block">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-3 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300 hover:scale-105 group"
                  >
                    <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-400/30 rounded-full flex items-center justify-center">
                      <FaUser className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="hidden md:block text-white/90 font-medium text-sm max-w-32 truncate">
                      {user.name}
                    </span>
                    <FaChevronDown className={`w-3 h-3 text-white/60 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2">
                      <button
                        onClick={handleProfileClick}
                        className="w-full px-4 py-2.5 text-left text-white/90 hover:bg-white/5 hover:text-white transition-colors duration-200 flex items-center space-x-2 text-sm font-medium"
                      >
                        <FaUserCircle className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      <div className="h-px bg-white/10 my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200 flex items-center space-x-2 text-sm font-medium"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        <span>{t('navbar.logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden lg:flex items-center space-x-3">
                <NavLink
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2.5 text-white/80 hover:text-white border border-white/20 rounded-full transition-all duration-300 hover:bg-white/5 hover:scale-105 text-sm font-medium"
                >
                  <FaSignInAlt className="w-4 h-4" />
                  <span>{t('navbar.login')}</span>
                </NavLink>
                <NavLink
                  to="/register"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/25 text-sm font-medium"
                >
                  <FaUserPlus className="w-4 h-4" />
                  <span>{t('navbar.register')}</span>
                </NavLink>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={handleNavCollapse}
              className="lg:hidden flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300 z-50"
              aria-label="Toggle navigation"
            >
              <div className="w-5 h-5 flex flex-col justify-center items-center">
                <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${!isNavCollapsed ? 'rotate-45 translate-y-0.5' : 'mb-1'}`} />
                <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${!isNavCollapsed ? 'opacity-0' : ''}`} />
                <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${!isNavCollapsed ? '-rotate-45 -translate-y-0.5' : 'mt-1'}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`lg:hidden transition-all duration-500 ease-out ${isNavCollapsed ? 'max-h-0 opacity-0' : 'max-h-screen opacity-100'} overflow-hidden`}>
        <div className="bg-slate-900/95 backdrop-blur-xl border-t border-white/5">
          <div className="px-4 py-6 space-y-2">
            {/* Mobile Navigation Links */}
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  onClick={() => setIsNavCollapsed(true)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 font-semibold'
                        : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-transparent'
                    }`
                  }
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{link.name}</span>
                </NavLink>
              );
            })}

            {/* Mobile Auth Section */}
            <div className="pt-6 mt-6 border-t border-white/10 space-y-3">
              {/* Language Selector - Mobile */}
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <FaGlobe className="w-5 h-5 text-white/60" />
                  <span className="text-white/60 text-sm font-medium">Language</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      i18n.language === 'en' 
                        ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-400' 
                        : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage('hi')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      i18n.language === 'hi' 
                        ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-400' 
                        : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'
                    }`}
                  >
                    हिन्दी
                  </button>
                </div>
              </div>

              {user ? (
                <>
                  <NavLink
                    to="/notifications"
                    onClick={() => setIsNavCollapsed(true)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-emerald-500/10 border border-emerald-400/20 text-emerald-400'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <FaBell className="w-5 h-5" />
                      <span className="font-medium">Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </NavLink>

                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 text-white/80 hover:text-white"
                  >
                    <FaUserCircle className="w-5 h-5" />
                    <span className="font-medium">Profile</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all duration-300 text-red-400 hover:text-red-300 border border-red-500/20"
                  >
                    <FaSignOutAlt className="w-5 h-5" />
                    <span className="font-medium">{t('navbar.logout')}</span>
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    onClick={() => setIsNavCollapsed(true)}
                    className="flex items-center space-x-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 text-white/80 hover:text-white"
                  >
                    <FaSignInAlt className="w-5 h-5" />
                    <span className="font-medium">{t('navbar.login')}</span>
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={() => setIsNavCollapsed(true)}
                    className="flex items-center space-x-3 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all duration-300 text-white font-semibold shadow-lg"
                  >
                    <FaUserPlus className="w-5 h-5" />
                    <span>{t('navbar.register')}</span>
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;