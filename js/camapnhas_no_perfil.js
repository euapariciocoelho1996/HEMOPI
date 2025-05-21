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
  const lista = document.getElementById("listaCampanhas");
  const inputBusca = document.getElementById("buscaCampanha");

  if (!user || !lista || !inputBusca) return;

  try {
    const campanhasRef = collection(db, "campanhas");
    const q = query(campanhasRef, where("local", "==", user.email));
    const querySnapshot = await getDocs(q);

    const campanhas = [];

    querySnapshot.forEach((doc) => {
      const dados = doc.data();
      campanhas.push(dados.titulo);
    });

    // Função para renderizar a lista
    const renderizarLista = (termo = "") => {
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
    };

    renderizarLista();

    // Atualiza lista conforme o usuário digita
    inputBusca.addEventListener("input", (e) => {
      renderizarLista(e.target.value);
    });

  } catch (err) {
    console.error("Erro ao buscar campanhas:", err);
    lista.innerHTML = "<li>Erro ao carregar campanhas.</li>";
  }
});
