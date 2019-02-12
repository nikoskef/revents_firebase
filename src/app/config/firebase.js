import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: "revent-5541c.firebaseapp.com",
  databaseURL: "https://revent-5541c.firebaseio.com",
  projectId: "revent-5541c",
  storageBucket: "revent-5541c.appspot.com",
  messagingSenderId: "579716772134"
};

firebase.initializeApp(firebaseConfig);
firebase.firestore();

firebase.database();

export const auth = firebase.auth();
export default firebase;
