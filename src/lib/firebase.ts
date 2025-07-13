
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBODQ3AaFgcWRCym5TPu_iluBacsH86m9E",
  authDomain: "quiz-builder-73d31.firebaseapp.com",
  projectId: "quiz-builder-73d31",
  storageBucket: "quiz-builder-73d31.firebasestorage.app",
  messagingSenderId: "815351485800",
  appId: "1:815351485800:web:5f7da560c11f0d851732dd",
  measurementId: "G-N8L2N4JP2K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
