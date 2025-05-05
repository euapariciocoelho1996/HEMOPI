/**
 * User Profile Management Module
 * Handles user profile functionality, data loading and management
 */

import { auth, db } from "./firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { 
    doc, getDoc, setDoc, collection, 
    query, where, getDocs, addDoc 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { showNotification, formatDate, calculateNextDonation } from "./utils.js";

// DOM Elements
const profileInfoContainer = document.getElementById('profileInfo');
const localInfoContainer = document.getElementById('localInfo');
const updateProfileBtn = document.getElementById('updateProfileBtn');
const createCampaignBtn = document.getElementById('createCampaignBtn');

/**
 * Initializes the profile page functionality
 */
function initProfilePage() {
    // Listen for authentication state changes
    document.addEventListener('authStateChanged', handleAuthStateChanged);
    
    // Attach event listeners to buttons if they exist
    if (updateProfileBtn) {
        updateProfileBtn.addEventListener('click', showProfileForm);
    }
    
    if (createCampaignBtn) {
        createCampaignBtn.addEventListener('click', () => {
            if (auth.currentUser) {
                showCampaignForm(auth.currentUser.email);
            }
        });
    }
}

/**
 * Handles authentication state changes
 * @param {CustomEvent} event - The auth state changed event
 */
async function handleAuthStateChanged(event) {
    const { isAuthenticated, user } = event.detail;
    
    if (isAuthenticated && user) {
        // First try to load local data (if email belongs to a registered local)
        const isLocal = await loadLocalByEmail(user.email);
        
        // If not a local, load user profile data
        if (!isLocal) {
            const userData = await loadUserProfile(user.uid);
            if (userData) {
                renderUserProfile(userData);
            }
        }
        
        // Show/hide appropriate UI elements based on user type
        updateUIForUserType(isLocal);
    } else {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
    }
}

/**
 * Updates UI elements based on whether user is a local or regular user
 * @param {boolean} isLocal - Whether the user is a registered local
 */
function updateUIForUserType(isLocal) {
    // Hide update profile button for local users
    if (updateProfileBtn) {
        updateProfileBtn.style.display = isLocal ? 'none' : 'block';
    }
    
    // Show campaign creation button only for local users
    if (createCampaignBtn) {
        createCampaignBtn.style.display = isLocal ? 'block' : 'none';
    }
}

/**
 * Loads user profile data from Firestore
 * @param {string} uid - User ID
 * @returns {Object|null} User data object or null if not found
 */
async function loadUserProfile(uid) {
    try {
        const userRef = doc(db, "usuarios", uid);
        const docSnap = await getDoc(userRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        showNotification('Erro', 'Erro ao carregar perfil do usuário.', 'error');
        return null;
    }
}

/**
 * Renders user profile data to the UI
 * @param {Object} userData - User profile data
 */
function renderUserProfile(userData) {
    if (!profileInfoContainer) return;

    // Format last donation date if it exists
    const formattedLastDonation = userData.ultimaDoacao 
        ? formatDate(userData.ultimaDoacao) 
        : 'Não registrada';
    
    // Format next donation date if it exists
    const formattedNextDonation = userData.proximaDoacao 
        ? formatDate(userData.proximaDoacao) 
        : 'Não definida';

    profileInfoContainer.innerHTML = `
        <div class="profile-card">
            <h3>Dados do Usuário</h3>
            <p><strong>Nome:</strong> ${userData.nome || 'Não informado'}</p>
            <p><strong>Idade:</strong> ${userData.idade || 'Não informada'}</p>
            <p><strong>Sexo:</strong> ${userData.sexo || 'Não informado'}</p>
            <p><strong>Rua:</strong> ${userData.rua || 'Não informada'}</p>
            <p><strong>Bairro:</strong> ${userData.bairro || 'Não informado'}</p>
            <div class="donation-info">
                <p><i class="heart-icon">❤️</i> <strong>Doações:</strong> ${userData.doacoes || 0}</p>
                <p><i class="calendar-icon">📅</i> <strong>Última Doação:</strong> ${formattedLastDonation}</p>
                <p><i class="calendar-icon">⏳</i> <strong>Próxima Doação:</strong> ${formattedNextDonation}</p>
            </div>
        </div>
    `;
}

/**
 * Loads local data by email from Firestore
 * @param {string} email - Email to search for
 * @returns {boolean} True if local was found and rendered
 */
async function loadLocalByEmail(email) {
    try {
        const locaisRef = collection(db, "locais");
        const q = query(locaisRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const localData = querySnapshot.docs[0].data();
            renderLocalData(localData);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Erro ao buscar local:", error);
        showNotification("Erro", "Erro ao buscar dados do local.", "error");
        return false;
    }
}

/**
 * Renders local data to the UI
 * @param {Object} localData - Local data object
 */
function renderLocalData(localData) {
    if (!localInfoContainer) return;

    if (!localData) {
        localInfoContainer.innerHTML = `
            <div class="profile-card">
                <h3>Local não encontrado</h3>
                <p>Não há dados de local vinculados ao seu e-mail.</p>
            </div>
        `;
        return;
    }

    localInfoContainer.innerHTML = `
        <div class="profile-card">
            <h3>Informações do Local</h3>
            <p><strong>Nome:</strong> ${localData.nome || 'Não informado'}</p>
            <p><strong>CNPJ:</strong> ${localData.cnpj || 'Não informado'}</p>
            <p><strong>Contato:</strong> ${localData.contato || 'Não informado'}</p>
            <p><strong>Email:</strong> ${localData.email || 'Não informado'}</p>
            <p><strong>Endereço:</strong> ${localData.endereco || 'Não informado'}</p>
        </div>
    `;
}

/**
 * Saves user profile data to Firestore
 * @param {string} uid - User ID
 * @param {Object} data - User profile data to save
 * @returns {boolean} True if save was successful
 */
async function saveUserProfile(uid, data) {
    try {
        const userRef = doc(db, "usuarios", uid);
        await setDoc(userRef, data, { merge: true });
        return true;
    } catch (error) {
        console.error("Erro ao salvar perfil:", error);
        showNotification('Erro', 'Não foi possível salvar os dados do perfil.', 'error');
        return false;
    }
}

/**
 * Shows a form for updating user profile data
 */
function showProfileForm() {
    Swal.fire({
        title: 'Atualize seus dados',
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
        confirmButtonText: 'Salvar',
        confirmButtonColor: '#ce483c',
        focusConfirm: false,
        preConfirm: validateProfileForm
    }).then(handleProfileFormSubmit);
}

/**
 * Validates profile form data
 * @returns {Object|boolean} Form data if valid, false otherwise
 */
function validateProfileForm() {
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

/**
 * Handles form submission for profile update
 * @param {Object} result - The form submission result
 */
async function handleProfileFormSubmit(result) {
    if (result.isConfirmed && auth.currentUser) {
        const saved = await saveUserProfile(auth.currentUser.uid, result.value);
        if (saved) {
            showNotification('Sucesso', 'Dados atualizados.', 'success');
            renderUserProfile(result.value);
        }
    }
}

/**
 * Registers a new campaign in Firestore
 * @param {Object} campanha - Campaign data
 */
async function cadastrarCampanha(campanha) {
    try {
        const campanhasRef = collection(db, "campanhas");
        const docRef = await addDoc(campanhasRef, campanha);
        console.log("Campanha cadastrada com ID:", docRef.id);
        showNotification('Sucesso', 'Campanha cadastrada com sucesso!', 'success');
    } catch (error) {
        console.error("Erro ao cadastrar campanha:", error);
        showNotification('Erro', 'Não foi possível cadastrar a campanha.', 'error');
    }
}

/**
 * Shows a form for creating a new campaign
 * @param {string} emailLocal - Email of the local
 */
function showCampaignForm(emailLocal) {
    Swal.fire({
        title: 'Cadastrar Nova Campanha',
        width: 600,
        html: `
            <div class="form-container">
                <input type="text" id="titulo" placeholder="Título da campanha" class="form-field" required>
                <input type="text" id="local" placeholder="Local (email do local)" class="form-field" value="${emailLocal}" readonly>
                <textarea id="descricao" placeholder="Descrição da campanha" class="form-field" required></textarea>
                <label for="inicio">Data de Início:</label>
                <input type="date" id="inicio" class="form-field" required>
                <label for="fim">Data de Fim:</label>
                <input type="date" id="fim" class="form-field" required>
            </div>
        `,
        confirmButtonText: 'Cadastrar',
        confirmButtonColor: '#ce483c',
        focusConfirm: false,
        preConfirm: validateCampaignForm
    }).then(handleCampaignFormSubmit);
}

/**
 * Validates campaign form data
 * @returns {Object|boolean} Form data if valid, false otherwise
 */
function validateCampaignForm() {
    const titulo = document.getElementById('titulo').value.trim();
    const local = document.getElementById('local').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const inicio = document.getElementById('inicio').value;
    const fim = document.getElementById('fim').value;

    if (!titulo || !local || !descricao || !inicio || !fim) {
        Swal.showValidationMessage('Preencha todos os campos!');
        return false;
    }

    return { 
        titulo, 
        local, 
        descricao, 
        inicio, 
        fim,
        dataCriacao: new Date().toISOString(),
        status: 'Ativa'
    };
}

/**
 * Handles form submission for campaign creation
 * @param {Object} result - The form submission result
 */
async function handleCampaignFormSubmit(result) {
    if (result.isConfirmed) {
        await cadastrarCampanha(result.value);
    }
}

// Initialize the profile page when DOM is ready
document.addEventListener('DOMContentLoaded', initProfilePage);

// Export functions for potential use in other modules
export { 
    loadUserProfile, 
    saveUserProfile, 
    cadastrarCampanha 
};
