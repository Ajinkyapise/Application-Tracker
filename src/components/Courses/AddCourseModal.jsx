import React, { useState } from 'react';

export default function AddCourseModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: '',
    totalLessons: '',
    targetDate: ''
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: form.name,
      totalLessons: Number(form.totalLessons),
      targetDate: form.targetDate
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add Course</h3>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Course name" onChange={handleChange} required />
          <input name="totalLessons" type="number" placeholder="Total lessons" onChange={handleChange} required />
          <input name="targetDate" type="date" onChange={handleChange} required />
          <div className="form-actions">
            <button className="btn">Save</button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
