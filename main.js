import { initializeApp } from 'http://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword
} from 'http://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { collection, getDocs, getFirestore } from 'http://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// TODO: Replace the following with your app's Firebase project configuration
const config = {
    apiKey: "AIzaSyCTwAbnxplZU5_kHiXl5JQV808UMGl7OoE",
    authDomain: "csc490-parkingpal.firebaseapp.com",
    projectId: "csc490-parkingpal",
    storageBucket: "csc490-parkingpal.appspot.com",
    messagingSenderId: "935824088253",
    appId: "1:935824088253:web:6c41d988b7d0245c8a6bd4",
    measurementId: "G-RH52ZTPFXY"
  };

  const app = initializeApp(config);
  //const auth = app.getAuth;
  const auth = getAuth;
  const db = getFirestore;
  const email = "murie@farmingdale.edu";
  const password = "123456"
  
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode+" "+errorMessage)
  });
