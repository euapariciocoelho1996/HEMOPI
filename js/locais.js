/**
 * Locations Management Module
 * Handles donation location operations
 */

import { auth, db } from "./firebase-config.js";
import { 
    collection, addDoc, doc, getDoc, getDocs, 
    query, where, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { showNotification, isValidEmail } from "./utils.js";
import { registerUser } from "./user-management.js";

/**
 * Creates a new donation location
 * 
 * @param {Object} locationData - Location data
 * @param {string} password - Password for location account
 * @returns {Promise<string|null>} Location ID if successful, null otherwise
 */
export async function createLocation(locationData, password) {
    try {
        // Validate required fields
        if (!locationData.nome || !locationData.cnpj || !locationData.email) {
            showNotification('Erro', 'Preencha todos os campos obrigatórios.', 'error');
            return null;
        }
        
        // Validate email
        if (!isValidEmail(locationData.email)) {
            showNotification('Erro', 'Email inválido.', 'error');
            return null;
        }
        
        // Check if CNPJ is already registered
        const cnpjExists = await checkCnpjExists(locationData.cnpj);
        if (cnpjExists) {
            showNotification('Erro', 'CNPJ já cadastrado.', 'error');
            return null;
        }
        
        // Check if email is already registered
        const emailExists = await checkEmailExists(locationData.email);
        if (emailExists) {
            showNotification('Erro', 'Email já cadastrado.', 'error');
            return null;
        }
        
        // Create user account for the location
        const user = await registerUser(locationData.email, password, {
            isLocal: true
        });
        
        if (!user) {
            return null;
        }
        
        // Add location to the 'locais' collection
        const locationWithMetadata = {
            ...locationData,
            dataCadastro: new Date().toISOString(),
            userId: user.uid
        };
        
        const docRef = await addDoc(collection(db, "locais"), locationWithMetadata);
        showNotification('Sucesso', 'Local cadastrado com sucesso!', 'success');
        return docRef.id;
    } catch (error) {
        console.error("Erro ao cadastrar local:", error);
        showNotification('Erro', 'Não foi possível cadastrar o local.', 'error');
        return null;
    }
}

/**
 * Updates an existing location
 * 
 * @param {string} locationId - ID of the location to update
 * @param {Object} locationData - Updated location data
 * @returns {Promise<boolean>} True if update was successful
 */
export async function updateLocation(locationId, locationData) {
    try {
        const locationRef = doc(db, "locais", locationId);
        await updateDoc(locationRef, {
            ...locationData,
            dataAtualizacao: new Date().toISOString()
        });
        
        showNotification('Sucesso', 'Local atualizado com sucesso!', 'success');
        return true;
    } catch (error) {
        console.error("Erro ao atualizar local:", error);
        showNotification('Erro', 'Não foi possível atualizar o local.', 'error');
        return false;
    }
}

/**
 * Gets all registered donation locations
 * 
 * @returns {Promise<Array>} Array of location objects
 */
export async function getAllLocations() {
    try {
        const querySnapshot = await getDocs(collection(db, "locais"));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Erro ao buscar locais:", error);
        showNotification('Erro', 'Não foi possível carregar os locais.', 'error');
        return [];
    }
}

/**
 * Gets a location by ID
 * 
 * @param {string} locationId - Location ID
 * @returns {Promise<Object|null>} Location object or null if not found
 */
export async function getLocationById(locationId) {
    try {
        const docRef = doc(db, "locais", locationId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Erro ao buscar local:", error);
        showNotification('Erro', 'Não foi possível carregar o local.', 'error');
        return null;
    }
}

/**
 * Gets a location by email
 * 
 * @param {string} email - Location email
 * @returns {Promise<Object|null>} Location object or null if not found
 */
export async function getLocationByEmail(email) {
    try {
        const locaisRef = collection(db, "locais");
        const q = query(locaisRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Erro ao buscar local por email:", error);
        return null;
    }
}

/**
 * Checks if a CNPJ is already registered
 * 
 * @param {string} cnpj - CNPJ to check
 * @returns {Promise<boolean>} True if CNPJ exists
 */
export async function checkCnpjExists(cnpj) {
    try {
        const locaisRef = collection(db, "locais");
        const q = query(locaisRef, where("cnpj", "==", cnpj));
        const querySnapshot = await getDocs(q);
        
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Erro ao verificar CNPJ:", error);
        return false;
    }
}

/**
 * Checks if an email is already registered as a location
 * 
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} True if email exists
 */
export async function checkEmailExists(email) {
    try {
        const locaisRef = collection(db, "locais");
        const q = query(locaisRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Erro ao verificar email:", error);
        return false;
    }
} 