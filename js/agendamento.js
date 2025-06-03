// Sistema de Agendamento de Doações
class AppointmentSystem {
    constructor() {
        this.appointments = [];
        this.locations = [
            {
                id: 1,
                name: 'HEMOPI Central',
                address: 'Rua 1º de Maio, 235 - Centro',
                city: 'Teresina',
                state: 'PI',
                slots: [
                    { time: '08:00', maxAppointments: 5 },
                    { time: '09:00', maxAppointments: 5 },
                    { time: '10:00', maxAppointments: 5 },
                    { time: '11:00', maxAppointments: 5 },
                    { time: '14:00', maxAppointments: 5 },
                    { time: '15:00', maxAppointments: 5 },
                    { time: '16:00', maxAppointments: 5 }
                ]
            },
            {
                id: 2,
                name: 'HEMOPI Móvel',
                address: 'Localização Variável',
                city: 'Teresina',
                state: 'PI',
                slots: [
                    { time: '09:00', maxAppointments: 3 },
                    { time: '10:00', maxAppointments: 3 },
                    { time: '11:00', maxAppointments: 3 },
                    { time: '14:00', maxAppointments: 3 },
                    { time: '15:00', maxAppointments: 3 }
                ]
            }
        ];
        
        this.init();
    }

    init() {
        this.createAppointmentSection();
        this.loadAppointments();
    }

    createAppointmentSection() {
        let appointmentSection = document.querySelector('.appointment-section');
        if (!appointmentSection) {
            appointmentSection = document.createElement('section');
            appointmentSection.className = 'appointment-section';
            
            appointmentSection.innerHTML = `
                <div class="appointment-container">
                    <h2>Agendar Doação</h2>
                    
                    <div class="appointment-grid">
                        <div class="calendar-container">
                            <div class="calendar-header">
                                <button class="prev-month">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <h3 class="current-month"></h3>
                                <button class="next-month">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                            <div class="calendar-grid">
                                <div class="calendar-weekdays"></div>
                                <div class="calendar-days"></div>
                            </div>
                        </div>
                        
                        <div class="appointment-details">
                            <div class="location-select">
                                <h3>Local da Doação</h3>
                                <div class="location-cards"></div>
                            </div>
                            
                            <div class="time-select">
                                <h3>Horário Disponível</h3>
                                <div class="time-slots"></div>
                            </div>
                            
                            <button class="schedule-btn" disabled>
                                Agendar Doação
                            </button>
                        </div>
                    </div>
                    
                    <div class="my-appointments">
                        <h3>Meus Agendamentos</h3>
                        <div class="appointments-list"></div>
                    </div>
                </div>
            `;
            
            // Inserir após a seção de perfil
            const profileSection = document.querySelector('.profile-section');
            if (profileSection) {
                profileSection.parentNode.insertBefore(appointmentSection, profileSection.nextSibling);
            } else {
                document.body.appendChild(appointmentSection);
            }
            
            // Inicializar calendário e eventos
            this.initializeCalendar();
            this.setupEventListeners();
        }
    }

    initializeCalendar() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedLocation = null;
        this.selectedTime = null;
        
        // Preencher dias da semana
        const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const weekdaysContainer = document.querySelector('.calendar-weekdays');
        weekdaysContainer.innerHTML = weekdays.map(day => `
            <div class="calendar-weekday">${day}</div>
        `).join('');
        
        // Renderizar calendário
        this.renderCalendar();
        
        // Renderizar locais
        this.renderLocations();
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Atualizar mês/ano no cabeçalho
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        document.querySelector('.current-month').textContent = 
            `${monthNames[month]} ${year}`;
        
        // Calcular dias
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        const daysContainer = document.querySelector('.calendar-days');
        let days = '';
        
        // Dias vazios do início
        for (let i = 0; i < startingDay; i++) {
            days += '<div class="calendar-day empty"></div>';
        }
        
        // Dias do mês
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month, day);
            const today = new Date();
            const isToday = date.toDateString() === today.toDateString();
            const isPast = date < new Date(today.setHours(0, 0, 0, 0));
            const isSelected = this.selectedDate && 
                             date.toDateString() === this.selectedDate.toDateString();
            
            days += `
                <div class="calendar-day ${isToday ? 'today' : ''} 
                                        ${isPast ? 'past' : ''} 
                                        ${isSelected ? 'selected' : ''}"
                     data-date="${date.toISOString()}">
                    ${day}
                </div>
            `;
        }
        
        daysContainer.innerHTML = days;
        
        // Adicionar eventos aos dias
        daysContainer.querySelectorAll('.calendar-day:not(.empty):not(.past)').forEach(day => {
            day.addEventListener('click', () => this.selectDate(day));
        });
    }

    renderLocations() {
        const container = document.querySelector('.location-cards');
        container.innerHTML = this.locations.map(location => `
            <div class="location-card" data-location-id="${location.id}">
                <h4>${location.name}</h4>
                <p>${location.address}</p>
                <p>${location.city} - ${location.state}</p>
            </div>
        `).join('');
        
        // Adicionar eventos
        container.querySelectorAll('.location-card').forEach(card => {
            card.addEventListener('click', () => this.selectLocation(card));
        });
    }

    renderTimeSlots() {
        if (!this.selectedLocation || !this.selectedDate) return;
        
        const container = document.querySelector('.time-slots');
        const location = this.locations.find(l => l.id === this.selectedLocation);
        
        container.innerHTML = location.slots.map(slot => {
            const isAvailable = this.checkSlotAvailability(slot);
            return `
                <div class="time-slot ${!isAvailable ? 'unavailable' : ''}"
                     data-time="${slot.time}">
                    <span class="time">${slot.time}</span>
                    <span class="availability">
                        ${isAvailable ? 'Disponível' : 'Lotado'}
                    </span>
                </div>
            `;
        }).join('');
        
        // Adicionar eventos
        container.querySelectorAll('.time-slot:not(.unavailable)').forEach(slot => {
            slot.addEventListener('click', () => this.selectTime(slot));
        });
    }

    checkSlotAvailability(slot) {
        if (!this.selectedDate || !this.selectedLocation) return false;
        
        const appointmentsInSlot = this.appointments.filter(app => 
            app.date === this.selectedDate.toISOString().split('T')[0] &&
            app.locationId === this.selectedLocation &&
            app.time === slot.time
        );
        
        return appointmentsInSlot.length < slot.maxAppointments;
    }

    selectDate(dayElement) {
        // Remover seleção anterior
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        
        // Adicionar nova seleção
        dayElement.classList.add('selected');
        this.selectedDate = new Date(dayElement.dataset.date);
        
        // Atualizar horários se local já estiver selecionado
        if (this.selectedLocation) {
            this.renderTimeSlots();
        }
        
        this.updateScheduleButton();
    }

    selectLocation(cardElement) {
        // Remover seleção anterior
        document.querySelectorAll('.location-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Adicionar nova seleção
        cardElement.classList.add('selected');
        this.selectedLocation = parseInt(cardElement.dataset.locationId);
        
        // Atualizar horários
        this.renderTimeSlots();
        this.updateScheduleButton();
    }

    selectTime(slotElement) {
        // Remover seleção anterior
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // Adicionar nova seleção
        slotElement.classList.add('selected');
        this.selectedTime = slotElement.dataset.time;
        
        this.updateScheduleButton();
    }

    updateScheduleButton() {
        const button = document.querySelector('.schedule-btn');
        const isComplete = this.selectedDate && this.selectedLocation && this.selectedTime;
        
        button.disabled = !isComplete;
        
        if (isComplete) {
            const location = this.locations.find(l => l.id === this.selectedLocation);
            button.innerHTML = `
                Agendar para ${this.formatDate(this.selectedDate)} às ${this.selectedTime}
                <br>
                Local: ${location.name}
            `;
        } else {
            button.textContent = 'Agendar Doação';
        }
    }

    setupEventListeners() {
        // Navegação do calendário
        document.querySelector('.prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });
        
        document.querySelector('.next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });
        
        // Botão de agendamento
        document.querySelector('.schedule-btn').addEventListener('click', () => {
            this.scheduleAppointment();
        });
    }

    async scheduleAppointment() {
        if (!this.selectedDate || !this.selectedLocation || !this.selectedTime) return;
        
        try {
            const appointment = {
                id: Date.now(),
                date: this.selectedDate.toISOString().split('T')[0],
                time: this.selectedTime,
                locationId: this.selectedLocation,
                userId: window.auth.currentUser.email
            };
            
            // Simulação de chamada à API
            await this.simulateApiCall(appointment);
            
            // Adicionar ao array local
            this.appointments.push(appointment);
            
            // Salvar no localStorage
            this.saveAppointments();
            
            // Atualizar UI
            this.renderAppointments();
            this.renderTimeSlots();
            
            // Limpar seleção
            this.clearSelection();
            
            window.notifications.success('Agendamento realizado com sucesso!');
        } catch (error) {
            window.notifications.error('Erro ao realizar agendamento');
        }
    }

    clearSelection() {
        this.selectedDate = null;
        this.selectedLocation = null;
        this.selectedTime = null;
        
        document.querySelectorAll('.calendar-day, .location-card, .time-slot').forEach(el => {
            el.classList.remove('selected');
        });
        
        this.updateScheduleButton();
    }

    loadAppointments() {
        try {
            const saved = localStorage.getItem('appointments');
            if (saved) {
                this.appointments = JSON.parse(saved);
                this.renderAppointments();
            }
        } catch (e) {
            console.error('Erro ao carregar agendamentos:', e);
        }
    }

    saveAppointments() {
        try {
            localStorage.setItem('appointments', JSON.stringify(this.appointments));
        } catch (e) {
            console.error('Erro ao salvar agendamentos:', e);
        }
    }

    renderAppointments() {
        const container = document.querySelector('.appointments-list');
        const userAppointments = this.appointments
            .filter(app => app.userId === window.auth.currentUser.email)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (userAppointments.length === 0) {
            container.innerHTML = `
                <div class="no-appointments">
                    <i class="fas fa-calendar-times"></i>
                    <p>Você não possui agendamentos</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = userAppointments.map(appointment => {
            const location = this.locations.find(l => l.id === appointment.locationId);
            return `
                <div class="appointment-card">
                    <div class="appointment-info">
                        <div class="appointment-date">
                            <i class="fas fa-calendar"></i>
                            ${this.formatDate(new Date(appointment.date))}
                        </div>
                        <div class="appointment-time">
                            <i class="fas fa-clock"></i>
                            ${appointment.time}
                        </div>
                        <div class="appointment-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${location.name}
                        </div>
                    </div>
                    <button class="cancel-appointment" data-appointment-id="${appointment.id}">
                        <i class="fas fa-times"></i>
                        Cancelar
                    </button>
                </div>
            `;
        }).join('');
        
        // Adicionar eventos de cancelamento
        container.querySelectorAll('.cancel-appointment').forEach(button => {
            button.addEventListener('click', () => {
                this.cancelAppointment(parseInt(button.dataset.appointmentId));
            });
        });
    }

    async cancelAppointment(appointmentId) {
        try {
            // Simulação de chamada à API
            await this.simulateApiCall({ appointmentId });
            
            // Remover do array local
            this.appointments = this.appointments.filter(app => app.id !== appointmentId);
            
            // Salvar no localStorage
            this.saveAppointments();
            
            // Atualizar UI
            this.renderAppointments();
            this.renderTimeSlots();
            
            window.notifications.success('Agendamento cancelado com sucesso!');
        } catch (error) {
            window.notifications.error('Erro ao cancelar agendamento');
        }
    }

    formatDate(date) {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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
    .appointment-section {
        padding: 40px 20px;
        background: var(--cor-fundo);
    }

    .appointment-container {
        max-width: 1000px;
        margin: 0 auto;
    }

    .appointment-container h2 {
        text-align: center;
        margin-bottom: 40px;
        color: var(--cor-texto);
    }

    .appointment-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        margin-bottom: 40px;
    }

    /* Calendário */
    .calendar-container {
        background: var(--cor-fundo);
        padding: 20px;
        border-radius: 12px;
        box-shadow: var(--sombra-padrao);
    }

    .calendar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
    }

    .calendar-header button {
        background: none;
        border: none;
        color: var(--cor-texto);
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: all 0.2s;
    }

    .calendar-header button:hover {
        background: var(--cor-fundo-secundaria);
    }

    .current-month {
        color: var(--cor-texto);
        font-weight: bold;
    }

    .calendar-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 5px;
        margin-bottom: 10px;
    }

    .calendar-weekday {
        text-align: center;
        color: var(--cor-texto);
        font-weight: bold;
        font-size: 14px;
    }

    .calendar-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 5px;
    }

    .calendar-day {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: pointer;
        color: var(--cor-texto);
        transition: all 0.2s;
    }

    .calendar-day:not(.empty):not(.past):hover {
        background: var(--cor-fundo-secundaria);
    }

    .calendar-day.empty {
        cursor: default;
    }

    .calendar-day.past {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .calendar-day.today {
        border: 2px solid var(--cor-primaria);
    }

    .calendar-day.selected {
        background: var(--cor-primaria);
        color: white;
    }

    /* Detalhes do Agendamento */
    .appointment-details {
        background: var(--cor-fundo);
        padding: 20px;
        border-radius: 12px;
        box-shadow: var(--sombra-padrao);
    }

    .appointment-details h3 {
        margin-bottom: 20px;
        color: var(--cor-texto);
    }

    .location-cards {
        display: grid;
        gap: 15px;
        margin-bottom: 30px;
    }

    .location-card {
        padding: 15px;
        background: var(--cor-fundo);
        border: 2px solid var(--cor-borda);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .location-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--sombra-padrao);
    }

    .location-card.selected {
        border-color: var(--cor-primaria);
        background: var(--cor-fundo-secundaria);
    }

    .location-card h4 {
        margin: 0 0 10px 0;
        color: var(--cor-texto);
    }

    .location-card p {
        margin: 0;
        font-size: 14px;
        color: var(--cor-texto);
        opacity: 0.7;
    }

    .time-slots {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 10px;
        margin-bottom: 30px;
    }

    .time-slot {
        padding: 10px;
        background: var(--cor-fundo);
        border: 1px solid var(--cor-borda);
        border-radius: 6px;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s;
    }

    .time-slot:not(.unavailable):hover {
        transform: translateY(-2px);
        box-shadow: var(--sombra-padrao);
    }

    .time-slot.selected {
        border-color: var(--cor-primaria);
        background: var(--cor-fundo-secundaria);
    }

    .time-slot.unavailable {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .time {
        display: block;
        font-weight: bold;
        color: var(--cor-texto);
    }

    .availability {
        display: block;
        font-size: 12px;
        color: var(--cor-texto);
        opacity: 0.7;
    }

    .schedule-btn {
        width: 100%;
        padding: 15px;
        background: var(--cor-primaria);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .schedule-btn:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .schedule-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* Meus Agendamentos */
    .my-appointments {
        background: var(--cor-fundo);
        padding: 20px;
        border-radius: 12px;
        box-shadow: var(--sombra-padrao);
    }

    .my-appointments h3 {
        margin-bottom: 20px;
        color: var(--cor-texto);
    }

    .no-appointments {
        text-align: center;
        padding: 40px;
        color: var(--cor-texto);
    }

    .no-appointments i {
        font-size: 48px;
        color: var(--cor-primaria);
        margin-bottom: 20px;
    }

    .appointment-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px;
        background: var(--cor-fundo);
        border: 1px solid var(--cor-borda);
        border-radius: 8px;
        margin-bottom: 15px;
    }

    .appointment-info {
        display: grid;
        gap: 10px;
    }

    .appointment-info > div {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--cor-texto);
    }

    .appointment-info i {
        color: var(--cor-primaria);
    }

    .cancel-appointment {
        padding: 8px 16px;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
    }

    .cancel-appointment:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
        .appointment-grid {
            grid-template-columns: 1fr;
        }
    }
`;

document.head.appendChild(style);

// Inicializar sistema de agendamento
document.addEventListener('DOMContentLoaded', () => {
    new AppointmentSystem();
}); 