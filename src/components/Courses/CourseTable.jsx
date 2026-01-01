import React from 'react';

export default function CourseTable({ courses, onDelete, onLog }) {
  const today = new Date();

  const daysLeft = (target) =>
    Math.max(
      Math.ceil((new Date(target) - today) / (1000 * 60 * 60 * 24)) + 1,
      1
    );

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Course</th>
          <th>Progress</th>
          <th>Daily Target</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {courses.map(c => {
          const remaining = c.totalLessons - c.completedLessons;
          const perDay = remaining / daysLeft(c.targetDate);

          return (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.completedLessons} / {c.totalLessons}</td>
              <td>{perDay.toFixed(2)} / day</td>
              <td>
                <button className="btn" onClick={() => onLog(c)}>
                  Log Today
                </button>
                <button
                  className="btn-danger"
                  onClick={() => onDelete(c.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
