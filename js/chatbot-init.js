// Importar o módulo do chatbot
import { initChatbot } from './chatbot.js';
// Importar DotLottie do CDN
// import { DotLottie } from 'https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web/+esm'; // Removido

// Função para inicializar o chatbot
function initializeChatbot() {
    // Elementos do chatbot
    const chatIcon = document.getElementById('chat-icon');
    const chatContainer = document.getElementById('chat-container');
    const chatToggle = document.getElementById('chat-toggle');
    const chatbotCanvas = document.getElementById('chatbot-canvas'); // Ainda precisamos verificar o canvas para compatibilidade com o HTML
    
    if (!chatIcon || !chatContainer || !chatToggle) { // Removida a verificação do canvas aqui, pois ele será removido do HTML
        console.error('Elementos essenciais do chatbot não encontrados');
        return;
    }
    
    // Inicializar o chatbot (funcionalidade principal)
    initChatbot();
    
    // Removido: Inicializar a animação Lottie no canvas
    /*
    const dotLottie = new DotLottie({
        autoplay: true,
        loop: true,
        canvas: chatbotCanvas,
        src: 'https://lottie.host/a63e4b6e-1c6a-4696-8840-72aec796230f/Wr4xAk66wC.lottie',
    });
    */
    
    // Mostrar o chat quando clicar no ícone
    chatIcon.addEventListener('click', () => {
        chatContainer.classList.add('active');
        chatIcon.style.display = 'none';
    });
    
    // Fechar o chat quando clicar no botão de fechar
    chatToggle.addEventListener('click', () => {
        chatContainer.classList.remove('active');
        chatIcon.style.display = 'flex';
    });
}

// Inicializar quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
    initializeChatbot();
} 