import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

function DateAnalyticsPage({ applications, onClose }) {
  const [filter, setFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupedApps, setGroupedApps] = useState({});

  const dateFilters = [
    { id: 'all', label: 'All Time' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'custom', label: 'Custom Range' }
  ];

  // Group applications by date
  useEffect(() => {
    const grouped = {};
    applications.forEach(app => {
      const date = new Date(app.dateApplied);
      const dateKey = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(app);
    });
    setGroupedApps(grouped);
  }, [applications]);

  // Filter applications by date range
  const filterApplications = () => {
    if (filter === 'all') return applications;
    
    const now = new Date();
    let start, end;

    switch (filter) {
      case 'week':
        start = startOfWeek(now);
        end = endOfWeek(now);
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'custom':
        if (!startDate || !endDate) return applications;
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        return applications;
    }

    return applications.filter(app => {
      const appDate = new Date(app.dateApplied);
      return isWithinInterval(appDate, { start, end });
    });
  };

  const filteredApps = filterApplications();

  // Calculate stats
  const stats = {
    total: filteredApps.length,
    thisWeek: applications.filter(app => {
      const appDate = new Date(app.dateApplied);
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      return isWithinInterval(appDate, { start: weekStart, end: weekEnd });
    }).length,
    thisMonth: applications.filter(app => {
      const appDate = new Date(app.dateApplied);
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      return isWithinInterval(appDate, { start: monthStart, end: monthEnd });
    }).length
  };

  return (
    <div className="analytics-overlay">
      <div className="analytics-container">
        {/* Header */}
        <div className="analytics-header">
          <button className="btn-secondary" onClick={onClose}>
            ← Back to Tracker
          </button>
          <h1>📊 Date Analytics</h1>
        </div>

        {/* Filter Section */}
        <div className="analytics-filters">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="form-input"
          >
            {dateFilters.map(f => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>

          {filter === 'custom' && (
            <div className="date-range">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
                style={{ width: '48%' }}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input"
                style={{ width: '48%' }}
              />
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.total}</h3>
            <p>Total Filtered</p>
          </div>
          <div className="stat-card">
            <h3>{stats.thisWeek}</h3>
            <p>This Week</p>
          </div>
          <div className="stat-card">
            <h3>{stats.thisMonth}</h3>
            <p>This Month</p>
          </div>
        </div>

        {/* Grouped Applications */}
        <div className="grouped-apps">
          {Object.entries(groupedApps).map(([date, apps]) => (
            <div key={date} className="date-group">
              <h3>{date} ({apps.length} apps)</h3>
              <div className="mini-table">
                {apps.slice(0, 3).map(app => (
                  <div key={app.id} className="mini-row">
                    <span>{app.company}</span>
                    <span>{app.position}</span>
                    <span className={`status status-${app.status}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
                {apps.length > 3 && (
                  <div className="more">+{apps.length - 3} more</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="analytics-footer">
          <button className="btn" onClick={() => setFilter('all')}>
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default DateAnalyticsPage;
