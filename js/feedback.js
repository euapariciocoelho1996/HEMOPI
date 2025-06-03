// Sistema de Feedback
class FeedbackSystem {
    constructor() {
        this.feedbacks = [];
        this.init();
    }

    init() {
        this.loadFeedbacks();
        this.createFeedbackSection();
    }

    loadFeedbacks() {
        // Simulação de dados iniciais
        this.feedbacks = [
            {
                id: 1,
                name: 'João Silva',
                rating: 5,
                comment: 'Excelente atendimento! A equipe foi muito atenciosa e profissional.',
                date: '2024-03-10',
                type: 'Doação',
                verified: true
            },
            {
                id: 2,
                name: 'Maria Santos',
                rating: 4,
                comment: 'Processo rápido e organizado. Apenas sugiro mais cadeiras na sala de espera.',
                date: '2024-03-08',
                type: 'Doação',
                verified: true
            },
            {
                id: 3,
                name: 'Pedro Oliveira',
                rating: 5,
                comment: 'Primeira vez doando e me senti muito seguro. Parabéns à equipe!',
                date: '2024-03-05',
                type: 'Primeira Doação',
                verified: true
            }
        ];
    }

    createFeedbackSection() {
        let feedbackSection = document.querySelector('.feedback-section');
        if (!feedbackSection) {
            feedbackSection = document.createElement('section');
            feedbackSection.className = 'feedback-section';
            
            feedbackSection.innerHTML = `
                <div class="feedback-container">
                    <h2>Avaliações e Comentários</h2>
                    
                    <div class="feedback-summary">
                        <div class="rating-overview">
                            <div class="average-rating">
                                <span class="rating-number">4.8</span>
                                <div class="rating-stars">
                                    ${this.createStars(4.8)}
                                </div>
                                <span class="total-ratings">Baseado em ${this.feedbacks.length} avaliações</span>
                            </div>
                            <div class="rating-bars">
                                ${this.createRatingBars()}
                            </div>
                        </div>
                        
                        <button class="add-feedback-btn">
                            <i class="fas fa-plus"></i>
                            Adicionar Avaliação
                        </button>
                    </div>
                    
                    <div class="feedback-filters">
                        <div class="filter-group">
                            <label>Filtrar por:</label>
                            <select class="filter-type">
                                <option value="all">Todos os tipos</option>
                                <option value="Doação">Doação</option>
                                <option value="Primeira Doação">Primeira Doação</option>
                                <option value="Agendamento">Agendamento</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>Ordenar por:</label>
                            <select class="sort-by">
                                <option value="date-desc">Mais recentes</option>
                                <option value="date-asc">Mais antigos</option>
                                <option value="rating-desc">Maior avaliação</option>
                                <option value="rating-asc">Menor avaliação</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="feedback-list"></div>
                    
                    <div class="feedback-pagination">
                        <button class="prev-page" disabled>
                            <i class="fas fa-chevron-left"></i>
                            Anterior
                        </button>
                        <span class="page-info">Página 1 de 1</span>
                        <button class="next-page" disabled>
                            Próxima
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Inserir após a seção de FAQ
            const faqSection = document.querySelector('.faq-section');
            if (faqSection) {
                faqSection.parentNode.insertBefore(feedbackSection, faqSection.nextSibling);
            } else {
                document.body.appendChild(feedbackSection);
            }
            
            // Inicializar eventos
            this.setupEventListeners(feedbackSection);
            
            // Renderizar feedbacks
            this.renderFeedbacks();
        }
    }

    setupEventListeners(section) {
        // Botão de adicionar feedback
        section.querySelector('.add-feedback-btn').addEventListener('click', () => {
            if (window.auth && window.auth.currentUser) {
                this.showFeedbackModal();
            } else {
                window.notifications.info('Faça login para adicionar uma avaliação');
            }
        });
        
        // Filtros
        section.querySelector('.filter-type').addEventListener('change', () => {
            this.renderFeedbacks();
        });
        
        section.querySelector('.sort-by').addEventListener('change', () => {
            this.renderFeedbacks();
        });
    }

    createStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return `
            ${Array(fullStars).fill('<i class="fas fa-star"></i>').join('')}
            ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
            ${Array(emptyStars).fill('<i class="far fa-star"></i>').join('')}
        `;
    }

    createRatingBars() {
        const ratings = [5, 4, 3, 2, 1];
        const counts = ratings.map(rating => {
            return this.feedbacks.filter(f => Math.floor(f.rating) === rating).length;
        });
        const total = this.feedbacks.length;
        
        return ratings.map((rating, index) => {
            const percentage = total > 0 ? (counts[index] / total * 100) : 0;
            return `
                <div class="rating-bar">
                    <span class="rating-label">${rating} estrelas</span>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="rating-count">${counts[index]}</span>
                </div>
            `;
        }).join('');
    }

    renderFeedbacks() {
        const container = document.querySelector('.feedback-list');
        const filterType = document.querySelector('.filter-type').value;
        const sortBy = document.querySelector('.sort-by').value;
        
        // Filtrar
        let filtered = this.feedbacks;
        if (filterType !== 'all') {
            filtered = filtered.filter(f => f.type === filterType);
        }
        
        // Ordenar
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'rating-desc':
                    return b.rating - a.rating;
                case 'rating-asc':
                    return a.rating - b.rating;
                default:
                    return 0;
            }
        });
        
        // Renderizar
        container.innerHTML = filtered.map(feedback => `
            <div class="feedback-card">
                <div class="feedback-header">
                    <div class="feedback-user">
                        <div class="user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="user-info">
                            <div class="user-name">
                                ${feedback.name}
                                ${feedback.verified ? `
                                    <span class="verified-badge" data-tooltip="Doador verificado">
                                        <i class="fas fa-check-circle"></i>
                                    </span>
                                ` : ''}
                            </div>
                            <div class="feedback-meta">
                                <span class="feedback-date">
                                    ${this.formatDate(feedback.date)}
                                </span>
                                <span class="feedback-type">${feedback.type}</span>
                            </div>
                        </div>
                    </div>
                    <div class="feedback-rating">
                        ${this.createStars(feedback.rating)}
                    </div>
                </div>
                <div class="feedback-content">
                    <p>${feedback.comment}</p>
                </div>
                ${feedback.reply ? `
                    <div class="feedback-reply">
                        <div class="reply-header">
                            <i class="fas fa-reply"></i>
                            <span>Resposta do HEMOPI</span>
                        </div>
                        <p>${feedback.reply}</p>
                    </div>
                ` : ''}
            </div>
        `).join('') || `
            <div class="no-feedbacks">
                <i class="fas fa-comments"></i>
                <p>Nenhuma avaliação encontrada</p>
            </div>
        `;
    }

    showFeedbackModal() {
        const modal = document.createElement('div');
        modal.className = 'feedback-modal';
        
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <h2>Adicionar Avaliação</h2>
                
                <form id="feedbackForm">
                    <div class="rating-input">
                        <label>Sua avaliação</label>
                        <div class="star-rating">
                            ${Array(5).fill('').map((_, i) => `
                                <i class="far fa-star" data-rating="${i + 1}"></i>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="feedbackType">Tipo de experiência</label>
                        <select id="feedbackType" required>
                            <option value="">Selecione...</option>
                            <option value="Doação">Doação</option>
                            <option value="Primeira Doação">Primeira Doação</option>
                            <option value="Agendamento">Agendamento</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="feedbackComment">Seu comentário</label>
                        <textarea id="feedbackComment" rows="4" required
                            placeholder="Conte-nos sobre sua experiência..."></textarea>
                        <div class="textarea-footer">
                            <span class="char-counter">0/500</span>
                        </div>
                    </div>
                    
                    <button type="submit" class="submit-feedback" disabled>
                        Enviar Avaliação
                    </button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar eventos
        this.setupModalListeners(modal);
    }

    setupModalListeners(modal) {
        const form = modal.querySelector('#feedbackForm');
        const stars = modal.querySelectorAll('.star-rating i');
        const comment = modal.querySelector('#feedbackComment');
        const charCounter = modal.querySelector('.char-counter');
        const submitBtn = modal.querySelector('.submit-feedback');
        let selectedRating = 0;
        
        // Fechar modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Rating stars
        stars.forEach(star => {
            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.dataset.rating);
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
            
            star.addEventListener('mouseleave', () => {
                stars.forEach((s, index) => {
                    if (index < selectedRating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
            
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.rating);
                this.validateForm(form, selectedRating);
            });
        });
        
        // Contador de caracteres
        comment.addEventListener('input', () => {
            const length = comment.value.length;
            charCounter.textContent = `${length}/500`;
            
            if (length > 500) {
                comment.value = comment.value.substring(0, 500);
                charCounter.textContent = '500/500';
            }
            
            this.validateForm(form, selectedRating);
        });
        
        // Validação do tipo
        form.querySelector('#feedbackType').addEventListener('change', () => {
            this.validateForm(form, selectedRating);
        });
        
        // Submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFeedbackSubmit(form, selectedRating);
            document.body.removeChild(modal);
        });
    }

    validateForm(form, rating) {
        const type = form.querySelector('#feedbackType').value;
        const comment = form.querySelector('#feedbackComment').value;
        const submitBtn = form.querySelector('.submit-feedback');
        
        submitBtn.disabled = !(rating > 0 && type && comment.length >= 10);
    }

    async handleFeedbackSubmit(form, rating) {
        const feedback = {
            id: Date.now(),
            name: window.auth.currentUser.name,
            rating: rating,
            type: form.querySelector('#feedbackType').value,
            comment: form.querySelector('#feedbackComment').value,
            date: new Date().toISOString().split('T')[0],
            verified: true
        };
        
        try {
            // Simulação de chamada à API
            await this.simulateApiCall(feedback);
            
            // Adicionar ao array local
            this.feedbacks.unshift(feedback);
            
            // Atualizar UI
            this.renderFeedbacks();
            
            window.notifications.success('Avaliação enviada com sucesso!');
        } catch (error) {
            window.notifications.error('Erro ao enviar avaliação');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    simulateApiCall(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(data);
            }, 800);
        });
    }
}

// Adicionar estilos
const style = document.createElement('style');
style.textContent = `
    .feedback-section {
        padding: 60px 20px;
        background: var(--cor-fundo);
    }

    .feedback-container {
        max-width: 800px;
        margin: 0 auto;
    }

    .feedback-container h2 {
        text-align: center;
        margin-bottom: 40px;
        color: var(--cor-texto);
    }

    /* Resumo */
    .feedback-summary {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 30px;
        margin-bottom: 40px;
    }

    .rating-overview {
        flex: 1;
        background: var(--cor-fundo);
        padding: 20px;
        border-radius: 12px;
        box-shadow: var(--sombra-padrao);
    }

    .average-rating {
        text-align: center;
        margin-bottom: 20px;
    }

    .rating-number {
        font-size: 48px;
        font-weight: bold;
        color: var(--cor-texto);
    }

    .rating-stars {
        color: #ffc107;
        font-size: 24px;
        margin: 10px 0;
    }

    .total-ratings {
        color: var(--cor-texto);
        opacity: 0.7;
    }

    .rating-bars {
        display: grid;
        gap: 10px;
    }

    .rating-bar {
        display: grid;
        grid-template-columns: 80px 1fr 50px;
        align-items: center;
        gap: 10px;
    }

    .rating-label {
        color: var(--cor-texto);
        font-size: 14px;
    }

    .bar-container {
        height: 8px;
        background: var(--cor-fundo-secundaria);
        border-radius: 4px;
        overflow: hidden;
    }

    .bar-fill {
        height: 100%;
        background: var(--cor-primaria);
        border-radius: 4px;
        transition: width 0.3s ease;
    }

    .rating-count {
        color: var(--cor-texto);
        font-size: 14px;
        text-align: right;
    }

    .add-feedback-btn {
        padding: 12px 24px;
        background: var(--cor-primaria);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
    }

    .add-feedback-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    /* Filtros */
    .feedback-filters {
        display: flex;
        gap: 20px;
        margin-bottom: 30px;
    }

    .filter-group {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .filter-group label {
        color: var(--cor-texto);
    }

    .filter-group select {
        padding: 8px;
        border: 1px solid var(--cor-borda);
        border-radius: 6px;
        background: var(--cor-fundo);
        color: var(--cor-texto);
    }

    /* Lista de Feedbacks */
    .feedback-list {
        display: grid;
        gap: 20px;
        margin-bottom: 30px;
    }

    .feedback-card {
        background: var(--cor-fundo);
        padding: 20px;
        border-radius: 12px;
        box-shadow: var(--sombra-padrao);
    }

    .feedback-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15px;
    }

    .feedback-user {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .user-avatar {
        width: 50px;
        height: 50px;
        background: var(--cor-fundo-secundaria);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .user-avatar i {
        font-size: 24px;
        color: var(--cor-primaria);
    }

    .user-info {
        display: grid;
        gap: 5px;
    }

    .user-name {
        color: var(--cor-texto);
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .verified-badge {
        color: #28a745;
        cursor: help;
    }

    .feedback-meta {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--cor-texto);
        opacity: 0.7;
        font-size: 14px;
    }

    .feedback-type {
        padding: 2px 8px;
        background: var(--cor-fundo-secundaria);
        border-radius: 4px;
    }

    .feedback-rating {
        color: #ffc107;
    }

    .feedback-content {
        color: var(--cor-texto);
        margin-bottom: 15px;
    }

    .feedback-reply {
        background: var(--cor-fundo-secundaria);
        padding: 15px;
        border-radius: 8px;
        margin-top: 15px;
    }

    .reply-header {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--cor-primaria);
        font-weight: bold;
        margin-bottom: 10px;
    }

    .no-feedbacks {
        text-align: center;
        padding: 40px;
        color: var(--cor-texto);
    }

    .no-feedbacks i {
        font-size: 48px;
        color: var(--cor-primaria);
        margin-bottom: 20px;
    }

    /* Paginação */
    .feedback-pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
    }

    .feedback-pagination button {
        padding: 8px 16px;
        background: var(--cor-fundo);
        border: 1px solid var(--cor-borda);
        border-radius: 6px;
        color: var(--cor-texto);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
    }

    .feedback-pagination button:not(:disabled):hover {
        background: var(--cor-fundo-secundaria);
    }

    .feedback-pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .page-info {
        color: var(--cor-texto);
    }

    /* Modal */
    .feedback-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        animation: fadeIn 0.3s ease;
    }

    .modal-content {
        position: relative;
        width: 90%;
        max-width: 500px;
        background: var(--cor-fundo);
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        animation: slideIn 0.3s ease;
        z-index: 1;
    }

    .modal-close {
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

    .modal-close:hover {
        opacity: 1;
    }

    .rating-input {
        margin-bottom: 20px;
    }

    .rating-input label {
        display: block;
        margin-bottom: 10px;
        color: var(--cor-texto);
    }

    .star-rating {
        display: flex;
        gap: 5px;
        color: #ffc107;
        font-size: 24px;
    }

    .star-rating i {
        cursor: pointer;
        transition: transform 0.2s;
    }

    .star-rating i:hover {
        transform: scale(1.2);
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-group label {
        display: block;
        margin-bottom: 8px;
        color: var(--cor-texto);
    }

    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid var(--cor-borda);
        border-radius: 6px;
        background: var(--cor-fundo);
        color: var(--cor-texto);
    }

    .textarea-footer {
        display: flex;
        justify-content: flex-end;
        margin-top: 5px;
    }

    .char-counter {
        font-size: 12px;
        color: var(--cor-texto);
        opacity: 0.7;
    }

    .submit-feedback {
        width: 100%;
        padding: 12px;
        background: var(--cor-primaria);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .submit-feedback:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .submit-feedback:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    @media (max-width: 768px) {
        .feedback-summary {
            flex-direction: column;
        }

        .feedback-filters {
            flex-direction: column;
        }
    }
`;

document.head.appendChild(style);

// Inicializar sistema de feedback
document.addEventListener('DOMContentLoaded', () => {
    new FeedbackSystem();
}); 