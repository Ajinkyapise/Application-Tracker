import React, { useEffect, useState } from 'react';
import CourseTable from './CourseTable';
import AddCourseModal from './AddCourseModal';
import DailyProgressModal from './DailyProgressModal';
import {
  getCourses,
  addCourse,
  deleteCourse,
  logDailyProgress
} from '../../firebase-config';

export default function CourseTrackerPage({ user }) {
  const [courses, setCourses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    getCourses(user.uid).then(setCourses);
  }, [user]);

  const handleAdd = async (course) => {
    const ref = await addCourse(user.uid, course);
    setCourses(prev => [{ ...course, id: ref.id }, ...prev]);
    setShowAdd(false);
  };

  const handleDelete = async (id) => {
    await deleteCourse(user.uid, id);
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleLog = async (id, lessons) => {
    const updated = await logDailyProgress(user.uid, id, lessons);
    setCourses(prev => prev.map(c => c.id === id ? updated : c));
    setActiveCourse(null);
  };

  return (
    <div className="container">
      <h1>📚 Course Tracker</h1>

      <CourseTable
        courses={courses}
        onDelete={handleDelete}
        onLog={setActiveCourse}
      />

      <button className="btn" onClick={() => setShowAdd(true)}>
        ➕ Add Course
      </button>

      {showAdd && (
        <AddCourseModal
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}

      {activeCourse && (
        <DailyProgressModal
          course={activeCourse}
          onSave={handleLog}
          onClose={() => setActiveCourse(null)}
        />
      )}
    </div>
  );
}
