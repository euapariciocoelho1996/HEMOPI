/**
 * User profile management
 * Handles user profile display, editing, and campaign management
 */

import { getAuthInstance, initAuthStateMonitoring } from './auth-manager.js';
import { 
    getUserProfile, 
    saveUserProfile, 
    addDocument, 
    queryDocuments,
    getDocument,
    setDocument 
} from './firebase-services.js';
import { showNotification, showConfirmDialog } from './utils.js';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signOut,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { app } from "./firebase-config.js";

const auth = getAuthInstance();

/**
 * Loads and displays user profile
 * @param {string} uid - User ID
 */
async function loadUserProfile(uid) {
    try {
        const userData = await getUserProfile(uid);
        if (userData) {
            renderUserProfile(userData);
        }
        return userData;
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        showNotification("Erro", "Erro ao carregar perfil do usuário.", "error");
        return null;
    }
}

/**
 * Renders user profile information
 * @param {Object} userData - User data
 */
function renderUserProfile(userData) {
    const profileInfo = document.getElementById("profileInfo");
    if (!profileInfo) return;

    profileInfo.innerHTML = `
        <div class="profile-card">
            <h3>Informações Pessoais</h3>
            <p><strong>Nome:</strong> ${userData.nome || "Não informado"}</p>
            <p><strong>Idade:</strong> ${userData.idade || "Não informada"}</p>
            <p><strong>Sexo:</strong> ${userData.sexo || "Não informado"}</p>
            <p><strong>Endereço:</strong> ${userData.rua || "Não informado"}, ${userData.bairro || "Não informado"}</p>
            <p><strong>E-mail:</strong> ${userData.email || "Não informado"}</p>
        </div>
    `;
}

/**
 * Loads and displays local information
 * @param {string} email - User email
 */
async function loadLocalInfo(email) {
    try {
        const locais = await queryDocuments('locais', [['email', '==', email]]);
        
        const localInfo = document.getElementById("localInfo");
        if (!localInfo) return;

        if (locais.length > 0) {
            const localData = locais[0];
            localInfo.innerHTML = `
                <div class="profile-card">
                    <h3>Informações do Local</h3>
                    <p><strong>Nome:</strong> ${localData.nome}</p>
                    <p><strong>Endereço:</strong> ${localData.endereco}</p>
                    <p><strong>Contato:</strong> ${localData.contato}</p>
                    <p><strong>CNPJ:</strong> ${localData.cnpj}</p>
                </div>
            `;
        } else {
            localInfo.innerHTML = `
                <div class="profile-card">
                    <h3>Local não encontrado</h3>
                    <p>Nenhum local cadastrado com este e-mail.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Erro ao buscar dados do local:", error);
        showNotification("Erro", "Erro ao buscar dados do local.", "error");
    }
}

/**
 * Shows profile editing form
 */
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

/**
 * Registers a new campaign
 * @param {Object} campanha - Campaign data
 */
async function cadastrarCampanha(campanha) {
    try {
        const docId = await addDocument('campanhas', campanha);
        if (docId) {
            console.log("Campanha cadastrada com ID:", docId);
            showNotification("Sucesso", "Campanha cadastrada com sucesso!", "success");
        } else {
            throw new Error("Falha ao cadastrar campanha");
        }
    } catch (error) {
        console.error("Erro ao cadastrar campanha:", error);
        showNotification("Erro", "Não foi possível cadastrar a campanha.", "error");
    }
}

/**
 * Shows campaign registration form
 */
function showCampaignForm() {
    Swal.fire({
        title: "Cadastrar Nova Campanha",
        width: 700,
        html: `
            <div class="form-container">
                <input type="text" id="titulo" placeholder="Título da campanha" class="form-field" required>
                <textarea id="descricao" placeholder="Descrição da campanha" class="form-field" rows="3" required></textarea>
                <input type="date" id="inicio" class="form-field" required>
                <input type="date" id="fim" class="form-field" required>
                <select id="urgencia" class="form-field" required>
                    <option value="">Selecione a urgência</option>
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                </select>
                <input type="text" id="local" placeholder="Local da campanha" class="form-field" required>
                <input type="text" id="cidade" placeholder="Cidade" class="form-field" required>
                <input type="text" id="estado" placeholder="Estado" class="form-field" required>
                <input type="text" id="contato" placeholder="Contato" class="form-field">
                <textarea id="requisitos" placeholder="Requisitos especiais" class="form-field" rows="2"></textarea>
                <textarea id="observacoes" placeholder="Observações" class="form-field" rows="2"></textarea>
            </div>
        `,
        confirmButtonText: "Cadastrar Campanha",
        confirmButtonColor: "#ce483c",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        focusConfirm: false,
        preConfirm: () => {
            const titulo = document.getElementById("titulo").value.trim();
            const descricao = document.getElementById("descricao").value.trim();
            const inicio = document.getElementById("inicio").value;
            const fim = document.getElementById("fim").value;
            const urgencia = document.getElementById("urgencia").value;
            const local = document.getElementById("local").value.trim();
            const cidade = document.getElementById("cidade").value.trim();
            const estado = document.getElementById("estado").value.trim();
            const contato = document.getElementById("contato").value.trim();
            const requisitos = document.getElementById("requisitos").value.trim();
            const observacoes = document.getElementById("observacoes").value.trim();

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
                responsavel: auth.currentUser.email,
                dataCriacao: new Date().toISOString(),
                ativa: true
            };
        },
    }).then(async (result) => {
        if (result.isConfirmed) {
            await cadastrarCampanha(result.value);
        }
    });
}

/**
 * Shows local editing form
 * @param {Object} localData - Current local data
 */
function showEditLocalForm(localData) {
    Swal.fire({
        title: "Editar Informações do Local",
        width: 600,
        html: `
            <div class="form-container">
                <input type="text" id="edit-nome" placeholder="Nome do local" class="form-field" value="${localData.nome || ''}" required>
                <input type="text" id="edit-endereco" placeholder="Endereço" class="form-field" value="${localData.endereco || ''}" required>
                <input type="text" id="edit-contato" placeholder="Contato" class="form-field" value="${localData.contato || ''}" required>
            </div>
        `,
        confirmButtonText: "Salvar Alterações",
        confirmButtonColor: "#ce483c",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        focusConfirm: false,
        preConfirm: () => {
            const nome = document.getElementById("edit-nome").value.trim();
            const endereco = document.getElementById("edit-endereco").value.trim();
            const contato = document.getElementById("edit-contato").value.trim();

            if (!nome || !endereco || !contato) {
                Swal.showValidationMessage("Preencha todos os campos!");
                return false;
            }

            return { nome, endereco, contato };
        },
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const success = await setDocument('locais', localData.cnpj, {
                    ...localData,
                    ...result.value,
                    ultimaAtualizacao: new Date().toISOString()
                });

                if (success) {
                    showNotification("Sucesso", "Dados do local atualizados.", "success");
                    await loadLocalInfo(auth.currentUser.email);
                } else {
                    throw new Error("Falha ao atualizar dados");
                }
            } catch (error) {
                console.error("Erro ao atualizar local:", error);
                showNotification("Erro", "Erro ao atualizar dados do local.", "error");
            }
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    const profileBtn = document.getElementById("abrirFormulario");
    if (profileBtn) {
        profileBtn.addEventListener("click", showProfileForm);
    }
});

// Initialize authentication monitoring with callback
initAuthStateMonitoring(async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Load user profile
    await loadUserProfile(user.uid);
    
    // Load local info
    await loadLocalInfo(user.email);

    // Check if user is a location admin and show appropriate buttons
    const locais = await queryDocuments('locais', [['email', '==', user.email]]);
    
    if (locais.length > 0) {
        // User is a location admin - show admin buttons
        const profileInfo = document.getElementById("profileInfo");
        if (profileInfo) {
            const adminButtons = document.createElement("div");
            adminButtons.className = "admin-buttons";
            adminButtons.innerHTML = `
                <button id="cadastrarCampanha" class="form-button">Cadastrar Campanha</button>
                <button id="cadastrarUsuario" class="form-button">Cadastrar Usuário</button>
                <button id="editarLocal" class="form-button">Editar Local</button>
            `;
            profileInfo.appendChild(adminButtons);

            // Add event listeners for admin buttons
            document.getElementById("cadastrarCampanha").addEventListener("click", showCampaignForm);
            
            document.getElementById("cadastrarUsuario").addEventListener("click", () => {
                Swal.fire({
                    title: "Cadastrar Novo Usuário",
                    width: 500,
                    html: `
                        <div class="form-container">
                            <input type="email" id="user-email" placeholder="E-mail do usuário" class="form-field" required>
                            <input type="password" id="user-senha" placeholder="Senha" class="form-field" required>
                        </div>
                    `,
                    confirmButtonText: "Cadastrar",
                    confirmButtonColor: "#ce483c",
                    showCancelButton: true,
                    cancelButtonText: "Cancelar",
                    focusConfirm: false,
                    preConfirm: async () => {
                        const email = document.getElementById("user-email").value.trim();
                        const senha = document.getElementById("user-senha").value;

                        if (!email || !senha) {
                            Swal.showValidationMessage("Preencha todos os campos!");
                            return false;
                        }

                        try {
                            const secondaryApp = initializeApp(firebaseConfig, "Secondary");
                            const secondaryAuth = getAuth(secondaryApp);

                            const userCredential = await createUserWithEmailAndPassword(
                                secondaryAuth,
                                email,
                                senha
                            );
                            const newUser = userCredential.user;

                            await setDocument('usuarios', newUser.uid, {
                                email: email,
                                dataCadastro: new Date().toISOString(),
                            });

                            await signOut(secondaryAuth);
                            return true;
                        } catch (error) {
                            if (error.code === "auth/email-already-in-use") {
                                Swal.showValidationMessage("Este e-mail já está cadastrado.");
                            } else if (error.code === "auth/weak-password") {
                                Swal.showValidationMessage("A senha deve ter pelo menos 6 caracteres.");
                            } else {
                                Swal.showValidationMessage("Erro ao cadastrar usuário: " + error.message);
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

            document.getElementById("editarLocal").addEventListener("click", async () => {
                if (locais.length > 0) {
                    const localData = locais[0];
                    showEditLocalForm(localData);
                }
            });
        }

        // Show campaigns container for location admins
        const campanhasContainer = document.getElementById("campanhasContainer");
        if (campanhasContainer) {
            campanhasContainer.style.display = "block";
        }
    } else {
        // Regular user - show donation info
        const userDonationInfo = document.getElementById("userDonationInfo");
        if (userDonationInfo) {
            userDonationInfo.style.display = "block";
        }
    }
});
