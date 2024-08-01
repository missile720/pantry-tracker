// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAj13IiGtS08HIZEGkCD1hxUWZsl4KG_qM",
  authDomain: "pantry-tracker-1654d.firebaseapp.com",
  projectId: "pantry-tracker-1654d",
  storageBucket: "pantry-tracker-1654d.appspot.com",
  messagingSenderId: "375596629213",
  appId: "1:375596629213:web:ac9465bfc48d2522766f34",
  measurementId: "G-WMPY6CNJTZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export {firestore};