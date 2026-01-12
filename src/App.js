import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';

import './components/styles.css';
import Header from './components/common/Header';
import StatsSection from './components/Applications/StatsSection';
import SearchBar from './components/Applications/SearchBar';
import Table from './components/Applications/Table';
import Modal from './components/common/Modal';
import Form from './components/Form';
import DateAnalyticsPage from './components/analytics/DateAnalyticsPage';
import CourseTrackerPage from './components/Courses/CourseTrackerPage';
import TimeTrackerPage from './Time/TimeTrackerPage';
import LinkedinTrackerPage from './components/LinkedinForm/LinkedinTrackerPage';  // ✅ NEW

import {
  auth,
  addApplication,
  updateApplication,
  deleteApplication,
  getApplications,
  loginUser,
  registerUser,
  logoutUser
} from './firebase-config';

import { onAuthStateChanged } from 'firebase/auth';

function App() {
  /* ================= AUTH ================= */
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  /* ================= APPLICATIONS ================= */
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const [formData, setFormData] = useState({
    company: '',
    position: '',
    dateApplied: new Date().toISOString().split('T')[0],
    status: 'applied',
    salary: '',
    notes: ''
  });

  const statuses = ['applied', 'interview', 'offer', 'rejected', 'bookmarked'];
  const [showAnalytics, setShowAnalytics] = useState(false);

  /* ================= AUTH STATE ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const apps = await getApplications(currentUser.uid);
        setApplications(apps);
      } else {
        setUser(null);
        setApplications([]);
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  /* ================= AUTH HANDLERS ================= */
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      if (isLogin) {
        await loginUser(authEmail, authPassword);
      } else {
        await registerUser(authEmail, authPassword);
      }
      setShowAuthModal(false);
      setAuthEmail('');
      setAuthPassword('');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  /* ================= FILTER & GROUP ================= */
  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate =
      selectedDate ? app.dateApplied === selectedDate : true;

    return matchesSearch && matchesDate;
  });

  const groupedApplications = filteredApplications.reduce((acc, app) => {
    const date = app.dateApplied;
    if (!acc[date]) acc[date] = [];
    acc[date].push(app);
    return acc;
  }, {});

  /* ================= STATS ================= */
  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offers: applications.filter(a => a.status === 'offer').length
  };

  /* ================= CRUD ================= */
  const handleOpenModal = (app = null) => {
    if (app) {
      setEditingId(app.id);
      setFormData(app);
    } else {
      setEditingId(null);
      setFormData({
        company: '',
        position: '',
        dateApplied: new Date().toISOString().split('T')[0],
        status: 'applied',
        salary: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company || !formData.position) return;

    if (editingId) {
      await updateApplication(user.uid, editingId, formData);
      setApplications(prev =>
        prev.map(app =>
          app.id === editingId ? { ...formData, id: editingId } : app
        )
      );
    } else {
      const ref = await addApplication(user.uid, formData);
      setApplications(prev => [{ ...formData, id: ref.id }, ...prev]);
    }

    setShowModal(false);
    setEditingId(null);
  };

  const handleDelete = (id) => setDeleteConfirmId(id);

  const confirmDelete = async () => {
    await deleteApplication(user.uid, deleteConfirmId);
    setApplications(prev => prev.filter(a => a.id !== deleteConfirmId));
    setDeleteConfirmId(null);
  };

  /* ================= LOADING ================= */
  if (loading) {
    return <div className="container">Loading...</div>;
  }

  /* ================= AUTH GATE ================= */
  if (!user) {
    return (
      <div className="container">
        <Header />
        <p>Please sign in to continue</p>

        <button
          className="btn"
          onClick={() => { setIsLogin(true); setShowAuthModal(true); }}
        >
          Sign In
        </button>

        <button
          className="btn-secondary"
          onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
        >
          Sign Up
        </button>

        {showAuthModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>
              <form onSubmit={handleAuthSubmit}>
                <input
                  type="email"
                  placeholder="Email"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  required
                />
                {authError && <p style={{ color: 'red' }}>{authError}</p>}
                <button className="btn">
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ================= MAIN APP ================= */
  return (
    <div className="container">
      <Header />

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <Link to="/" className="btn-secondary">🏠 Applications</Link>

          {/* <Link to="/courses" className="btn-secondary" style={{ marginLeft: 10 }}>
            📚 Courses
          </Link>

          <Link to="/time" className="btn-secondary" style={{ marginLeft: 10 }}>
            ⏱ Time Tracker
          </Link> */}

          <Link to="/linkedin" className="btn-secondary" style={{ marginLeft: 10 }}>
            💼 LinkedIn Tracker
          </Link>
        </div>

        <button className="btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <Routes>
        {/* APPLICATION TRACKER */}
        <Route
          path="/"
          element={
            <>
              <StatsSection stats={stats} />

              <div className="controls">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />

                <button className="btn" onClick={() => handleOpenModal()}>
                  ➕ Add Application
                </button>

                <button className="btn" onClick={() => setShowAnalytics(true)}>
                  📊 Analytics
                </button>
              </div>

              <Table
                groupedApplications={groupedApplications}
                selectedDate={selectedDate}
                onDateSelect={(date) =>
                  setSelectedDate(prev => (prev === date ? null : date))
                }
                onEdit={handleOpenModal}
                onDelete={handleDelete}
              />
            </>
          }
        />

        {/* COURSES */}
        <Route
          path="/courses"
          element={<CourseTrackerPage user={user} />}
        />

        {/* TIME TRACKER */}
        <Route
          path="/time"
          element={<TimeTrackerPage user={user} />}
        />

        {/* LINKEDIN TRACKER */}
        <Route
          path="/linkedin"
          element={<LinkedinTrackerPage user={user} />}
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* ANALYTICS */}
      {showAnalytics && (
        <DateAnalyticsPage
          applications={applications}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {/* ADD / EDIT APPLICATION */}
      <Modal
        isOpen={showModal}
        title={editingId ? 'Edit Application' : 'Add Application'}
        onClose={() => setShowModal(false)}
      >
        <Form
          formData={formData}
          onInputChange={e =>
            setFormData({ ...formData, [e.target.name]: e.target.value })
          }
          onSubmit={handleSubmit}
          statuses={statuses}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      {/* DELETE CONFIRM */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Delete this application?</p>
            <button className="btn-danger" onClick={confirmDelete}>
              Delete
            </button>
            <button
              className="btn-secondary"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
