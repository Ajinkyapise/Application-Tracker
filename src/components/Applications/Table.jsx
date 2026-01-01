import React from 'react';

function Table({
  groupedApplications,
  selectedDate,
  onDateSelect,
  onEdit,
  onDelete
}) {
  const formatDate = (dateStr) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  const dates = Object.keys(groupedApplications).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  if (dates.length === 0) {
    return <div className="empty-state">📭 No applications found</div>;
  }

  /* ================= DATE LIST MODE ================= */
  if (!selectedDate) {
    return (
      <div className="table-wrapper">
        <h3>Select a date</h3>

        {dates.map(date => (
          <div
            key={date}
            className="date-card"
            onClick={() => onDateSelect(date)}
            style={{
              padding: '12px',
              marginBottom: '8px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            📅 <strong>{formatDate(date)}</strong>
            <span style={{ marginLeft: 10, color: '#666' }}>
              ({groupedApplications[date].length} applications)
            </span>
          </div>
        ))}
      </div>
    );
  }

  /* ================= APPLICATION LIST MODE ================= */
  return (
    <div className="table-wrapper">
      <button
        className="btn-secondary"
        style={{ marginBottom: 12 }}
        onClick={() => onDateSelect(null)}
      >
        ← Back to dates
      </button>

      <h3>📅 {formatDate(selectedDate)}</h3>

      <table className="table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Position</th>
            <th>Status</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {groupedApplications[selectedDate].map(app => (
            <tr key={app.id}>
              <td><strong>{app.company}</strong></td>
              <td>{app.position}</td>
              <td>
                <span className={`status status-${app.status}`}>
                  {app.status}
                </span>
              </td>
              <td>{app.salary || '—'}</td>
              <td>
                <button className="btn-sm" onClick={() => onEdit(app)}>
                  Edit
                </button>
                <button
                  className="btn-sm btn-danger"
                  onClick={() => onDelete(app.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
