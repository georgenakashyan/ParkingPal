import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, getFirestore } from 'firebase/firestore';


// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCTwAbnxplZU5_kHiXl5JQV808UMGl7OoE",
    authDomain: "csc490-parkingpal.firebaseapp.com",
    projectId: "csc490-parkingpal",
    storageBucket: "csc490-parkingpal.appspot.com",
    messagingSenderId: "935824088253",
    appId: "1:935824088253:web:6c41d988b7d0245c8a6bd4",
    measurementId: "G-RH52ZTPFXY"
  };

const firebaseapp = initializeApp(firebaseConfig);
const auth = getAuth;
const db = getFirestore;
db.collection('Todos').getDocs();
const todosCol = collection(db, 'Todos');
const snapshot = await getDocs(todosCol);

auth.onAuthStateChanged((user) => {

});
onAuthStateChanged(auth, (user) => {
    if (user =! null) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      const uid = user.uid;
      // ...
    } else {
      // User is signed out
      // ...
    }
  });
