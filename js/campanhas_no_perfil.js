import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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
  const container = document.getElementById("campanhasContainer");
  const lista = document.getElementById("listaCampanhas");
  const inputBusca = document.getElementById("buscaCampanha");
  const refreshBtn = document.getElementById("refreshCampanhas");

  if (!user || !container || !lista || !inputBusca || !refreshBtn) return;

  let campanhas = [];

  function renderizarLista(termo = "") {
    lista.innerHTML = "";

    const resultados = campanhas.filter(c =>
      c.titulo.toLowerCase().includes(termo.toLowerCase())
    );

    if (resultados.length === 0) {
      lista.innerHTML = "<li>Nenhuma campanha encontrada.</li>";
      return;
    }

    resultados.forEach(campanha => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${campanha.titulo}</strong>
        <span style="float: right;">
          <i class="fas fa-users" title="Visualizar pessoas" style="margin: 0 8px; cursor: pointer;" data-id="${campanha.id}" data-action="ver"></i>
          <i class="fas fa-check" title="Finalizar campanha" style="margin: 0 8px; cursor: pointer; color: green;" data-id="${campanha.id}" data-action="finalizar"></i>
          <i class="fas fa-trash" title="Excluir campanha" style="margin: 0 8px; cursor: pointer; color: red;" data-id="${campanha.id}" data-action="excluir"></i>
        </span>
      `;
      lista.appendChild(li);
    });

    lista.querySelectorAll("i").forEach(icon => {
      icon.addEventListener("click", async (e) => {
        const id = e.target.getAttribute("data-id");
        const action = e.target.getAttribute("data-action");

        if (action === "excluir") {
          if (confirm("Deseja excluir esta campanha?")) {
            await deleteDoc(doc(db, "campanhas", id));
            await buscarCampanhas();
          }
        }

        
        if (action === "ver") {
            try {
              const qIntencoes = query(
                collection(db, "intencaoDoacao"),
                where("campanhaId", "==", id)
              );
              const snapshot = await getDocs(qIntencoes);

              if (snapshot.empty) {
                Swal.fire({
                  icon: 'info',
                  title: 'Nenhuma pessoa cadastrada',
                  text: 'Nenhuma pessoa cadastrada nesta campanha.'
                });
                return;
              }

              // Monta array com objetos { nome }
              const pessoas = [];
              snapshot.forEach(docSnap => {
                const data = docSnap.data();
                pessoas.push({ nome: data.usuarioNome || "Nome não disponível" });
              });

              // Função que gera o HTML da lista, filtrando pelo termo
              const gerarListaHTML = (termo = "") => {
                const filtradas = pessoas.filter(p =>
                  p.nome.toLowerCase().includes(termo.toLowerCase())
                );
                if (filtradas.length === 0) return "<li>Nenhum resultado.</li>";
                return filtradas.map(p => `<li>${p.nome}</li>`).join("");
              };

              Swal.fire({
                title: 'Pessoas cadastradas',
                html: `
                  <input type="text" id="swalInputBusca" class="swal2-input" placeholder="Buscar por nome...">
                  <ul id="swalListaPessoas" style="text-align:left; max-height: 200px; overflow-y: auto; padding-left: 20px;">
                    ${gerarListaHTML()}
                  </ul>
                `,
                width: 450,
                confirmButtonText: 'Fechar',
                didOpen: () => {
                  const inputBusca = Swal.getPopup().querySelector("#swalInputBusca");
                  const lista = Swal.getPopup().querySelector("#swalListaPessoas");

                  inputBusca.addEventListener("input", (e) => {
                    const termo = e.target.value;
                    lista.innerHTML = gerarListaHTML(termo);
                  });
                },
                scrollbarPadding: false,
              });

            } catch (error) {
              console.error("Erro ao buscar pessoas cadastradas:", error);
              Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Erro ao buscar pessoas cadastradas.'
              });
            }
          }



        

        if (action === "finalizar") {
          if (confirm("Deseja finalizar esta campanha?")) {
            const campanhaDoc = campanhas.find(c => c.id === id);
            if (campanhaDoc) {
              await setDoc(doc(db, "campanhas-finalizadas", id), campanhaDoc);
              await deleteDoc(doc(db, "campanhas", id));
              await buscarCampanhas();
            }
          }
        }
      });
    });
  }

  async function buscarCampanhas() {
    lista.innerHTML = "<li>Carregando...</li>";
    try {
      const qCampanhas = query(collection(db, "campanhas"), where("local", "==", user.email));
      const campanhasSnapshot = await getDocs(qCampanhas);

      campanhas = [];
      campanhasSnapshot.forEach((docSnap) => {
        campanhas.push({ ...docSnap.data(), id: docSnap.id });
      });

      renderizarLista();
    } catch (error) {
      console.error("Erro ao atualizar campanhas:", error);
      lista.innerHTML = "<li>Erro ao carregar campanhas.</li>";
    }
  }

  try {
    const qLocais = query(
      collection(db, "locais"),
      where("email", "==", user.email),
      where("tipo", "==", "administrador")
    );

    const locaisSnapshot = await getDocs(qLocais);

    if (locaisSnapshot.empty) {
      container.style.display = "none";
      return;
    }

    container.style.display = "block";
    await buscarCampanhas();

    inputBusca.addEventListener("input", (e) => {
      renderizarLista(e.target.value);
    });

    refreshBtn.addEventListener("click", buscarCampanhas);
  } catch (err) {
    console.error("Erro ao verificar usuário ou buscar campanhas:", err);
    container.style.display = "none";
  }
});
