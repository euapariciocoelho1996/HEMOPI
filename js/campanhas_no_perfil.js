import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDul81cb5or7oR8HCs5I_Vw-SHm-ORHshI",
  authDomain: "teste-2067f.firebaseapp.com",
  projectId: "teste-2067f",
  storageBucket: "teste-2067f.appspot.com",
  messagingSenderId: "160483034987",
  appId: "1:160483034987:web:944eb621b02efea11b2e2e",
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

    const resultados = campanhas.filter((c) =>
      c.titulo.toLowerCase().includes(termo.toLowerCase())
    );

    if (resultados.length === 0) {
      lista.innerHTML = "<li>Nenhuma campanha encontrada.</li>";
      return;
    }

    resultados.forEach((campanha) => {
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

    lista.querySelectorAll("i").forEach((icon) => {
      icon.addEventListener("click", async (e) => {
        const id = e.target.getAttribute("data-id");
        const action = e.target.getAttribute("data-action");

        if (action === "excluir") {
          Swal.fire({
            title: "Deseja excluir esta campanha?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim, excluir",
            cancelButtonText: "Cancelar",
          }).then(async (result) => {
            if (result.isConfirmed) {
              await deleteDoc(doc(db, "campanhas", id));
              await buscarCampanhas();
              Swal.fire(
                "Excluída!",
                "A campanha foi excluída com sucesso.",
                "success"
              );
            }
          });
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
                icon: "info",
                title: "Nenhuma pessoa cadastrada",
                text: "Nenhuma pessoa cadastrada nesta campanha.",
              });
              return;
            }

            // Monta array com objetos { id, nome, email, quantidadeDoacoes }
            const pessoas = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              pessoas.push({
                id: docSnap.id,
                nome: data.usuarioNome || "Nome não disponível",
                email: data.usuarioEmail || "", // suposição que tenha email
                quantidadeDoacoes: data.quantidadeDoacoes || 0, // opcional, se já tiver
              });
            });

            // Função que gera o HTML da lista com botões coração e x
            const gerarListaHTML = (termo = "") => {
              const filtradas = pessoas.filter((p) =>
                p.nome.toLowerCase().includes(termo.toLowerCase())
              );
              if (filtradas.length === 0) return "<li>Nenhum resultado.</li>";

              return filtradas
                .map(
                  (p) => `
            <li style="display:flex; align-items:center; justify-content: space-between; margin-bottom: 5px;">
              <span>${p.nome}</span>
              <span>
                <button class="btn-compareceu" data-id="${p.id}" data-email="${p.email}" data-nome="${p.nome}" style="background:none; border:none; cursor:pointer; font-size:18px; color:red;" title="Doador compareceu ❤️">&#10084;</button>
                <button class="btn-nao-compareceu" data-id="${p.id}" style="background:none; border:none; cursor:pointer; font-size:18px; color:gray;" title="Doador não compareceu ❌">&#10060;</button>
              </span>
            </li>`
                )
                .join("");
            };

            Swal.fire({
              title: "Pessoas cadastradas",
              html: `
        <input type="text" id="swalInputBusca" class="swal2-input" placeholder="Buscar por nome...">
        <ul id="swalListaPessoas" style="text-align:left; max-height: 200px; overflow-y: auto; padding-left: 20px;">
          ${gerarListaHTML()}
        </ul>
      `,
              width: 500,
              confirmButtonText: "Fechar",
              didOpen: () => {
                const inputBusca =
                  Swal.getPopup().querySelector("#swalInputBusca");
                const lista =
                  Swal.getPopup().querySelector("#swalListaPessoas");

                inputBusca.addEventListener("input", (e) => {
                  const termo = e.target.value;
                  lista.innerHTML = gerarListaHTML(termo);
                  attachButtonEvents();
                });

                const attachButtonEvents = () => {
                  // Botão coração (compareceu)
                  lista.querySelectorAll(".btn-compareceu").forEach((btn) => {
                    btn.onclick = async (e) => {
                      const id = btn.dataset.id;
                      const email = btn.dataset.email;
                      const nome = btn.dataset.nome;

                      // Pergunta a data da doação
                      const { value: dataDoacao } = await Swal.fire({
                        title: `Data da doação de ${nome}`,
                        input: "date",
                        inputLabel: "Informe a data da doação",
                        inputPlaceholder: "Selecione a data",
                        inputAttributes: {
                          max: new Date().toISOString().split("T")[0], // não pode ser futura
                        },
                        showCancelButton: true,
                      });

                      if (dataDoacao) {
                        // Calcula data próxima doação (90 dias depois)
                        const dataDoacaoObj = new Date(dataDoacao);
                        const proxDoacaoObj = new Date(dataDoacaoObj);
                        proxDoacaoObj.setDate(proxDoacaoObj.getDate() + 90);
                        const proxDoacao = proxDoacaoObj
                          .toISOString()
                          .split("T")[0];

                        // Ref para doacoes-realizadas por email
                        const docRef = doc(db, "doacoes-realizadas", email);

                        try {
                          const docSnap = await getDoc(docRef);
                          if (docSnap.exists()) {
                            // Atualiza quantidade incrementando 1
                            const dadosAtuais = docSnap.data();
                            const novaQtd =
                              (dadosAtuais.quantidadeDoacoes || 0) + 1;
                            await setDoc(
                              docRef,
                              {
                                nome,
                                email,
                                quantidadeDoacoes: novaQtd,
                                ultimaDoacao: dataDoacao,
                                proxDoacao,
                              },
                              { merge: true }
                            );
                          } else {
                            // Cria novo registro
                            await setDoc(docRef, {
                              nome,
                              email,
                              quantidadeDoacoes: 1,
                              ultimaDoacao: dataDoacao,
                              proxDoacao,
                            });
                          }

                          Swal.fire({
                            icon: "success",
                            title: "Doação registrada",
                            html: `
                      Doação de <b>${nome}</b> registrada com sucesso.<br>
                      Próxima doação em: <b>${proxDoacao}</b>
                    `,
                          });
                        } catch (error) {
                          console.error("Erro ao registrar doação:", error);
                          Swal.fire({
                            icon: "error",
                            title: "Erro",
                            text: "Não foi possível registrar a doação.",
                          });
                        }
                      }
                    };
                  });

                  // Botão X (não compareceu)
                  lista
                    .querySelectorAll(".btn-nao-compareceu")
                    .forEach((btn) => {
                      btn.onclick = () => {
                        Swal.fire({
                          icon: "info",
                          title: "Informação",
                          text: "Registrado que o doador não compareceu.",
                        });
                      };
                    });
                };

                attachButtonEvents();
              },
              scrollbarPadding: false,
            });
          } catch (error) {
            console.error("Erro ao buscar pessoas cadastradas:", error);
            Swal.fire({
              icon: "error",
              title: "Erro",
              text: "Erro ao buscar pessoas cadastradas.",
            });
          }
        }

        if (action === "finalizar") {
          Swal.fire({
            title: "Deseja finalizar esta campanha?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim, finalizar",
            cancelButtonText: "Cancelar",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const campanhaDoc = campanhas.find((c) => c.id === id);
              if (campanhaDoc) {
                await setDoc(doc(db, "campanhas-finalizadas", id), campanhaDoc);
                await deleteDoc(doc(db, "campanhas", id));
                await buscarCampanhas();
                Swal.fire(
                  "Finalizada!",
                  "A campanha foi finalizada com sucesso.",
                  "success"
                );
              }
            }
          });
        }
      });
    });
  }

  async function buscarCampanhas() {
    lista.innerHTML = "<li>Carregando...</li>";
    try {
      const qCampanhas = query(
        collection(db, "campanhas"),
        where("local", "==", user.email)
      );
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
