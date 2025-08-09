import React from 'react';
import { useFood } from '../context/FoodContext.jsx';
import AnalyticsChart from '../components/charts/AnalyticsChart.jsx';

const AnalyticsPage = () => {
  const { analytics } = useFood(); // Get analytics data from context

  // Prepare data for the weekly trend chart
  const weeklyChartData = {
    labels: analytics.weeklyTrend.labels,
    datasets: [
      {
        label: 'Food Items Saved This Week',
        data: analytics.weeklyTrend.data,
        backgroundColor: 'rgba(44, 94, 74, 0.7)',
        borderColor: 'rgba(44, 94, 74, 1)',
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      title: {
        display: true,
        text: 'Weekly Food Rescue Trend',
        font: { size: 20, weight: '600' },
      },
       legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Items'
        }
      }
    }
  };

  return (
    <>
      <div className="analytics-page-container">
        <div className="page-header">
          <h1 className="page-title">Impact Analytics</h1>
          <p className="page-subtitle">A detailed look at the positive impact of your efforts.</p>
        </div>
        <div className="chart-wrapper">
          <AnalyticsChart chartData={weeklyChartData} chartOptions={chartOptions} />
        </div>
        {/* You can add more charts here in the future */}
      </div>

      <style jsx>{`
        .analytics-page-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .page-title {
          font-size: 2.8rem;
          font-weight: 700;
          color: #2C5E4A;
          margin: 0;
        }
        .page-subtitle {
          font-size: 1.1rem;
          color: #555;
        }
        .chart-wrapper {
          background-color: #fff;
          padding: 25px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.07);
        }
      `}</style>
    </>
  );
};

export default AnalyticsPage;
