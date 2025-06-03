// Sistema de Estatísticas de Doações
class DonationStats {
    constructor() {
        this.stats = {
            totalDoacoes: 0,
            doacoesPorTipo: {},
            doacoesPorMes: {},
            campanhasAtivas: 0,
            metasAlcancadas: 0
        };
        
        this.init();
    }

    async init() {
        // Simular carregamento de dados
        await this.loadStats();
        
        // Criar e exibir gráficos
        this.createCharts();
        
        // Atualizar contadores
        this.updateCounters();
        
        // Adicionar observador para animações
        this.observeStats();
    }

    async loadStats() {
        // Simulação de dados - em produção, isso viria do backend
        this.stats = {
            totalDoacoes: 1250,
            doacoesPorTipo: {
                'A+': 320,
                'A-': 150,
                'B+': 280,
                'B-': 120,
                'AB+': 90,
                'AB-': 40,
                'O+': 180,
                'O-': 70
            },
            doacoesPorMes: {
                'Jan': 95,
                'Fev': 120,
                'Mar': 150,
                'Abr': 130,
                'Mai': 140,
                'Jun': 160,
                'Jul': 145,
                'Ago': 135,
                'Set': 155,
                'Out': 170,
                'Nov': 165,
                'Dez': 180
            },
            campanhasAtivas: 8,
            metasAlcancadas: 5
        };
    }

    createCharts() {
        // Criar container de estatísticas se não existir
        let statsSection = document.querySelector('.estatisticas-section');
        if (!statsSection) {
            statsSection = document.createElement('section');
            statsSection.className = 'estatisticas-section';
            statsSection.innerHTML = `
                <div class="stats-container">
                    <h2>Estatísticas de Doações</h2>
                    <div class="stats-grid">
                        <div class="stats-card total-doacoes">
                            <i class="fas fa-heart"></i>
                            <h3>Total de Doações</h3>
                            <div class="counter" data-target="${this.stats.totalDoacoes}">0</div>
                        </div>
                        <div class="stats-card campanhas-ativas">
                            <i class="fas fa-calendar-check"></i>
                            <h3>Campanhas Ativas</h3>
                            <div class="counter" data-target="${this.stats.campanhasAtivas}">0</div>
                        </div>
                        <div class="stats-card metas-alcancadas">
                            <i class="fas fa-trophy"></i>
                            <h3>Metas Alcançadas</h3>
                            <div class="counter" data-target="${this.stats.metasAlcancadas}">0</div>
                        </div>
                    </div>
                    <div class="charts-container">
                        <div class="chart-card">
                            <h3>Doações por Tipo Sanguíneo</h3>
                            <div class="blood-type-chart"></div>
                        </div>
                        <div class="chart-card">
                            <h3>Evolução Mensal de Doações</h3>
                            <div class="monthly-chart"></div>
                        </div>
                    </div>
                </div>
            `;
            
            // Inserir antes da seção de campanhas
            const campanhasSection = document.querySelector('.secao-campanhas');
            campanhasSection.parentNode.insertBefore(statsSection, campanhasSection);
        }
        
        // Criar gráficos
        this.createBloodTypeChart();
        this.createMonthlyChart();
    }

    createBloodTypeChart() {
        const container = document.querySelector('.blood-type-chart');
        const data = this.stats.doacoesPorTipo;
        
        container.innerHTML = Object.entries(data).map(([tipo, quantidade]) => `
            <div class="blood-bar">
                <div class="blood-label">${tipo}</div>
                <div class="blood-bar-container">
                    <div class="blood-bar-fill" style="width: ${(quantidade / Math.max(...Object.values(data)) * 100)}%">
                        <span class="blood-value">${quantidade}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    createMonthlyChart() {
        const container = document.querySelector('.monthly-chart');
        const data = this.stats.doacoesPorMes;
        const maxValue = Math.max(...Object.values(data));
        
        container.innerHTML = Object.entries(data).map(([mes, quantidade]) => `
            <div class="month-bar">
                <div class="month-bar-container">
                    <div class="month-bar-fill" style="height: ${(quantidade / maxValue * 100)}%">
                        <span class="month-value">${quantidade}</span>
                    </div>
                </div>
                <div class="month-label">${mes}</div>
            </div>
        `).join('');
    }

    updateCounters() {
        const counters = document.querySelectorAll('.counter');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const increment = target / 200;
            
            const updateCount = () => {
                const count = parseInt(counter.innerText);
                if (count < target) {
                    counter.innerText = Math.ceil(count + increment);
                    setTimeout(updateCount, 1);
                } else {
                    counter.innerText = target;
                }
            };
            
            updateCount();
        });
    }

    observeStats() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.blood-bar-fill, .month-bar-fill').forEach(el => {
            observer.observe(el);
        });
    }
}

// Adicionar estilos
const style = document.createElement('style');
style.textContent = `
    .estatisticas-section {
        padding: 60px 20px;
        background: var(--cor-fundo);
    }

    .stats-container {
        max-width: 1200px;
        margin: 0 auto;
    }

    .stats-container h2 {
        text-align: center;
        margin-bottom: 40px;
        color: var(--cor-texto);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 30px;
        margin-bottom: 50px;
    }

    .stats-card {
        background: var(--cor-fundo);
        border-radius: 12px;
        padding: 30px;
        text-align: center;
        box-shadow: var(--sombra-padrao);
        transition: transform 0.3s;
    }

    .stats-card:hover {
        transform: translateY(-5px);
    }

    .stats-card i {
        font-size: 36px;
        color: var(--cor-primaria);
        margin-bottom: 15px;
    }

    .stats-card h3 {
        margin: 10px 0;
        color: var(--cor-texto);
    }

    .counter {
        font-size: 36px;
        font-weight: bold;
        color: var(--cor-primaria);
    }

    .charts-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 30px;
    }

    .chart-card {
        background: var(--cor-fundo);
        border-radius: 12px;
        padding: 30px;
        box-shadow: var(--sombra-padrao);
    }

    .chart-card h3 {
        text-align: center;
        margin-bottom: 30px;
        color: var(--cor-texto);
    }

    /* Gráfico de Tipos Sanguíneos */
    .blood-type-chart {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .blood-bar {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .blood-label {
        min-width: 50px;
        font-weight: bold;
        color: var(--cor-texto);
    }

    .blood-bar-container {
        flex: 1;
        height: 25px;
        background: var(--cor-fundo-secundaria);
        border-radius: 12px;
        overflow: hidden;
    }

    .blood-bar-fill {
        height: 100%;
        background: var(--cor-primaria);
        border-radius: 12px;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 1s ease;
        position: relative;
    }

    .blood-bar-fill.animate {
        transform: scaleX(1);
    }

    .blood-value {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: white;
        font-weight: bold;
    }

    /* Gráfico Mensal */
    .monthly-chart {
        height: 300px;
        display: flex;
        align-items: flex-end;
        gap: 10px;
        padding-top: 30px;
    }

    .month-bar {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .month-bar-container {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: flex-end;
    }

    .month-bar-fill {
        width: 100%;
        background: var(--cor-primaria);
        border-radius: 6px 6px 0 0;
        transform: scaleY(0);
        transform-origin: bottom;
        transition: transform 1s ease;
        position: relative;
    }

    .month-bar-fill.animate {
        transform: scaleY(1);
    }

    .month-value {
        position: absolute;
        top: -25px;
        left: 50%;
        transform: translateX(-50%);
        color: var(--cor-texto);
        font-size: 12px;
    }

    .month-label {
        margin-top: 10px;
        color: var(--cor-texto);
        font-size: 12px;
        transform: rotate(-45deg);
    }

    @media (max-width: 768px) {
        .charts-container {
            grid-template-columns: 1fr;
        }

        .chart-card {
            overflow-x: auto;
        }

        .monthly-chart {
            min-width: 600px;
        }
    }
`;

document.head.appendChild(style);

// Inicializar sistema de estatísticas
document.addEventListener('DOMContentLoaded', () => {
    new DonationStats();
}); 