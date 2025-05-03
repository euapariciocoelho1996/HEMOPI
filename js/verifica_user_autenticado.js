/**
 * Authentication status manager
 * Handles user login state and UI updates
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDul81cb5or7oR8HCs5I_Vw-SHm-ORHshI",
    authDomain: "teste-2067f.firebaseapp.com",
    projectId: "teste-2067f",
    storageBucket: "teste-2067f.firebasestorage.app",
    messagingSenderId: "160483034987",
    appId: "1:160483034987:web:944eb621b02efea11b2e2e"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/**
 * Updates the header UI based on user authentication status
 * @param {Object} user - Firebase user object or null if not authenticated
 */
function updateHeaderUI(user) {
    const userHeader = document.getElementById("user-header-options");
    if (!userHeader) return;

    if (user) {
        // User is signed in - show user menu
        userHeader.innerHTML = `
            <div class="user-info">
                <span class="user-greeting">
                    Olá, <strong>Herói</strong> ❤️
                </span>
                <a href="perfil.html" class="profile-link">Ver Perfil</a>
                <button id="logout-btn" class="logout-button">Sair</button>
            </div>
        `;

        // Add logout handler
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                signOut(auth).then(() => {
                    window.location.reload();
                }).catch(error => {
                    console.error("Erro ao fazer logout:", error);
                });
            });
        }
    } else {
        // User is not signed in - show login link
        userHeader.innerHTML = `
            <a href="login.html" class="login">
                <img src="img/login.png" alt="Ícone de login" class="icon-login">
                Entrar
            </a>
        `;
    }
}

// Monitor authentication state changes
onAuthStateChanged(auth, (user) => {
    console.log("Usuário autenticado:", user);  // Verificando o status do usuário no console
    updateHeaderUI(user);
    
    // Dispatch custom event for other components that might need auth info
    const authEvent = new CustomEvent('authStateChanged', { 
        detail: { isAuthenticated: !!user, user } 
    });
    document.dispatchEvent(authEvent);
});
