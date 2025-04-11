import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Configuração Firebase
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

const userHeader = document.getElementById("user-header-options");

onAuthStateChanged(auth, (user) => {
    if (user) {
        userHeader.innerHTML = `
            <div class="user-info">
                <span>Olá, ${user.displayName?.split(" ")[0] || "usuário"}!</span>
                <a href="perfil.html" class="perfil-link">Ver Perfil</a>
                <button id="logout-btn">Sair</button>
            </div>
        `;

        document.getElementById("logout-btn").addEventListener("click", () => {
            signOut(auth).then(() => location.reload());
        });
    }
});
