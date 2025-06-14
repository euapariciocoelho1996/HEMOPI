document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

    menuToggle.addEventListener('click', function() {
        mainNav.classList.toggle('active');
        // Alterna o ícone do botão entre hambúrguer e 'X'
        if (mainNav.classList.contains('active')) {
            menuToggle.innerHTML = '<i class="fas fa-times"></i>'; // Ícone 'X'
        } else {
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>'; // Ícone hambúrguer
        }
    });

    // Fechar o menu quando um link é clicado (para navegação suave em seções)
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>'; // Volta para ícone hambúrguer
        });
    });
}); 