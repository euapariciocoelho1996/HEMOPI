import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDul81cb5or7oR8HCs5I_Vw-SHm-ORHshI",
  authDomain: "teste-2067f.firebaseapp.com",
  projectId: "teste-2067f",
  storageBucket: "teste-2067f.appspot.com",
  messagingSenderId: "160483034987",
  appId: "1:160483034987:web:944eb621b02efea11b2e2e",
};

// Inicializa Firebase
import { app } from "./firebase-config.js";

const auth = getAuth(app);

// Atualiza o header com base no login
function updateHeaderUI(user) {
  const userHeader = document.getElementById("user-header-options");
  if (!userHeader) return;

  if (user) {
    userHeader.innerHTML = `
      <div class="user-info">
        <span class="user-greeting">Olá, <strong>Herói</strong> ❤️</span>
        <a href="perfil.html" class="profile-link">Ver Perfil</a>
        <button id="logout-btn" class="logout-button">Sair</button>
      </div>
    `;

    document.getElementById("logout-btn").addEventListener("click", () => {
      signOut(auth)
        .then(() => {
          window.location.reload();
        })
        .catch((error) => {
          console.error("Erro ao sair:", error);
        });
    });
  } else {
    userHeader.innerHTML = `
      <a href="login.html" class="login">
        <img src="img/login.png" alt="Ícone de login" class="icon-login">
        Entrar
      </a>
    `;
  }
}

// Monitora login/deslogamento
onAuthStateChanged(auth, (user) => {
  console.log("Usuário autenticado:", user);
  updateHeaderUI(user);
});
