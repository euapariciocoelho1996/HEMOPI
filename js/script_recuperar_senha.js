// Import Firebase modules
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { app } from "./firebase-config.js";

// Get auth instance from existing app
const auth = getAuth(app);

console.log('Script de recuperação de senha iniciando...');
console.log('App configurado:', app);
console.log('Auth configurado:', auth);

// Função para recuperar senha
async function recuperarSenha() {
    console.log('Função recuperarSenha chamada');
    
    // Verificar se o SweetAlert2 está disponível
    if (typeof Swal === 'undefined') {
        console.error('SweetAlert2 não está carregado!');
        alert('Ocorreu um erro ao inicializar o sistema. Por favor, recarregue a página.');
        return;
    }

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
console.log('Script de recuperação de senha carregado');
console.log('Função recuperarSenha disponível:', typeof window.recuperarSenha);

// Aguardar o DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado - verificando função recuperarSenha');
    console.log('Função disponível:', typeof window.recuperarSenha);
}); 