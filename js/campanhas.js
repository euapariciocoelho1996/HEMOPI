import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
// SweetAlert2 já está no HTML via CDN, mas se quiser usar import, pode fazer:
// import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js";


const firebaseConfig = {
  apiKey: "AIzaSyDul81cb5or7oR8HCs5I_Vw-SHm-ORHshI",
  authDomain: "teste-2067f.firebaseapp.com",
  projectId: "teste-2067f",
  storageBucket: "teste-2067f.appspot.com",
  messagingSenderId: "160483034987",
  appId: "1:160483034987:web:944eb621b02efea11b2e2e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";


const auth = getAuth(app);
document.addEventListener("DOMContentLoaded", async () => {
  const containerPai = document.getElementById("campanhasContainer");
  if (!containerPai) return;

  const campanhasRef = collection(db, "campanhas");
  const querySnapshot = await getDocs(campanhasRef);

  const section = document.createElement("section");
  section.id = "campanhas";
  section.classList.add("secao-campanhas");

  const container = document.createElement("div");
  container.className = "campanhas-container";

  container.innerHTML = `
    <h2>Campanhas de Doação Ativas</h2>
    <p class="campanha-subtitulo">Veja todas as campanhas registradas na plataforma.</p>
  `;

  const cardsWrapper = document.createElement("div");
  cardsWrapper.className = "campanhas-cards";

  if (querySnapshot.empty) {
    cardsWrapper.innerHTML = "<p>Nenhuma campanha cadastrada até o momento.</p>";
  } else {
    querySnapshot.forEach(docSnap => {
      const dados = docSnap.data();

      const inicioData = dados.inicio?.toDate
        ? dados.inicio.toDate().toISOString().split("T")[0]
        : dados.inicio || "";

      const fimData = dados.fim?.toDate
        ? dados.fim.toDate().toISOString().split("T")[0]
        : dados.fim || "";

      const urgencia = dados.urgencia || "baixa";
      const urgenciaTexto = {
        urgente: "URGENTE",
        media: "IMPORTANTE",
        baixa: "REGULAR"
      }[urgencia];

      const card = document.createElement("div");
      card.classList.add("campanha-card");
    
      card.innerHTML = `
        <div class="urgencia ${urgencia}">${urgenciaTexto}</div>
        <h3>${dados.titulo}</h3>
        <p>${dados.descricao}</p>
        <p class="campanha-data">Início: ${inicioData} | Fim: ${fimData}</p>
        <p class="campanha-local">Organizada por: ${dados.local}</p>
        <p class="campanha-localizacao">Localização: ${dados.cidade || "Cidade não informada"}, ${dados.estado || "Estado não informado"}</p>
      `;


        card.addEventListener("click", () => {
          Swal.fire({
            title: dados.titulo,
            html: `
              <p><strong>Descrição:</strong> ${dados.descricao}</p>
              <p><strong>Início:</strong> ${inicioData} | <strong>Fim:</strong> ${fimData}</p>
              <p><strong>Urgência:</strong> ${urgenciaTexto}</p>
              <p><strong>Organizada por:</strong> ${dados.local}</p>
              <p><strong>Localização:</strong> ${dados.cidade || "Cidade não informada"}, ${dados.estado || "Estado não informado"}</p>
              <hr>
              <p><strong>Contato:</strong> ${dados.contato || "Não informado"}</p>
              <p><strong>Requisitos:</strong> ${dados.requisitos || "Nenhum requisito adicional"}</p>
              <p><strong>Observações:</strong> ${dados.observacoes || "Sem observações"}</p>
            `,
            showCloseButton: true,
            showCancelButton: true,
            cancelButtonText: 'Fechar',
            confirmButtonText: 'Quero doar nesta campanha',
            focusConfirm: false,
            customClass: {
              popup: 'popup-campanha'
            },
            preConfirm: async () => {
                const user = auth.currentUser;
                if (!user) {
                  Swal.showValidationMessage('Você precisa estar logado para registrar sua intenção. Por favor, faça login.');
                  return false;
                }

                // Objeto com os dados que você quer salvar
                const intencao = {
                  campanhaId: docSnap.id,         // id do documento da campanha
                  usuarioId: user.uid,             // id do usuário autenticado
                  usuarioEmail: user.email || "", // email do usuário (se disponível)
                  campanhaTitulo: dados.titulo,
                  campanhaResponsavel: dados.local || "",  // responsável pela campanha
                  timestamp: new Date(),
                };

                try {
                  await addDoc(collection(db, "intencaoDoacao"), intencao);
                } catch (error) {
                  Swal.showValidationMessage(`Erro ao registrar intenção: ${error.message}`);
                  return false;
                }

                await Swal.fire({
                  icon: 'success',
                  title: 'Obrigado!',
                  text: 'Sua intenção de doar foi registrada. A equipe entrará em contato se necessário.',
                });
              }

          });
        });



      cardsWrapper.appendChild(card);
    });
  }

  container.appendChild(cardsWrapper);
  section.appendChild(container);
  containerPai.appendChild(section);
});
