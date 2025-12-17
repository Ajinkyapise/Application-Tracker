import React from 'react';

function Form({ formData, onInputChange, onSubmit, editingId, onCancel, statuses }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label>Company *</label>
        <input
          type="text"
          name="company"
          className="form-input"
          value={formData.company}
          onChange={onInputChange}
          placeholder="e.g., Microsoft"
        />
      </div>

      <div className="form-group">
        <label>Position *</label>
        <input
          type="text"
          name="position"
          className="form-input"
          value={formData.position}
          onChange={onInputChange}
          placeholder="e.g., React Developer"
        />
      </div>

      <div className="form-group">
        <label>Date Applied</label>
        <input
          type="date"
          name="dateApplied"
          className="form-input"
          value={formData.dateApplied}
          onChange={onInputChange}
        />
      </div>

      <div className="form-group">
        <label>Status</label>
        <select
          name="status"
          className="form-input"
          value={formData.status}
          onChange={onInputChange}
        >
          {statuses.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Salary Range</label>
        <input
          type="text"
          name="salary"
          className="form-input"
          value={formData.salary}
          onChange={onInputChange}
          placeholder="e.g., 120000-150000"
        />
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          name="notes"
          className="form-input"
          value={formData.notes}
          onChange={onInputChange}
          placeholder="Interview details, follow-ups, etc."
          rows="4"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn">
          {editingId ? 'Update' : 'Add'} Application
        </button>
      </div>
    </form>
  );
}

export default Form;