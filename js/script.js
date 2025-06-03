/**
 * Main JavaScript functionality for Sangue Solidário
 * Handles animations, carousel, and interactive features
 */

// Utility functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Animation on scroll functionality
class ScrollAnimation {
    constructor(selector, threshold = 0.1) {
        this.elements = document.querySelectorAll(selector);
        this.threshold = threshold;
        this.setupObserver();
        this.initialize();
    }

    setupObserver() {
        this.observer = new IntersectionObserver(
            debounce((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        this.observer.unobserve(entry.target);
                    }
                });
            }, 50),
            {
                threshold: this.threshold,
                rootMargin: '50px'
            }
        );
    }

    initialize() {
        this.elements.forEach(el => {
            if (el) this.observer.observe(el);
        });
    }

    // Método para limpar os observers quando necessário
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// Enhanced Carousel functionality
class Carousel {
    constructor(containerSelector = '.carousel', dotsSelector = '.dot', interval = 4000) {
        this.container = document.querySelector(containerSelector);
        this.slides = document.querySelector(`${containerSelector}-images`);
        this.dots = document.querySelectorAll(dotsSelector);
        this.index = 0;
        this.total = this.slides ? this.slides.children.length : 0;
        this.interval = interval;
        this.autoPlayTimer = null;
        this.isHovered = false;
        
        if (this.slides && this.total > 0) {
            this.setupEventListeners();
            this.start();
        }
    }

    setupEventListeners() {
        // Pausa o carrossel quando o mouse está sobre ele
        this.container.addEventListener('mouseenter', () => {
            this.isHovered = true;
            this.pause();
        });

        this.container.addEventListener('mouseleave', () => {
            this.isHovered = false;
            this.start();
        });

        // Adiciona navegação por toque
        let touchStartX = 0;
        let touchEndX = 0;

        this.container.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        this.container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe(touchStartX, touchEndX);
        }, { passive: true });

        // Adiciona navegação por botões
        this.dots.forEach((dot, i) => {
            dot.addEventListener('click', () => this.goToSlide(i));
        });
    }

    handleSwipe(startX, endX) {
        const diff = startX - endX;
        if (Math.abs(diff) > 50) { // Mínimo de movimento para considerar como swipe
            if (diff > 0) {
                this.next();
            } else {
                this.prev();
            }
        }
    }

    showSlide(i) {
        if (!this.slides) return;
        
        this.slides.style.transform = `translateX(-${i * 100}%)`;
        this.dots.forEach(dot => dot.classList.remove('active'));
        if (this.dots[i]) {
            this.dots[i].classList.add('active');
        }
    }

    next() {
        this.index = (this.index + 1) % this.total;
        this.showSlide(this.index);
    }

    prev() {
        this.index = (this.index - 1 + this.total) % this.total;
        this.showSlide(this.index);
    }

    goToSlide(i) {
        this.index = i;
        this.showSlide(this.index);
    }

    pause() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    start() {
        if (!this.isHovered && !this.autoPlayTimer) {
            this.autoPlayTimer = setInterval(() => this.next(), this.interval);
        }
    }

    destroy() {
        this.pause();
        // Remover event listeners se necessário
    }
}

// Menu Mobile functionality
class MobileMenu {
    constructor() {
        this.button = document.querySelector('.menu-mobile-btn');
        this.menu = document.querySelector('.menu-centralizado');
        this.isOpen = false;

        if (this.button && this.menu) {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        this.button.addEventListener('click', () => this.toggleMenu());
        
        // Fecha o menu ao clicar em um link
        this.menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Fecha o menu ao redimensionar a janela para desktop
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth > 768) {
                this.closeMenu();
            }
        }, 250));
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;
        this.menu.classList.toggle('active');
        this.updateButtonState();
    }

    closeMenu() {
        this.isOpen = false;
        this.menu.classList.remove('active');
        this.updateButtonState();
    }

    updateButtonState() {
        const spans = this.button.querySelectorAll('span');
        spans.forEach((span, index) => {
            if (this.isOpen) {
                if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                if (index === 1) span.style.opacity = '0';
                if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                span.style = '';
            }
        });
    }

    destroy() {
        // Cleanup event listeners if needed
        this.closeMenu();
    }
}

// Filtros de Campanhas
class CampanhasFiltro {
    constructor() {
        this.filtroSangue = document.getElementById('filtro-sangue');
        this.filtroUrgencia = document.getElementById('filtro-urgencia');
        this.cards = document.querySelectorAll('.campanha-card');

        if (this.filtroSangue && this.filtroUrgencia) {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        this.filtroSangue.addEventListener('change', () => this.aplicarFiltros());
        this.filtroUrgencia.addEventListener('change', () => this.aplicarFiltros());
    }

    aplicarFiltros() {
        const tipoSangue = this.filtroSangue.value;
        const urgencia = this.filtroUrgencia.value;

        this.cards.forEach(card => {
            const cardTipoSangue = card.dataset.tipoSangue;
            const cardUrgencia = card.dataset.urgencia;
            
            const matchTipoSangue = tipoSangue === 'todos' || cardTipoSangue === tipoSangue;
            const matchUrgencia = urgencia === 'todos' || cardUrgencia === urgencia;

            if (matchTipoSangue && matchUrgencia) {
                card.style.display = '';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }
}

// Initialize features when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Start animations when elements scroll into view
    const scrollAnimation = new ScrollAnimation('.reveal');
    
    // Start image carousel
    const carousel = new Carousel('.carousel', '.dot', 4000);

    // Initialize mobile menu
    const mobileMenu = new MobileMenu();

    // Initialize campanhas filtro
    const campanhasFiltro = new CampanhasFiltro();

    // Cleanup on page unload
    window.addEventListener('unload', () => {
        scrollAnimation.destroy();
        carousel.destroy();
        mobileMenu.destroy();
    });
});
