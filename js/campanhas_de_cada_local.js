/**
 * Campaign management for location administrators
 * Handles campaign display, editing, and deletion for specific locations
 */

import { getAuthInstance, initAuthStateMonitoring } from './auth-manager.js';
import { queryDocuments, updateDocument, deleteDocument } from './firebase-services.js';
import { showNotification, showConfirmDialog } from './utils.js';
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11.7.27/+esm';

const auth = getAuthInstance();

/**
 * Renders campaigns for the authenticated location
 * @param {Array} campanhas - Array of campaigns
 */
function renderCampaigns(campanhas) {
    const container = document.getElementById("campanhasContainer");
    if (!container) return;

    if (campanhas.length === 0) {
        container.innerHTML = `
            <div class="no-content-message">
                <h2>Nenhuma campanha encontrada</h2>
                <p>Você ainda não cadastrou nenhuma campanha.</p>
            </div>
        `;
        return;
    }

    const section = document.createElement("section");
    section.className = "campanhas-section";
    
    const header = document.createElement("div");
    header.className = "campanhas-header";
    header.innerHTML = `
        <h2>Suas Campanhas</h2>
        <p>Gerencie as campanhas do seu local de doação</p>
    `;
    
    const cardsContainer = document.createElement("div");
    cardsContainer.className = "campanhas-cards";

    campanhas.forEach(campanha => {
        const card = createCampaignCard(campanha);
        cardsContainer.appendChild(card);
    });

    section.appendChild(header);
    section.appendChild(cardsContainer);
    container.appendChild(section);
}

/**
 * Creates a campaign card element
 * @param {Object} campanha - Campaign data
 * @returns {HTMLElement} - Campaign card element
 */
function createCampaignCard(campanha) {
    const card = document.createElement("div");
    card.className = "campanha-card";
    
    const urgenciaClass = campanha.urgencia === "alta" ? "urgente" : 
                         campanha.urgencia === "media" ? "media" : "baixa";
    
    card.innerHTML = `
        <div class="urgencia ${urgenciaClass}">${(campanha.urgencia || 'baixa').toUpperCase()}</div>
        <h3>${campanha.titulo || 'Título não disponível'}</h3>
        <p class="campanha-local">${campanha.local || 'Local não informado'}</p>
        <p>${campanha.descricao || 'Descrição não disponível'}</p>
        <p class="campanha-data">
            ${campanha.inicio ? `Início: ${campanha.inicio}` : ''} 
            ${campanha.fim ? `| Fim: ${campanha.fim}` : ''}
        </p>
        <div class="campaign-actions">
            <button class="form-button edit-btn" data-id="${campanha.id}">Editar</button>
            <button class="form-button delete-btn" data-id="${campanha.id}">Excluir</button>
        </div>
    `;

    // Add event listeners
    const editBtn = card.querySelector('.edit-btn');
    const deleteBtn = card.querySelector('.delete-btn');
    
    editBtn.addEventListener('click', () => editCampaign(campanha));
    deleteBtn.addEventListener('click', () => deleteCampaign(campanha.id));

    return card;
}

/**
 * Shows campaign editing form
 * @param {Object} campanha - Campaign data to edit
 */
async function editCampaign(campanha) {
    const result = await Swal.fire({
        title: "Editar Campanha",
        width: 700,
        html: `
            <div class="form-container">
                <input type="text" id="edit-titulo" placeholder="Título da campanha" class="form-field" value="${campanha.titulo || ''}" required>
                <textarea id="edit-descricao" placeholder="Descrição da campanha" class="form-field" rows="3" required>${campanha.descricao || ''}</textarea>
                <input type="date" id="edit-inicio" class="form-field" value="${campanha.inicio || ''}" required>
                <input type="date" id="edit-fim" class="form-field" value="${campanha.fim || ''}" required>
                <select id="edit-urgencia" class="form-field" required>
                    <option value="baixa" ${campanha.urgencia === 'baixa' ? 'selected' : ''}>Baixa</option>
                    <option value="media" ${campanha.urgencia === 'media' ? 'selected' : ''}>Média</option>
                    <option value="alta" ${campanha.urgencia === 'alta' ? 'selected' : ''}>Alta</option>
                </select>
                <input type="text" id="edit-local" placeholder="Local da campanha" class="form-field" value="${campanha.local || ''}" required>
                <input type="text" id="edit-cidade" placeholder="Cidade" class="form-field" value="${campanha.cidade || ''}" required>
                <input type="text" id="edit-estado" placeholder="Estado" class="form-field" value="${campanha.estado || ''}" required>
                <input type="text" id="edit-contato" placeholder="Contato" class="form-field" value="${campanha.contato || ''}">
                <textarea id="edit-requisitos" placeholder="Requisitos especiais" class="form-field" rows="2">${campanha.requisitos || ''}</textarea>
                <textarea id="edit-observacoes" placeholder="Observações" class="form-field" rows="2">${campanha.observacoes || ''}</textarea>
            </div>
        `,
        confirmButtonText: "Salvar Alterações",
        confirmButtonColor: "#ce483c",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        focusConfirm: false,
        preConfirm: () => {
            const titulo = document.getElementById("edit-titulo").value.trim();
            const descricao = document.getElementById("edit-descricao").value.trim();
            const inicio = document.getElementById("edit-inicio").value;
            const fim = document.getElementById("edit-fim").value;
            const urgencia = document.getElementById("edit-urgencia").value;
            const local = document.getElementById("edit-local").value.trim();
            const cidade = document.getElementById("edit-cidade").value.trim();
            const estado = document.getElementById("edit-estado").value.trim();
            const contato = document.getElementById("edit-contato").value.trim();
            const requisitos = document.getElementById("edit-requisitos").value.trim();
            const observacoes = document.getElementById("edit-observacoes").value.trim();

            if (!titulo || !descricao || !inicio || !fim || !urgencia || !local || !cidade || !estado) {
                Swal.showValidationMessage("Preencha todos os campos obrigatórios!");
                return false;
            }

            return {
                titulo,
                descricao,
                inicio,
                fim,
                urgencia,
                local,
                cidade,
                estado,
                contato,
                requisitos,
                observacoes,
                ultimaAtualizacao: new Date().toISOString()
            };
        }
    });

    if (result.isConfirmed) {
        const success = await updateDocument('campanhas', campanha.id, result.value);
        if (success) {
            showNotification("Sucesso", "Campanha atualizada com sucesso.", "success");
            await loadUserCampaigns();
        } else {
            showNotification("Erro", "Não foi possível atualizar a campanha.", "error");
        }
    }
}

/**
 * Deletes a campaign after confirmation
 * @param {string} campanhaId - Campaign ID to delete
 */
async function deleteCampaign(campanhaId) {
    const confirmed = await showConfirmDialog(
        "Excluir Campanha",
        "Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.",
        "Excluir"
    );

    if (confirmed) {
        const success = await deleteDocument('campanhas', campanhaId);
        if (success) {
            showNotification("Sucesso", "Campanha excluída com sucesso.", "success");
            await loadUserCampaigns();
        } else {
            showNotification("Erro", "Não foi possível excluir a campanha.", "error");
        }
    }
}

/**
 * Loads campaigns for the current user's location
 */
async function loadUserCampaigns() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const campanhas = await queryDocuments('campanhas', [['responsavel', '==', user.email]]);
        renderCampaigns(campanhas);
    } catch (error) {
        console.error("Erro ao carregar campanhas:", error);
        showNotification("Erro", "Erro ao carregar campanhas.", "error");
    }
}

// Initialize authentication monitoring and load campaigns
initAuthStateMonitoring(async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    
    await loadUserCampaigns();
});
