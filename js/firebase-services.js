/**
 * Firebase Services for HEMOPI blood donation system
 * Centralizes common Firestore operations
 */

import { app } from './firebase-config.js';
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    addDoc,
    updateDoc,
    deleteDoc,
    collection, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { showNotification } from './utils.js';

const db = getFirestore(app);

/**
 * Gets a document from Firestore
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID
 * @returns {Promise<Object|null>} - Document data or null
 */
export async function getDocument(collectionName, docId) {
    try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error(`Erro ao buscar documento ${docId} em ${collectionName}:`, error);
        return null;
    }
}

/**
 * Sets a document in Firestore
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID
 * @param {Object} data - Document data
 * @returns {Promise<boolean>} - Success status
 */
export async function setDocument(collectionName, docId, data) {
    try {
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, data);
        return true;
    } catch (error) {
        console.error(`Erro ao salvar documento ${docId} em ${collectionName}:`, error);
        return false;
    }
}

/**
 * Adds a document to Firestore collection
 * @param {string} collectionName - Collection name
 * @param {Object} data - Document data
 * @returns {Promise<string|null>} - Document ID or null
 */
export async function addDocument(collectionName, data) {
    try {
        const docRef = await addDoc(collection(db, collectionName), data);
        return docRef.id;
    } catch (error) {
        console.error(`Erro ao adicionar documento em ${collectionName}:`, error);
        return null;
    }
}

/**
 * Updates a document in Firestore
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID
 * @param {Object} data - Data to update
 * @returns {Promise<boolean>} - Success status
 */
export async function updateDocument(collectionName, docId, data) {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, data);
        return true;
    } catch (error) {
        console.error(`Erro ao atualizar documento ${docId} em ${collectionName}:`, error);
        return false;
    }
}

/**
 * Deletes a document from Firestore
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteDocument(collectionName, docId) {
    try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error(`Erro ao deletar documento ${docId} em ${collectionName}:`, error);
        return false;
    }
}

/**
 * Queries documents from Firestore collection
 * @param {string} collectionName - Collection name
 * @param {Array} whereConditions - Array of where conditions [field, operator, value]
 * @returns {Promise<Array>} - Array of documents
 */
export async function queryDocuments(collectionName, whereConditions = []) {
    try {
        let q = collection(db, collectionName);
        
        if (whereConditions.length > 0) {
            const constraints = whereConditions.map(condition => 
                where(condition[0], condition[1], condition[2])
            );
            q = query(q, ...constraints);
        }
        
        const querySnapshot = await getDocs(q);
        const documents = [];
        
        querySnapshot.forEach((doc) => {
            documents.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return documents;
    } catch (error) {
        console.error(`Erro ao consultar documentos em ${collectionName}:`, error);
        return [];
    }
}

/**
 * Checks if a document exists
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID
 * @returns {Promise<boolean>} - True if document exists
 */
export async function documentExists(collectionName, docId) {
    try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    } catch (error) {
        console.error(`Erro ao verificar existência do documento ${docId}:`, error);
        return false;
    }
}

/**
 * Gets all documents from a collection
 * @param {string} collectionName - Collection name
 * @returns {Promise<Array>} - Array of all documents
 */
export async function getAllDocuments(collectionName) {
    return await queryDocuments(collectionName);
}

/**
 * Gets the Firestore database instance
 * @returns {Object} - Firestore database instance
 */
export function getDatabase() {
    return db;
}

// Specific business logic functions

/**
 * Gets user profile data
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} - User profile data
 */
export async function getUserProfile(uid) {
    const userData = await getDocument('usuarios', uid);
    if (!userData) {
        showNotification("Erro", "Perfil do usuário não encontrado.", "error");
    }
    return userData;
}

/**
 * Saves user profile data
 * @param {string} uid - User ID
 * @param {Object} profileData - Profile data
 * @returns {Promise<boolean>} - Success status
 */
export async function saveUserProfile(uid, profileData) {
    const success = await setDocument('usuarios', uid, {
        ...profileData,
        ultimaAtualizacao: new Date().toISOString()
    });
    
    if (!success) {
        showNotification("Erro", "Erro ao salvar perfil do usuário.", "error");
    }
    
    return success;
}

/**
 * Gets campaigns for a specific location
 * @param {string} localEmail - Location email
 * @returns {Promise<Array>} - Array of campaigns
 */
export async function getCampaignsByLocation(localEmail) {
    return await queryDocuments('campanhas', [['responsavel', '==', localEmail]]);
}

/**
 * Gets all active campaigns
 * @returns {Promise<Array>} - Array of active campaigns
 */
export async function getActiveCampaigns() {
    return await queryDocuments('campanhas', [['ativa', '==', true]]);
} 