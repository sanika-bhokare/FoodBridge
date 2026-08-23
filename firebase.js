/* ==========================================================================
   FoodBridge - Firebase Firestore Integration (Modular SDK v12)
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Your web app's Firebase configuration
// REPLACE the placeholder values below with your actual Firebase Project keys from Firebase Console

const firebaseConfig = {
  apiKey: "AIzaSyBKo03m2T66CBE60KwC25AvcVvbj2mAi7Q",
  authDomain: "zero-food-waste-platform.firebaseapp.com",
  projectId: "zero-food-waste-platform",
  storageBucket: "zero-food-waste-platform.firebasestorage.app",
  messagingSenderId: "404463929096",
  appId: "1:404463929096:web:b5389555b92cc955ed8ebd",
  measurementId: "G-MV3PLJ9TYT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { 
  db, 
  collection, 
  addDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
};
