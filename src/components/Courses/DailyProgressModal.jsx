import React, { useState } from 'react';

export default function DailyProgressModal({ course, onSave, onClose }) {
  const [today, setToday] = useState('');

  const submit = (e) => {
    e.preventDefault();
    onSave(course.id, Number(today));
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Today's Progress – {course.name}</h3>
        <form onSubmit={submit}>
          <input
            type="number"
            placeholder="Lessons completed today"
            value={today}
            onChange={e => setToday(e.target.value)}
            required
          />
          <div className="form-actions">
            <button className="btn">Log</button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
