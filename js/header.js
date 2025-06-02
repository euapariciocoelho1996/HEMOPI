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

// Função para gerenciar navegação com âncoras
function handleAnchorNavigation(event) {
  const target = event.target;
  if (target.tagName === 'A' && target.hash) {
    event.preventDefault();
    const hash = target.hash;
    
    // Se não estiver na página inicial, redireciona para index.html com a âncora
    if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
      window.location.href = `index.html${hash}`;
    } else {
      // Se já estiver na página inicial, apenas rola para a seção
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}

// Adiciona o evento de clique para todos os links do menu
function setupNavigation() {
  const menuLinks = document.querySelectorAll('.menu-centralizado a');
  menuLinks.forEach(link => {
    link.addEventListener('click', handleAnchorNavigation);
  });
}

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

// Inicializa a navegação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  
  // Se houver uma âncora na URL, rola para a seção correspondente
  if (window.location.hash) {
    const element = document.querySelector(window.location.hash);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }
});
