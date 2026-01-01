import React from 'react';

function StatsSection({ stats }) {
  return (
    <div className="stats">
      <div className="stat-card">
        <h3>{stats.total}</h3>
        <p>Total</p>
      </div>
      <div className="stat-card">
        <h3>{stats.applied}</h3>
        <p>Applied</p>
      </div>
      <div className="stat-card">
        <h3>{stats.interview}</h3>
        <p>Interviews</p>
      </div>
      <div className="stat-card">
        <h3>{stats.offers}</h3>
        <p>Offers</p>
      </div>
    </div>
  );
}

export default StatsSection;