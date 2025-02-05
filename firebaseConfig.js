import { initializeApp } from 'firebase/app';
import { getAuth} from "firebase/auth";
// Optionally import the services that you want to use
// import {...} from "firebase/auth";
import {getDatabase} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9GaW6uwfC2rp4OIDyN71KiaeRXT9j6Zk",
  authDomain: "teaapp-3d7ad.firebaseapp.com",
  databaseURL: "https://teaapp-3d7ad-default-rtdb.firebaseio.com",
  projectId: "teaapp-3d7ad",
  storageBucket: "teaapp-3d7ad.firebasestorage.app",
  messagingSenderId: "801737056763",
  appId: "1:801737056763:web:f5a0b27ae2471fa5532b5e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db =  getDatabase(app);
const storage = getStorage(app);
// Initialize Firebase

export {app, auth, db, storage}