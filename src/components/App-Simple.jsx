// import React, { useState } from 'react';
// import './styles.css';
// import Header from './components/Header';
// import StatsSection from './components/StatsSection';
// import SearchBar from './components/SearchBar';
// import Table from './components/Table';
// import Modal from './components/Modal';
// import Form from './components/Form';

// function App() {
//   const [applications, setApplications] = useState([
//     {
//       id: 1,
//       company: 'Amazon',
//       position: 'Software Engineer',
//       dateApplied: '2025-12-10',
//       status: 'interview',
//       salary: '150000-180000',
//       notes: 'Phone interview scheduled for Dec 20'
//     },
//     {
//       id: 2,
//       company: 'Google',
//       position: 'Frontend Engineer',
//       dateApplied: '2025-12-08',
//       status: 'applied',
//       salary: '160000-190000',
//       notes: 'Waiting for response'
//     }
//   ]);

//   const [showModal, setShowModal] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [formData, setFormData] = useState({
//     company: '',
//     position: '',
//     dateApplied: new Date().toISOString().split('T')[0],
//     status: 'applied',
//     salary: '',
//     notes: ''
//   });

//   const statuses = ['applied', 'interview', 'offer', 'rejected', 'bookmarked'];

//   const filteredApplications = applications.filter(app =>
//     app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     app.position.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const stats = {
//     total: applications.length,
//     applied: applications.filter(a => a.status === 'applied').length,
//     interview: applications.filter(a => a.status === 'interview').length,
//     offers: applications.filter(a => a.status === 'offer').length
//   };

//   const handleOpenModal = (app = null) => {
//     if (app) {
//       setEditingId(app.id);
//       setFormData(app);
//     } else {
//       setEditingId(null);
//       setFormData({
//         company: '',
//         position: '',
//         dateApplied: new Date().toISOString().split('T')[0],
//         status: 'applied',
//         salary: '',
//         notes: ''
//       });
//     }
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setEditingId(null);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!formData.company.trim() || !formData.position.trim()) {
//       alert('Please fill in company and position fields');
//       return;
//     }

//     if (editingId) {
//       setApplications(prev =>
//         prev.map(app =>
//           app.id === editingId ? { ...formData, id: editingId } : app
//         )
//       );
//     } else {
//       const newApp = {
//         ...formData,
//         id: Math.max(...applications.map(a => a.id), 0) + 1
//       };
//       setApplications(prev => [newApp, ...prev]);
//     }

//     handleCloseModal();
//   };

//   const handleDelete = (id) => {
//     if (confirm('Are you sure you want to delete this application?')) {
//       setApplications(prev => prev.filter(app => app.id !== id));
//     }
//   };

//   return (
//     <div className="container">
//       <Header />
//       <StatsSection stats={stats} />
//       <div className="controls">
//         <SearchBar value={searchTerm} onChange={setSearchTerm} />
//         <button className="btn" onClick={() => handleOpenModal()}>
//           ➕ Add Application
//         </button>
//       </div>
//       <Table
//         applications={filteredApplications}
//         onEdit={handleOpenModal}
//         onDelete={handleDelete}
//       />
//       <Modal
//         isOpen={showModal}
//         title={editingId ? 'Edit Application' : 'Add New Application'}
//         onClose={handleCloseModal}
//       >
//         <Form
//           formData={formData}
//           onInputChange={handleInputChange}
//           onSubmit={handleSubmit}
//           editingId={editingId}
//           onCancel={handleCloseModal}
//           statuses={statuses}
//         />
//       </Modal>
//     </div>
//   );
// }

// export default App;