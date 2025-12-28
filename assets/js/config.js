// assets/js/config.js

const firebaseConfig = {
    apiKey: "AIzaSyAdDHLhUFXOBHHqaGpudSM5OKH1JhNPOiY",
    authDomain: "link-walnesia.firebaseapp.com",
    projectId: "link-walnesia",
    storageBucket: "link-walnesia.firebasestorage.app",
    messagingSenderId: "339988272638",
    appId: "1:339988272638:web:dec55d4b005278f0481caf"
};

// Email Admin (Untuk fitur hapus semua link)
const ADMIN_EMAIL = "prayogakeyza@gmail.com"; 

// Initialize Firebase secara global
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const provider = new firebase.auth.GoogleAuthProvider();
