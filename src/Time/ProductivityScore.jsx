import React, { useEffect, useState, useMemo } from 'react';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { getTimeLogsInRange } from '../firebase-config';

const PRODUCTIVE_CATEGORIES = ['Studying', 'Working'];

function ProductivityScore({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchLogs = async () => {
      setLoading(true);
      const start = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const end = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

      const data = await getTimeLogsInRange(user.uid, start, end);
      setLogs(data);
      setLoading(false);
    };

    fetchLogs();
  }, [user]);

  const { score, productiveMinutes, totalMinutes, status } = useMemo(() => {
    let productiveMinutes = 0;
    let totalMinutes = 0;

    logs.forEach(log => {
      Object.entries(log.activities || {}).forEach(([activity, minutes]) => {
        totalMinutes += minutes;
        if (PRODUCTIVE_CATEGORIES.includes(activity)) {
          productiveMinutes += minutes;
        }
      });
    });

    const score =
      totalMinutes > 0
        ? Math.round((productiveMinutes / totalMinutes) * 100)
        : 0;

    let status = 'Needs Improvement';
    if (score >= 70) status = 'On Track 👍';
    else if (score >= 50) status = 'Moderate ⚠️';

    return { score, productiveMinutes, totalMinutes, status };
  }, [logs]);

  if (loading) return <p>Calculating productivity score...</p>;
  if (logs.length === 0) return <p>No data for this week.</p>;

  let color = '#c0392b';
  if (score >= 70) color = '#27ae60';
  else if (score >= 50) color = '#f39c12';

  return (
    <div
      className="productivity-score"
      style={{
        marginTop: 30,
        padding: 15,
        borderRadius: 8,
        borderLeft: `6px solid ${color}`,
        background: '#f9f9f9'
      }}
    >
      <h2>⚡ Productivity Score</h2>

      <h1 style={{ color }}>{score} / 100</h1>

      <p>{status}</p>

      <p>
        Productive time: {Math.round(productiveMinutes / 60)}h <br />
        Total logged time: {Math.round(totalMinutes / 60)}h
      </p>
    </div>
  );
}

export default ProductivityScore;
