import React, { useEffect, useState } from 'react';
import { subDays, format } from 'date-fns';
import { getTimeLogsInRange } from '../firebase-config';

const DAYS = 90;

function getColor(totalMinutes) {
  if (totalMinutes === 0) return '#ebedf0';
  if (totalMinutes < 180) return '#c6e48b';
  if (totalMinutes < 360) return '#7bc96f';
  if (totalMinutes < 600) return '#239a3b';
  return '#196127';
}

function TimeHeatmap({ user }) {
  const [data, setData] = useState({});

  useEffect(() => {
    if (!user?.uid) return;

    const fetchData = async () => {
      const end = format(new Date(), 'yyyy-MM-dd');
      const start = format(subDays(new Date(), DAYS), 'yyyy-MM-dd');
      const logs = await getTimeLogsInRange(user.uid, start, end);

      const map = {};
      logs.forEach(log => {
        const total = Object.values(log.activities || {}).reduce(
          (sum, v) => sum + v,
          0
        );
        map[log.date] = total;
      });

      setData(map);
    };

    fetchData();
  }, [user]);

  const daysArray = Array.from({ length: DAYS }, (_, i) =>
    format(subDays(new Date(), DAYS - i), 'yyyy-MM-dd')
  );

  return (
    <div style={{ marginTop: 30 }}>
      <h2>🟩 Activity Heatmap (Last 90 Days)</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(13, 1fr)',
          gap: 4,
          maxWidth: 260,
          marginTop: 10
        }}
      >
        {daysArray.map(date => {
          const total = data[date] || 0;
          return (
            <div
              key={date}
              title={`${date}: ${Math.round(total / 60)}h`}
              style={{
                width: 16,
                height: 16,
                backgroundColor: getColor(total),
                borderRadius: 3
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default TimeHeatmap;
