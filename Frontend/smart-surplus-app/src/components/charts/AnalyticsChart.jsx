import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsChart = ({ chartData, chartOptions }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chart Title',
        font: {
          size: 18,
        }
      },
    },
    scales: {
        y: {
            beginAtZero: true
        }
    }
  };

  const options = { ...defaultOptions, ...chartOptions };

  return (
    <div style={{ height: '350px', width: '100%' }}>
      <Bar options={options} data={chartData} />
    </div>
  );
};

export default AnalyticsChart;
