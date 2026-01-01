import React from 'react';

function TimeEntryRow({ category, minutes, onChange }) {
  const mins = Number(minutes) || 0;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  const handleInput = (e) => {
    const value = e.target.value;
    if (value < 0) return;
    onChange(category, Number(value));
  };

  return (
    <div
      className="time-entry-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 15,
        marginBottom: 10
      }}
    >
      <div style={{ width: 180 }}>
        <strong>{category}</strong>
      </div>

      <input
        type="number"
        min="0"
        placeholder="Minutes"
        value={minutes}
        onChange={handleInput}
        className="form-input"
        style={{ width: 100 }}
      />

      <span style={{ color: '#666' }}>
        {hours > 0 || remainingMins > 0
          ? `= ${hours}h ${remainingMins}m`
          : ''}
      </span>
    </div>
  );
}

export default TimeEntryRow;
