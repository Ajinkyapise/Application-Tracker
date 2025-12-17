// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Replace with your Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDrFao0Rxpzh57lziGFZZDAPFsrmuC8U6A",
  authDomain: "applicationtracker-b8398.firebaseapp.com",
  projectId: "applicationtracker-b8398",
  storageBucket: "applicationtracker-b8398.firebasestorage.app",
  messagingSenderId: "668249794612",
  appId: "1:668249794612:web:cabc18fe0d691556ed0261",
  measurementId: "G-YM930XK7HW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Auth Functions
export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

// Database Functions
export const addApplication = (userId, applicationData) => {
  return addDoc(collection(db, 'users', userId, 'applications'), {
    ...applicationData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

export const updateApplication = (userId, applicationId, applicationData) => {
  return updateDoc(doc(db, 'users', userId, 'applications', applicationId), {
    ...applicationData,
    updatedAt: new Date()
  });
};

export const deleteApplication = (userId, applicationId) => {
  return deleteDoc(doc(db, 'users', userId, 'applications', applicationId));
};

export const getApplications = async (userId) => {
  const applicationsRef = collection(db, 'users', userId, 'applications');
  const querySnapshot = await getDocs(applicationsRef);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
