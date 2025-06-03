// Sistema de Notificações
class NotificationSystem {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        const iconMap = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.className = `notification notification-${type} fade-in`;
        notification.innerHTML = `
            <span class="notification-icon">${iconMap[type]}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Fechar notificação">×</button>
        `;

        notification.style.cssText = `
            background: var(--cor-fundo);
            color: var(--cor-texto);
            padding: 12px 24px;
            margin-bottom: 10px;
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            animation: slideIn 0.3s ease;
        `;

        // Cores específicas por tipo
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        
        notification.style.borderLeft = `4px solid ${colors[type]}`;

        // Botão de fechar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.hide(notification));

        // Auto-hide após duração especificada
        if (duration > 0) {
            setTimeout(() => this.hide(notification), duration);
        }

        this.container.appendChild(notification);
    }

    hide(notification) {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 300);
    }

    success(message, duration) {
        this.show(message, 'success', duration);
    }

    error(message, duration) {
        this.show(message, 'error', duration);
    }

    warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    info(message, duration) {
        this.show(message, 'info', duration);
    }
}

// Criar instância global
const notifications = new NotificationSystem();

// Exemplo de uso:
// notifications.success('Doação agendada com sucesso!');
// notifications.error('Erro ao processar solicitação.');
// notifications.warning('Seu tipo sanguíneo está em baixa.');
// notifications.info('Nova campanha disponível.');

// Exportar para uso em outros módulos
export default notifications; 