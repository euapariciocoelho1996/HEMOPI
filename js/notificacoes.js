// Sistema de Notificações
class NotificationSystem {
    constructor() {
        this.container = this.createContainer();
        this.init();
    }

    init() {
        document.body.appendChild(this.container);
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'notification-container';
        
        // Adicionar estilos
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            }

            .notification {
                background: var(--cor-fundo);
                color: var(--cor-texto);
                padding: 15px 20px;
                margin-bottom: 10px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                transform: translateX(120%);
                transition: transform 0.3s ease;
                max-width: 300px;
            }

            .notification.show {
                transform: translateX(0);
            }

            .notification i {
                font-size: 20px;
            }

            .notification.success {
                border-left: 4px solid #28a745;
            }

            .notification.success i {
                color: #28a745;
            }

            .notification.error {
                border-left: 4px solid #dc3545;
            }

            .notification.error i {
                color: #dc3545;
            }

            .notification.info {
                border-left: 4px solid #17a2b8;
            }

            .notification.info i {
                color: #17a2b8;
            }

            .notification.warning {
                border-left: 4px solid #ffc107;
            }

            .notification.warning i {
                color: #ffc107;
            }

            .notification-content {
                flex: 1;
            }

            .notification-close {
                background: none;
                border: none;
                color: var(--cor-texto);
                cursor: pointer;
                padding: 0;
                font-size: 18px;
                opacity: 0.5;
                transition: opacity 0.2s;
            }

            .notification-close:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
        return container;
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-times-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        notification.innerHTML = `
            <i class="${icons[type]}"></i>
            <div class="notification-content">${message}</div>
            <button class="notification-close">&times;</button>
        `;
        
        this.container.appendChild(notification);
        
        // Forçar reflow para garantir a animação
        notification.offsetHeight;
        notification.classList.add('show');
        
        // Adicionar evento de fechar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.close(notification));
        
        // Auto-fechar após duração
        if (duration > 0) {
            setTimeout(() => this.close(notification), duration);
        }
    }

    close(notification) {
        notification.classList.remove('show');
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

    info(message, duration) {
        this.show(message, 'info', duration);
    }

    warning(message, duration) {
        this.show(message, 'warning', duration);
    }
}

// Criar instância global
window.notifications = new NotificationSystem(); 