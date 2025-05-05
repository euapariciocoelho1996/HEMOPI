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

/**
 * Initialize login functionality
 */
function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const toggleForms = document.querySelectorAll('.toggle-form');
    
    // Set up form toggle buttons
    setupFormToggles(toggleForms);
    
    // Set up form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
}

/**
 * Sets up form toggle functionality
 * @param {NodeList} toggleButtons - Toggle buttons
 */
function setupFormToggles(toggleButtons) {
    toggleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');
            const loginTitle = document.querySelector('.login-title');
            
            if (loginForm.style.display === 'none') {
                // Switching to login form
                loginForm.style.display = 'flex';
                registerForm.style.display = 'none';
                loginTitle.textContent = 'Login';
            } else {
                // Switching to register form
                loginForm.style.display = 'none';
                registerForm.style.display = 'flex';
                loginTitle.textContent = 'Cadastro';
            }
        });
    });
}

/**
 * Handles login form submission
 * @param {Event} e - Form submit event
 */
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showNotification('Erro', 'Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Erro', 'Por favor, insira um email válido.', 'error');
        return;
    }
    
    showLoadingState(true);
    
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
        showLoadingState(false);
    }
}

/**
 * Handles register form submission
 * @param {Event} e - Form submit event
 */
async function handleRegisterSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
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
    
    showLoadingState(true);
    
    try {
        const user = await registerUser(email, password, {
            nome: name,
            dataCadastro: new Date().toISOString()
        });
        
        if (user) {
            showNotification('Sucesso', 'Cadastro realizado com sucesso! Faça login para continuar.', 'success');
            
            // Reset form and switch to login
            document.getElementById('register-form').reset();
            
            // Automatically switch to login form
            document.querySelector('.toggle-form').click();
        }
    } catch (error) {
        handleRegistrationError(error);
    } finally {
        showLoadingState(false);
    }
}

/**
 * Shows or hides loading state
 * @param {boolean} isLoading - Whether to show loading state
 */
function showLoadingState(isLoading) {
    const loginButton = document.querySelector('#login-form button[type="submit"]');
    const registerButton = document.querySelector('#register-form button[type="submit"]');
    
    if (loginButton) {
        loginButton.disabled = isLoading;
        loginButton.textContent = isLoading ? 'Entrando...' : 'Entrar';
    }
    
    if (registerButton) {
        registerButton.disabled = isLoading;
        registerButton.textContent = isLoading ? 'Cadastrando...' : 'Cadastrar';
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
