# ZeroBite - Smart Surplus App 🥗

A comprehensive web application designed to reduce food waste by connecting surplus food with those who need it. Built with React frontend and designed for scalability.

## 🌟 Features

- **User Authentication**: Secure login and registration system
- **Food Inventory Management**: Add, browse, and manage surplus food items
- **Smart Analytics**: Track food waste reduction and impact metrics
- **Interactive Dashboard**: Real-time overview of food surplus and distribution
- **Leaderboard**: Gamification to encourage food sharing
- **Timer Notifications**: Track food freshness and expiry dates
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

### Frontend
- **React** - User interface framework
- **React Router** - Client-side routing
- **Chart.js** - Data visualization
- **React Icons** - Icon components
- **Axios** - HTTP client for API calls
- **CSS Modules** - Scoped styling

### Development Tools
- **Vite** - Build tool and development server
- **ESLint** - Code linting and quality
- **React Hot Reload** - Development experience

## 📁 Project Structure

```
ZeroBite/
├── Frontend/
│   └── smart-surplus-app/
│       ├── src/
│       │   ├── components/
│       │   │   ├── auth/          # Authentication components
│       │   │   ├── charts/        # Chart components
│       │   │   ├── food/          # Food-related components
│       │   │   ├── layout/        # Layout components
│       │   │   └── shared/        # Reusable components
│       │   ├── context/           # React Context providers
│       │   ├── pages/             # Page components
│       │   ├── services/          # API services
│       │   ├── styles/            # CSS files
│       │   ├── App.jsx            # Main App component
│       │   └── main.jsx           # Entry point
│       ├── public/                # Static assets
│       ├── package.json           # Dependencies
│       └── vite.config.js         # Vite configuration
└── Backend/                       # Backend (to be implemented)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ZeroBite.git
cd ZeroBite
```

2. Navigate to the frontend directory:
```bash
cd Frontend/smart-surplus-app
```

3. Install dependencies:
```bash
npm install
# or
yarn install
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and visit `http://localhost:5173`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Key Components

### Authentication System
- LoginForm.jsx - User login interface
- Registration.jsx - User registration interface
- ProtectedRoute.jsx - Route protection wrapper
- AuthContext.jsx - Authentication state management

### Food Management
- FoodCard.jsx - Display food item cards
- FoodForm.jsx - Add new food items
- TimerTag.jsx - Food freshness tracking
- FoodContext.jsx - Food state management

### Dashboard & Analytics
- DashboardPage.jsx - Main dashboard
- AnalyticsChart.jsx - Data visualization
- DashboardSummaryCard.jsx - Summary metrics
- AnalyticsPage.jsx - Detailed analytics

### User Interface
- Navbar.jsx - Navigation bar
- Sidebar.jsx - Side navigation
- Footer.jsx - Page footer
- LoadingSpinner.jsx - Loading states
- Notification.jsx - User notifications

## 🌍 Environment Setup

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=your_api_base_url
VITE_APP_NAME=ZeroBite
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Future Enhancements

- [ ] Backend API development
- [ ] Real-time notifications
- [ ] Mobile app development
- [ ] Integration with food banks and NGOs
- [ ] AI-powered food categorization
- [ ] Location-based food sharing
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: [Your Name]
- **Project Type**: Food Waste Reduction Platform

## 📞 Support

For support, email support@zerobite.com or create an issue in this repository.

---

**Made with ❤️ to reduce food waste and build a sustainable future**
