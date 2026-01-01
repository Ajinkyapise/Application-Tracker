import React, { useEffect, useState } from 'react';
import { getGoals, saveGoals } from '../firebase-config';

const DEFAULT_GOALS = {
  Studying: { min: 180 },
  Working: { min: 240 },
  'Social Media': { max: 120 }
};

function GoalsManager({ user, todayActivities }) {
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  /* ================= LOAD GOALS ================= */

  useEffect(() => {
    if (!user?.uid) return;

    const loadGoals = async () => {
      const data = await getGoals(user.uid);
      if (data?.goals) {
        setGoals(data.goals);
      }
      setLoading(false);
    };

    loadGoals();
  }, [user]);

  /* ================= SAVE ================= */

  const handleSave = async () => {
    await saveGoals(user.uid, goals);
    setMessage('✅ Goals saved');
    setTimeout(() => setMessage(''), 2000);
  };

  /* ================= INPUT HANDLER ================= */

  const updateGoal = (category, type, value) => {
    setGoals(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: Number(value)
      }
    }));
  };

  /* ================= EVALUATION ================= */

  const warnings = [];

  Object.entries(goals).forEach(([category, rule]) => {
    const spent = todayActivities?.[category] || 0;

    if (rule.min && spent < rule.min) {
      warnings.push(
        `⚠️ ${category}: ${Math.round(spent / 60)}h logged, goal is ${Math.round(
          rule.min / 60
        )}h`
      );
    }

    if (rule.max && spent > rule.max) {
      warnings.push(
        `⚠️ ${category}: exceeded limit (${Math.round(spent / 60)}h / ${Math.round(
          rule.max / 60
        )}h)`
      );
    }
  });

  if (loading) return <p>Loading goals...</p>;

  return (
    <div
      className="goals-manager"
      style={{
        marginTop: 30,
        padding: 15,
        borderRadius: 8,
        background: '#f9f9f9'
      }}
    >
      <h2>🎯 Daily Goals</h2>

      {Object.entries(goals).map(([category, rule]) => (
        <div
          key={category}
          style={{ display: 'flex', gap: 10, marginBottom: 8 }}
        >
          <strong style={{ width: 140 }}>{category}</strong>

          {rule.min !== undefined && (
            <>
              <span>Min (min)</span>
              <input
                type="number"
                value={rule.min}
                onChange={e => updateGoal(category, 'min', e.target.value)}
                className="form-input"
                style={{ width: 80 }}
              />
            </>
          )}

          {rule.max !== undefined && (
            <>
              <span>Max (min)</span>
              <input
                type="number"
                value={rule.max}
                onChange={e => updateGoal(category, 'max', e.target.value)}
                className="form-input"
                style={{ width: 80 }}
              />
            </>
          )}
        </div>
      ))}

      <button className="btn" onClick={handleSave}>
        💾 Save Goals
      </button>

      {message && <p style={{ color: 'green' }}>{message}</p>}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div style={{ marginTop: 15 }}>
          <h4>⚠️ Today’s Warnings</h4>
          <ul>
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default GoalsManager;
