import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

  // Função para renderizar a lista de campanhas
  function renderizarLista(termo = "") {
    lista.innerHTML = "";

    const resultados = campanhas.filter(titulo =>
      titulo.toLowerCase().includes(termo.toLowerCase())
    );

    if (resultados.length === 0) {
      lista.innerHTML = "<li>Nenhuma campanha encontrada.</li>";
      return;
    }

    resultados.forEach(titulo => {
      const li = document.createElement("li");
      li.textContent = titulo;
      lista.appendChild(li);
    });
  }

  // Função para buscar as campanhas no Firestore
  async function buscarCampanhas() {
    lista.innerHTML = "<li>Carregando...</li>";

    try {
      const qCampanhas = query(collection(db, "campanhas"), where("local", "==", user.email));
      const campanhasSnapshot = await getDocs(qCampanhas);

      campanhas = [];
      campanhasSnapshot.forEach((doc) => {
        campanhas.push(doc.data().titulo);
      });

      renderizarLista();
    } catch (error) {
      console.error("Erro ao atualizar campanhas:", error);
      lista.innerHTML = "<li>Erro ao carregar campanhas.</li>";
    }
  }

  try {
    // Verifica se é um administrador da coleção 'locais'
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

    await buscarCampanhas(); // Carrega inicialmente

    // Filtro ao digitar
    inputBusca.addEventListener("input", (e) => {
      renderizarLista(e.target.value);
    });

    // Atualizar campanhas manualmente
    refreshBtn.addEventListener("click", buscarCampanhas);

  } catch (err) {
    console.error("Erro ao verificar usuário ou buscar campanhas:", err);
    container.style.display = "none";
  }
});
