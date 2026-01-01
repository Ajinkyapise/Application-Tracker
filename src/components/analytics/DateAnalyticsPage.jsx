import React, { useState, useMemo } from 'react';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  isToday,
  differenceInCalendarDays
} from 'date-fns';

function DateAnalyticsPage({ applications, onClose }) {
  const [filter, setFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  /* ================= FILTERED APPLICATIONS ================= */

  const filteredApps = useMemo(() => {
    if (filter === 'all') return applications;

    const now = new Date();
    let start, end;

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
    }

    return applications.filter(app =>
      isWithinInterval(new Date(app.dateApplied), { start, end })
    );
  }, [applications, filter, startDate, endDate]);

  /* ================= STATUS STATS ================= */

  const stats = useMemo(() => {
    const counts = {
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0
    };

    filteredApps.forEach(app => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });

    const interviewRate =
      counts.applied > 0
        ? Math.round((counts.interview / counts.applied) * 100)
        : 0;

    const offerRate =
      counts.interview > 0
        ? Math.round((counts.offer / counts.interview) * 100)
        : 0;

    return {
      total: filteredApps.length,
      ...counts,
      interviewRate,
      offerRate
    };
  }, [filteredApps]);

  /* ================= ACTIVITY BY DAY ================= */

  const activityByDate = useMemo(() => {
    const map = {};
    filteredApps.forEach(app => {
      map[app.dateApplied] = (map[app.dateApplied] || 0) + 1;
    });
    return map;
  }, [filteredApps]);

  const maxActivity = Math.max(...Object.values(activityByDate), 1);

  /* ================= STREAK ================= */

  const streak = useMemo(() => {
    const dates = Object.keys(activityByDate)
      .map(d => new Date(d))
      .sort((a, b) => b - a);

    let currentStreak = 0;

    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        if (differenceInCalendarDays(new Date(), dates[i]) <= 1) {
          currentStreak = 1;
        } else break;
      } else {
        const diff = differenceInCalendarDays(dates[i - 1], dates[i]);
        if (diff === 1) currentStreak++;
        else break;
      }
    }

    return currentStreak;
  }, [activityByDate]);

  /* ================= INSIGHTS ================= */

  const insights = useMemo(() => {
    const messages = [];

    if (stats.total === 0) {
      messages.push('No applications yet. Start applying to see insights.');
      return messages;
    }

    if (stats.interviewRate > 30) {
      messages.push('Your interview rate is strong 👍');
    } else if (stats.applied > 5 && stats.interview === 0) {
      messages.push('You have applications but no interviews yet. Consider improving your resume.');
    }

    if (streak >= 5) {
      messages.push(`🔥 Great consistency! ${streak}-day application streak.`);
    } else if (streak === 0) {
      messages.push('No recent activity. A small daily effort goes a long way.');
    }

    if (stats.offer > 0) {
      messages.push('🎉 You’re converting interviews into offers!');
    }

    return messages;
  }, [stats, streak]);

  /* ================= UI ================= */

  return (
    <div className="analytics-overlay">
      <div className="analytics-container">

        {/* Header */}
        <div className="analytics-header">
          <button className="btn-secondary" onClick={onClose}>← Back</button>
          <h1>📊 Analytics</h1>
        </div>

        {/* Filters */}
        <div className="analytics-filters">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="form-input"
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {filter === 'custom' && (
            <div className="date-range">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="form-input"
              />
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="form-input"
              />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card"><h3>{stats.total}</h3><p>Total</p></div>
          <div className="stat-card"><h3>{stats.applied}</h3><p>Applied</p></div>
          <div className="stat-card"><h3>{stats.interview}</h3><p>Interviews</p></div>
          <div className="stat-card"><h3>{stats.offer}</h3><p>Offers</p></div>
          <div className="stat-card"><h3>{stats.interviewRate}%</h3><p>Interview Rate</p></div>
          <div className="stat-card"><h3>{stats.offerRate}%</h3><p>Offer Rate</p></div>
          <div className="stat-card"><h3>{streak}</h3><p>Day Streak 🔥</p></div>
        </div>

        {/* Activity Bars */}
        <div className="activity-section">
          <h3>Daily Activity</h3>
          {Object.entries(activityByDate)
            .sort((a, b) => new Date(b[0]) - new Date(a[0]))
            .slice(0, 7)
            .map(([date, count]) => (
              <div key={date} className="activity-row">
                <span>{date}</span>
                <div className="activity-bar-bg">
                  <div
                    className="activity-bar"
                    style={{ width: `${(count / maxActivity) * 100}%` }}
                  />
                </div>
                <span>{count}</span>
              </div>
            ))}
        </div>

        {/* Insights */}
        <div className="insights-section">
          <h3>Insights</h3>
          <ul>
            {insights.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default DateAnalyticsPage;
