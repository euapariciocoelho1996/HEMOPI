// header.js
import { auth, signOut, onAuthStateChanged } from "./firebaseConfig.js";

document.addEventListener("DOMContentLoaded", () => {
  fetch("header.html")
    .then((res) => res.text())
    .then((html) => {
      const headerWrapper = document.createElement("div");
      headerWrapper.innerHTML = html;
      document.body.prepend(headerWrapper);

      const userHeader = document.getElementById("user-header");

      onAuthStateChanged(auth, (user) => {
        if (user) {
          userHeader.innerHTML = `
            <div class="user-info">
              <span class="user-greeting">Olá, <strong>Herói</strong> ❤️</span>
              <a href="perfil.html" class="profile-link">Ver Perfil</a>
              <button id="logout-btn" class="logout-button">Sair</button>
            </div>
          `;

          const logoutBtn = document.getElementById("logout-btn");
          logoutBtn?.addEventListener("click", () => {
            signOut(auth).then(() => window.location.reload());
          });
        } else {
          userHeader.innerHTML = `
            <a href="login.html" class="login">
              <img src="img/login.png" alt="Ícone de login" class="icon-login">
              Entrar
            </a>
          `;
        }
      });
    });
});
