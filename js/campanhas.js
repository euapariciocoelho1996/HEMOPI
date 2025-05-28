/**
 * Campaign management for users
 * Displays active campaigns and handles donation intentions
 */

import { getAuthInstance } from './auth-manager.js';
import { getAllDocuments, addDocument, queryDocuments, getDocument } from './firebase-services.js';
import { showNotification } from './utils.js';

const auth = getAuthInstance();

document.addEventListener("DOMContentLoaded", async () => {
  const containerPai = document.getElementById("campanhasContainer");
  
  // Create main section
  const section = document.createElement("section");
  section.className = "campanhas-section";
  
  const container = document.createElement("div");
  container.className = "campanhas-container";
  
  const titulo = document.createElement("h2");
  titulo.textContent = "Campanhas Ativas";
  container.appendChild(titulo);
  
  const subtitulo = document.createElement("p");
  subtitulo.className = "campanha-subtitulo";
  subtitulo.textContent = "Participe das campanhas de doação e ajude a salvar vidas";
  container.appendChild(subtitulo);
  
  // Get all campaigns
  const campanhas = await getAllDocuments('campanhas');
  
  if (campanhas.length === 0) {
    const mensagem = document.createElement("p");
    mensagem.textContent = "Nenhuma campanha ativa no momento.";
    mensagem.className = "no-campaigns-message";
    container.appendChild(mensagem);
  } else {
    const cardsWrapper = document.createElement("div");
    cardsWrapper.className = "campanhas-cards";
    
    campanhas.forEach(campanha => {
      const card = document.createElement("div");
      card.className = "campanha-card";
      
      // Determine urgency level
      const urgencia = campanha.urgencia || "baixa";
      const urgenciaClass = urgencia === "alta" ? "urgente" : 
                           urgencia === "media" ? "media" : "baixa";
      
      card.innerHTML = `
        <div class="urgencia ${urgenciaClass}">${urgencia.toUpperCase()}</div>
        <h3>${campanha.titulo || 'Título não disponível'}</h3>
        <p class="campanha-local">${campanha.local || campanha.responsavel || 'Local não informado'}</p>
        <p>${campanha.descricao || 'Descrição não disponível'}</p>
        <p class="campanha-data">Até: ${campanha.dataFim || 'Data não informada'}</p>
      `;
      
      card.addEventListener("click", () => {
        Swal.fire({
          title: campanha.titulo,
          html: `
            <div style="text-align: left;">
              <p><strong>Local:</strong> ${campanha.local || campanha.responsavel}</p>
              <p><strong>Descrição:</strong> ${campanha.descricao}</p>
              <p><strong>Data de término:</strong> ${campanha.dataFim}</p>
              <p><strong>Responsável:</strong> ${campanha.responsavel}</p>
              ${campanha.observacoes ? `<p><strong>Observações:</strong> ${campanha.observacoes}</p>` : ''}
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Registrar Intenção de Doar',
          cancelButtonText: 'Fechar',
          confirmButtonColor: '#ce483c',
          preConfirm: async () => {
            const user = auth.currentUser;
            if (!user) {
              Swal.showValidationMessage('Você precisa estar logado para registrar sua intenção. Por favor, faça login.');
              return false;
            }

            const campanhaId = campanha.id;

            try {
              // Get complete user data
              const userData = await getDocument('usuarios', user.uid);

              if (!userData) {
                Swal.showValidationMessage('Dados do usuário não encontrados.');
                return false;
              }

              // Check if intention already exists
              const existingIntentions = await queryDocuments('intencaoDoacao', [
                ['usuarioId', '==', user.uid],
                ['campanhaId', '==', campanhaId]
              ]);

              if (existingIntentions.length > 0) {
                Swal.showValidationMessage('Você já registrou intenção de doar nesta campanha.');
                return false;
              }

              const intencao = {
                campanhaId,
                usuarioId: user.uid,
                usuarioEmail: user.email || "",
                usuarioNome: userData.nome || "Nome não disponível",
                usuarioIdade: userData.idade || "",
                usuarioSexo: userData.sexo || "",
                usuarioRua: userData.rua || "",
                usuarioBairro: userData.bairro || "",
                campanhaTitulo: campanha.titulo,
                campanhaResponsavel: campanha.local || campanha.responsavel || "",
                timestamp: new Date(),
              };

              const docId = await addDocument('intencaoDoacao', intencao);
              
              if (docId) {
                await Swal.fire({
                  icon: 'success',
                  title: 'Obrigado!',
                  text: 'Sua intenção de doar foi registrada. A equipe entrará em contato se necessário.',
                });
              } else {
                throw new Error('Falha ao registrar intenção');
              }

            } catch (error) {
              Swal.showValidationMessage(`Erro ao registrar intenção: ${error.message}`);
              return false;
            }
          }
        });
      });

      cardsWrapper.appendChild(card);
    });
    
    container.appendChild(cardsWrapper);
  }

  section.appendChild(container);
  containerPai.appendChild(section);
});
