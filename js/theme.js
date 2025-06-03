// Gerenciador de Tema
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = this.themeToggle.querySelector('i');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }

    init() {
        // Aplicar tema salvo
        this.applyTheme(this.currentTheme);
        
        // Adicionar listener para alternar tema
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Verificar preferência do sistema
        this.checkSystemPreference();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        
        // Atualizar ícone
        this.themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        // Adicionar classe de transição após o carregamento inicial
        if (!document.documentElement.classList.contains('theme-transition')) {
            setTimeout(() => {
                document.documentElement.classList.add('theme-transition');
            }, 100);
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        
        // Animação do botão
        this.themeToggle.classList.add('theme-toggle-spin');
        setTimeout(() => {
            this.themeToggle.classList.remove('theme-toggle-spin');
        }, 300);
    }

    checkSystemPreference() {
        // Verificar preferência do sistema operacional
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Atualizar tema quando a preferência do sistema mudar
        prefersDark.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

// Inicializar gerenciador de tema
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
}); 