// firebase-config.js
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

/* ================= FIREBASE CONFIG ================= */

const firebaseConfig = {
  apiKey: "AIzaSyDrFao0Rxpzh57lziGFZZDAPFsrmuC8U6A",
  authDomain: "applicationtracker-b8398.firebaseapp.com",
  projectId: "applicationtracker-b8398",
  storageBucket: "applicationtracker-b8398.firebasestorage.app",
  messagingSenderId: "668249794612",
  appId: "1:668249794612:web:cabc18fe0d691556ed0261",
  measurementId: "G-YM930XK7HW"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

/* ================= AUTH ================= */

export const registerUser = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);

/* ================= APPLICATIONS ================= */

export const addApplication = (userId, data) =>
  addDoc(collection(db, 'users', userId, 'applications'), {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  });

export const updateApplication = (userId, id, data) =>
  updateDoc(doc(db, 'users', userId, 'applications', id), {
    ...data,
    updatedAt: new Date()
  });

export const deleteApplication = (userId, id) =>
  deleteDoc(doc(db, 'users', userId, 'applications', id));

export const getApplications = async (userId) => {
  const snap = await getDocs(collection(db, 'users', userId, 'applications'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/* ================= COURSES ================= */

export const addCourse = (userId, course) =>
  addDoc(collection(db, 'users', userId, 'courses'), {
    ...course,
    completedLessons: 0,
    dailyLogs: {},
    createdAt: new Date(),
    updatedAt: new Date()
  });

export const getCourses = async (userId) => {
  const snap = await getDocs(collection(db, 'users', userId, 'courses'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const deleteCourse = (userId, courseId) =>
  deleteDoc(doc(db, 'users', userId, 'courses', courseId));

export const logDailyProgress = async (userId, courseId, lessons) => {
  const ref = doc(db, 'users', userId, 'courses', courseId);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error('Course not found');

  const course = snap.data();
  const today = new Date().toISOString().split('T')[0];

  const updatedLogs = {
    ...(course.dailyLogs || {}),
    [today]: (course.dailyLogs?.[today] || 0) + lessons
  };

  const updatedCompleted = (course.completedLessons || 0) + lessons;

  await updateDoc(ref, {
    dailyLogs: updatedLogs,
    completedLessons: updatedCompleted,
    updatedAt: new Date()
  });

  return {
    id: courseId,
    ...course,
    dailyLogs: updatedLogs,
    completedLessons: updatedCompleted
  };
};

/* ================= TIME TRACKER ================= */

// One document per day
export const getTimeLog = async (userId, date) => {
  const ref = doc(db, 'users', userId, 'timeLogs', date);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

export const saveTimeLog = async (userId, date, activities) => {
  const ref = doc(db, 'users', userId, 'timeLogs', date);
  await setDoc(
    ref,
    {
      date,
      activities,
      updatedAt: new Date(),
      createdAt: new Date()
    },
    { merge: true }
  );
};

// Fetch time logs for a date range (weekly analytics)
export const getTimeLogsInRange = async (userId, startDate, endDate) => {
  const logsRef = collection(db, 'users', userId, 'timeLogs');
  const q = query(
    logsRef,
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
};

/* ================= GOALS ================= */

// Default goals document (1 per user)
export const getGoals = async (userId) => {
  const ref = doc(db, 'users', userId, 'goals', 'default');
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

export const saveGoals = async (userId, goals) => {
  const ref = doc(db, 'users', userId, 'goals', 'default');
  await setDoc(ref, {
    goals,
    updatedAt: new Date()
  });
};

/* ================= LINKEDIN TRACKER ✅ NEW ================= */

export const addLinkedinEntry = (userId, data) =>
  addDoc(collection(db, 'users', userId, 'linkedinTracker'), {
    recruiter: {
      name: data.recruiter?.name || "",
      phone: data.recruiter?.phone || "",
      email: data.recruiter?.email || "",
      linkedin: data.recruiter?.linkedin || ""
    },
    postUrl: data.postUrl || "",
    status: data.status || "Applied",
    appliedDate: data.appliedDate,
    followedUp: data.followedUp ?? false,
    createdAt: new Date(),
    updatedAt: new Date()
  });

export const updateLinkedinEntry = (userId, id, updates) =>
  updateDoc(doc(db, 'users', userId, 'linkedinTracker', id), {
    ...updates,
    updatedAt: new Date()
  });

export const deleteLinkedinEntry = (userId, id) =>
  deleteDoc(doc(db, 'users', userId, 'linkedinTracker', id));

export const getLinkedinEntries = async (userId) => {
  const snap = await getDocs(
    collection(db, 'users', userId, 'linkedinTracker')
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
