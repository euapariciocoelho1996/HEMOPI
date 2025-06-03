import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDul81cb5or7oR8HCs5I_Vw-SHm-ORHshI",
  authDomain: "teste-2067f.firebaseapp.com",
  projectId: "teste-2067f",
  storageBucket: "teste-2067f.appspot.com",
  messagingSenderId: "160483034987",
  appId: "1:160483034987:web:944eb621b02efea11b2e2e",
};

import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

function showNotification(title, message, type = "info") {
  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: title,
      text: message,
      icon: type,
      confirmButtonColor: "#ce483c",
    });
  } else {
    alert(`${title}: ${message}`);
  }
}

async function loadUserProfile(uid) {
  try {
    const userRef = doc(db, "usuarios", uid);
    const docSnap = await getDoc(userRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    showNotification("Erro", "Erro ao carregar perfil do usuário.", "error");
    return null;
  }
}

function renderUserProfile(userData) {
  const container = document.getElementById("profileInfo");
  if (!container) return;

  container.innerHTML = `
        <div class="profile-card">
            <h3>Dados do Usuário</h3>
            <p><strong>Nome:</strong> ${userData.nome || "Não informado"}</p>
            <p><strong>Idade:</strong> ${userData.idade || "Não informada"}</p>
            <p><strong>Sexo:</strong> ${userData.sexo || "Não informado"}</p>
            <p><strong>Rua:</strong> ${userData.rua || "Não informada"}</p>
            <p><strong>Bairro:</strong> ${
              userData.bairro || "Não informado"
            }</p>
            
        </div>
    `;
}

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
      renderLocalData(null);
      return false;
    }
  } catch (error) {
    console.error("Erro ao buscar local:", error);
    showNotification("Erro", "Erro ao buscar dados do local.", "error");
    return false;
  }
}

function renderLocalData(localData) {
  const container = document.getElementById("localInfo");
  if (!container) return;

  if (!localData) {
    container.innerHTML = `
            <div class="profile-card">
                <h3>Local não encontrado</h3>
                <p>Não há dados de local vinculados ao seu e-mail.</p>
            </div>
        `;
    return;
  }

  // Renderiza os dados do local
  container.innerHTML = `
        <div class="profile-card">
            <h3>Informações do Local Vinculado</h3>
            <p><strong>Nome:</strong> ${localData.nome || "Não informado"}</p>
            <p><strong>CNPJ:</strong> ${localData.cnpj || "Não informado"}</p>
            <p><strong>Contato:</strong> ${
              localData.contato || "Não informado"
            }</p>
            <p><strong>Email:</strong> ${localData.email || "Não informado"}</p>
            <p><strong>Endereço:</strong> ${
              localData.endereco || "Não informado"
            }</p>
        </div>
    `;

  // Cria os botões novamente
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.gap = "10px";
  buttonContainer.style.justifyContent = "center";
  buttonContainer.style.marginTop = "20px";

  const campaignBtn = document.createElement("button");
  campaignBtn.textContent = "Cadastrar Campanha";
  campaignBtn.classList.add("form-button");
  campaignBtn.addEventListener("click", () =>
    showCampaignForm(localData.email)
  );

  const redirectBtn = document.createElement("button");
  redirectBtn.textContent = "Editar Campanhas";
  redirectBtn.classList.add("form-button");
  redirectBtn.addEventListener("click", () => {
    window.location.href = "campanhas_de_cada_local.html";
  });

  const registerUserBtn = document.createElement("button");
  registerUserBtn.textContent = "Cadastrar Usuário";
  registerUserBtn.classList.add("form-button");
  registerUserBtn.addEventListener("click", () => {
    if (typeof Swal === 'undefined') {
      alert('Erro: SweetAlert2 não está carregado. Por favor, recarregue a página.');
      return;
    }

    // Criar uma nova instância do Firebase para o novo usuário
    const secondaryApp = initializeApp(firebaseConfig, "Secondary");
    const secondaryAuth = getAuth(secondaryApp);

    Swal.fire({
      title: "Cadastrar Novo Usuário",
      html:
        '<input id="swal-input-email" class="swal2-input" placeholder="Email">' +
        '<input id="swal-input-password" type="password" class="swal2-input" placeholder="Senha">' +
        '<input id="swal-input-confirm" type="password" class="swal2-input" placeholder="Confirmar Senha">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Cadastrar",
      confirmButtonColor: "#ce483c",
      preConfirm: async () => {
        const email = document
          .getElementById("swal-input-email")
          .value.trim();
        const senha = document.getElementById("swal-input-password").value;
        const confirmar =
          document.getElementById("swal-input-confirm").value;

        if (!email || !senha || !confirmar) {
          Swal.showValidationMessage(
            "Por favor, preencha todos os campos."
          );
          return false;
        }

        if (senha !== confirmar) {
          Swal.showValidationMessage("As senhas não coincidem.");
          return false;
        }

        try {
          // Usar a instância secundária para criar o novo usuário
          const userCredential = await createUserWithEmailAndPassword(
            secondaryAuth,
            email,
            senha
          );
          const newUser = userCredential.user;

          // Usar a instância principal do Firestore para salvar os dados
          await setDoc(doc(db, "usuarios", newUser.uid), {
            email: email,
            dataCadastro: new Date().toISOString(),
          });

          // Fazer logout apenas da instância secundária
          await signOut(secondaryAuth);
          return true;
        } catch (error) {
          if (error.code === "auth/email-already-in-use") {
            Swal.showValidationMessage("Este e-mail já está cadastrado.");
          } else if (error.code === "auth/weak-password") {
            Swal.showValidationMessage(
              "A senha deve ter pelo menos 6 caracteres."
            );
          } else {
            Swal.showValidationMessage(
              "Erro ao cadastrar usuário: " + error.message
            );
          }
          return false;
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Sucesso!", "Usuário cadastrado com sucesso.", "success");
      }
    });
  });

  const editLocalBtn = document.createElement("button");
  editLocalBtn.textContent = "Editar Local";
  editLocalBtn.classList.add("form-button");
  editLocalBtn.addEventListener("click", () => {
    showEditLocalForm(localData);
  });

  // Adiciona os botões ao container
  buttonContainer.appendChild(campaignBtn);
  buttonContainer.appendChild(redirectBtn);
  buttonContainer.appendChild(registerUserBtn);
  buttonContainer.appendChild(editLocalBtn);

  container.appendChild(buttonContainer); // Anexa ao DOM
}

async function saveUserProfile(uid, data) {
  try {
    const userRef = doc(db, "usuarios", uid);
    await setDoc(userRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    showNotification(
      "Erro",
      "Não foi possível salvar os dados do perfil.",
      "error"
    );
    return false;
  }
}

function showProfileForm() {
  Swal.fire({
    title: "Atualize seus dados",
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
    confirmButtonText: "Salvar",
    confirmButtonColor: "#ce483c",
    focusConfirm: false,
    preConfirm: () => {
      const nome = document.getElementById("nome").value.trim();
      const idade = document.getElementById("idade").value.trim();
      const sexo = document.getElementById("sexo").value.trim();
      const rua = document.getElementById("rua").value.trim();
      const bairro = document.getElementById("bairro").value.trim();

      if (!nome || !idade || !sexo || !rua || !bairro) {
        Swal.showValidationMessage("Preencha todos os campos!");
        return false;
      }

      return { nome, idade, sexo, rua, bairro };
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      const saved = await saveUserProfile(auth.currentUser.uid, result.value);
      if (saved) {
        showNotification("Sucesso", "Dados atualizados.", "success");
        renderUserProfile(result.value);
      }
    }
  });
}

async function cadastrarCampanha(campanha) {
  try {
    const campanhasRef = collection(db, "campanhas");
    const docRef = await addDoc(campanhasRef, campanha);
    console.log("Campanha cadastrada com ID:", docRef.id);
    showNotification("Sucesso", "Campanha cadastrada com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao cadastrar campanha:", error);
    showNotification("Erro", "Não foi possível cadastrar a campanha.", "error");
  }
}

function showCampaignForm(emailLocal) {
  Swal.fire({
    title: "Cadastrar Nova Campanha",
    width: 600,
    html: `
            <div class="form-container">
                <input type="text" id="titulo" placeholder="Título da campanha" class="form-field" required>
                <input type="text" id="local" placeholder="Local (email do local)" class="form-field" value="${emailLocal}" readonly>
                <textarea id="descricao" placeholder="Descrição da campanha" class="form-field" required></textarea>
                <input type="text" id="cidade" placeholder="Cidade" class="form-field" required>
                <input type="text" id="estado" placeholder="Estado" class="form-field" required>
                <label for="inicio">Data de Início:</label>
                <input type="date" id="inicio" class="form-field" required>
                <label for="fim">Data de Fim:</label>
                <input type="date" id="fim" class="form-field" required>
                
                <input type="tel" id="contato" placeholder="Contato (telefone)" class="form-field" required>
                <textarea id="requisitos" placeholder="Requisitos (opcional)" class="form-field"></textarea>
                <textarea id="observacoes" placeholder="Observações (opcional)" class="form-field"></textarea>
            </div>
        `,
    confirmButtonText: "Cadastrar",
    confirmButtonColor: "#ce483c",
    focusConfirm: false,
    preConfirm: () => {
      const titulo = document.getElementById("titulo").value.trim();
      const local = document.getElementById("local").value.trim();
      const descricao = document.getElementById("descricao").value.trim();
      const cidade = document.getElementById("cidade").value.trim();
      const estado = document
        .getElementById("estado")
        .value.trim()
        .toUpperCase();
      const inicio = document.getElementById("inicio").value;
      const fim = document.getElementById("fim").value;
      const contato = document.getElementById("contato").value.trim();
      const requisitos = document.getElementById("requisitos").value.trim();
      const observacoes = document.getElementById("observacoes").value.trim();

      if (
        !titulo ||
        !local ||
        !descricao ||
        !cidade ||
        !estado ||
        !inicio ||
        !fim ||
        !contato
      ) {
        Swal.showValidationMessage("Preencha todos os campos obrigatórios!");
        return false;
      }

      return {
        titulo,
        local,
        descricao,
        cidade,
        estado,
        inicio,
        fim,
        contato,
        requisitos,
        observacoes,
      };
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      await cadastrarCampanha(result.value);
    }
  });
}

function validarCNPJ(cnpj) {
  // Remove tudo que não for dígito
  cnpj = cnpj.replace(/[^\d]+/g, "");
  // Verifica se tem exatamente 14 dígitos
  return cnpj.match(/^\d{14}$/) !== null;
}

function showEditLocalForm(localData) {
  Swal.fire({
    title: "Editar Informações do Local",
    width: 600,
    html: `
            <div class="form-container">
                <input type="text" id="nomeLocal" value="${
                  localData.nome || ""
                }" placeholder="Nome do local" class="form-field" required>
                <input type="text" id="cnpjLocal" value="${
                  localData.cnpj || ""
                }" placeholder="CNPJ" class="form-field" required>
                <input type="text" id="contatoLocal" value="${
                  localData.contato || ""
                }" placeholder="Contato" class="form-field" required>
                <input type="text" id="enderecoLocal" value="${
                  localData.endereco || ""
                }" placeholder="Endereço" class="form-field" required>
            </div>
        `,
    confirmButtonText: "Salvar",
    confirmButtonColor: "#ce483c",
    focusConfirm: false,
    preConfirm: async () => {
      const nome = document.getElementById("nomeLocal").value.trim();
      const cnpj = document.getElementById("cnpjLocal").value.trim();
      const contato = document.getElementById("contatoLocal").value.trim();
      const endereco = document.getElementById("enderecoLocal").value.trim();

      if (!nome || !cnpj || !contato || !endereco) {
        Swal.showValidationMessage("Preencha todos os campos!");
        return false;
      }

      if (!validarCNPJ(cnpj)) {
        Swal.showValidationMessage("CNPJ inválido!");
        return false;
      }

      // Verifica se o CNPJ já está cadastrado (exceto para o próprio documento)
      const locaisRef = collection(db, "locais");
      const cnpjQuery = query(locaisRef, where("cnpj", "==", cnpj));
      const cnpjSnapshot = await getDocs(cnpjQuery);
      const outroCadastrado = cnpjSnapshot.docs.find(
        (docSnap) => docSnap.data().email !== localData.email
      );

      if (outroCadastrado) {
        Swal.showValidationMessage(
          "Este CNPJ já está cadastrado para outro local."
        );
        return false;
      }

      return { nome, cnpj, contato, endereco };
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const locaisRef = collection(db, "locais");
        const q = query(locaisRef, where("email", "==", localData.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docId = querySnapshot.docs[0].id;
          const docRef = doc(db, "locais", docId);
          await setDoc(
            docRef,
            { ...localData, ...result.value },
            { merge: true }
          );
          showNotification(
            "Sucesso",
            "Informações do local atualizadas!",
            "success"
          );
          renderLocalData({ ...localData, ...result.value });
        }
      } catch (error) {
        console.error("Erro ao atualizar local:", error);
        showNotification(
          "Erro",
          "Não foi possível atualizar as informações do local.",
          "error"
        );
      }
    }
  });
}

// Sistema de Perfil de Usuário
class UserProfile {
    constructor() {
        this.userData = null;
        this.init();
    }

    init() {
        // Verificar se usuário está logado
        if (window.auth && window.auth.currentUser) {
            this.loadUserData();
        }
        
        // Adicionar listener para mudanças no estado de autenticação
        document.body.addEventListener('authStateChange', (e) => {
            if (e.detail.isLoggedIn) {
                this.loadUserData();
            } else {
                this.hideProfile();
            }
        });
        
        // Criar seção de perfil
        this.createProfileSection();
    }

    async loadUserData() {
        try {
            // Simulação de chamada à API
            this.userData = await this.simulateApiCall({
                name: window.auth.currentUser.name,
                email: window.auth.currentUser.email,
                bloodType: 'A+',
                lastDonation: '2024-02-15',
                totalDonations: 5,
                nextDonationDate: '2024-06-15',
                donationHistory: [
                    {
                        date: '2024-02-15',
                        location: 'HEMOPI Central',
                        type: 'Sangue Total',
                        status: 'Concluída'
                    },
                    {
                        date: '2023-10-10',
                        location: 'HEMOPI Móvel',
                        type: 'Sangue Total',
                        status: 'Concluída'
                    },
                    {
                        date: '2023-06-05',
                        location: 'HEMOPI Central',
                        type: 'Plaquetas',
                        status: 'Concluída'
                    }
                ],
                badges: [
                    {
                        icon: 'fa-heart',
                        name: 'Primeira Doação',
                        description: 'Realizou sua primeira doação'
                    },
                    {
                        icon: 'fa-award',
                        name: 'Doador Regular',
                        description: 'Realizou 5 doações'
                    },
                    {
                        icon: 'fa-star',
                        name: 'Doador Platina',
                        description: 'Doou em 3 campanhas diferentes'
                    }
                ]
            });
            
            this.updateProfileUI();
        } catch (error) {
            window.notifications.error('Erro ao carregar dados do perfil');
        }
    }

    createProfileSection() {
        let profileSection = document.querySelector('.profile-section');
        if (!profileSection) {
            profileSection = document.createElement('section');
            profileSection.className = 'profile-section';
            profileSection.style.display = 'none';
            
            profileSection.innerHTML = `
                <div class="profile-container">
                    <div class="profile-header">
                        <div class="profile-cover"></div>
                        <div class="profile-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <button class="edit-profile-btn">
                            <i class="fas fa-edit"></i>
                            Editar Perfil
                        </button>
                    </div>
                    
                    <div class="profile-content">
                        <div class="profile-info">
                            <h2 class="profile-name"></h2>
                            <div class="profile-details">
                                <div class="profile-detail">
                                    <i class="fas fa-envelope"></i>
                                    <span class="profile-email"></span>
                                </div>
                                <div class="profile-detail">
                                    <i class="fas fa-tint"></i>
                                    <span class="profile-blood-type"></span>
                                </div>
                                <div class="profile-detail">
                                    <i class="fas fa-calendar"></i>
                                    <span class="profile-last-donation"></span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-stats">
                            <div class="stat-card">
                                <div class="stat-value"></div>
                                <div class="stat-label">Doações Realizadas</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value next-donation"></div>
                                <div class="stat-label">Próxima Doação</div>
                            </div>
                        </div>
                        
                        <div class="profile-badges">
                            <h3>Conquistas</h3>
                            <div class="badges-grid"></div>
                        </div>
                        
                        <div class="donation-history">
                            <h3>Histórico de Doações</h3>
                            <div class="history-timeline"></div>
                        </div>
                    </div>
                </div>
            `;
            
            // Inserir após a seção de autenticação
            const authSection = document.querySelector('.auth-section');
            if (authSection) {
                authSection.parentNode.insertBefore(profileSection, authSection.nextSibling);
            } else {
                document.body.appendChild(profileSection);
            }
            
            // Adicionar listeners
            this.setupProfileListeners(profileSection);
        }
    }

    setupProfileListeners(profileSection) {
        const editBtn = profileSection.querySelector('.edit-profile-btn');
        editBtn.addEventListener('click', () => this.showEditProfileModal());
    }

    updateProfileUI() {
        const profileSection = document.querySelector('.profile-section');
        if (!profileSection || !this.userData) return;
        
        // Atualizar informações básicas
        profileSection.querySelector('.profile-name').textContent = this.userData.name;
        profileSection.querySelector('.profile-email').textContent = this.userData.email;
        profileSection.querySelector('.profile-blood-type').textContent = this.userData.bloodType;
        profileSection.querySelector('.profile-last-donation').textContent = 
            `Última doação: ${this.formatDate(this.userData.lastDonation)}`;
        
        // Atualizar estatísticas
        profileSection.querySelector('.stat-value').textContent = this.userData.totalDonations;
        profileSection.querySelector('.next-donation').textContent = 
            this.formatDate(this.userData.nextDonationDate);
        
        // Atualizar badges
        const badgesGrid = profileSection.querySelector('.badges-grid');
        badgesGrid.innerHTML = this.userData.badges.map(badge => `
            <div class="badge-card" data-tooltip="${badge.description}">
                <i class="fas ${badge.icon}"></i>
                <span>${badge.name}</span>
            </div>
        `).join('');
        
        // Atualizar histórico
        const timeline = profileSection.querySelector('.history-timeline');
        timeline.innerHTML = this.userData.donationHistory.map(donation => `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-date">${this.formatDate(donation.date)}</div>
                    <div class="timeline-title">${donation.type}</div>
                    <div class="timeline-location">${donation.location}</div>
                    <div class="timeline-status ${donation.status.toLowerCase()}">${donation.status}</div>
                </div>
            </div>
        `).join('');
        
        // Mostrar seção
        profileSection.style.display = 'block';
    }

    showEditProfileModal() {
        const modal = document.createElement('div');
        modal.className = 'edit-profile-modal';
        
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <h2>Editar Perfil</h2>
                
                <form id="editProfileForm">
                    <div class="form-group">
                        <label for="editName">Nome</label>
                        <input type="text" id="editName" value="${this.userData.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editEmail">Email</label>
                        <input type="email" id="editEmail" value="${this.userData.email}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editBloodType">Tipo Sanguíneo</label>
                        <select id="editBloodType">
                            <option value="A+" ${this.userData.bloodType === 'A+' ? 'selected' : ''}>A+</option>
                            <option value="A-" ${this.userData.bloodType === 'A-' ? 'selected' : ''}>A-</option>
                            <option value="B+" ${this.userData.bloodType === 'B+' ? 'selected' : ''}>B+</option>
                            <option value="B-" ${this.userData.bloodType === 'B-' ? 'selected' : ''}>B-</option>
                            <option value="AB+" ${this.userData.bloodType === 'AB+' ? 'selected' : ''}>AB+</option>
                            <option value="AB-" ${this.userData.bloodType === 'AB-' ? 'selected' : ''}>AB-</option>
                            <option value="O+" ${this.userData.bloodType === 'O+' ? 'selected' : ''}>O+</option>
                            <option value="O-" ${this.userData.bloodType === 'O-' ? 'selected' : ''}>O-</option>
                        </select>
                    </div>
                    
                    <button type="submit" class="save-profile-btn">Salvar Alterações</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar listeners
        const form = modal.querySelector('#editProfileForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProfileUpdate(form);
        });
        
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        const overlay = modal.querySelector('.modal-overlay');
        overlay.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    async handleProfileUpdate(form) {
        const name = form.querySelector('#editName').value;
        const email = form.querySelector('#editEmail').value;
        const bloodType = form.querySelector('#editBloodType').value;
        
        try {
            // Simulação de chamada à API
            await this.simulateApiCall({ name, email, bloodType });
            
            // Atualizar dados
            this.userData = {
                ...this.userData,
                name,
                email,
                bloodType
            };
            
            // Atualizar UI
            this.updateProfileUI();
            
            // Fechar modal
            const modal = document.querySelector('.edit-profile-modal');
            if (modal) {
                document.body.removeChild(modal);
            }
            
            window.notifications.success('Perfil atualizado com sucesso!');
        } catch (error) {
            window.notifications.error('Erro ao atualizar perfil');
        }
    }

    hideProfile() {
        const profileSection = document.querySelector('.profile-section');
        if (profileSection) {
            profileSection.style.display = 'none';
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    simulateApiCall(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(data);
            }, 800);
        });
    }
}

// Adicionar estilos
const style = document.createElement('style');
style.textContent = `
    .profile-section {
        padding: 40px 20px;
        background: var(--cor-fundo);
    }

    .profile-container {
        max-width: 800px;
        margin: 0 auto;
        background: var(--cor-fundo);
        border-radius: 12px;
        box-shadow: var(--sombra-padrao);
        overflow: hidden;
    }

    .profile-header {
        position: relative;
        height: 200px;
    }

    .profile-cover {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 120px;
        background: linear-gradient(135deg, var(--cor-primaria), var(--cor-secundaria));
    }

    .profile-avatar {
        position: absolute;
        left: 30px;
        bottom: 20px;
        width: 120px;
        height: 120px;
        background: var(--cor-fundo);
        border: 4px solid var(--cor-fundo);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--sombra-padrao);
    }

    .profile-avatar i {
        font-size: 48px;
        color: var(--cor-primaria);
    }

    .edit-profile-btn {
        position: absolute;
        right: 20px;
        bottom: 20px;
        padding: 8px 16px;
        background: var(--cor-primaria);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
    }

    .edit-profile-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .profile-content {
        padding: 30px;
    }

    .profile-info {
        margin-bottom: 40px;
    }

    .profile-name {
        margin: 0 0 20px 0;
        color: var(--cor-texto);
    }

    .profile-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
    }

    .profile-detail {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--cor-texto);
    }

    .profile-detail i {
        color: var(--cor-primaria);
    }

    .profile-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
    }

    .stat-card {
        padding: 20px;
        background: var(--cor-fundo);
        border-radius: 8px;
        text-align: center;
        box-shadow: var(--sombra-padrao);
    }

    .stat-value {
        font-size: 36px;
        font-weight: bold;
        color: var(--cor-primaria);
        margin-bottom: 10px;
    }

    .stat-label {
        color: var(--cor-texto);
        font-size: 14px;
    }

    .profile-badges {
        margin-bottom: 40px;
    }

    .profile-badges h3 {
        margin-bottom: 20px;
        color: var(--cor-texto);
    }

    .badges-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 20px;
    }

    .badge-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 15px;
        background: var(--cor-fundo);
        border-radius: 8px;
        box-shadow: var(--sombra-padrao);
        cursor: help;
    }

    .badge-card i {
        font-size: 24px;
        color: var(--cor-primaria);
        margin-bottom: 10px;
    }

    .badge-card span {
        text-align: center;
        font-size: 12px;
        color: var(--cor-texto);
    }

    .donation-history h3 {
        margin-bottom: 20px;
        color: var(--cor-texto);
    }

    .history-timeline {
        position: relative;
        padding-left: 30px;
    }

    .history-timeline::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--cor-primaria);
        opacity: 0.3;
    }

    .timeline-item {
        position: relative;
        margin-bottom: 30px;
    }

    .timeline-dot {
        position: absolute;
        left: -34px;
        top: 0;
        width: 10px;
        height: 10px;
        background: var(--cor-primaria);
        border-radius: 50%;
    }

    .timeline-content {
        background: var(--cor-fundo);
        padding: 15px;
        border-radius: 8px;
        box-shadow: var(--sombra-padrao);
    }

    .timeline-date {
        font-size: 14px;
        color: var(--cor-texto);
        opacity: 0.7;
        margin-bottom: 5px;
    }

    .timeline-title {
        font-weight: bold;
        color: var(--cor-texto);
        margin-bottom: 5px;
    }

    .timeline-location {
        font-size: 14px;
        color: var(--cor-texto);
        margin-bottom: 10px;
    }

    .timeline-status {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
    }

    .timeline-status.concluída {
        background: #28a745;
        color: white;
    }

    .edit-profile-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        animation: fadeIn 0.3s ease;
    }

    .modal-content {
        position: relative;
        width: 90%;
        max-width: 500px;
        background: var(--cor-fundo);
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        animation: slideIn 0.3s ease;
        z-index: 1;
    }

    .modal-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 24px;
        color: var(--cor-texto);
        cursor: pointer;
        opacity: 0.5;
        transition: opacity 0.2s;
    }

    .modal-close:hover {
        opacity: 1;
    }

    .save-profile-btn {
        width: 100%;
        padding: 12px;
        background: var(--cor-primaria);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .save-profile-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
        .profile-header {
            height: 240px;
        }

        .profile-avatar {
            left: 50%;
            transform: translateX(-50%);
        }

        .edit-profile-btn {
            bottom: 60px;
        }

        .profile-details {
            grid-template-columns: 1fr;
        }
    }
`;

document.head.appendChild(style);

// Inicializar sistema de perfil
document.addEventListener('DOMContentLoaded', () => {
    new UserProfile();
});
