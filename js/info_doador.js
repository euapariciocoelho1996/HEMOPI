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
        <div class="info-card">
          <div class="info-item">
            <i class="fas fa-user"></i>
            <p><strong>Nome:</strong> <span class="info-value">${data.nome || "Não informado"}</span></p>
          </div>
          <div class="info-item">
            <i class="fas fa-calendar-check"></i>
            <p><strong>Última Doação:</strong> <span class="info-value">${
              data.ultimaDoacao || "Não informado"
            }</span></p>
          </div>
          <div class="info-item">
            <i class="fas fa-calendar-alt"></i>
            <p><strong>Próxima Doação:</strong> <span class="info-value">${
              data.proxDoacao || "Não informado"
            }</span></p>
          </div>
          <div class="total-doacoes">
            <i class="fas fa-trophy"></i>
            <p><strong>Total de Doações:</strong> <span class="numero-doacoes">${
              data.quantidadeDoacoes ?? 0
            }</span></p>
          </div>
        </div>
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
