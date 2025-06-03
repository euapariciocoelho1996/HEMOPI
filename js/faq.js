// Sistema de FAQ
class FAQSystem {
    constructor() {
        this.questions = [
            {
                category: 'Doação',
                items: [
                    {
                        question: 'Quem pode doar sangue?',
                        answer: `Para doar sangue, é necessário:
                            • Ter entre 16 e 69 anos
                            • Pesar mais de 50kg
                            • Estar bem de saúde
                            • Estar descansado e alimentado
                            • Apresentar documento oficial com foto`
                    },
                    {
                        question: 'Qual o intervalo entre as doações?',
                        answer: `O intervalo mínimo entre doações é:
                            • Homens: 60 dias (máximo de 4 doações por ano)
                            • Mulheres: 90 dias (máximo de 3 doações por ano)`
                    },
                    {
                        question: 'Quanto tempo dura a doação?',
                        answer: 'Todo o processo leva cerca de 40 minutos, incluindo cadastro, triagem e a doação em si, que dura aproximadamente 10 minutos.'
                    }
                ]
            },
            {
                category: 'Impedimentos',
                items: [
                    {
                        question: 'Quais são os impedimentos temporários?',
                        answer: `Alguns impedimentos temporários incluem:
                            • Gripe ou resfriado: aguardar 7 dias após fim dos sintomas
                            • Gravidez
                            • Amamentação
                            • Ingestão de bebida alcoólica nas últimas 12 horas
                            • Tatuagem ou piercing nos últimos 12 meses`
                    },
                    {
                        question: 'Quais são os impedimentos definitivos?',
                        answer: `São impedimentos definitivos:
                            • Hepatite B ou C
                            • HIV/AIDS
                            • Doença de Chagas
                            • Uso de drogas injetáveis
                            • Malária`
                    }
                ]
            },
            {
                category: 'Processo',
                items: [
                    {
                        question: 'Como é feita a triagem?',
                        answer: 'A triagem inclui verificação de pressão arterial, temperatura, peso, teste de anemia e entrevista sobre histórico de saúde e hábitos.'
                    },
                    {
                        question: 'Preciso estar em jejum?',
                        answer: 'Não. É recomendado evitar alimentos gordurosos nas 4 horas anteriores à doação e estar bem alimentado.'
                    },
                    {
                        question: 'Quais documentos preciso levar?',
                        answer: 'É necessário apresentar documento oficial original com foto (RG, CNH, Passaporte, etc).'
                    }
                ]
            },
            {
                category: 'Pós-Doação',
                items: [
                    {
                        question: 'O que devo fazer após doar?',
                        answer: `Recomendações pós-doação:
                            • Permanecer sentado por 15 minutos
                            • Evitar esforços físicos no dia
                            • Aumentar a ingestão de líquidos
                            • Não fumar por 2 horas
                            • Evitar bebidas alcoólicas por 12 horas`
                    },
                    {
                        question: 'Quando posso retomar as atividades normais?',
                        answer: 'Você pode retomar suas atividades normais no dia seguinte, mas deve evitar esforços físicos intensos no dia da doação.'
                    },
                    {
                        question: 'Como acompanhar os resultados dos exames?',
                        answer: 'Os resultados dos exames ficam disponíveis em até 30 dias e podem ser acessados através do seu perfil no sistema ou presencialmente no hemocentro.'
                    }
                ]
            }
        ];
        
        this.init();
    }

    init() {
        this.createFAQSection();
        this.setupSearch();
    }

    createFAQSection() {
        let faqSection = document.querySelector('.faq-section');
        if (!faqSection) {
            faqSection = document.createElement('section');
            faqSection.className = 'faq-section';
            
            faqSection.innerHTML = `
                <div class="faq-container">
                    <h2>Perguntas Frequentes</h2>
                    
                    <div class="faq-search">
                        <div class="search-input">
                            <i class="fas fa-search"></i>
                            <input type="text" placeholder="Buscar perguntas...">
                        </div>
                        <div class="search-results"></div>
                    </div>
                    
                    <div class="faq-categories">
                        ${this.questions.map(category => `
                            <div class="faq-category">
                                <h3>${category.category}</h3>
                                <div class="faq-items">
                                    ${category.items.map(item => `
                                        <div class="faq-item">
                                            <div class="faq-question">
                                                <span>${item.question}</span>
                                                <button class="toggle-answer">
                                                    <i class="fas fa-chevron-down"></i>
                                                </button>
                                            </div>
                                            <div class="faq-answer">
                                                <p>${item.answer}</p>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            // Inserir após a seção de agendamento
            const appointmentSection = document.querySelector('.appointment-section');
            if (appointmentSection) {
                appointmentSection.parentNode.insertBefore(faqSection, appointmentSection.nextSibling);
            } else {
                document.body.appendChild(faqSection);
            }
            
            // Adicionar eventos
            this.setupEventListeners(faqSection);
        }
    }

    setupEventListeners(section) {
        // Toggle respostas
        section.querySelectorAll('.toggle-answer').forEach(button => {
            button.addEventListener('click', () => {
                const item = button.closest('.faq-item');
                const answer = item.querySelector('.faq-answer');
                const icon = button.querySelector('i');
                
                // Fechar outros itens
                section.querySelectorAll('.faq-item.active').forEach(activeItem => {
                    if (activeItem !== item) {
                        activeItem.classList.remove('active');
                        activeItem.querySelector('.faq-answer').style.maxHeight = null;
                        activeItem.querySelector('.toggle-answer i').classList.replace('fa-chevron-up', 'fa-chevron-down');
                    }
                });
                
                // Toggle item atual
                item.classList.toggle('active');
                if (item.classList.contains('active')) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                } else {
                    answer.style.maxHeight = null;
                    icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                }
            });
        });
    }

    setupSearch() {
        const searchInput = document.querySelector('.faq-search input');
        const resultsContainer = document.querySelector('.search-results');
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.toLowerCase().trim();
            
            searchTimeout = setTimeout(() => {
                if (query.length < 2) {
                    resultsContainer.innerHTML = '';
                    resultsContainer.classList.remove('show');
                    return;
                }
                
                const results = this.searchQuestions(query);
                this.displaySearchResults(results, query, resultsContainer);
            }, 300);
        });
        
        // Fechar resultados ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.faq-search')) {
                resultsContainer.classList.remove('show');
            }
        });
    }

    searchQuestions(query) {
        const results = [];
        
        this.questions.forEach(category => {
            category.items.forEach(item => {
                if (item.question.toLowerCase().includes(query) || 
                    item.answer.toLowerCase().includes(query)) {
                    results.push({
                        category: category.category,
                        ...item
                    });
                }
            });
        });
        
        return results;
    }

    displaySearchResults(results, query, container) {
        if (results.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>Nenhum resultado encontrado para "${query}"</p>
                </div>
            `;
        } else {
            container.innerHTML = results.map(result => `
                <div class="search-result">
                    <div class="result-category">${result.category}</div>
                    <div class="result-question">${this.highlightText(result.question, query)}</div>
                    <div class="result-answer">${this.highlightText(this.truncateText(result.answer), query)}</div>
                </div>
            `).join('');
        }
        
        container.classList.add('show');
        
        // Adicionar eventos aos resultados
        container.querySelectorAll('.search-result').forEach((result, index) => {
            result.addEventListener('click', () => {
                this.scrollToQuestion(results[index]);
                container.classList.remove('show');
                document.querySelector('.faq-search input').value = '';
            });
        });
    }

    scrollToQuestion(result) {
        const questions = document.querySelectorAll('.faq-question');
        let targetQuestion;
        
        questions.forEach(question => {
            if (question.querySelector('span').textContent === result.question) {
                targetQuestion = question;
            }
        });
        
        if (targetQuestion) {
            const item = targetQuestion.closest('.faq-item');
            const answer = item.querySelector('.faq-answer');
            const button = item.querySelector('.toggle-answer');
            const icon = button.querySelector('i');
            
            // Abrir resposta
            item.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + 'px';
            icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            
            // Scroll suave
            targetQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Destacar brevemente
            item.classList.add('highlight');
            setTimeout(() => item.classList.remove('highlight'), 2000);
        }
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    truncateText(text, limit = 100) {
        if (text.length <= limit) return text;
        return text.substring(0, limit) + '...';
    }
}

// Adicionar estilos
const style = document.createElement('style');
style.textContent = `
    .faq-section {
        padding: 60px 20px;
        background: var(--cor-fundo);
    }

    .faq-container {
        max-width: 800px;
        margin: 0 auto;
    }

    .faq-container h2 {
        text-align: center;
        margin-bottom: 40px;
        color: var(--cor-texto);
    }

    /* Busca */
    .faq-search {
        position: relative;
        margin-bottom: 40px;
    }

    .search-input {
        position: relative;
    }

    .search-input i {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--cor-texto);
        opacity: 0.5;
    }

    .search-input input {
        width: 100%;
        padding: 15px 15px 15px 45px;
        border: none;
        border-radius: 8px;
        background: var(--cor-fundo);
        color: var(--cor-texto);
        font-size: 16px;
        box-shadow: var(--sombra-padrao);
    }

    .search-results {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--cor-fundo);
        border-radius: 8px;
        box-shadow: var(--sombra-padrao);
        margin-top: 10px;
        z-index: 100;
        max-height: 400px;
        overflow-y: auto;
    }

    .search-results.show {
        display: block;
    }

    .no-results {
        padding: 30px;
        text-align: center;
        color: var(--cor-texto);
    }

    .no-results i {
        font-size: 24px;
        color: var(--cor-primaria);
        margin-bottom: 10px;
    }

    .search-result {
        padding: 15px;
        border-bottom: 1px solid var(--cor-borda);
        cursor: pointer;
        transition: all 0.2s;
    }

    .search-result:last-child {
        border-bottom: none;
    }

    .search-result:hover {
        background: var(--cor-fundo-secundaria);
    }

    .result-category {
        font-size: 12px;
        color: var(--cor-primaria);
        margin-bottom: 5px;
    }

    .result-question {
        font-weight: bold;
        color: var(--cor-texto);
        margin-bottom: 5px;
    }

    .result-answer {
        font-size: 14px;
        color: var(--cor-texto);
        opacity: 0.7;
    }

    mark {
        background: var(--cor-primaria);
        color: white;
        padding: 0 2px;
        border-radius: 2px;
    }

    /* Categorias */
    .faq-category {
        margin-bottom: 40px;
    }

    .faq-category h3 {
        margin-bottom: 20px;
        color: var(--cor-texto);
        font-size: 24px;
    }

    .faq-items {
        display: grid;
        gap: 15px;
    }

    .faq-item {
        background: var(--cor-fundo);
        border-radius: 8px;
        box-shadow: var(--sombra-padrao);
        transition: all 0.3s;
    }

    .faq-item.highlight {
        transform: scale(1.02);
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
    }

    .faq-question {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px;
        cursor: pointer;
        color: var(--cor-texto);
    }

    .faq-question span {
        font-weight: bold;
        flex: 1;
        padding-right: 20px;
    }

    .toggle-answer {
        background: none;
        border: none;
        color: var(--cor-texto);
        cursor: pointer;
        padding: 5px;
        opacity: 0.5;
        transition: all 0.2s;
    }

    .toggle-answer:hover {
        opacity: 1;
    }

    .faq-answer {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
    }

    .faq-answer p {
        padding: 0 20px 20px;
        color: var(--cor-texto);
        opacity: 0.8;
        white-space: pre-line;
    }

    @media (max-width: 768px) {
        .faq-section {
            padding: 40px 15px;
        }

        .faq-question {
            padding: 15px;
        }

        .faq-answer p {
            padding: 0 15px 15px;
        }
    }
`;

document.head.appendChild(style);

// Inicializar sistema de FAQ
document.addEventListener('DOMContentLoaded', () => {
    new FAQSystem();
}); 