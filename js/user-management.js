/**
 * User Management Module
 * Handles user authentication, registration and profile management
 */

import { auth, db } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
    getAuth, createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, signOut 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { showNotification, isValidEmail, calculateNextDonation } from "./utils.js";

/**
 * Registers a new user
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} userData - Additional user data
 * @returns {Promise<Object|null>} User object if successful, null otherwise
 */
export async function registerUser(email, password, userData = {}) {
    if (!isValidEmail(email)) {
        showNotification('Erro', 'O email fornecido não é válido.', 'error');
        return null;
    }

    try {
        // Create a secondary app instance to avoid affecting current auth state
        const secondaryApp = initializeApp(auth.app.options, "secondary");
        const secondaryAuth = getAuth(secondaryApp);
        
        // Create the user
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const newUser = userCredential.user;
        
        // Save additional user data
        await setDoc(doc(db, "usuarios", newUser.uid), {
            email,
            dataCadastro: new Date().toISOString(),
            ...userData
        });
        
        // Sign out from secondary app to not affect main auth state
        await signOut(secondaryAuth);
        
        showNotification('Sucesso', 'Usuário cadastrado com sucesso!', 'success');
        return newUser;
    } catch (error) {
        handleAuthError(error);
        return null;
    }
}

/**
 * Logs in a user
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object|null>} User object if successful, null otherwise
 */
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        handleAuthError(error);
        return null;
    }
}

/**
 * Logs out the current user
 * 
 * @returns {Promise<boolean>} True if logout was successful
 */
export async function logoutUser() {
    try {
        await signOut(auth);
        return true;
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        showNotification('Erro', 'Não foi possível fazer logout.', 'error');
        return false;
    }
}

/**
 * Gets the current user profile data
 * 
 * @returns {Promise<Object|null>} User profile data or null if not found
 */
export async function getCurrentUserProfile() {
    if (!auth.currentUser) {
        return null;
    }
    
    try {
        const userDoc = await getDoc(doc(db, "usuarios", auth.currentUser.uid));
        return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
        console.error("Erro ao obter perfil do usuário:", error);
        return null;
    }
}

/**
 * Updates user profile data
 * 
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<boolean>} True if update was successful
 */
export async function updateUserProfile(profileData) {
    if (!auth.currentUser) {
        showNotification('Erro', 'Nenhum usuário autenticado.', 'error');
        return false;
    }
    
    try {
        await setDoc(doc(db, "usuarios", auth.currentUser.uid), profileData, { merge: true });
        showNotification('Sucesso', 'Perfil atualizado com sucesso!', 'success');
        return true;
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        showNotification('Erro', 'Não foi possível atualizar o perfil.', 'error');
        return false;
    }
}

/**
 * Records a new blood donation for the current user
 * 
 * @param {Object} donationData - Donation data
 * @returns {Promise<boolean>} True if recording was successful
 */
export async function recordDonation(donationData) {
    if (!auth.currentUser) {
        showNotification('Erro', 'Nenhum usuário autenticado.', 'error');
        return false;
    }
    
    try {
        const userProfile = await getCurrentUserProfile();
        if (!userProfile) {
            showNotification('Erro', 'Perfil de usuário não encontrado.', 'error');
            return false;
        }
        
        const donationDate = new Date(donationData.data);
        const nextDonationDate = calculateNextDonation(donationDate, userProfile.sexo);
        
        // Update user profile with donation information
        await updateUserProfile({
            doacoes: (userProfile.doacoes || 0) + 1,
            ultimaDoacao: donationDate.toISOString(),
            proximaDoacao: nextDonationDate.toISOString()
        });
        
        return true;
    } catch (error) {
        console.error("Erro ao registrar doação:", error);
        showNotification('Erro', 'Não foi possível registrar a doação.', 'error');
        return false;
    }
}

/**
 * Handles authentication errors
 * 
 * @param {Error} error - Authentication error object
 */
function handleAuthError(error) {
    console.error("Erro de autenticação:", error);
    
    let message = 'Ocorreu um erro na autenticação. Tente novamente.';
    
    switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            message = 'Email ou senha incorretos.';
            break;
        case 'auth/invalid-email':
            message = 'Email inválido.';
            break;
        case 'auth/weak-password':
            message = 'A senha deve ter pelo menos 6 caracteres.';
            break;
        case 'auth/email-already-in-use':
            message = 'Este email já está em uso.';
            break;
        case 'auth/too-many-requests':
            message = 'Muitas tentativas de login. Tente novamente mais tarde.';
            break;
    }
    
    showNotification('Erro', message, 'error');
} 