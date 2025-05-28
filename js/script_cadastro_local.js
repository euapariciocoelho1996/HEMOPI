/**
 * Local registration functionality
 * Handles registration of blood donation locations
 */

import { app } from './firebase-config.js';
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDocument, setDocument, queryDocuments } from './firebase-services.js';
import { validateEmail, validateCNPJ, validatePassword } from './utils.js';
import { initAuthStateMonitoring } from './auth-manager.js';

// Initialize Firebase services
const auth = getAuth(app);

/**
 * Shows field error message
 * @param {string} id - Field ID without 'local-' prefix
 * @param {string} message - Error message
 */
function showFieldError(id, message) {
    const span = document.getElementById(`error-${id}`);
    const input = document.getElementById(`local-${id}`);
    if (span) {
        span.textContent = message;
        span.style.display = "block";
        input.classList.add("error");
    }
}

/**
 * Clears field error
 * @param {string} id - Field ID without 'local-' prefix
 */
function clearFieldError(id) {
    const span = document.getElementById(`error-${id}`);
    const input = document.getElementById(`local-${id}`);
    if (span) {
        span.textContent = "";
        span.style.display = "none";
        input.classList.remove("error");
    }
}

/**
 * Checks if CNPJ already exists
 * @param {string} cnpj - CNPJ to check
 * @returns {Promise<boolean>} - True if CNPJ exists
 */
async function isCNPJExists(cnpj) {
    const localData = await getDocument("locais", cnpj);
    return !!localData;
}

/**
 * Checks if email already exists in locations
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} - True if email exists
 */
async function isEmailExistsInLocais(email) {
    const locations = await queryDocuments('locais', [['email', '==', email]]);
    return locations.length > 0;
}

/**
 * Validates and submits local registration form
 * @param {Event} event - Form submit event
 */
async function validateLocalForm(event) {
    event.preventDefault();

    const fields = ["name", "endereco", "contato", "email", "cnpj", "senha", "confirmar-senha"];
    fields.forEach(clearFieldError);

    const nome = document.getElementById("local-name").value.trim();
    const endereco = document.getElementById("local-endereco").value.trim();
    const contato = document.getElementById("local-contato").value.trim();
    const email = document.getElementById("local-email").value.trim();
    const cnpj = document.getElementById("local-cnpj").value.trim();
    const senha = document.getElementById("local-senha").value;
    const confirmarSenha = document.getElementById("local-confirmar-senha").value;

    let hasError = false;

    // Validate fields
    if (!nome) {
        showFieldError("name", "Informe o nome do local.");
        hasError = true;
    }

    if (!endereco) {
        showFieldError("endereco", "Informe o endereço completo.");
        hasError = true;
    }

    if (!contato) {
        showFieldError("contato", "Informe um número de contato.");
        hasError = true;
    }

    if (!email || !validateEmail(email)) {
        showFieldError("email", "Informe um e-mail válido.");
        hasError = true;
    }

    if (!validateCNPJ(cnpj)) {
        showFieldError("cnpj", "CNPJ inválido (14 dígitos numéricos).");
        hasError = true;
    }

    const passwordValidation = validatePassword(senha);
    if (!passwordValidation.isValid) {
        showFieldError("senha", passwordValidation.message);
        hasError = true;
    }

    if (senha !== confirmarSenha) {
        showFieldError("confirmar-senha", "As senhas não coincidem.");
        hasError = true;
    }

    if (hasError) return;

    // Check for duplicates
    if (await isEmailExistsInLocais(email)) {
        showFieldError("email", "Este e-mail já está vinculado a um local.");
        return;
    }

    if (await isCNPJExists(cnpj)) {
        showFieldError("cnpj", "CNPJ já cadastrado.");
        return;
    }

    try {
        // Create user in Firebase Auth
        await createUserWithEmailAndPassword(auth, email, senha);

        // Save data to Firestore
        const success = await setDocument("locais", cnpj, {
            nome,
            endereco,
            contato,
            email,
            cnpj,
            tipo: "administrador",
            dataCadastro: new Date().toISOString()
        });

        if (success) {
            alert("Local cadastrado com sucesso!");
            document.getElementById("local-form").reset();
            window.location.href = "index.html";
        } else {
            throw new Error("Falha ao salvar dados do local");
        }

    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            showFieldError("email", "Este e-mail já está em uso para login.");
        } else {
            alert("Erro ao cadastrar: " + error.message);
        }
    }
}

/**
 * Shows/hides local form
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
 * Returns to login form
 */
function voltarLogin() {
    const authContainer = document.getElementById('auth-container');
    const localContainer = document.getElementById('local-form-container');
    
    authContainer.style.display = 'block';
    localContainer.style.display = 'none';
}

/**
 * Initialize the module
 */
function init() {
    const localForm = document.getElementById("local-form");
    if (localForm) {
        localForm.addEventListener("submit", validateLocalForm);
    }

    // Make functions globally available
    window.toggleLocalForm = toggleLocalForm;
    window.voltarLogin = voltarLogin;
    
    // Initialize authentication monitoring
    initAuthStateMonitoring();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
