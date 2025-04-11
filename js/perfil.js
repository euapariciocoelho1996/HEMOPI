import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDul81cb5or7oR8HCs5I_Vw-SHm-ORHshI",
    authDomain: "teste-2067f.firebaseapp.com",
    projectId: "teste-2067f",
    storageBucket: "teste-2067f.firebasestorage.app",
    messagingSenderId: "160483034987",
    appId: "1:160483034987:web:944eb621b02efea11b2e2e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    if (!user) {
        alert("Você precisa estar logado para acessar o perfil.");
        window.location.href = "login.html";
    }
});

document.getElementById("perfil-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const dados = {
        nome: document.getElementById("nome").value,
        idade: document.getElementById("idade").value,
        sexo: document.getElementById("sexo").value,
        rua: document.getElementById("rua").value,
        bairro: document.getElementById("bairro").value,
    };

    localStorage.setItem("perfilUsuario", JSON.stringify(dados)); // ou enviar para Firestore
    alert("Dados salvos com sucesso!");
});
