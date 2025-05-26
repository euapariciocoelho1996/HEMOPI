// js/firebase-config.js
import {
  initializeApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyDul81cb5or7oR8HCs5I_Vw-SHm-ORHshI",
  authDomain: "teste-2067f.firebaseapp.com",
  projectId: "teste-2067f",
  storageBucket: "teste-2067f.appspot.com",
  messagingSenderId: "160483034987",
  appId: "1:160483034987:web:944eb621b02efea11b2e2e",
};

// Só inicializa se ainda não tiver apps ativos
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export { app };
