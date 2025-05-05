/**
 * Authentication Status Manager
 * Handles user login state and UI updates
 */

import { auth } from "./firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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
            logoutBtn.addEventListener("click", handleLogout);
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

/**
 * Handles the logout process
 */
function handleLogout() {
    signOut(auth)
        .then(() => {
            window.location.reload();
        })
        .catch(error => {
            console.error("Erro ao fazer logout:", error);
        });
}

/**
 * Initializes the authentication state listener
 */
function initAuthStateListener() {
    auth.onAuthStateChanged((user) => {
        console.log("Usuário autenticado:", !!user);
        updateHeaderUI(user);
        
        // Dispatch custom event for other components that might need auth info
        dispatchAuthEvent(user);
    });
}

/**
 * Dispatches a custom event with the current authentication state
 * @param {Object|null} user - The current user or null if not authenticated
 */
function dispatchAuthEvent(user) {
    const authEvent = new CustomEvent('authStateChanged', { 
        detail: { isAuthenticated: !!user, user } 
    });
    document.dispatchEvent(authEvent);
}

// Initialize authentication listener when DOM is ready
document.addEventListener('DOMContentLoaded', initAuthStateListener);

// Export functions for potential use in other modules
export { updateHeaderUI, handleLogout };
