import React, { useEffect, useState, useMemo } from 'react';
import { getTimeLog, saveTimeLog } from '../firebase-config';

import TimeEntryRow from './TimeEntryRow';
import TimeSummary from './TimeSummary';
import WeeklyTimeAnalytics from './WeeklyTimeAnalytics';
import ProductivityScore from './ProductivityScore';
import TimeHeatmap from './TimeHeatmap';
import GoalsManager from './GoalsManager';

import './time.css'; // 👈 page-specific CSS

const DEFAULT_CATEGORIES = [
  'Studying',
  'Working',
  'Social Media',
  'Texting',
  'Preparing Food',
  'Chores'
];

const MAX_MINUTES = 1440;

function TimeTrackerPage({ user }) {
  const today = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [activities, setActivities] = useState({});
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  /* ================= LOAD DAILY LOG ================= */
  useEffect(() => {
    if (!user?.uid) return;

    const loadLog = async () => {
      setLoading(true);
      const data = await getTimeLog(user.uid, selectedDate);
      setActivities(data?.activities || {});
      setLoading(false);
    };

    loadLog();
  }, [user, selectedDate]);

  /* ================= TOTAL TIME ================= */
  const totalMinutes = useMemo(() => {
    return Object.values(activities).reduce(
      (sum, val) => sum + Number(val || 0),
      0
    );
  }, [activities]);

  /* ================= UPDATE ACTIVITY ================= */
  const updateActivity = (category, minutes) => {
    setActivities(prev => ({
      ...prev,
      [category]: minutes
    }));
  };

  /* ================= ADD CATEGORY ================= */
  const addCategory = () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory)) return;

    setCategories(prev => [...prev, newCategory]);
    setNewCategory('');
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    setError('');

    if (totalMinutes > MAX_MINUTES) {
      setError('❌ Total time exceeds 24 hours. Please adjust your entries.');
      return;
    }

    await saveTimeLog(user.uid, selectedDate, activities);
  };

  if (loading) {
    return <div className="page-center">Loading time log…</div>;
  }

  return (
    <div className="time-page">
      <h1 className="page-title">⏱ Time Tracker</h1>

      {/* ===== DATE + ENTRIES ===== */}
      <div className="time-card">
        <div className="time-date">
          <label>Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="time-entries">
          {categories.map(cat => (
            <TimeEntryRow
              key={cat}
              category={cat}
              minutes={activities[cat] || ''}
              onChange={updateActivity}
            />
          ))}
        </div>

        <div className="time-add-category">
          <input
            type="text"
            placeholder="Add category"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="form-input"
          />
          <button className="btn" onClick={addCategory}>
            ➕ Add
          </button>
        </div>
      </div>

      {/* ===== SUMMARY ===== */}
      <div className="time-card">
        <TimeSummary totalMinutes={totalMinutes} />
        {error && <p className="error">{error}</p>}
        <button className="btn" onClick={handleSave}>
          💾 Save Day
        </button>
      </div>

      {/* ===== ANALYTICS ===== */}
      <div className="time-card">
        <WeeklyTimeAnalytics user={user} />
      </div>

      <div className="time-card">
        <ProductivityScore user={user} />
      </div>

      <div className="time-card">
        <TimeHeatmap user={user} />
      </div>

      <div className="time-card">
        <GoalsManager user={user} todayActivities={activities} />
      </div>
    </div>
  );
}

export default TimeTrackerPage;
