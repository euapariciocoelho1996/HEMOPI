import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDul81cb5or7oR8HCs5I_Vw-SHm-ORHshI",
    authDomain: "teste-2067f.firebaseapp.com",
    projectId: "teste-2067f",
    storageBucket: "teste-2067f.appspot.com",
    messagingSenderId: "160483034987",
    appId: "1:160483034987:web:944eb621b02efea11b2e2e"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Show user notification
 */
function showNotification(title, message, type = 'info') {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: title,
            text: message,
            icon: type,
            confirmButtonColor: '#ce483c'
        });
    } else {
        alert(`${title}: ${message}`);
    }
}

/**
 * Load data from 'locais' by email
 * @param {string} email - User email
 */
async function loadLocalByEmail(email) {
    try {
        const locaisRef = collection(db, "locais");
        const q = query(locaisRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        // Retorna o primeiro documento encontrado
        return querySnapshot.docs[0].data();

    } catch (error) {
        console.error("Erro ao buscar local:", error);
        showNotification('Erro', 'Não foi possível carregar os dados do local.', 'error');
        return null;
    }
}

/**
 * Render local data on the page
 * @param {Object} localData
 */
function renderLocalData(localData) {
    const container = document.getElementById('localInfo');
    if (!container) return;

    container.innerHTML = `
        <div class="profile-card">
            <h3>Informações do Local</h3>
            <p><strong>Nome do Local:</strong> ${localData.nome || 'Não informado'}</p>
            <p><strong>Endereço:</strong> ${localData.endereco || 'Não informado'}</p>
            <p><strong>Telefone:</strong> ${localData.telefone || 'Não informado'}</p>
            <p><strong>Email:</strong> ${localData.email || 'Não informado'}</p>
        </div>
    `;
}

/**
 * Initialize local info page
 */
function initLocalPage() {
    const localInfoContainer = document.getElementById('localInfo');

    if (!localInfoContainer) {
        console.error("Elemento localInfo não encontrado no DOM");
        return;
    }

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            showNotification('Acesso negado', 'Você precisa estar logado para acessar os dados.', 'warning');
            localInfoContainer.innerHTML = `
                <div class="profile-card">
                    <h3>Não autenticado</h3>
                    <p>Você precisa fazer login para acessar esta área.</p>
                    <a href="login.html" class="login-link">Fazer Login</a>
                </div>
            `;
            return;
        }

        const localData = await loadLocalByEmail(user.email);

        if (localData) {
            renderLocalData(localData);
        } else {
            localInfoContainer.innerHTML = `
                <div class="profile-card">
                    <h3>Local não encontrado</h3>
                    <p>Nenhum local cadastrado com este email.</p>
                </div>
            `;
        }
    });
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', initLocalPage);
