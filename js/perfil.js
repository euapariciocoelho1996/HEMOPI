import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js"; 
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDul81cb5or7oR8HCs5I_Vw-SHm-ORHshI",
    authDomain: "teste-2067f.firebaseapp.com",
    projectId: "teste-2067f",
    storageBucket: "teste-2067f.appspot.com",
    messagingSenderId: "160483034987",
    appId: "1:160483034987:web:944eb621b02efea11b2e2e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

function renderUserProfile(userData) {
    const container = document.getElementById('profileInfo');
    if (!container) return;

    container.innerHTML = `
        <div class="profile-card">
            <h3>Dados do Usuário</h3>
            <p><strong>Nome:</strong> ${userData.nome || 'Não informado'}</p>
            <p><strong>Idade:</strong> ${userData.idade || 'Não informada'}</p>
            <p><strong>Sexo:</strong> ${userData.sexo || 'Não informado'}</p>
            <p><strong>Rua:</strong> ${userData.rua || 'Não informada'}</p>
            <p><strong>Bairro:</strong> ${userData.bairro || 'Não informado'}</p>
            <div class="donation-info">
                <p><i class="heart-icon">❤️</i> <strong>Doações:</strong> ${userData.doacoes || 0}</p>
                <p><i class="calendar-icon">📅</i> <strong>Última Doação:</strong> ${userData.ultimaDoacao || 'Não registrada'}</p>
                <p><i class="calendar-icon">⏳</i> <strong>Próxima Doação:</strong> ${userData.proximaDoacao || 'Não definida'}</p>
            </div>
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
    const container = document.getElementById('localInfo');
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

    container.innerHTML = `
        <div class="profile-card">
            <h3>Informações do Local Vinculado</h3>
            <p><strong>Nome:</strong> ${localData.nome || 'Não informado'}</p>
            <p><strong>CNPJ:</strong> ${localData.cnpj || 'Não informado'}</p>
            <p><strong>Contato:</strong> ${localData.contato || 'Não informado'}</p>
            <p><strong>Email:</strong> ${localData.email || 'Não informado'}</p>
            <p><strong>Endereço:</strong> ${localData.endereco || 'Não informado'}</p>
        </div>
    `;
}

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
                showNotification('Sucesso', 'Dados atualizados.', 'success');
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
        showNotification('Sucesso', 'Campanha cadastrada com sucesso!', 'success');
    } catch (error) {
        console.error("Erro ao cadastrar campanha:", error);
        showNotification('Erro', 'Não foi possível cadastrar a campanha.', 'error');
    }
}

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
        preConfirm: () => {
            const titulo = document.getElementById('titulo').value.trim();
            const local = document.getElementById('local').value.trim();
            const descricao = document.getElementById('descricao').value.trim();
            const inicio = document.getElementById('inicio').value;
            const fim = document.getElementById('fim').value;

            if (!titulo || !local || !descricao || !inicio || !fim) {
                Swal.showValidationMessage('Preencha todos os campos!');
                return false;
            }

            return { titulo, local, descricao, inicio, fim };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            await cadastrarCampanha(result.value);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const profileBtn = document.getElementById('abrirFormulario');
    const profileInfoContainer = document.getElementById('profileInfo');
    const localInfoContainer = document.getElementById('localInfo');
    const pageTitle = document.getElementById('pageTitle');

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            profileInfoContainer.innerHTML = `
                <div class="profile-card">
                    <h3>Não autenticado</h3>
                    <p>Faça login para visualizar seu perfil.</p>
                    <a href="login.html" class="login-link">Fazer Login</a>
                </div>
            `;
            localInfoContainer.innerHTML = '';
            profileBtn.style.display = 'none';
            return;
        }

        const isLocal = await loadLocalByEmail(user.email);

        if (isLocal) {
            profileInfoContainer.innerHTML = '';
            profileBtn.style.display = 'none';
            pageTitle.textContent = "Perfil do Local";

            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.gap = '10px';

            const campaignBtn = document.createElement('button');
            campaignBtn.textContent = "Cadastrar Campanha";
            campaignBtn.classList.add('form-button');
            campaignBtn.addEventListener('click', () => showCampaignForm(user.email));

            const redirectBtn = document.createElement('button');
            redirectBtn.textContent = "Editar Campanhas";
            redirectBtn.classList.add('form-button');
            redirectBtn.addEventListener('click', () => {
                window.location.href = "campanhas_de_cada_local.html";
            });

            const registerUserBtn = document.createElement('button');
            registerUserBtn.textContent = "Cadastrar Usuário";
            registerUserBtn.classList.add('form-button');
            registerUserBtn.addEventListener('click', () => {
                Swal.fire({
                    title: 'Cadastrar Novo Usuário',
                    html:
                        '<input id="swal-input-email" class="swal2-input" placeholder="Email">' +
                        '<input id="swal-input-password" type="password" class="swal2-input" placeholder="Senha">' +
                        '<input id="swal-input-confirm" type="password" class="swal2-input" placeholder="Confirmar Senha">',
                    focusConfirm: false,
                    showCancelButton: true,
                    confirmButtonText: 'Cadastrar',
                    confirmButtonColor: '#ce483c',
                    preConfirm: async () => {
                        const email = document.getElementById('swal-input-email').value.trim();
                        const senha = document.getElementById('swal-input-password').value;
                        const confirmar = document.getElementById('swal-input-confirm').value;

                        if (!email || !senha || !confirmar) {
                            Swal.showValidationMessage('Por favor, preencha todos os campos.');
                            return false;
                        }

                        if (senha !== confirmar) {
                            Swal.showValidationMessage('As senhas não coincidem.');
                            return false;
                        }

                        try {
                            const secondaryApp = initializeApp(firebaseConfig, "Secondary");
                            const secondaryAuth = getAuth(secondaryApp);

                            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, senha);
                            const newUser = userCredential.user;

                            await setDoc(doc(db, "usuarios", newUser.uid), {
                                email: email,
                                dataCadastro: new Date().toISOString()
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
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire('Sucesso!', 'Usuário cadastrado com sucesso.', 'success');
                    }
                });
            });

            buttonContainer.appendChild(campaignBtn);
            buttonContainer.appendChild(redirectBtn);
            buttonContainer.appendChild(registerUserBtn);
            localInfoContainer.appendChild(buttonContainer);

        } else {
            const userData = await loadUserProfile(user.uid);
            if (userData) {
                renderUserProfile(userData);
            }
            localInfoContainer.innerHTML = '';
            profileBtn.style.display = 'inline-block';
            profileBtn.addEventListener('click', showProfileForm);
            pageTitle.textContent = "Perfil do Usuário";
        }
    });
});
