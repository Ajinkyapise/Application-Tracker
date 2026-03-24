import React, { useMemo, useState } from 'react';
import {
  endOfMonth,
  endOfWeek,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

/* ================= Small Stat Card ================= */

function Stat({ title, value }) {
  return (
    <div className="stat-card small">
      <h4>{value}</h4>
      <p>{title}</p>
    </div>
  );
}

/* ================= Main Component ================= */

function DateAnalyticsPage({ applications = [], onClose }) {
  const [filter, setFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  /* ================= Filter Applications ================= */

  const filteredApps = useMemo(() => {
    if (filter === 'all') return applications;

    const now = new Date();
    let start;
    let end;

    if (filter === 'week') {
      start = startOfWeek(now);
      end = endOfWeek(now);
    } else if (filter === 'month') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else if (filter === 'custom') {
      if (!startDate || !endDate) return applications;
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      return applications;
    }

    return applications.filter((app) => {
      if (!app?.dateApplied) return false;
      const appliedDate = new Date(app.dateApplied);
      if (Number.isNaN(appliedDate.getTime())) return false;

      return isWithinInterval(appliedDate, { start, end });
    });
  }, [applications, filter, startDate, endDate]);

  /* ================= Stats ================= */

  const stats = useMemo(() => {
    const counts = {
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    };

    filteredApps.forEach((app) => {
      const status = app?.status;
      if (!status) return;

      counts[status] = (counts[status] || 0) + 1;
    });

    return {
      total: filteredApps.length,
      ...counts,
    };
  }, [filteredApps]);

  /* ================= UI ================= */

  return (
    <div className="analytics-overlay">
      <div className="analytics-modal">
        {/* Header */}
        <div className="analytics-header">
          <h3>Application Analytics</h3>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="analytics-filters">
          <select
            className="form-input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom</option>
          </select>

          {filter === 'custom' && (
            <>
              <input
                className="form-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <input
                className="form-input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div className="stats-grid compact">
          <Stat title="Total" value={stats.total} />
          <Stat title="Applied" value={stats.applied} />
          <Stat title="Interviews" value={stats.interview} />
          <Stat title="Offers" value={stats.offer} />
          <Stat title="Rejected" value={stats.rejected} />
        </div>
      </div>
    </div>
  );
}

export default DateAnalyticsPage;
