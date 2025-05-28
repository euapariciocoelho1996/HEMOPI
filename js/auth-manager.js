/**
 * Authentication Manager for HEMOPI blood donation system
 * Centralizes authentication state management and UI updates
 */

import { app } from './firebase-config.js';
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const auth = getAuth(app);

/**
 * Updates the header UI based on user authentication status
 * @param {Object} user - Firebase user object or null if not authenticated
 */
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

        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", async () => {
                try {
                    await signOut(auth);
                    window.location.reload();
                } catch (error) {
                    console.error("Erro ao sair:", error);
                }
            });
        }
    } else {
        userHeader.innerHTML = `
            <a href="login.html" class="login">
                <img src="img/login.png" alt="Ícone de login" class="icon-login">
                Entrar
            </a>
        `;
    }
}

/**
 * Initializes authentication state monitoring
 * @param {Function} callback - Optional callback function to execute on auth state change
 */
export function initAuthStateMonitoring(callback = null) {
    onAuthStateChanged(auth, (user) => {
        console.log("Usuário autenticado:", user);
        updateHeaderUI(user);
        
        // Dispatch custom event for other components
        const authEvent = new CustomEvent('authStateChanged', { 
            detail: { isAuthenticated: !!user, user } 
        });
        document.dispatchEvent(authEvent);
        
        // Execute callback if provided
        if (callback && typeof callback === 'function') {
            callback(user);
        }
    });
}

/**
 * Gets the current authenticated user
 * @returns {Object|null} - Current user or null
 */
export function getCurrentUser() {
    return auth.currentUser;
}

/**
 * Gets the authentication instance
 * @returns {Object} - Firebase auth instance
 */
export function getAuthInstance() {
    return auth;
}

/**
 * Checks if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
export function isAuthenticated() {
    return !!auth.currentUser;
}

/**
 * Signs out the current user
 * @returns {Promise} - Sign out promise
 */
export async function signOutUser() {
    try {
        await signOut(auth);
        return true;
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        return false;
    }
} 