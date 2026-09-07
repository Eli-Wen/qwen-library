// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGQH9GhYME7FMpBT8Y0Vfn8h_o8DWFips",
  authDomain: "circularmelb.firebaseapp.com",
  projectId: "circularmelb",
  storageBucket: "circularmelb.firebasestorage.app",
  messagingSenderId: "209509901035",
  appId: "1:209509901035:web:8a2da9362513dddaba14ae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export { auth, db };