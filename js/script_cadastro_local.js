// Import Firebase modules 
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDul81cb5or7oR8HCs5I_Vw-SHm-ORHshI",
    authDomain: "teste-2067f.firebaseapp.com",
    projectId: "teste-2067f",
    storageBucket: "teste-2067f.firebasestorage.app",
    messagingSenderId: "160483034987",
    appId: "1:160483034987:web:944eb621b02efea11b2e2e"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Mostrar erro abaixo do input
function showFieldError(id, message) {
    const span = document.getElementById(`error-${id}`);
    const input = document.getElementById(`local-${id}`);
    if (span) {
        span.textContent = message;
        span.style.display = "block";
        input.classList.add("error");
    }
}

// Limpar erro do input
function clearFieldError(id) {
    const span = document.getElementById(`error-${id}`);
    const input = document.getElementById(`local-${id}`);
    if (span) {
        span.textContent = "";
        span.style.display = "none";
        input.classList.remove("error");
    }
}

// Validar email
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

// Verifica se o CNPJ já está cadastrado no Firestore
async function isCNPJExists(cnpj) {
    const localRef = doc(db, "locais", cnpj);
    const localSnap = await getDoc(localRef);
    return localSnap.exists();
}

// Verifica se o e-mail já está cadastrado em um local (Firestore)
async function isEmailExistsInLocais(email) {
    const usersRef = collection(db, "locais");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

// Validação e envio do formulário de cadastro de local
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

    if (!cnpj.match(/^\d{14}$/)) {
        showFieldError("cnpj", "CNPJ inválido (14 dígitos numéricos).");
        hasError = true;
    }

    if (!senha || senha.length < 6) {
        showFieldError("senha", "A senha deve ter pelo menos 6 caracteres.");
        hasError = true;
    }

    if (senha !== confirmarSenha) {
        showFieldError("confirmar-senha", "As senhas não coincidem.");
        hasError = true;
    }

    if (hasError) return;

    // Verifica duplicidade no Firestore
    if (await isEmailExistsInLocais(email)) {
        showFieldError("email", "Este e-mail já está vinculado a um local.");
        return;
    }

    if (await isCNPJExists(cnpj)) {
        showFieldError("cnpj", "CNPJ já cadastrado.");
        return;
    }

    try {
        // Cria o usuário no Firebase Auth
        await createUserWithEmailAndPassword(auth, email, senha);

        // Salva os dados no Firestore
        const localRef = doc(db, "locais", cnpj);
        await setDoc(localRef, {
            nome,
            endereco,
            contato,
            email,
            cnpj,
            tipo: "administrador",
            dataCadastro: new Date().toISOString()
        });

        alert("Local cadastrado com sucesso!");
        document.getElementById("local-form").reset();

        updateHeaderUI({ displayName: nome, email: email });

        window.location.href = "index.html";

    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            showFieldError("email", "Este e-mail já está em uso para login.");
        } else {
            alert("Erro ao cadastrar: " + error.message);
        }
    }
}

// Atualiza o cabeçalho com o status de login
function updateHeaderUI(user) {
    const userHeader = document.getElementById("user-header-options");
    if (!userHeader) return;

    if (user) {
        userHeader.innerHTML = `
            <div class="user-info">
                <span class="user-greeting">
                    Olá, <strong>${user.displayName || "Herói"}</strong> ❤️
                </span>
                <a href="perfil.html" class="profile-link">Ver Perfil</a>
                <button id="logout-btn" class="logout-button">Sair</button>
            </div>
        `;
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                signOut(auth).then(() => {
                    window.location.reload();
                }).catch(error => {
                    console.error("Erro ao fazer logout:", error);
                });
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

// Monitorar mudanças no estado de autenticação
onAuthStateChanged(auth, (user) => {
    updateHeaderUI(user);
    const authEvent = new CustomEvent('authStateChanged', {
        detail: {
            isAuthenticated: !!user,
            user: user
        }
    });
    document.dispatchEvent(authEvent);
});

function voltarLogin() {
    document.getElementById("local-form-container").style.display = "none";
    document.getElementById("auth-container").style.display = "flex";
}

function toggleLocalForm() {
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("local-form-container").style.display = "flex";
}

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
