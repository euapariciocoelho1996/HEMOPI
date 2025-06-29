document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

    // Verificar se os elementos existem
    if (!menuToggle || !mainNav) {
        console.warn('Elementos do menu não encontrados');
        return;
    }

    // Função para alternar o menu
    function toggleMenu() {
        const isActive = mainNav.classList.contains('active');
        
        if (isActive) {
            // Fechar menu
            mainNav.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            menuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
            document.body.classList.remove('menu-open');
        } else {
            // Abrir menu
            mainNav.classList.add('active');
            menuToggle.innerHTML = '<i class="fas fa-times"></i>';
            menuToggle.setAttribute('aria-label', 'Fechar menu de navegação');
            document.body.classList.add('menu-open');
        }
    }

    // Event listener para o botão do menu
    menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });

    // Fechar menu quando um link é clicado (incluindo o item de perfil)
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            // Pequeno delay para permitir que o link seja processado
            setTimeout(() => {
                mainNav.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                menuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
                document.body.classList.remove('menu-open');
            }, 100);
        });
    });

    // Fechar menu quando clicar fora dele
    document.addEventListener('click', function(e) {
        if (mainNav.classList.contains('active') && 
            !mainNav.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            mainNav.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            menuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
            document.body.classList.remove('menu-open');
        }
    });

    // Fechar menu ao redimensionar a tela para desktop
    function handleResize() {
        if (window.innerWidth > 768 && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            menuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
            document.body.classList.remove('menu-open');
        }
    }

    // Adicionar listener para redimensionamento
    window.addEventListener('resize', handleResize);

    // Suporte para teclado (acessibilidade)
    menuToggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });

    // Fechar menu com tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            menuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
            document.body.classList.remove('menu-open');
        }
    });

    // Prevenir scroll do menu quando ele está aberto
    mainNav.addEventListener('touchmove', function(e) {
        if (mainNav.classList.contains('active')) {
            e.preventDefault();
        }
    }, { passive: false });

    // Adicionar classe para indicar que o JavaScript está carregado
    document.body.classList.add('js-loaded');
    
    // Remover classe no-js se existir
    document.body.classList.remove('no-js');
}); 