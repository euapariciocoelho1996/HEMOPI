// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
    getAuth, 
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDul81cb5or7oR8HCs5I_Vw-SHm-ORHshI",
    authDomain: "teste-2067f.firebaseapp.com",
    projectId: "teste-2067f",
    storageBucket: "teste-2067f.appspot.com",
    messagingSenderId: "160483034987",
    appId: "1:160483034987:web:944eb621b02efea11b2e2e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Função para recuperar senha
async function recuperarSenha() {
    console.log('Função recuperarSenha chamada'); // Log de debug
    
    try {
        // Mostrar modal de recuperação de senha
        const { value: email } = await Swal.fire({
            title: 'Recuperar Senha',
            input: 'email',
            inputLabel: 'Digite seu e-mail cadastrado',
            inputPlaceholder: 'seu@email.com',
            showCancelButton: true,
            confirmButtonText: 'Enviar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ce483c',
            inputValidator: (value) => {
                if (!value) {
                    return 'Por favor, digite seu e-mail!';
                }
                if (!value.includes('@')) {
                    return 'Por favor, digite um e-mail válido!';
                }
            }
        });

        console.log('Email recebido:', email); // Log de debug

        if (email) {
            // Enviar e-mail de recuperação
            await sendPasswordResetEmail(auth, email);
            console.log('Email de recuperação enviado'); // Log de debug
            
            // Mostrar mensagem de sucesso
            await Swal.fire({
                title: 'E-mail Enviado!',
                text: 'Verifique sua caixa de entrada para redefinir sua senha.',
                icon: 'success',
                confirmButtonColor: '#ce483c'
            });
        }
    } catch (error) {
        console.error('Erro ao recuperar senha:', error);
        
        // Mostrar mensagem de erro apropriada
        let errorMessage = 'Ocorreu um erro ao enviar o e-mail de recuperação.';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'Não encontramos uma conta com este e-mail.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'O e-mail informado é inválido.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
        }
        
        await Swal.fire({
            title: 'Erro',
            text: errorMessage,
            icon: 'error',
            confirmButtonColor: '#ce483c'
        });
    }
}

// Exportar função para uso global
window.recuperarSenha = recuperarSenha;

// Log para confirmar que o script foi carregado
console.log('Script de recuperação de senha carregado'); 