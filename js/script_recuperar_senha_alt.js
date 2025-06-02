// Função para recuperar senha
function recuperarSenha() {
    console.log('Função recuperarSenha chamada');
    
    // Verificar se o Firebase está disponível
    if (typeof firebase === 'undefined') {
        console.error('Firebase não está carregado!');
        Swal.fire({
            title: 'Erro',
            text: 'Ocorreu um erro ao inicializar o sistema. Por favor, recarregue a página.',
            icon: 'error',
            confirmButtonColor: '#ce483c'
        });
        return;
    }

    // Verificar se o SweetAlert2 está disponível
    if (typeof Swal === 'undefined') {
        console.error('SweetAlert2 não está carregado!');
        alert('Ocorreu um erro ao inicializar o sistema. Por favor, recarregue a página.');
        return;
    }

    // Mostrar modal de recuperação de senha
    Swal.fire({
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
    }).then((result) => {
        if (result.isConfirmed) {
            const email = result.value;
            console.log('Email recebido:', email);

            // Enviar e-mail de recuperação
            firebase.auth().sendPasswordResetEmail(email)
                .then(() => {
                    console.log('Email de recuperação enviado');
                    Swal.fire({
                        title: 'E-mail Enviado!',
                        text: 'Verifique sua caixa de entrada para redefinir sua senha.',
                        icon: 'success',
                        confirmButtonColor: '#ce483c'
                    });
                })
                .catch((error) => {
                    console.error('Erro ao recuperar senha:', error);
                    
                    let errorMessage = 'Ocorreu um erro ao enviar o e-mail de recuperação.';
                    
                    if (error.code === 'auth/user-not-found') {
                        errorMessage = 'Não encontramos uma conta com este e-mail.';
                    } else if (error.code === 'auth/invalid-email') {
                        errorMessage = 'O e-mail informado é inválido.';
                    } else if (error.code === 'auth/too-many-requests') {
                        errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
                    }
                    
                    Swal.fire({
                        title: 'Erro',
                        text: errorMessage,
                        icon: 'error',
                        confirmButtonColor: '#ce483c'
                    });
                });
        }
    });
}

// Exportar função para uso global
window.recuperarSenha = recuperarSenha;

// Log para confirmar que o script foi carregado
console.log('Script de recuperação de senha carregado'); 