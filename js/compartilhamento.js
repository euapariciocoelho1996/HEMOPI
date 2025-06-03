// Sistema de Compartilhamento de Campanhas
class ShareManager {
    constructor() {
        this.init();
    }

    init() {
        // Adicionar botões de compartilhamento aos cards
        this.addShareButtons();
        
        // Inicializar Web Share API se disponível
        if (navigator.share) {
            this.initializeWebShare();
        } else {
            this.initializeFallbackShare();
        }
    }

    addShareButtons() {
        const cards = document.querySelectorAll('.campanha-card');
        
        cards.forEach(card => {
            const shareContainer = document.createElement('div');
            shareContainer.className = 'share-container';
            
            const shareButton = document.createElement('button');
            shareButton.className = 'share-button';
            shareButton.innerHTML = `
                <i class="fas fa-share-alt"></i>
                <span>Compartilhar</span>
            `;
            
            shareContainer.appendChild(shareButton);
            card.appendChild(shareContainer);
            
            // Adicionar evento de clique
            shareButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleShare(card);
            });
        });
    }

    async handleShare(card) {
        const title = card.querySelector('h3').textContent;
        const description = card.querySelector('.campanha-descricao').textContent;
        const local = card.querySelector('.campanha-local').textContent;
        const urgencia = card.querySelector('.urgencia').textContent;
        
        const shareData = {
            title: 'Campanha de Doação de Sangue',
            text: `${title}\n${urgencia}\n${local}\n\n${description}`,
            url: window.location.href
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                notifications.success('Campanha compartilhada com sucesso!');
            } else {
                this.showShareDialog(card, shareData);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                notifications.error('Erro ao compartilhar campanha');
                console.error('Erro no compartilhamento:', err);
            }
        }
    }

    initializeWebShare() {
        // Web Share API já está inicializada no handleShare
    }

    initializeFallbackShare() {
        // Adicionar estilos para o diálogo de compartilhamento
        const style = document.createElement('style');
        style.textContent = `
            .share-dialog {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--cor-fundo);
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                max-width: 90%;
                width: 400px;
            }
            
            .share-dialog h3 {
                margin: 0 0 15px 0;
                color: var(--cor-texto);
            }
            
            .share-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                gap: 10px;
                margin: 20px 0;
            }
            
            .share-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px;
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .share-option:hover {
                background-color: var(--cor-fundo-secundaria);
            }
            
            .share-option i {
                font-size: 24px;
                margin-bottom: 5px;
            }
            
            .share-option span {
                font-size: 12px;
                text-align: center;
            }
            
            .share-dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 999;
            }
            
            .share-button {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: var(--cor-primaria);
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .share-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }
            
            .share-container {
                margin-top: 15px;
                display: flex;
                justify-content: center;
            }
        `;
        
        document.head.appendChild(style);
    }

    showShareDialog(card, shareData) {
        // Criar overlay
        const overlay = document.createElement('div');
        overlay.className = 'share-dialog-overlay';
        
        // Criar diálogo
        const dialog = document.createElement('div');
        dialog.className = 'share-dialog';
        
        dialog.innerHTML = `
            <h3>Compartilhar Campanha</h3>
            <div class="share-options">
                <div class="share-option" data-platform="whatsapp">
                    <i class="fab fa-whatsapp" style="color: #25D366;"></i>
                    <span>WhatsApp</span>
                </div>
                <div class="share-option" data-platform="facebook">
                    <i class="fab fa-facebook" style="color: #1877F2;"></i>
                    <span>Facebook</span>
                </div>
                <div class="share-option" data-platform="twitter">
                    <i class="fab fa-twitter" style="color: #1DA1F2;"></i>
                    <span>Twitter</span>
                </div>
                <div class="share-option" data-platform="telegram">
                    <i class="fab fa-telegram" style="color: #0088cc;"></i>
                    <span>Telegram</span>
                </div>
            </div>
        `;
        
        // Adicionar eventos
        dialog.querySelectorAll('.share-option').forEach(option => {
            option.addEventListener('click', () => {
                const platform = option.dataset.platform;
                this.shareToSocialMedia(platform, shareData);
                document.body.removeChild(overlay);
                document.body.removeChild(dialog);
            });
        });
        
        // Fechar ao clicar no overlay
        overlay.addEventListener('click', () => {
            document.body.removeChild(overlay);
            document.body.removeChild(dialog);
        });
        
        document.body.appendChild(overlay);
        document.body.appendChild(dialog);
    }

    shareToSocialMedia(platform, shareData) {
        const text = encodeURIComponent(shareData.text);
        const url = encodeURIComponent(shareData.url);
        
        const shareUrls = {
            whatsapp: `https://wa.me/?text=${text}%20${url}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            telegram: `https://t.me/share/url?url=${url}&text=${text}`
        };
        
        window.open(shareUrls[platform], '_blank');
    }
}

// Inicializar sistema de compartilhamento
document.addEventListener('DOMContentLoaded', () => {
    new ShareManager();
}); 