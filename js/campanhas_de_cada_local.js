import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js"; 
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11.7.27/+esm'


// Configuração do Firebase
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

onAuthStateChanged(auth, async (user) => {
  const containerPai = document.getElementById("campanhasContainer");
  if (!containerPai) return;

  if (user) {
    const campanhasRef = collection(db, "campanhas");
    const q = query(campanhasRef, where("local", "==", user.email));
    const querySnapshot = await getDocs(q);

    const section = document.createElement("section");
    section.id = "campanhas";
    section.classList.add("secao-campanhas", "reveal");

    const container = document.createElement("div");
    container.className = "campanhas-container";

    container.innerHTML = `
      <h2>Campanhas de Doação Ativas</h2>
      <p class="campanha-subtitulo">
        Gerencie suas campanhas de doação ativas. Você pode editar as informações de cada campanha clicando no botão "Editar".
      </p>
    `;

    const cardsWrapper = document.createElement("div");
    cardsWrapper.className = "campanhas-cards";

    if (querySnapshot.empty) {
      cardsWrapper.innerHTML = "<p>Você não possui campanhas cadastradas.</p>";
    } else {
      querySnapshot.forEach(docSnap => {
        const dados = docSnap.data();
        const docId = docSnap.id;

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
          <p><strong>Cidade:</strong> ${dados.cidade || "Não informada"}</p>
          <p><strong>Estado:</strong> ${dados.estado || "Não informado"}</p>
          <p class="campanha-data">Início: ${inicioData} | Fim: ${fimData}</p>
          <button class="btn-editar" style="margin-top:10px;">Editar</button>
      `;


        // Evento de edição
        // Evento de edição
      card.querySelector(".btn-editar").addEventListener("click", async () => {
         const result = await Swal.fire({
            title: "Editar Campanha",
            html: `
              <input id="swal-titulo" class="swal2-input" placeholder="Título" value="${dados.titulo}">
              <textarea id="swal-desc" class="swal2-textarea" placeholder="Descrição">${dados.descricao}</textarea>
              <input id="swal-inicio" class="swal2-input" type="date" value="${inicioData}">
              <input id="swal-fim" class="swal2-input" type="date" value="${fimData}">
              <input id="swal-cidade" class="swal2-input" placeholder="Cidade" value="${dados.cidade || ""}">
              <input id="swal-estado" class="swal2-input" placeholder="Estado" value="${dados.estado || ""}">
              <select id="swal-urgencia" class="swal2-select">
                <option value="urgente" ${urgencia === "urgente" ? "selected" : ""}>URGENTE</option>
                <option value="media" ${urgencia === "media" ? "selected" : ""}>IMPORTANTE</option>
                <option value="baixa" ${urgencia === "baixa" ? "selected" : ""}>REGULAR</option>
              </select>
              <input id="swal-contato" class="swal2-input" placeholder="Contato (telefone)" value="${dados.contato || ""}">
              <textarea id="swal-requisitos" class="swal2-textarea" placeholder="Requisitos (opcional)">${dados.requisitos || ""}</textarea>
              <textarea id="swal-observacoes" class="swal2-textarea" placeholder="Observações (opcional)">${dados.observacoes || ""}</textarea>
            `,
            focusConfirm: false,
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: "Salvar",
            denyButtonText: "Excluir",
            cancelButtonText: "Cancelar",
            preConfirm: () => {
              return {
                titulo: document.getElementById("swal-titulo").value,
                descricao: document.getElementById("swal-desc").value,
                inicio: document.getElementById("swal-inicio").value,
                fim: document.getElementById("swal-fim").value,
                cidade: document.getElementById("swal-cidade").value,
                estado: document.getElementById("swal-estado").value,
                urgencia: document.getElementById("swal-urgencia").value,
                contato: document.getElementById("swal-contato").value,
                requisitos: document.getElementById("swal-requisitos").value,
                observacoes: document.getElementById("swal-observacoes").value
              };
            }
          });

        // Salvar alterações
        if (result.isConfirmed && result.value) {
          try {
            await updateDoc(doc(db, "campanhas", docId), {
              ...result.value,
              inicio: new Date(result.value.inicio),
              fim: new Date(result.value.fim)
            });

            Swal.fire("Sucesso!", "Campanha atualizada com sucesso.", "success").then(() => {
              location.reload();
            });
          } catch (err) {
            console.error("Erro ao atualizar campanha:", err);
            Swal.fire("Erro", "Não foi possível atualizar a campanha.", "error");
          }
        }

        // Excluir campanha
        if (result.isDenied) {
          const confirmDelete = await Swal.fire({
            title: "Tem certeza?",
            text: "Você não poderá reverter essa ação!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim, excluir!",
            cancelButtonText: "Cancelar"
          });

          if (confirmDelete.isConfirmed) {
            try {
              await deleteDoc(doc(db, "campanhas", docId));
              Swal.fire("Excluído!", "A campanha foi removida com sucesso.", "success").then(() => {
                location.reload();
              });
            } catch (err) {
              console.error("Erro ao excluir campanha:", err);
              Swal.fire("Erro", "Não foi possível excluir a campanha.", "error");
            }
          }
        }
      });


        cardsWrapper.appendChild(card);
      });
    }

    container.appendChild(cardsWrapper);
    section.appendChild(container);
    containerPai.appendChild(section);

  } else {
    containerPai.innerHTML = "<p>Você precisa estar logado para visualizar suas campanhas.</p>";
  }
});
