/**
 * User Login Module
 * Handles user authentication and login process
 */

import { auth, db } from "./firebase-config.js";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { showNotification, isValidEmail } from "./utils.js";
import { loginUser, registerUser } from "./user-management.js";

// Mensagens de motivação para o carrossel
const messages = [
    "Estamos quase lá... sua doação pode salvar vidas!",
    "Doe sangue, compartilhe vida!",
    "Você é o tipo certo de herói.",
    "Uma bolsa de sangue pode salvar até 4 vidas.",
    "A sua atitude hoje pode mudar o amanhã de alguém.",
    "Doar sangue é um ato de amor.",
    "Um pequeno gesto. Um grande impacto.",
    "Você tem o poder de salvar vidas. Use-o.",
    "Seja a esperança de alguém hoje.",
    "Doe sangue, doe vida, doe esperança."
];

/**
 * Initialize login functionality
 */
function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    const messageCarousel = document.getElementById('message-carousel');
    
    // Iniciar carrossel de mensagens
    if (messageCarousel) {
        iniciarCarrosselMensagens();
    }
    
    // Configurar formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    // Disponibilizar funções no escopo global
    window.toggleForm = toggleForm;
    window.toggleLocalForm = toggleLocalForm;
    window.voltarLogin = voltarLogin;
}

/**
 * Inicia o carrossel de mensagens motivacionais
 */
function iniciarCarrosselMensagens() {
    const messageElement = document.getElementById('message-carousel');
    if (!messageElement) return;
    
    let index = 0;
    
    function updateMessage() {
        messageElement.style.opacity = 0;
        setTimeout(() => {
            index = (index + 1) % messages.length;
            messageElement.textContent = messages[index];
            messageElement.style.opacity = 1;
        }, 500); // Duração do fade out
    }

    setInterval(updateMessage, 4000); // Troca a cada 4 segundos
}

/**
 * Alterna entre os formulários de login e cadastro
 * @param {string} action - 'login' ou 'signup'
 */
function toggleForm(action) {
    const formTitle = document.getElementById("form-title");
    const alternativeAction = document.getElementById("alternative-action");
    const signupLink = document.getElementById("signup-link");
    const form = document.getElementById("login-form");

    if (action === 'signup') {
        formTitle.textContent = "Crie sua conta";
        alternativeAction.textContent = "ou continue com:";
        signupLink.innerHTML = 'Já tem uma conta? <a href="javascript:void(0);" onclick="toggleForm(\'login\')">Faça login aqui</a>';
        form.innerHTML = `
            <input type="text" id="signup-name" placeholder="Nome completo" required>
            <input type="email" id="signup-email" placeholder="E-mail" required>
            <input type="password" id="signup-password" placeholder="Senha" required>
            <input type="password" id="signup-confirm-password" placeholder="Confirme a senha" required>
            <div id="signup-password-strength-message"></div>
            <button type="submit" class="submit-btn">Cadastrar</button>
        `;
        
        // Adicionar listener para o formulário de cadastro
        form.removeEventListener('submit', handleLoginSubmit);
        form.addEventListener('submit', handleSignupSubmit);
    } else {
        formTitle.textContent = "Entre com sua conta";
        alternativeAction.textContent = "ou continue com:";
        signupLink.innerHTML = 'Não tem uma conta? <a href="javascript:void(0);" onclick="toggleForm(\'signup\')">Cadastre-se aqui</a>';
        form.innerHTML = `
            <input type="email" id="email" placeholder="E-mail" required>
            <input type="password" id="password" placeholder="Senha" required>
            <div id="password-strength-message"></div>
            <button type="submit" class="submit-btn">Entrar</button>
        `;
        
        // Adicionar listener para o formulário de login
        form.removeEventListener('submit', handleSignupSubmit);
        form.addEventListener('submit', handleLoginSubmit);
    }
}

/**
 * Alterna para o formulário de cadastro de local
 */
function toggleLocalForm() {
    const authContainer = document.getElementById('auth-container');
    const localFormContainer = document.getElementById('local-form-container');
    
    if (authContainer && localFormContainer) {
        authContainer.style.display = 'none';
        localFormContainer.style.display = 'block';
    }
}

/**
 * Volta para o formulário de login
 */
function voltarLogin() {
    const authContainer = document.getElementById('auth-container');
    const localFormContainer = document.getElementById('local-form-container');
    
    if (authContainer && localFormContainer) {
        localFormContainer.style.display = 'none';
        authContainer.style.display = 'block';
    }
}

/**
 * Handles login form submission
 * @param {Event} e - Form submit event
 */
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showNotification('Erro', 'Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Erro', 'Por favor, insira um email válido.', 'error');
        return;
    }
    
    showLoadingState(true, 'login');
    
    try {
        const user = await loginUser(email, password);
        
        if (user) {
            showNotification('Sucesso', 'Login realizado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = 'perfil.html';
            }, 1500);
        }
    } catch (error) {
        handleLoginError(error);
    } finally {
        showLoadingState(false, 'login');
    }
}

/**
 * Handles signup form submission
 * @param {Event} e - Form submit event
 */
async function handleSignupSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    // Validate form fields
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Erro', 'Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Erro', 'Por favor, insira um email válido.', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Erro', 'As senhas não coincidem.', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Erro', 'A senha deve ter pelo menos 6 caracteres.', 'error');
        return;
    }
    
    showLoadingState(true, 'signup');
    
    try {
        const user = await registerUser(email, password, {
            nome: name,
            dataCadastro: new Date().toISOString()
        });
        
        if (user) {
            showNotification('Sucesso', 'Cadastro realizado com sucesso! Faça login para continuar.', 'success');
            
            // Voltar para o formulário de login
            toggleForm('login');
        }
    } catch (error) {
        handleRegistrationError(error);
    } finally {
        showLoadingState(false, 'signup');
    }
}

/**
 * Shows or hides loading state
 * @param {boolean} isLoading - Whether to show loading state
 * @param {string} formType - Type of form ('login' or 'signup')
 */
function showLoadingState(isLoading, formType) {
    let button;
    
    if (formType === 'login') {
        button = document.querySelector('#login-form button[type="submit"]');
        if (button) {
            button.disabled = isLoading;
            button.textContent = isLoading ? 'Entrando...' : 'Entrar';
        }
    } else if (formType === 'signup') {
        button = document.querySelector('#login-form button[type="submit"]');
        if (button) {
            button.disabled = isLoading;
            button.textContent = isLoading ? 'Cadastrando...' : 'Cadastrar';
        }
    }
}

/**
 * Handles login errors
 * @param {Error} error - Login error
 */
function handleLoginError(error) {
    console.error('Erro de login:', error);
    
    let message = 'Falha no login. Verifique suas credenciais.';
    
    switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            message = 'Email ou senha incorretos.';
            break;
        case 'auth/too-many-requests':
            message = 'Muitas tentativas de login. Tente novamente mais tarde.';
            break;
    }
    
    showNotification('Erro', message, 'error');
}

/**
 * Handles registration errors
 * @param {Error} error - Registration error
 */
function handleRegistrationError(error) {
    console.error('Erro de cadastro:', error);
    
    let message = 'Falha no cadastro. Tente novamente.';
    
    switch (error.code) {
        case 'auth/email-already-in-use':
            message = 'Este email já está em uso.';
            break;
        case 'auth/invalid-email':
            message = 'Email inválido.';
            break;
        case 'auth/weak-password':
            message = 'A senha deve ter pelo menos 6 caracteres.';
            break;
    }
    
    showNotification('Erro', message, 'error');
}

// Initialize the page when DOM is ready
document.addEventListener('DOMContentLoaded', initLoginPage);
