/**
 * User login and registration functionality
 * Handles authentication forms and Google login
 */

import { app } from './firebase-config.js';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { validateEmail, validatePassword } from './utils.js';

// Initialize Firebase services
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

/**
 * Animated message carousel
 */
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

// Constants
const FADE_DURATION = 500;
const MESSAGE_INTERVAL = 4000;

let currentMessageIndex = 0;
let messageInterval;

/**
 * Rotates messages in the carousel
 */
function rotateMessages() {
    const messageElement = document.getElementById('message-carousel');
    if (!messageElement) return;

    messageInterval = setInterval(() => {
        messageElement.style.opacity = '0';
        
        setTimeout(() => {
            currentMessageIndex = (currentMessageIndex + 1) % messages.length;
            messageElement.textContent = messages[currentMessageIndex];
            messageElement.style.opacity = '1';
        }, FADE_DURATION);
    }, MESSAGE_INTERVAL);
}

/**
 * Initializes Google authentication
 */
function initGoogleAuth() {
    const googleLoginDiv = document.querySelector('.social-login');
    if (!googleLoginDiv) return;

    googleLoginDiv.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log('Login com Google bem-sucedido:', result.user);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Erro no login com Google:', error);
            alert('Erro ao fazer login com Google: ' + error.message);
        }
    });
}

/**
 * Shows field error message
 * @param {string} fieldId - Field ID
 * @param {string} message - Error message
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create and add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '5px';

    field.parentNode.insertBefore(errorDiv, field.nextSibling);
    field.style.borderColor = '#dc3545';
}

/**
 * Clears field error
 * @param {string} fieldId - Field ID
 */
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
    field.style.borderColor = '';
}

/**
 * Validates and submits the form
 * @param {Event} event - Form submit event
 */
async function validateForm(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const isSignup = document.getElementById('form-title').textContent.includes('Cadastre-se');

    // Clear previous errors
    clearFieldError('email');
    clearFieldError('password');

    let hasError = false;

    // Validate email
    if (!email) {
        showFieldError('email', 'E-mail é obrigatório');
        hasError = true;
    } else if (!validateEmail(email)) {
        showFieldError('email', 'E-mail inválido');
        hasError = true;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        showFieldError('password', passwordValidation.message);
        hasError = true;
    }

    if (hasError) return;

    try {
        if (isSignup) {
            // Create new user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Usuário criado:', userCredential.user);
            alert('Conta criada com sucesso!');
        } else {
            // Sign in existing user
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Login bem-sucedido:', userCredential.user);
        }
        
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erro na autenticação:', error);
        
        let errorMessage = 'Erro na autenticação';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Usuário não encontrado';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Senha incorreta';
                break;
            case 'auth/email-already-in-use':
                errorMessage = 'E-mail já está em uso';
                break;
            case 'auth/weak-password':
                errorMessage = 'Senha muito fraca';
                break;
            case 'auth/invalid-email':
                errorMessage = 'E-mail inválido';
                break;
            default:
                errorMessage = error.message;
        }
        
        alert(errorMessage);
    }
}

/**
 * Toggles between login and signup forms
 * @param {string} mode - 'login' or 'signup'
 */
function toggleForm(mode) {
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.querySelector('.submit-btn');
    const signupLink = document.getElementById('signup-link');
    const alternativeAction = document.getElementById('alternative-action');

    if (mode === 'signup') {
        formTitle.textContent = 'Cadastre-se';
        submitBtn.textContent = 'Cadastrar';
        signupLink.innerHTML = 'Já tem uma conta? <a href="javascript:void(0);" onclick="toggleForm(\'login\')">Entre aqui</a>';
        alternativeAction.textContent = 'ou cadastre-se com:';
    } else {
        formTitle.textContent = 'Entre com sua conta';
        submitBtn.textContent = 'Entrar';
        signupLink.innerHTML = 'Não tem uma conta? <a href="javascript:void(0);" onclick="toggleForm(\'signup\')">Cadastre-se aqui</a>';
        alternativeAction.textContent = 'ou continue com:';
    }

    // Clear form and errors
    document.getElementById('login-form').reset();
    clearFieldError('email');
    clearFieldError('password');
}

/**
 * Shows/hides local registration form
 */
function toggleLocalForm() {
    const authContainer = document.getElementById('auth-container');
    const localContainer = document.getElementById('local-form-container');
    
    if (localContainer.style.display === 'none' || !localContainer.style.display) {
        authContainer.style.display = 'none';
        localContainer.style.display = 'block';
    } else {
        authContainer.style.display = 'block';
        localContainer.style.display = 'none';
    }
}

/**
 * Returns to login form from local registration
 */
function voltarLogin() {
    const authContainer = document.getElementById('auth-container');
    const localContainer = document.getElementById('local-form-container');
    
    authContainer.style.display = 'block';
    localContainer.style.display = 'none';
}

/**
 * Initialize page functionality
 */
function init() {
    rotateMessages();
    initGoogleAuth();

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', validateForm);
    }

    // Make functions globally available
    window.toggleForm = toggleForm;
    window.validateForm = validateForm;
    window.toggleLocalForm = toggleLocalForm;
    window.voltarLogin = voltarLogin;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
