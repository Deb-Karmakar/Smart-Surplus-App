import React from 'react';

const DashboardSummaryCard = ({ item }) => {
  const getStatus = () => {
    if (item.status === 'claimed') {
      return <span className="status claimed">Claimed</span>;
    }
    if (new Date(item.expiresAt) < new Date()) {
      return <span className="status expired">Expired</span>;
    }
    return <span className="status available">Available</span>;
  };

  return (
    <>
      <div className="summary-card">
        <div className="card-info">
          <h4 className="card-title">{item.title}</h4>
          <p className="card-source">from {item.source}</p>
        </div>
        <div className="card-status">
          {getStatus()}
        </div>
      </div>
      <style jsx>{`
        .summary-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #fff;
          padding: 15px 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          transition: box-shadow 0.3s ease;
        }
        .summary-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .card-info {
          flex-grow: 1;
        }
        .card-title {
          font-weight: 600;
          font-size: 1.1rem;
          color: #333;
          margin: 0 0 4px 0;
        }
        .card-source {
          font-size: 0.9rem;
          color: #777;
          margin: 0;
        }
        .status {
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
        }
        .status.available {
          background-color: #E8F5E9; /* Light Green */
          color: #388E3C;
        }
        .status.claimed {
          background-color: #FFF3E0; /* Light Orange */
          color: #F57C00;
        }
        .status.expired {
          background-color: #F5F5F5; /* Light Grey */
          color: #616161;
        }
      `}</style>
    </>
  );
};

export default DashboardSummaryCard;