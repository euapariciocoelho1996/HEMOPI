import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);

// Função para verificar se o usuário está autenticado
export function checkAuthStatus() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe(); // Para de escutar mudanças
            resolve(user);
        });
    });
}

// Função para redirecionar usuário autenticado
export function redirectIfAuthenticated() {
    checkAuthStatus().then((user) => {
        if (user) {
            // Se o usuário estiver logado, redireciona para o perfil
            window.location.href = 'perfil.html';
        }
    });
}

// Função para redirecionar usuário não autenticado
export function redirectIfNotAuthenticated() {
    checkAuthStatus().then((user) => {
        if (!user) {
            // Se o usuário não estiver logado, redireciona para login
            window.location.href = 'login.html';
        }
    });
}

// Exportar auth para uso em outros módulos
export { auth }; 