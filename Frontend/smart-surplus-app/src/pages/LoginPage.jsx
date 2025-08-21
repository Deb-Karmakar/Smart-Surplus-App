import React from 'react';
import { useTranslation } from 'react-i18next'; // Import the hook
import LoginForm from '../components/auth/LoginForm.jsx';
import { Link } from 'react-router-dom';
import { FaLeaf, FaHeart, FaUtensils } from 'react-icons/fa';

const LoginPage = () => {
  const { t } = useTranslation(); // Initialize the hook

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#1A3C34] to-[#2E4F4F] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <FaLeaf className="absolute text-[#A3BFFA] text-4xl animate-float opacity-20" style={{ left: '10%', top: '20%', animationDelay: '0s' }} />
          <FaHeart className="absolute text-[#FF6F61] text-4xl animate-float opacity-20" style={{ right: '15%', top: '40%', animationDelay: '2s' }} />
          <FaUtensils className="absolute text-[#F28C38] text-4xl animate-float opacity-20" style={{ left: '20%', bottom: '25%', animationDelay: '4s' }} />
          <FaLeaf className="absolute text-[#A3BFFA] text-4xl animate-float opacity-20" style={{ right: '10%', bottom: '15%', animationDelay: '6s' }} />
        </div>

        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#2C5E4A] mb-2 tracking-tight">{t('loginPage.title')}</h1>
            <p className="text-lg text-gray-600">{t('loginPage.subtitle')}</p>
            <div className="mt-4 flex justify-center">
              <div className="w-16 h-1 bg-[#FF7A59] rounded-full"></div>
            </div>
          </div>
          <LoginForm />
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              {t('loginPage.registerPrompt')}{' '}
              <Link to="/register" className="text-[#FF7A59] font-semibold hover:text-[#FF6F61] transition-colors duration-200">
                {t('loginPage.registerLink')}
              </Link>
            </p>
          </div>
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>
              {t('loginPage.terms')}{' '}
              <a href="#" className="underline hover:text-[#FF7A59]">{t('registerPage.termsLink')}</a>{' '}
              {t('registerPage.and')}{' '}
              <a href="#" className="underline hover:text-[#FF7A59]">{t('registerPage.privacyLink')}</a>.
            </p>
          </div>
        </div>
      </div>

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
          100% { transform: translateY(0) rotate(360deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default LoginPage;