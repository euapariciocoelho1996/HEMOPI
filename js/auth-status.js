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
        <div class="user-info" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f5f5f5;
            padding: 10px 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        ">
            <span style="font-size: 1.1rem; font-weight: 500; color: #333; margin-right: 10px;">
                Olá, <strong style="color:rgb(206, 72, 60);">Herói</strong> ❤️
            </span>
            <a href="perfil.html" style="
                text-decoration: none;
                color: #007BFF;
                font-weight: 500;
                margin-right: 20px; /* Adiciona um espaço à direita do link */
            ">Ver Perfil</a>
            <button id="logout-btn" style="
                background-color: #dc3545;
                border: none;
                color: white;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
            ">Sair</button>
        </div>
    `;
    




        document.getElementById("logout-btn").addEventListener("click", () => {
            signOut(auth).then(() => location.reload());
        });
    }
});
