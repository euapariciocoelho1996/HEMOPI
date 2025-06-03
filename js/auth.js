// Sistema de Autenticação
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Verificar se há usuário salvo
        this.checkSavedUser();
        
        // Adicionar listeners para formulários
        this.setupAuthForms();
        
        // Adicionar observador para elementos protegidos
        this.setupProtectedElements();
    }

    checkSavedUser() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.updateAuthState(true);
            } catch (e) {
                localStorage.removeItem('currentUser');
            }
        }
    }

    setupAuthForms() {
        // Criar modal de autenticação
        this.createAuthModal();
        
        // Adicionar listeners para botões de auth
        document.querySelectorAll('[data-auth-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.dataset.authAction;
                if (action === 'logout') {
                    this.logout();
                } else {
                    this.showAuthModal(action);
                }
            });
        });
    }

    createAuthModal() {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-overlay"></div>
            <div class="auth-modal-content">
                <button class="auth-modal-close">&times;</button>
                
                <div class="auth-forms">
                    <form id="loginForm" class="auth-form">
                        <h2>Login</h2>
                        <div class="form-group">
                            <label for="loginEmail">Email</label>
                            <input type="email" id="loginEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Senha</label>
                            <div class="password-input">
                                <input type="password" id="loginPassword" required>
                                <button type="button" class="toggle-password">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="rememberMe">
                                <span>Lembrar-me</span>
                            </label>
                        </div>
                        <button type="submit" class="auth-submit">Entrar</button>
                        <p class="auth-switch">
                            Não tem uma conta? 
                            <a href="#" data-switch-form="register">Registre-se</a>
                        </p>
                    </form>

                    <form id="registerForm" class="auth-form">
                        <h2>Registro</h2>
                        <div class="form-group">
                            <label for="registerName">Nome Completo</label>
                            <input type="text" id="registerName" required>
                        </div>
                        <div class="form-group">
                            <label for="registerEmail">Email</label>
                            <input type="email" id="registerEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="registerPassword">Senha</label>
                            <div class="password-input">
                                <input type="password" id="registerPassword" required>
                                <button type="button" class="toggle-password">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="registerPasswordConfirm">Confirmar Senha</label>
                            <div class="password-input">
                                <input type="password" id="registerPasswordConfirm" required>
                                <button type="button" class="toggle-password">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <button type="submit" class="auth-submit">Registrar</button>
                        <p class="auth-switch">
                            Já tem uma conta? 
                            <a href="#" data-switch-form="login">Faça login</a>
                        </p>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar listeners
        this.setupModalListeners(modal);
    }

    setupModalListeners(modal) {
        // Fechar modal
        modal.querySelector('.auth-modal-close').addEventListener('click', () => {
            this.hideAuthModal();
        });
        
        modal.querySelector('.auth-modal-overlay').addEventListener('click', () => {
            this.hideAuthModal();
        });
        
        // Alternar entre formulários
        modal.querySelectorAll('[data-switch-form]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchForm(e.target.dataset.switchForm);
            });
        });
        
        // Toggle password visibility
        modal.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', (e) => {
                const input = e.target.closest('.password-input').querySelector('input');
                const icon = e.target.closest('.toggle-password').querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.replace('fa-eye', 'fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.replace('fa-eye-slash', 'fa-eye');
                }
            });
        });
        
        // Form submissions
        modal.querySelector('#loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e.target);
        });
        
        modal.querySelector('#registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister(e.target);
        });
    }

    showAuthModal(formType = 'login') {
        document.querySelector('.auth-modal').classList.add('show');
        this.switchForm(formType);
    }

    hideAuthModal() {
        document.querySelector('.auth-modal').classList.remove('show');
    }

    switchForm(formType) {
        const forms = document.querySelector('.auth-forms');
        forms.className = `auth-forms show-${formType}`;
    }

    async handleLogin(form) {
        const email = form.querySelector('#loginEmail').value;
        const password = form.querySelector('#loginPassword').value;
        const rememberMe = form.querySelector('#rememberMe').checked;
        
        try {
            // Simulação de chamada à API
            await this.simulateApiCall({ email, password });
            
            const user = {
                name: 'Usuário Teste',
                email: email,
                token: 'token-teste'
            };
            
            this.login(user, rememberMe);
            this.hideAuthModal();
            window.notifications.success('Login realizado com sucesso!');
        } catch (error) {
            window.notifications.error(error.message);
        }
    }

    async handleRegister(form) {
        const name = form.querySelector('#registerName').value;
        const email = form.querySelector('#registerEmail').value;
        const password = form.querySelector('#registerPassword').value;
        const passwordConfirm = form.querySelector('#registerPasswordConfirm').value;
        
        if (password !== passwordConfirm) {
            window.notifications.error('As senhas não coincidem');
            return;
        }
        
        try {
            // Simulação de chamada à API
            await this.simulateApiCall({ name, email, password });
            
            const user = {
                name: name,
                email: email,
                token: 'token-teste'
            };
            
            this.login(user, true);
            this.hideAuthModal();
            window.notifications.success('Registro realizado com sucesso!');
        } catch (error) {
            window.notifications.error(error.message);
        }
    }

    login(user, remember = false) {
        this.currentUser = user;
        if (remember) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
        this.updateAuthState(true);
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateAuthState(false);
        window.notifications.info('Logout realizado com sucesso');
    }

    updateAuthState(isLoggedIn) {
        document.body.classList.toggle('is-authenticated', isLoggedIn);
        
        // Atualizar elementos da UI
        document.querySelectorAll('[data-auth-display]').forEach(el => {
            const showWhen = el.dataset.authDisplay;
            el.style.display = (showWhen === 'logged-in') === isLoggedIn ? '' : 'none';
        });
        
        // Atualizar elementos protegidos
        this.updateProtectedElements();
    }

    setupProtectedElements() {
        document.querySelectorAll('[data-requires-auth]').forEach(el => {
            const originalContent = el.innerHTML;
            el.dataset.originalContent = originalContent;
            
            if (!this.currentUser) {
                el.innerHTML = this.getProtectedTemplate();
            }
            
            el.addEventListener('click', (e) => {
                if (!this.currentUser) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showAuthModal();
                }
            });
        });
    }

    updateProtectedElements() {
        document.querySelectorAll('[data-requires-auth]').forEach(el => {
            if (this.currentUser) {
                el.innerHTML = el.dataset.originalContent;
            } else {
                el.innerHTML = this.getProtectedTemplate();
            }
        });
    }

    getProtectedTemplate() {
        return `
            <div class="protected-content">
                <i class="fas fa-lock"></i>
                <p>Faça login para acessar</p>
            </div>
        `;
    }

    simulateApiCall(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% de sucesso
                    resolve(data);
                } else {
                    reject(new Error('Erro na autenticação. Tente novamente.'));
                }
            }, 800);
        });
    }
}

// Adicionar estilos
const style = document.createElement('style');
style.textContent = `
    .auth-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000;
    }

    .auth-modal.show {
        display: block;
    }

    .auth-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        animation: fadeIn 0.3s ease;
    }

    .auth-modal-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--cor-fundo);
        padding: 30px;
        border-radius: 12px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        animation: slideIn 0.3s ease;
    }

    .auth-modal-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 24px;
        color: var(--cor-texto);
        cursor: pointer;
        opacity: 0.5;
        transition: opacity 0.2s;
    }

    .auth-modal-close:hover {
        opacity: 1;
    }

    .auth-forms {
        position: relative;
        height: 400px;
        overflow: hidden;
    }

    .auth-form {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding: 20px 0;
        transition: transform 0.3s ease;
    }

    .auth-forms.show-login #registerForm {
        transform: translateX(100%);
    }

    .auth-forms.show-register #loginForm {
        transform: translateX(-100%);
    }

    .auth-form h2 {
        text-align: center;
        margin-bottom: 30px;
        color: var(--cor-texto);
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-group label {
        display: block;
        margin-bottom: 8px;
        color: var(--cor-texto);
    }

    .form-group input {
        width: 100%;
        padding: 10px;
        border: 1px solid var(--cor-borda);
        border-radius: 6px;
        background: var(--cor-fundo);
        color: var(--cor-texto);
    }

    .password-input {
        position: relative;
    }

    .toggle-password {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--cor-texto);
        opacity: 0.5;
        cursor: pointer;
        transition: opacity 0.2s;
    }

    .toggle-password:hover {
        opacity: 1;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
    }

    .checkbox-label input {
        width: auto;
    }

    .auth-submit {
        width: 100%;
        padding: 12px;
        background: var(--cor-primaria);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .auth-submit:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .auth-switch {
        text-align: center;
        margin-top: 20px;
        color: var(--cor-texto);
    }

    .auth-switch a {
        color: var(--cor-primaria);
        text-decoration: none;
    }

    .protected-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: var(--cor-fundo-secundaria);
        border-radius: 8px;
        cursor: pointer;
    }

    .protected-content i {
        font-size: 24px;
        color: var(--cor-primaria);
        margin-bottom: 10px;
    }

    .protected-content p {
        margin: 0;
        color: var(--cor-texto);
        font-size: 14px;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translate(-50%, -60%);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
    }
`;

document.head.appendChild(style);

// Inicializar sistema de autenticação
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new AuthSystem();
}); 