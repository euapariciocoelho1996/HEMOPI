// Import Firebase modules
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

// Inicializar Firestore usando a instância existente do Firebase
const db = getFirestore(app);

// Base de conhecimento do chatbot
const knowledgeBase = {
    "requisitos": {
        patterns: ["quais são os requisitos", "o que preciso para doar", "requisitos para doação"],
        response: "Para doar sangue você precisa:\n" +
                 "1. Ter entre 16 e 69 anos\n" +
                 "2. Pesar mais de 50kg\n" +
                 "3. Estar em boas condições de saúde\n" +
                 "4. Não ter feito tatuagem nos últimos 12 meses\n" +
                 "5. Não ter feito cirurgia nos últimos 6 meses\n\n" +
                 "Você pode verificar se está apto a doar acessando seu perfil no site!",
        followUp: [
            "Onde posso doar sangue?",
            "Quanto tempo dura a doação?",
            "Preciso de agendamento?"
        ]
    },
    "intervalo": {
        patterns: ["quanto tempo esperar", "intervalo entre doações", "quando posso doar novamente"],
        response: "O intervalo entre doações é:\n" +
                 "- Homens: 60 dias (máximo 4 doações por ano)\n" +
                 "- Mulheres: 90 dias (máximo 3 doações por ano)\n\n" +
                 "Você pode acompanhar seu próximo período de doação no seu perfil!",
        followUp: [
            "Onde posso doar sangue?",
            "Quanto tempo dura a doação?",
            "Quais são os requisitos?"
        ]
    },
    "local": {
        patterns: ["onde doar", "locais de doação", "hemocentro"],
        response: "Você pode doar sangue em vários lugares:\n\n" +
                 "1. Em campanhas de doação\n\n" +
                 "Para ver as campanhas ativas, clique no botão abaixo:",
        followUp: [
            "Ver campanhas ativas",
            "Quais são os requisitos?",
            "Preciso de agendamento?"
        ],
        action: "redirectToCampaigns"
    },
    "duvidas": {
        patterns: ["tenho dúvidas", "preciso de ajuda", "não sei como proceder"],
        response: "Estou aqui para ajudar! Você pode:\n\n" +
                 "1. Verificar as campanhas ativas\n" +
                 "2. Acessar seu perfil para ver seu histórico\n" +
                 "3. Consultar os requisitos para doação\n\n" +
                 "O que você gostaria de saber?",
        followUp: [
            "Ver campanhas ativas",
            "Acessar meu perfil",
            "Ver requisitos para doação"
        ]
    },
    "agendamento": {
        patterns: ["preciso agendar", "como agendar", "agendamento"],
        response: "Para doar sangue no HEMOPI:\n\n" +
                 "1. Você pode agendar pelo nosso site\n" +
                 "2. Ligar para (86) 3216-3000\n" +
                 "3. Comparecer diretamente ao hemocentro\n\n" +
                 "Em campanhas externas, geralmente não é necessário agendamento. " +
                 "Você pode verificar as campanhas ativas no site!",
        followUp: [
            "Ver campanhas ativas",
            "Quais são os requisitos?",
            "Onde posso doar sangue?"
        ]
    },
    "duracao": {
        patterns: ["quanto tempo dura", "duração da doação", "tempo de doação"],
        response: "O processo completo de doação leva aproximadamente 1 hora:\n\n" +
                 "- Cadastro e triagem: 15 minutos\n" +
                 "- Coleta do sangue: 10-15 minutos\n" +
                 "- Lanche e repouso: 20-30 minutos\n\n" +
                 "Você pode acompanhar seu histórico de doações no seu perfil!",
        followUp: [
            "Acessar meu perfil",
            "Ver campanhas ativas",
            "Quais são os requisitos?"
        ]
    },
    "campanhas": {
        patterns: ["ver campanhas", "campanhas ativas", "quais campanhas"],
        response: "Para ver as campanhas ativas, clique no botão abaixo. " +
                 "Lá você encontrará todas as campanhas disponíveis, incluindo:\n\n" +
                 "- Local da campanha\n" +
                 "- Data e horário\n" +
                 "- Tipo sanguíneo necessário\n" +
                 "- Nível de urgência",
        followUp: [
            "Quais são os requisitos?",
            "Preciso de agendamento?",
            "Onde posso doar sangue?"
        ],
        action: "redirectToCampaigns"
    },
    "perfil": {
        patterns: ["acessar perfil", "meu perfil", "histórico de doações"],
        response: "Para acessar seu perfil e ver seu histórico de doações, clique no botão abaixo. " +
                 "No seu perfil você pode:\n\n" +
                 "- Ver seu tipo sanguíneo\n" +
                 "- Acompanhar seu histórico de doações\n" +
                 "- Ver quando poderá doar novamente\n" +
                 "- Atualizar seus dados",
        followUp: [
            "Ver campanhas ativas",
            "Quais são os requisitos?",
            "Onde posso doar sangue?"
        ],
        action: "redirectToProfile"
    }
};

// Perguntas iniciais
const initialQuestions = [
    "Ver campanhas ativas",
    "Acessar meu perfil",
    "Quais são os requisitos para doar?",
    "Onde posso doar sangue?",
    "Quanto tempo dura a doação?",
    "Tenho outras dúvidas"
];

// Função para criar botões de perguntas
function createQuestionButtons(questions) {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'question-buttons';
    
    questions.forEach(question => {
        const button = document.createElement('button');
        button.className = 'question-button';
        button.textContent = question;
        button.onclick = () => {
            processUserMessage(question);
            buttonsContainer.remove();
        };
        buttonsContainer.appendChild(button);
    });
    
    return buttonsContainer;
}

// Função para encontrar a melhor resposta baseada na pergunta
function findBestResponse(userInput) {
    userInput = userInput.toLowerCase();
    
    for (const [key, data] of Object.entries(knowledgeBase)) {
        for (const pattern of data.patterns) {
            if (userInput.includes(pattern)) {
                return {
                    response: data.response,
                    followUp: data.followUp,
                    action: data.action
                };
            }
        }
    }
    
    return {
        response: "Você pode:\n\n" +
                 "1. Ver as campanhas ativas\n",
        followUp: initialQuestions
    };
}

// Função para adicionar mensagem ao chat
function addMessage(message, isUser = false) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Função para processar a mensagem do usuário
async function processUserMessage(message) {
    addMessage(message, true);
    
    // Salvar mensagem no Firebase
    try {
        await addDoc(collection(db, "chat_messages"), {
            message: message,
            timestamp: new Date(),
            isUser: true
        });
    } catch (error) {
        console.error("Erro ao salvar mensagem:", error);
    }
    
    // Processar resposta
    const { response, followUp, action } = findBestResponse(message);
    addMessage(response);
    
    // Executar ação específica se houver
    if (action === "redirectToCampaigns") {
        const campaignButton = document.createElement('button');
        campaignButton.className = 'action-button';
        campaignButton.textContent = 'Ver Campanhas Ativas';
        campaignButton.onclick = () => window.location.href = 'campanhas_para_usuarios.html';
        document.getElementById('chat-messages').appendChild(campaignButton);
    } else if (action === "redirectToProfile") {
        const profileButton = document.createElement('button');
        profileButton.className = 'action-button';
        profileButton.textContent = 'Acessar Meu Perfil';
        profileButton.onclick = () => window.location.href = 'perfil.html';
        document.getElementById('chat-messages').appendChild(profileButton);
    }
    
    // Adicionar botões de perguntas seguintes
    const chatMessages = document.getElementById('chat-messages');
    const buttonsContainer = createQuestionButtons(followUp);
    chatMessages.appendChild(buttonsContainer);
    
    // Salvar resposta no Firebase
    try {
        await addDoc(collection(db, "chat_messages"), {
            message: response,
            timestamp: new Date(),
            isUser: false
        });
    } catch (error) {
        console.error("Erro ao salvar resposta:", error);
    }
}

// Inicializar o chatbot
function initChatbot() {
    // Adicionar mensagem inicial
    addMessage("Olá! Sou o assistente virtual do HEMOPI. Como posso ajudar você hoje?");
    
    // Adicionar botões de perguntas iniciais
    const chatMessages = document.getElementById('chat-messages');
    const buttonsContainer = createQuestionButtons(initialQuestions);
    chatMessages.appendChild(buttonsContainer);
}

// Exportar função de inicialização
export { initChatbot }; 