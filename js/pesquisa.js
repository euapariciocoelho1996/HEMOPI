// Sistema de Pesquisa de Campanhas
class CampanhaSearch {
    constructor() {
        this.searchInput = document.getElementById('campanha-search');
        this.campanhasContainer = document.querySelector('.campanhas-cards');
        this.filtroSangue = document.getElementById('filtro-sangue');
        this.filtroUrgencia = document.getElementById('filtro-urgencia');
        this.searchDebounceTimer = null;
        
        this.init();
    }

    init() {
        // Adicionar listeners
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.filtroSangue.addEventListener('change', () => this.aplicarFiltros());
        this.filtroUrgencia.addEventListener('change', () => this.aplicarFiltros());
        
        // Inicializar tooltips
        this.initializeTooltips();
    }

    handleSearch() {
        // Debounce para melhor performance
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => {
            this.aplicarFiltros();
        }, 300);
    }

    aplicarFiltros() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const tipoSangue = this.filtroSangue.value;
        const urgencia = this.filtroUrgencia.value;
        
        const cards = this.campanhasContainer.querySelectorAll('.campanha-card');
        
        cards.forEach(card => {
            const titulo = card.querySelector('h3').textContent.toLowerCase();
            const descricao = card.querySelector('.campanha-descricao').textContent.toLowerCase();
            const local = card.querySelector('.campanha-local').textContent.toLowerCase();
            
            const cardTipoSangue = card.dataset.tipoSangue;
            const cardUrgencia = card.dataset.urgencia;
            
            // Verificar correspondência com a pesquisa
            const matchSearch = searchTerm === '' || 
                titulo.includes(searchTerm) || 
                descricao.includes(searchTerm) || 
                local.includes(searchTerm);
            
            // Verificar filtros
            const matchTipoSangue = tipoSangue === 'todos' || cardTipoSangue === tipoSangue;
            const matchUrgencia = urgencia === 'todos' || cardUrgencia === urgencia;
            
            // Aplicar visibilidade
            if (matchSearch && matchTipoSangue && matchUrgencia) {
                card.style.display = 'block';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
                card.classList.remove('fade-in');
            }
        });
        
        // Verificar se há resultados
        this.verificarResultados();
    }

    verificarResultados() {
        const cardsVisiveis = this.campanhasContainer.querySelectorAll('.campanha-card[style="display: block"]');
        const mensagemSemResultados = document.querySelector('.sem-resultados');
        
        if (cardsVisiveis.length === 0) {
            if (!mensagemSemResultados) {
                const mensagem = document.createElement('div');
                mensagem.className = 'sem-resultados fade-in';
                mensagem.innerHTML = `
                    <i class="fas fa-search"></i>
                    <h3>Nenhuma campanha encontrada</h3>
                    <p>Tente ajustar seus filtros ou termos de busca</p>
                `;
                this.campanhasContainer.appendChild(mensagem);
            }
        } else if (mensagemSemResultados) {
            mensagemSemResultados.remove();
        }
    }

    initializeTooltips() {
        const tooltips = document.querySelectorAll('[data-tooltip]');
        
        tooltips.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = element.dataset.tooltip;
                
                document.body.appendChild(tooltip);
                
                const rect = element.getBoundingClientRect();
                tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
                tooltip.style.left = `${rect.left + (element.offsetWidth/2) - (tooltip.offsetWidth/2)}px`;
            });
            
            element.addEventListener('mouseleave', () => {
                const tooltip = document.querySelector('.tooltip');
                if (tooltip) tooltip.remove();
            });
        });
    }
}

// Estilos para os tooltips
const style = document.createElement('style');
style.textContent = `
    .tooltip {
        position: fixed;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 1000;
        pointer-events: none;
        transition: all 0.2s ease;
    }
    
    .sem-resultados {
        text-align: center;
        padding: 40px;
        color: var(--cor-texto);
    }
    
    .sem-resultados i {
        font-size: 48px;
        color: var(--cor-primaria);
        margin-bottom: 20px;
    }
    
    .sem-resultados h3 {
        margin: 10px 0;
        font-size: 24px;
    }
    
    .sem-resultados p {
        color: var(--cor-texto);
        opacity: 0.7;
    }
`;

document.head.appendChild(style);

// Inicializar sistema de pesquisa
document.addEventListener('DOMContentLoaded', () => {
    new CampanhaSearch();
}); 