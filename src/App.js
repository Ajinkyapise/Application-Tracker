import React, { useState, useEffect } from 'react';
import './components/styles.css';
import Header from './components/Header';
import StatsSection from './components/StatsSection';
import SearchBar from './components/SearchBar';
import Table from './components/Table';
import Modal from './components/Modal';
import Form from './components/Form';
import { auth, db, addApplication, updateApplication, deleteApplication, getApplications, loginUser, registerUser, logoutUser } from './firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import DateAnalyticsPage from './components/DateAnalyticsPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
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




  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Load applications from Firebase
        try {
          const apps = await getApplications(currentUser.uid);
          setApplications(apps);
        } catch (error) {
          console.error('Error loading applications:', error);
        }
      } else {
        setUser(null);
        setApplications([]);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

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
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const filteredApplications = applications.filter(app =>
    app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offers: applications.filter(a => a.status === 'offer').length
  };

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

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.company.trim() || !formData.position.trim()) {
      alert('Please fill in company and position fields');
      return;
    }

    try {
      if (editingId) {
        // Update existing application
        await updateApplication(user.uid, editingId, formData);
        setApplications(prev =>
          prev.map(app =>
            app.id === editingId ? { ...formData, id: editingId } : app
          )
        );
      } else {
        // Add new application
        const docRef = await addApplication(user.uid, formData);
        setApplications(prev => [{ ...formData, id: docRef.id }, ...prev]);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving application:', error);
      alert('Error saving application');
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmId) {
      try {
        await deleteApplication(user.uid, deleteConfirmId);
        setApplications(prev => prev.filter(app => app.id !== deleteConfirmId));
        setDeleteConfirmId(null);
      } catch (error) {
        console.error('Error deleting application:', error);
        alert('Error deleting application');
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  if (!user) {
    return (
      <div className="container">
        <Header />
        <div className="empty-state">
          <p>Please sign in to track your job applications</p>
          <button className="btn" onClick={() => { setIsLogin(true); setShowAuthModal(true); }}>
            Sign In
          </button>
          <button className="btn-secondary" onClick={() => { setIsLogin(false); setShowAuthModal(true); }} style={{ marginLeft: '10px' }}>
            Sign Up
          </button>
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>
              <form onSubmit={handleAuthSubmit}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                  />
                </div>
                {authError && <p style={{ color: 'red' }}>{authError}</p>}
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAuthModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn">
                    {isLogin ? 'Sign In' : 'Sign Up'}
                  </button>
                </div>
              </form>
              <p style={{ marginTop: '20px', textAlign: 'center' }}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#218085', cursor: 'pointer', textDecoration: 'underline' }}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Header />
        <div>
          <span style={{ marginRight: '15px' }}>Welcome, {user.email}</span>
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

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
        applications={filteredApplications}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this application? This action cannot be undone.</p>
            <div className="form-actions">
              <button className="btn-secondary" onClick={handleCancelDelete}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

     
{showAnalytics && (
  <DateAnalyticsPage 
    applications={applications} 
    onClose={() => setShowAnalytics(false)} 
  />
)}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        title={editingId ? 'Edit Application' : 'Add New Application'}
        onClose={handleCloseModal}
      >
        <Form
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          editingId={editingId}
          onCancel={handleCloseModal}
          statuses={statuses}
        />
      </Modal>
    </div>
  );
}

export default App;