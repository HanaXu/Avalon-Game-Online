import firebase from 'firebase'

// Initialize Firebase
var config = {
    apiKey: "AIzaSyC_0DpX0DNsW0WqtBq88BlQc1MntzEL3ZY",
    authDomain: "avalonline-a8a5b.firebaseapp.com",
    databaseURL: "https://avalonline-a8a5b.firebaseio.com",
    projectId: "avalonline-a8a5b",
    storageBucket: "avalonline-a8a5b.appspot.com",
    messagingSenderId: "932679206673"
};

var fire = firebase.intializeApp(config);
export default fire;