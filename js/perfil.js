import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

// Verifica se o usuário está logado
onAuthStateChanged(auth, (user) => {
    if (!user) {
        alert("Você precisa estar logado para acessar o perfil.");
        window.location.href = "login.html";
        return;
    }

    const uid = user.uid;
    console.log("Usuário logado com UID:", uid);

    // Recupera dados do Firestore para exibir no perfil
    const userRef = doc(db, "usuarios", uid);
    getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log("Dados do usuário recuperados:", userData);
            document.getElementById("nome").value = userData.nome || "";
            document.getElementById("idade").value = userData.idade || "";
            document.getElementById("sexo").value = userData.sexo || "";
            document.getElementById("rua").value = userData.rua || "";
            document.getElementById("bairro").value = userData.bairro || "";
            // Garantir que o campo de doações seja mostrado corretamente
            document.getElementById("doacoes").value = userData.doacoes || 0;
        } else {
            console.log("Nenhum dado encontrado no Firestore.");
        }
    }).catch((err) => {
        console.error("Erro ao carregar dados do Firestore:", err);
    });

    // Salvamento de dados no Firestore
    document.getElementById("perfil-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const dados = {
            nome: document.getElementById("nome").value,
            idade: document.getElementById("idade").value,
            sexo: document.getElementById("sexo").value,
            rua: document.getElementById("rua").value,
            bairro: document.getElementById("bairro").value,
            doacoes: 0, // Garantir que o valor de doações é inicializado como 0
        };

        console.log("Dados a serem salvos no Firestore:", dados);

        try {
            await setDoc(doc(db, "usuarios", uid), dados);
            alert("Dados salvos com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar dados no Firestore:", error);
            alert("Erro ao salvar os dados.");
        }
    });
});
