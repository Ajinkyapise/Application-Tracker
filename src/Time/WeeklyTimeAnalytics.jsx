import React, { useEffect, useState, useMemo } from 'react';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { getTimeLogsInRange } from '../firebase-config';

function WeeklyTimeAnalytics({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchWeeklyLogs = async () => {
      setLoading(true);
      const start = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const end = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

      const data = await getTimeLogsInRange(user.uid, start, end);
      setLogs(data);
      setLoading(false);
    };

    fetchWeeklyLogs();
  }, [user]);

  /* ================= AGGREGATION ================= */

  const { totals, averages, mostUsed } = useMemo(() => {
    const totals = {};
    let mostUsed = { name: '', minutes: 0 };

    logs.forEach(log => {
      Object.entries(log.activities || {}).forEach(([activity, minutes]) => {
        totals[activity] = (totals[activity] || 0) + minutes;

        if (totals[activity] > mostUsed.minutes) {
          mostUsed = { name: activity, minutes: totals[activity] };
        }
      });
    });

    const days = Math.max(logs.length, 1);
    const averages = {};
    Object.keys(totals).forEach(key => {
      averages[key] = Math.round(totals[key] / days);
    });

    return { totals, averages, mostUsed };
  }, [logs]);

  if (loading) {
    return <p>Loading weekly analytics...</p>;
  }

  if (logs.length === 0) {
    return <p>No data logged this week.</p>;
  }

  return (
    <div className="weekly-analytics" style={{ marginTop: 30 }}>
      <h2>📅 Weekly Time Analytics</h2>

      <div style={{ marginTop: 15 }}>
        {Object.keys(totals).map(activity => (
          <div key={activity} style={{ marginBottom: 8 }}>
            <strong>{activity}</strong>: {Math.round(totals[activity] / 60)}h{' '}
            ({Math.round(averages[activity] / 60)}h/day)
          </div>
        ))}
      </div>

      {mostUsed.name && (
        <div style={{ marginTop: 15, color: '#218085' }}>
          🔥 Most time spent on: <strong>{mostUsed.name}</strong>
        </div>
      )}
    </div>
  );
}

export default WeeklyTimeAnalytics;
