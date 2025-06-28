// Script de recuperação de senha - Versão 2
// Abordagem mais robusta para garantir que a função seja exportada

console.log('Iniciando script de recuperação de senha v2...');

// Função para carregar Firebase dinamicamente
async function carregarFirebase() {
    try {
        // Importar módulos do Firebase
        const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js");
        const { getAuth, sendPasswordResetEmail } = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js");
        
        // Configuração do Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyDul81cb5or7oR8HCs5I_Vw-SHm-ORHshI",
            authDomain: "teste-2067f.firebaseapp.com",
            projectId: "teste-2067f",
            storageBucket: "teste-2067f.appspot.com",
            messagingSenderId: "160483034987",
            appId: "1:160483034987:web:944eb621b02efea11b2e2e"
        };

        // Inicializar Firebase apenas se não existir
        let app;
        if (getApps().length === 0) {
            app = initializeApp(firebaseConfig);
            console.log('Firebase inicializado');
        } else {
            app = getApps()[0];
            console.log('Firebase já estava inicializado');
        }

        const auth = getAuth(app);
        console.log('Auth configurado:', auth);

        return { auth, sendPasswordResetEmail };
    } catch (error) {
        console.error('Erro ao carregar Firebase:', error);
        throw error;
    }
}

// Função principal de recuperação de senha
async function recuperarSenha() {
    console.log('Função recuperarSenha chamada');
    
    // Verificar se o SweetAlert2 está disponível
    if (typeof Swal === 'undefined') {
        console.error('SweetAlert2 não está carregado!');
        alert('Ocorreu um erro ao inicializar o sistema. Por favor, recarregue a página.');
        return;
    }

    try {
        // Carregar Firebase
        const { auth, sendPasswordResetEmail } = await carregarFirebase();

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

        if (email) {
            console.log('Email recebido:', email);

            // Enviar e-mail de recuperação
            await sendPasswordResetEmail(auth, email);
            console.log('Email de recuperação enviado');
            
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
console.log('Script de recuperação de senha v2 carregado');
console.log('Função recuperarSenha disponível:', typeof window.recuperarSenha);

// Aguardar o DOM estar pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM carregado - função recuperarSenha disponível:', typeof window.recuperarSenha);
    });
} else {
    console.log('DOM já carregado - função recuperarSenha disponível:', typeof window.recuperarSenha);
} 