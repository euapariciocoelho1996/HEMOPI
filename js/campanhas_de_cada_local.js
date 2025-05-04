import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
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

        const fimData = dados.fim?.toDate
          ? dados.fim.toDate().toISOString().split("T")[0]
          : dados.fim;

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
          <p class="campanha-local">${dados.localNome || "Local não informado"}</p>
          <p>${dados.descricao}</p>
          <p class="campanha-data">Até: ${fimData}</p>
          <button class="btn-editar" style="margin-top:10px;">Editar</button>
        `;

        // Evento de edição
        card.querySelector(".btn-editar").addEventListener("click", async () => {
          const { value: formValues } = await Swal.fire({
            title: "Editar Campanha",
            html: `
              <input id="swal-titulo" class="swal2-input" placeholder="Título" value="${dados.titulo}">
              <input id="swal-local" class="swal2-input" placeholder="Nome do Local" value="${dados.localNome || ""}">
              <textarea id="swal-desc" class="swal2-textarea" placeholder="Descrição">${dados.descricao}</textarea>
              <input id="swal-fim" class="swal2-input" type="date" value="${fimData}">
              <select id="swal-urgencia" class="swal2-select">
                <option value="urgente" ${urgencia === "urgente" ? "selected" : ""}>URGENTE</option>
                <option value="media" ${urgencia === "media" ? "selected" : ""}>IMPORTANTE</option>
                <option value="baixa" ${urgencia === "baixa" ? "selected" : ""}>REGULAR</option>
              </select>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Salvar",
            preConfirm: () => {
              return {
                titulo: document.getElementById("swal-titulo").value,
                localNome: document.getElementById("swal-local").value,
                descricao: document.getElementById("swal-desc").value,
                fim: document.getElementById("swal-fim").value,
                urgencia: document.getElementById("swal-urgencia").value
              };
            }
          });

          if (formValues) {
            try {
              await updateDoc(doc(db, "campanhas", docId), {
                ...formValues,
                fim: new Date(formValues.fim)
              });

              Swal.fire("Sucesso!", "Campanha atualizada com sucesso.", "success").then(() => {
                location.reload();
              });
            } catch (err) {
              console.error("Erro ao atualizar campanha:", err);
              Swal.fire("Erro", "Não foi possível atualizar a campanha.", "error");
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
