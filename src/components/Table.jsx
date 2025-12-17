import React from 'react';

function Table({ applications, onEdit, onDelete }) {
  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (applications.length === 0) {
    return (
      <div className="table-wrapper">
        <div className="empty-state">📭 No applications found</div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Position</th>
            <th>Date Applied</th>
            <th>Status</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app.id}>
              <td><strong>{app.company}</strong></td>
              <td>{app.position}</td>
              <td>{formatDate(app.dateApplied)}</td>
              <td>
                <span className={`status status-${app.status}`}>
                  {app.status}
                </span>
              </td>
              <td>{app.salary || '—'}</td>
              <td>
                <button className="btn-sm" onClick={() => onEdit(app)}>Edit</button>
                <button className="btn-sm btn-danger" onClick={() => onDelete(app.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;