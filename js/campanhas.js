/**
 * Campaign Management Module
 * Handles campaign data operations and UI interactions
 */

import { auth, db } from "./firebase-config.js";
import { 
    collection, addDoc, doc, getDoc, getDocs, 
    query, where, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { showNotification, formatDate } from "./utils.js";

/**
 * Creates a new blood donation campaign
 * 
 * @param {Object} campaignData - Campaign data
 * @returns {Promise<string|null>} The campaign ID if successful, null otherwise
 */
export async function createCampaign(campaignData) {
    try {
        const campaignWithMetadata = {
            ...campaignData,
            dataCriacao: new Date().toISOString(),
            status: 'Ativa'
        };

        const docRef = await addDoc(collection(db, "campanhas"), campaignWithMetadata);
        showNotification('Sucesso', 'Campanha cadastrada com sucesso!', 'success');
        return docRef.id;
    } catch (error) {
        console.error("Erro ao cadastrar campanha:", error);
        showNotification('Erro', 'Não foi possível cadastrar a campanha.', 'error');
        return null;
    }
}

/**
 * Updates an existing campaign
 * 
 * @param {string} campaignId - ID of the campaign to update
 * @param {Object} campaignData - Updated campaign data
 * @returns {Promise<boolean>} True if update was successful
 */
export async function updateCampaign(campaignId, campaignData) {
    try {
        const campaignRef = doc(db, "campanhas", campaignId);
        await updateDoc(campaignRef, {
            ...campaignData,
            dataAtualizacao: new Date().toISOString()
        });
        
        showNotification('Sucesso', 'Campanha atualizada com sucesso!', 'success');
        return true;
    } catch (error) {
        console.error("Erro ao atualizar campanha:", error);
        showNotification('Erro', 'Não foi possível atualizar a campanha.', 'error');
        return false;
    }
}

/**
 * Deletes a campaign
 * 
 * @param {string} campaignId - ID of the campaign to delete
 * @returns {Promise<boolean>} True if deletion was successful
 */
export async function deleteCampaign(campaignId) {
    try {
        const campaignRef = doc(db, "campanhas", campaignId);
        await deleteDoc(campaignRef);
        
        showNotification('Sucesso', 'Campanha removida com sucesso!', 'success');
        return true;
    } catch (error) {
        console.error("Erro ao remover campanha:", error);
        showNotification('Erro', 'Não foi possível remover a campanha.', 'error');
        return false;
    }
}

/**
 * Gets all campaigns for a specific location
 * 
 * @param {string} localEmail - Email of the location
 * @returns {Promise<Array>} Array of campaign objects
 */
export async function getCampaignsByLocal(localEmail) {
    try {
        const campaignQuery = query(
            collection(db, "campanhas"), 
            where("local", "==", localEmail)
        );
        
        const querySnapshot = await getDocs(campaignQuery);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Erro ao buscar campanhas:", error);
        showNotification('Erro', 'Não foi possível carregar as campanhas.', 'error');
        return [];
    }
}

/**
 * Gets all active campaigns
 * 
 * @returns {Promise<Array>} Array of active campaign objects
 */
export async function getActiveCampaigns() {
    try {
        const campaignQuery = query(
            collection(db, "campanhas"), 
            where("status", "==", "Ativa")
        );
        
        const querySnapshot = await getDocs(campaignQuery);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Erro ao buscar campanhas ativas:", error);
        showNotification('Erro', 'Não foi possível carregar as campanhas ativas.', 'error');
        return [];
    }
}

/**
 * Renders a campaign management interface
 * 
 * @param {HTMLElement} container - Container element for the interface
 * @param {Array} campaigns - Array of campaign objects
 * @param {Function} onEdit - Callback for edit action
 * @param {Function} onDelete - Callback for delete action
 */
export function renderCampaignManager(container, campaigns, onEdit, onDelete) {
    if (!container) return;

    if (!campaigns || campaigns.length === 0) {
        container.innerHTML = `
            <div class="no-campaigns">
                <p>Não há campanhas cadastradas.</p>
            </div>
        `;
        return;
    }

    const campaignList = document.createElement('div');
    campaignList.className = 'campaign-list';

    campaigns.forEach(campaign => {
        const campaignCard = document.createElement('div');
        campaignCard.className = 'campaign-card';
        
        campaignCard.innerHTML = `
            <h3>${campaign.titulo}</h3>
            <p>${campaign.descricao}</p>
            <p class="campaign-dates">
                <strong>Início:</strong> ${formatDate(campaign.inicio)} | 
                <strong>Fim:</strong> ${formatDate(campaign.fim)}
            </p>
            <p class="campaign-status"><strong>Status:</strong> ${campaign.status}</p>
            <div class="campaign-actions">
                <button class="edit-btn">Editar</button>
                <button class="delete-btn">Excluir</button>
            </div>
        `;

        const editBtn = campaignCard.querySelector('.edit-btn');
        const deleteBtn = campaignCard.querySelector('.delete-btn');

        if (editBtn && typeof onEdit === 'function') {
            editBtn.addEventListener('click', () => onEdit(campaign));
        }

        if (deleteBtn && typeof onDelete === 'function') {
            deleteBtn.addEventListener('click', () => onDelete(campaign));
        }

        campaignList.appendChild(campaignCard);
    });

    container.innerHTML = '';
    container.appendChild(campaignList);
}

/**
 * Shows a form for editing a campaign
 * 
 * @param {Object} campaign - Campaign data to edit
 * @returns {Promise<Object|null>} Updated campaign data or null if cancelled
 */
export async function showCampaignEditForm(campaign) {
    return new Promise((resolve) => {
        Swal.fire({
            title: 'Editar Campanha',
            width: 600,
            html: `
                <div class="form-container">
                    <input type="text" id="titulo" placeholder="Título da campanha" class="form-field" 
                           value="${campaign.titulo || ''}" required>
                    <input type="text" id="local" placeholder="Local (email do local)" class="form-field" 
                           value="${campaign.local || ''}" readonly>
                    <textarea id="descricao" placeholder="Descrição da campanha" class="form-field" 
                              required>${campaign.descricao || ''}</textarea>
                    <label for="inicio">Data de Início:</label>
                    <input type="date" id="inicio" class="form-field" 
                           value="${campaign.inicio || ''}" required>
                    <label for="fim">Data de Fim:</label>
                    <input type="date" id="fim" class="form-field" 
                           value="${campaign.fim || ''}" required>
                    <label for="status">Status:</label>
                    <select id="status" class="form-field" required>
                        <option value="Ativa" ${campaign.status === 'Ativa' ? 'selected' : ''}>Ativa</option>
                        <option value="Encerrada" ${campaign.status === 'Encerrada' ? 'selected' : ''}>Encerrada</option>
                        <option value="Pendente" ${campaign.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                    </select>
                </div>
            `,
            confirmButtonText: 'Salvar',
            confirmButtonColor: '#ce483c',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            focusConfirm: false,
            preConfirm: () => {
                const titulo = document.getElementById('titulo').value.trim();
                const local = document.getElementById('local').value.trim();
                const descricao = document.getElementById('descricao').value.trim();
                const inicio = document.getElementById('inicio').value;
                const fim = document.getElementById('fim').value;
                const status = document.getElementById('status').value;

                if (!titulo || !local || !descricao || !inicio || !fim || !status) {
                    Swal.showValidationMessage('Preencha todos os campos!');
                    return false;
                }

                return { titulo, local, descricao, inicio, fim, status };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                resolve({
                    ...campaign,
                    ...result.value
                });
            } else {
                resolve(null);
            }
        });
    });
} 