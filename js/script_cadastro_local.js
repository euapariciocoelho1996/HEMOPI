// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDul81cb5or7oR8HCs5I_Vw-SHm-ORHshI",
    authDomain: "teste-2067f.firebaseapp.com",
    projectId: "teste-2067f",
    storageBucket: "teste-2067f.firebasestorage.app",
    messagingSenderId: "160483034987",
    appId: "1:160483034987:web:944eb621b02efea11b2e2e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/**
 * Mostrar alerta
 */
function showAlert(message) {
    alert(message);
}

/**
 * Voltar para tela anterior
 */
function voltarLogin() {
    document.getElementById("local-form-container").style.display = "none";
    document.getElementById("auth-container").style.display = "flex";
}

/**
 * Mostrar formulário de cadastro de local
 */
function toggleLocalForm() {
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("local-form-container").style.display = "flex";
}

/**
 * Validar email
 */
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

/**
 * Validação e envio do formulário de cadastro de local
 */
function validateLocalForm(event) {
    event.preventDefault();

    const nome = document.getElementById("local-name").value.trim();
    const endereco = document.getElementById("local-endereco").value.trim();
    const contato = document.getElementById("local-contato").value.trim();
    const email = document.getElementById("local-email").value.trim();
    const cnpj = document.getElementById("local-cnpj").value.trim();

    if (!nome || !endereco || !contato || !email || !cnpj) {
        showAlert("Por favor, preencha todos os campos.");
        return false;
    }

    if (!validateEmail(email)) {
        showAlert("Por favor, insira um e-mail válido.");
        return false;
    }

    const cnpjRegex = /^\d{14}$/;
    if (!cnpjRegex.test(cnpj)) {
        showAlert("CNPJ inválido. Insira apenas os 14 números.");
        return false;
    }

    const localRef = ref(database, 'locais/' + cnpj);
    set(localRef, {
        nome: nome,
        endereco: endereco,
        contato: contato,
        email: email,
        cnpj: cnpj,
        dataCadastro: new Date().toISOString()
    })
    .then(() => {
        showAlert("Local cadastrado com sucesso!");
        document.getElementById("local-form").reset();
        voltarLogin();
    })
    .catch((error) => {
        showAlert("Erro ao salvar: " + error.message);
    });

    return true;
}

/**
 * Inicialização
 */
function init() {
    const localForm = document.getElementById('local-form');
    if (localForm) {
        localForm.addEventListener('submit', validateLocalForm);
    }

    window.toggleLocalForm = toggleLocalForm;
    window.voltarLogin = voltarLogin;
    window.validateLocalForm = validateLocalForm;
}

document.addEventListener('DOMContentLoaded', init);
