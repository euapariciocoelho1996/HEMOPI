/**
 * Authentication Status Manager
 * Handles global authentication state and redirects
 */

import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Verifica se estamos na página de login
const isLoginPage = window.location.pathname.includes('login.html');

/**
 * Inicializa o gerenciador de estado de autenticação
 */
function initAuthStatusManager() {
    onAuthStateChanged(auth, (user) => {
        handleAuthStateChange(user);
    });
}

/**
 * Gerencia mudanças no estado de autenticação
 * @param {Object|null} user - Usuário autenticado ou null
 */
function handleAuthStateChange(user) {
    console.log('Estado de autenticação:', user ? 'Autenticado' : 'Não autenticado');
    
    if (isLoginPage && user) {
        // Se estiver na página de login e o usuário estiver logado, redireciona para o perfil
        console.log('Usuário já autenticado, redirecionando para perfil...');
        setTimeout(() => {
            window.location.href = 'perfil.html';
        }, 1000);
    }
    
    // Atualiza a interface com base no estado de autenticação
    updateUIForAuth(user);
}

/**
 * Atualiza a interface com base no estado de autenticação
 * @param {Object|null} user - Usuário autenticado ou null
 */
function updateUIForAuth(user) {
    // Esta função pode ser expandida para atualizar diferentes partes da UI
    // Atualmente, gerencia apenas a página de login
    
    if (isLoginPage) {
        const authContainer = document.getElementById('auth-container');
        const localFormContainer = document.getElementById('local-form-container');
        
        if (user && authContainer) {
            // Se o usuário estiver logado na página de login, mostra uma mensagem
            authContainer.innerHTML = `
                <div class="auth-success">
                    <h2>Você já está logado!</h2>
                    <p>Redirecionando para sua página de perfil...</p>
                </div>
            `;
            
            if (localFormContainer) {
                localFormContainer.style.display = 'none';
            }
        }
    }
}

// Inicializa o gerenciador quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initAuthStatusManager); 