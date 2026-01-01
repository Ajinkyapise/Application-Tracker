import React from 'react';

const MAX_MINUTES = 1440;

function TimeSummary({ totalMinutes }) {
  const remaining = MAX_MINUTES - totalMinutes;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const remainingHours = Math.floor(Math.max(remaining, 0) / 60);
  const remainingMinutes = Math.max(remaining, 0) % 60;

  let statusColor = '#218085';
  let statusText = 'You still have time left today';

  if (remaining <= 0) {
    statusColor = '#c0392b';
    statusText = '⛔ 24 hours fully allocated';
  } else if (remaining <= 120) {
    statusColor = '#e67e22';
    statusText = '⚠️ Less than 2 hours remaining';
  }

  return (
    <div
      className="time-summary"
      style={{
        marginTop: 20,
        padding: 15,
        borderRadius: 8,
        background: '#71e0c6ff',
        borderLeft: `5px solid ${statusColor}`
      }}
    >
      <h3>Daily Summary</h3>

      <p>
        <strong>Total logged:</strong>{' '}
        {hours}h {minutes}m
      </p>

      <p>
        <strong>Remaining:</strong>{' '}
        {remainingHours}h {remainingMinutes}m
      </p>

      <p style={{ color: statusColor }}>
        {statusText}
      </p>
    </div>
  );
}

export default TimeSummary;
