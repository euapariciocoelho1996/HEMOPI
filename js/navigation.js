// Funções de navegação para o formulário de login
console.log('Carregando funções de navegação...');

// Função para alternar para o formulário de cadastro de local
function toggleLocalForm() {
    console.log('toggleLocalForm chamada');
    const authContainer = document.getElementById("auth-container");
    const localFormContainer = document.getElementById("local-form-container");
    
    if (authContainer && localFormContainer) {
        authContainer.style.display = "none";
        localFormContainer.style.display = "flex";
        console.log('Formulário de local exibido');
    } else {
        console.error('Elementos não encontrados');
    }
}

// Função para voltar ao formulário de login
function voltarLogin() {
    console.log('voltarLogin chamada');
    const authContainer = document.getElementById("auth-container");
    const localFormContainer = document.getElementById("local-form-container");
    
    if (authContainer && localFormContainer) {
        localFormContainer.style.display = "none";
        authContainer.style.display = "flex";
        console.log('Formulário de login exibido');
    } else {
        console.error('Elementos não encontrados');
    }
}

// Função para alternar entre login e cadastro
function toggleForm(action) {
    console.log('toggleForm chamada com:', action);
    const formTitle = document.getElementById("form-title");
    const alternativeAction = document.getElementById("alternative-action");
    const signupLink = document.getElementById("signup-link");
    const form = document.getElementById("login-form");

    if (!formTitle || !alternativeAction || !signupLink || !form) {
        console.error('Elementos do formulário não encontrados');
        return;
    }

    if (action === 'signup') {
        formTitle.textContent = "Crie sua conta";
        alternativeAction.textContent = "ou continue com:";
        signupLink.innerHTML = 'Já tem uma conta? <a href="javascript:void(0);" onclick="toggleForm(\'login\')">Faça login aqui</a>';
        form.innerHTML = `
            <input type="text" id="name" placeholder="Nome completo" required>
            <input type="email" id="signup-email" placeholder="E-mail" required>
            <input type="password" id="signup-password" placeholder="Senha" required>
            <div id="signup-password-strength-message"></div>
            <button type="submit" class="submit-btn">Cadastrar</button>
        `;
    } else {
        formTitle.textContent = "Entre com sua conta";
        alternativeAction.textContent = "ou continue com:";
        signupLink.innerHTML = 'Não tem uma conta? <a href="javascript:void(0);" onclick="toggleForm(\'signup\')">Cadastre-se aqui</a>';
        form.innerHTML = `
            <input type="email" id="email" placeholder="E-mail" required>
            <input type="password" id="password" placeholder="Senha" required>
            <div id="password-strength-message"></div>
            <button type="submit" class="submit-btn">Entrar</button>
        `;
    }
}

// Exportar funções para escopo global
window.toggleLocalForm = toggleLocalForm;
window.voltarLogin = voltarLogin;
window.toggleForm = toggleForm;

console.log('Funções de navegação carregadas e exportadas'); 