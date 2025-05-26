import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDul81cb5or7oR8HCs5I_Vw-SHm-ORHshI",
  authDomain: "teste-2067f.firebaseapp.com",
  projectId: "teste-2067f",
  storageBucket: "teste-2067f.firebasestorage.app",
  messagingSenderId: "160483034987",
  appId: "1:160483034987:web:944eb621b02efea11b2e2e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.warn("Usuário não autenticado.");
    document.getElementById("userDonationInfo").style.display = "none";
    return;
  }

  const userEmail = user.email;
  const userUid = user.uid;
  console.log("Usuário autenticado:", userEmail);

  try {
    const locaisRef = collection(db, "locais");

    // Verifica por UID
    const locaisQueryUid = query(locaisRef, where("uid", "==", userUid));
    const locaisSnapUid = await getDocs(locaisQueryUid);

    // Verifica por Email (só faz se não achou pelo UID)
    let locaisSnapEmail = null;
    if (locaisSnapUid.empty) {
      const locaisQueryEmail = query(
        locaisRef,
        where("email", "==", userEmail)
      );
      locaisSnapEmail = await getDocs(locaisQueryEmail);
    }

    if (!locaisSnapUid.empty || (locaisSnapEmail && !locaisSnapEmail.empty)) {
      // Usuário é local/admin — não mostrar info do doador
      console.log(
        "Usuário é local ou administrador (por UID ou email). Div oculta."
      );
      document.getElementById("userDonationInfo").style.display = "none";
      return;
    }

    // Se não for local, buscar doações
    const doacoesRef = collection(db, "doacoes-realizadas");
    const doacoesQuery = query(doacoesRef, where("email", "==", userEmail));
    const doacoesSnap = await getDocs(doacoesQuery);

    const dadosDiv = document.getElementById("dadosDoacao");
    const container = document.getElementById("userDonationInfo");
    dadosDiv.innerHTML = ""; // limpa conteúdo

    if (doacoesSnap.empty) {
      dadosDiv.innerHTML = `<p>Nenhuma doação registrada para este usuário.</p>`;
      container.style.display = "block";
      return;
    }

    let index = 1;
    doacoesSnap.forEach((doc) => {
      const data = doc.data();
      const section = document.createElement("section");
      section.innerHTML = `
        
        <p><strong>Nome:</strong> ${data.nome || "Não informado"}</p>
        <p><strong>Última Doação:</strong> ${
          data.ultimaDoacao || "Não informado"
        }</p>
        <p><strong>Próxima Doação:</strong> ${
          data.proxDoacao || "Não informado"
        }</p>
        <p class="total-doacoes"><strong>Total de Doações:</strong> ${
          data.quantidadeDoacoes ?? 0
        }</p>
        <hr/>
      `;

      dadosDiv.appendChild(section);
    });

    container.style.display = "block";
    console.log("Informações de doador exibidas com sucesso.");
  } catch (error) {
    console.error("Erro ao buscar dados de doação:", error);
    const dadosDiv = document.getElementById("dadosDoacao");
    dadosDiv.innerHTML = "<p>Erro ao carregar as informações.</p>";
    document.getElementById("userDonationInfo").style.display = "block";
  }
});
