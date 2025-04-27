/**
 * User Profile Management
 * Handles user profile data display and updates
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDul81cb5or7oR8HCs5I_Vw-SHm-ORHshI",
    authDomain: "teste-2067f.firebaseapp.com",
    projectId: "teste-2067f",
    storageBucket: "teste-2067f.appspot.com",
    messagingSenderId: "160483034987",
    appId: "1:160483034987:web:944eb621b02efea11b2e2e"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Show notification to user
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
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
 * Load user profile data from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} - User data or null if not found
 */
async function loadUserProfile(uid) {
    try {
        const userRef = doc(db, "usuarios", uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error("Error loading user profile:", error);
        showNotification('Erro', 'Não foi possível carregar os dados do perfil.', 'error');
        return null;
    }
}

/**
 * Save user profile data to Firestore
 * @param {string} uid - User ID
 * @param {Object} data - User data to save
 * @returns {Promise<boolean>} - Whether save was successful
 */
async function saveUserProfile(uid, data) {
    try {
        const userRef = doc(db, "usuarios", uid);
        await setDoc(userRef, data, { merge: true });
        return true;
    } catch (error) {
        console.error("Error saving user profile:", error);
        showNotification('Erro', 'Não foi possível salvar os dados do perfil.', 'error');
        return false;
    }
}

/**
 * Render user profile data in the UI
 * @param {Object} userData - User profile data
 * @param {boolean} isAdmin - Whether user is an admin
 */
function renderUserProfile(userData, isAdmin = false) {
    const profileInfoContainer = document.getElementById('profileInfo');
    if (!profileInfoContainer) return;

    profileInfoContainer.innerHTML = `
        <div class="profile-card">
            <h3>Dados Cadastrados</h3>
            <p><strong>Nome:</strong> ${userData.nome || 'Não informado'}</p>
            <p><strong>Idade:</strong> ${userData.idade || 'Não informada'}</p>
            <p><strong>Sexo:</strong> ${userData.sexo || 'Não informado'}</p>
            <p><strong>Rua:</strong> ${userData.rua || 'Não informada'}</p>
            <p><strong>Bairro:</strong> ${userData.bairro || 'Não informado'}</p>

            <!-- Informações de doações e datas -->
            <div class="donation-info">
                <p><i class="heart-icon">❤️</i> <strong>Doações:</strong> ${userData.doacoes || 0}</p>
                <p><i class="calendar-icon">📅</i> <strong>Última Doação:</strong> ${userData.ultimaDoacao || 'Não registrada'}</p>
                <p><i class="calendar-icon">⏳</i> <strong>Próxima Doação:</strong> ${userData.proximaDoacao || 'Não definida'}</p>
            </div>

            ${isAdmin ? '<button id="editarDoacao" class="btn-editar">Editar Doações</button>' : ''}
        </div>
    `;

    // Add event listener for admin edit button
    if (isAdmin) {
        document.getElementById('editarDoacao').addEventListener('click', () => {
            openEditDonationForm(userData);
        });
    }
}

/**
 * Display form for editing donation information
 * @param {Object} userData - Current user data
 */
function openEditDonationForm(userData) {
    Swal.fire({
        title: 'Editar Doações',
        width: 600,
        html: `
            <div class="form-container">
                <input type="number" id="doacoes" placeholder="Quantidade de Doações" class="form-field" value="${userData.doacoes || ''}">
                <input type="date" id="ultimaDoacao" placeholder="Última Doação" class="form-field" value="${userData.ultimaDoacao || ''}">
                <input type="date" id="proximaDoacao" placeholder="Próxima Doação" class="form-field" value="${userData.proximaDoacao || ''}">
            </div>
        `,
        customClass: {
            popup: 'popup-form'
        },
        confirmButtonText: 'Salvar',
        confirmButtonColor: '#ce483c',
        focusConfirm: false,
        preConfirm: () => {
            const doacoes = document.getElementById('doacoes').value.trim();
            const ultimaDoacao = document.getElementById('ultimaDoacao').value.trim();
            const proximaDoacao = document.getElementById('proximaDoacao').value.trim();

            return { doacoes, ultimaDoacao, proximaDoacao };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            // Update user data
            const updatedData = {
                ...userData,
                doacoes: result.value.doacoes,
                ultimaDoacao: result.value.ultimaDoacao,
                proximaDoacao: result.value.proximaDoacao
            };
            
            const saved = await saveUserProfile(auth.currentUser.uid, updatedData);
            
            if (saved) {
                showNotification('Sucesso', 'Doações atualizadas com sucesso.', 'success');
                renderUserProfile(updatedData, true);
            }
        }
    });
}

/**
 * Show form for creating or updating user profile
 */
function showProfileForm() {
    Swal.fire({
        title: 'Preencha seus dados',
        width: 600,
        html: `
            <div class="form-container">
                <input type="text" id="nome" placeholder="Nome completo" class="form-field" required>
                <input type="number" id="idade" placeholder="Idade" class="form-field" required>
                <select id="sexo" class="form-field" required>
                    <option value="">Selecione o sexo</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Outro">Outro</option>
                </select>
                <input type="text" id="rua" placeholder="Rua" class="form-field" required>
                <input type="text" id="bairro" placeholder="Bairro" class="form-field" required>
            </div>
        `,
        customClass: {
            popup: 'popup-form'
        },
        confirmButtonText: 'Salvar',
        confirmButtonColor: '#ce483c',
        focusConfirm: false,
        preConfirm: () => {
            const nome = document.getElementById('nome').value.trim();
            const idade = document.getElementById('idade').value.trim();
            const sexo = document.getElementById('sexo').value.trim();
            const rua = document.getElementById('rua').value.trim();
            const bairro = document.getElementById('bairro').value.trim();

            if (!nome || !idade || !sexo || !rua || !bairro) {
                Swal.showValidationMessage('Preencha todos os campos!');
                return false;
            }

            return { nome, idade, sexo, rua, bairro };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const saved = await saveUserProfile(auth.currentUser.uid, result.value);
            
            if (saved) {
                showNotification('Sucesso', 'Dados salvos com sucesso.', 'success');
                renderUserProfile(result.value, false);
            }
        }
    });
}

/**
 * Initialize profile page
 */
function initProfilePage() {
    const profileBtn = document.getElementById('abrirFormulario');
    const profileInfoContainer = document.getElementById('profileInfo');
    
    if (!profileBtn || !profileInfoContainer) {
        console.error("Required DOM elements not found");
        return;
    }
    
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            showNotification('Acesso negado', 'Você precisa estar logado para acessar o perfil.', 'warning');
            profileBtn.disabled = true;
            profileInfoContainer.innerHTML = `
                <div class="profile-card">
                    <h3>Não autenticado</h3>
                    <p>Você precisa fazer login para acessar seu perfil.</p>
                    <a href="login.html" class="login-link">Fazer Login</a>
                </div>
            `;
            return;
        }

        // Load user profile
        const userData = await loadUserProfile(user.uid);
        const isAdmin = userData?.isAdmin || false;
        
        if (userData) {
            renderUserProfile(userData, isAdmin);
        } else {
            profileInfoContainer.innerHTML = `
                <div class="profile-card">
                    <h3>Nenhum dado encontrado</h3>
                    <p>Você ainda não completou o seu cadastro. Por favor, clique no botão acima para preencher seus dados.</p>
                </div>
            `;
        }

        // Add profile form button handler
        profileBtn.addEventListener('click', showProfileForm);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initProfilePage);
