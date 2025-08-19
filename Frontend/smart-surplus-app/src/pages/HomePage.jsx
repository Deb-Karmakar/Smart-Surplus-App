import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaLightbulb, FaCheckCircle, FaUtensils, FaHeart, FaRecycle } from "react-icons/fa";
import { IoBagCheck } from "react-icons/io5";
import { MdRestaurant } from "react-icons/md";

const HomePage = ({ userRole }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
          <div className="absolute inset-0 bg-black/20"></div>
          {/* Animated background elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-400/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-40 right-32 w-48 h-48 bg-teal-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-cyan-400/10 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium">
                <FaRecycle className="text-emerald-300" />
                {t('homePage.hero.badge')}
              </div>
              
              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {t('homePage.hero.title')}{" "}
                <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                  {t('homePage.hero.highlight')}
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg md:text-xl text-white/90 max-w-lg mx-auto lg:mx-0">
                {userRole === 'canteen-organizer' && t('homePage.hero.subtitles.organizer')}
                {userRole === 'student' && t('homePage.hero.subtitles.student')}
                {userRole === 'ngo' && t('homePage.hero.subtitles.ngo')}
                {!userRole && t('homePage.hero.subtitles.default')}
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {(userRole === 'student' || userRole === 'ngo' || !userRole) && (
                  <NavLink 
                    to="/browse" 
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <FaUtensils className="text-xl group-hover:rotate-12 transition-transform duration-300" />
                    {userRole === 'ngo' ? t('homePage.hero.cta.findFood') : t('homePage.hero.cta.browseFood')}
                  </NavLink>
                )}
                {(userRole === 'canteen-organizer' || !userRole) && (
                  <NavLink 
                    to="/add-food" 
                    className={`group inline-flex items-center justify-center gap-3 px-8 py-4 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 ${
                      !userRole 
                        ? 'bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20' 
                        : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                    }`}
                  >
                    <MdRestaurant className="text-xl group-hover:rotate-12 transition-transform duration-300" />
                    {t('homePage.hero.cta.listFood')}
                  </NavLink>
                )}
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-emerald-300">2,500+</div>
                  <div className="text-sm md:text-base text-white/80 mt-1">{t('homePage.hero.stats.mealsSaved')}</div>
                </div>
                <div className="text-center border-l border-r border-white/20">
                  <div className="text-2xl md:text-3xl font-bold text-emerald-300">500+</div>
                  <div className="text-sm md:text-base text-white/80 mt-1">{t('homePage.hero.stats.activeMembers')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-emerald-300">95%</div>
                  <div className="text-sm md:text-base text-white/80 mt-1">{t('homePage.hero.stats.wasteReduction')}</div>
                </div>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-96">
                {/* Floating Cards */}
                <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3 text-white animate-float">
                  <FaUtensils className="text-emerald-300 text-xl" />
                  <span className="font-medium">{t('homePage.hero.cards.fresh')}</span>
                </div>
                <div className="absolute top-1/2 right-1/3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3 text-white animate-float" style={{ animationDelay: '0.5s' }}>
                  <FaRecycle className="text-emerald-300 text-xl" />
                  <span className="font-medium">{t('homePage.hero.cards.waste')}</span>
                </div>
                <div className="absolute bottom-8 right-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3 text-white animate-float" style={{ animationDelay: '1s' }}>
                  <FaHeart className="text-emerald-300 text-xl" />
                  <span className="font-medium">{t('homePage.hero.cards.community')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t('homePage.howItWorks.title')}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-red-400 mx-auto mb-6 rounded-full"></div>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('homePage.howItWorks.subtitle')}
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="group relative">
                <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center group-hover:-translate-y-2">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      01
                    </div>
                  </div>
                  <div className="mt-6 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FaLightbulb className="text-3xl text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {t('homePage.howItWorks.steps.discoverTitle')}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t('homePage.howItWorks.steps.discoverDesc')}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              <div className="hidden md:block absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 transform -translate-y-1/2 z-0"></div>

              {/* Step 2 */}
              <div className="group relative">
                <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center group-hover:-translate-y-2">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      02
                    </div>
                  </div>
                  <div className="mt-6 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FaCheckCircle className="text-3xl text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {t('homePage.howItWorks.steps.claimTitle')}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t('homePage.howItWorks.steps.claimDesc')}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              <div className="hidden md:block absolute top-1/2 right-1/3 w-1/3 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 transform -translate-y-1/2 z-0"></div>

              {/* Step 3 */}
              <div className="group relative">
                <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center group-hover:-translate-y-2">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      03
                    </div>
                  </div>
                  <div className="mt-6 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <IoBagCheck className="text-3xl text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {t('homePage.howItWorks.steps.collectTitle')}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t('homePage.howItWorks.steps.collectDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t('homePage.features.title')}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-red-400 mx-auto mb-6 rounded-full"></div>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('homePage.features.subtitle')}
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center hover:-translate-y-2 border-t-4 border-orange-400">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaUtensils className="text-3xl text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('homePage.features.cards.qualityTitle')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('homePage.features.cards.qualityDesc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center hover:-translate-y-2 border-t-4 border-emerald-400">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaRecycle className="text-3xl text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('homePage.features.cards.impactTitle')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('homePage.features.cards.impactDesc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center hover:-translate-y-2 border-t-4 border-pink-400">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaHeart className="text-3xl text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('homePage.features.cards.communityTitle')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('homePage.features.cards.communityDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-emerald-400/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-56 h-56 bg-teal-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {t('homePage.finalCta.title')}
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-3xl mx-auto">
            {t('homePage.finalCta.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <NavLink 
              to="/browse" 
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <FaUtensils className="text-xl group-hover:rotate-12 transition-transform duration-300" />
              {t('homePage.finalCta.browse')}
            </NavLink>
            {(userRole === 'canteen-organizer' || !userRole) && (
              <NavLink 
                to="/add-food" 
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <MdRestaurant className="text-xl group-hover:rotate-12 transition-transform duration-300" />
                {t('homePage.finalCta.list')}
              </NavLink>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;