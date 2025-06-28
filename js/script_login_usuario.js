// Import Firebase modules
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { app } from "./firebase-config.js";

// Get auth instance from existing app
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

/**
 * Toggle between login and signup forms
 * @param {string} action - 'login' or 'signup'
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
            <input type="text" id="name" placeholder="Nome completo" required>
            <input type="email" id="signup-email" placeholder="E-mail" required>
            <input type="password" id="signup-password" placeholder="Senha" required>
            <div id="signup-password-strength-message"></div>
            <button type="submit" class="submit-btn">Cadastrar</button>
        `;
        
        const passwordInput = document.getElementById("signup-password");
        if (passwordInput) {
            passwordInput.addEventListener('input', checkPasswordStrength);
        }
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
    }
}

/**
 * Check password strength while typing
 * @param {Event} event - Input event
 */
function checkPasswordStrength(event) { 
    const password = event.target.value;
    const messageElement = document.getElementById('signup-password-strength-message');
    if (!messageElement) return;

    // Aplica os estilos solicitados
    messageElement.style.fontSize = "0.85rem";
    messageElement.style.margin = "8px 0";

    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (strongPasswordRegex.test(password)) {
        messageElement.textContent = "Senha forte!";
        messageElement.style.color = "green";
    } else {
        messageElement.textContent = "A senha precisa ter pelo menos 8 caracteres, incluindo uma letra maiúscula, um número e um caractere especial.";
        messageElement.style.color = "red";
    }
}


/**
 * Validate login/signup form
 * @param {Event} event - Form submit event
 * @returns {boolean} - Whether form is valid
 */
function validateForm(event) {
    event.preventDefault();
    
    const isSignup = !!document.getElementById("signup-email");
    
    if (isSignup) {
        return validateSignupForm();
    } else {
        return validateLoginForm();
    }
}

/**
 * Exibe mensagem de erro abaixo do campo de input
 * @param {HTMLElement} inputElement - O campo input para mostrar erro
 * @param {string} message - Mensagem de erro a exibir
 */
function showFieldError(inputElement, message) {
    if (!inputElement) return;

    // Verifica se já existe uma mensagem de erro abaixo do input
    let errorElement = inputElement.nextElementSibling;
    
    // Se não existe ou não é um erro, cria um novo
    if (!errorElement || !errorElement.classList.contains('field-error')) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
    }

    errorElement.textContent = message;
    errorElement.style.color = 'red';
    errorElement.style.fontSize = '0.9em';
    errorElement.style.marginTop = '4px';
}

/**
 * Limpa todas as mensagens de erro nos campos do formulário
 */
function clearFieldErrors() {
    const errors = document.querySelectorAll('.field-error');
    errors.forEach(errorEl => errorEl.remove());
}

/**
 * Validate signup form fields
 * @returns {boolean} - Whether form is valid
 */
function validateSignupForm() {
    clearFieldErrors();

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("signup-email");
    const passwordInput = document.getElementById("signup-password");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    let valid = true;

    if (!name) {
        showFieldError(nameInput, "Por favor, preencha o nome completo.");
        valid = false;
    }
    if (!email) {
        showFieldError(emailInput, "Por favor, preencha o e-mail.");
        valid = false;
    } else if (!validateEmail(email)) {
        showFieldError(emailInput, "Por favor, insira um e-mail válido.");
        valid = false;
    }

    if (!password) {
        showFieldError(passwordInput, "Por favor, preencha a senha.");
        valid = false;
    } else if (!validatePasswordStrength(password)) {
        showFieldError(passwordInput, "A senha não é forte o suficiente.");
        valid = false;
    }

    if (!valid) return false;
    
    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            Swal.fire({
                title: 'Cadastro Realizado!',
                text: 'Sua conta foi criada com sucesso.',
                icon: 'success',
                confirmButtonColor: '#ce483c',
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            }).then(() => {
                window.location.href = "index.html";
            });
        })
        .catch((error) => {
            if (error.code === 'auth/email-already-in-use') {
                showFieldError(emailInput, "Este e-mail já está em uso.");
            } else {
                Swal.fire({
                    title: 'Erro',
                    text: 'Erro ao cadastrar: ' + error.message,
                    icon: 'error',
                    confirmButtonColor: '#ce483c'
                });
            }
        });
    
    return true;
}

/**
 * Validate login form fields
 * @returns {boolean} - Whether form is valid
 */
function validateLoginForm() {
    clearFieldErrors();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    let valid = true;

    if (!email) {
        showFieldError(emailInput, "Por favor, preencha o e-mail.");
        valid = false;
    } else if (!validateEmail(email)) {
        showFieldError(emailInput, "Por favor, insira um e-mail válido.");
        valid = false;
    }

    

    if (!valid) return false;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location.href = "index.html";
        })
        .catch((error) => {
            if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                showFieldError(passwordInput, "E-mail ou senha incorretos.");
            } else {
                showFieldError(passwordInput, "E-mail ou senha incorretos.");
            }
        });
    
    return true;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} - Whether password is strong enough
 */
function validatePasswordStrength(password) {
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
}

/**
 * Show an alert message to the user
 * (Pode ser usado para alertas gerais, não para erros de campo)
 * @param {string} message - Message to display
 */
function showAlert(message) {
    alert(message);
}

/**
 * Rotate through motivational messages
 */
function rotateMessages() {
    const messageElement = document.getElementById('message-carousel');
    if (!messageElement) return;
    
    let index = 0;
    
    function updateMessage() {
        messageElement.style.opacity = 0;
        setTimeout(() => {
            index = (index + 1) % messages.length;
            messageElement.textContent = messages[index];
            messageElement.style.opacity = 1;
        }, FADE_DURATION);
    }

    setInterval(updateMessage, MESSAGE_INTERVAL);
}

/**
 * Initialize Google Auth
 */
function initGoogleAuth() {
    const googleBtn = document.querySelector('.social-login');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            signInWithPopup(auth, provider)
                .then((result) => {
                    showAlert(`Bem-vindo, ${result.user.displayName || 'Doador'}`);
                    window.location.href = "index.html";
                })
                .catch((error) => {
                    showAlert(`Erro de autenticação: ${error.message}`);
                });
        });
    }
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

    // Disponibiliza funções globalmente
    window.toggleForm = toggleForm;
    window.validateForm = validateForm;
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
