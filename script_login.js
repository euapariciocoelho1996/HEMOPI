const messages = [
    "Estamos quase lá... sua doação pode salvar vidas!",
    "Doe sangue, compartilhe vida!",
    "Você é o tipo certo de herói.",
    "Uma bolsa de sangue pode salvar até 4 vidas.",
    "A sua atitude hoje pode mudar o amanhã de alguém.",
    "Doar sangue é um ato de amor.",
    "Um pequeno gesto. Um grande impacto.",
    "Você tem o poder de salvar vidas. Use-o.",
    "Seja a esperança de alguém hoje.",
    "Doe sangue, doe vida, doe esperança."
];

const messageElement = document.getElementById('message-carousel');
let index = 0;

setInterval(() => {
    // Inicia a transição (fade out)
    messageElement.style.opacity = 0;

    setTimeout(() => {
        // Troca a mensagem enquanto invisível
        index = (index + 1) % messages.length;
        messageElement.textContent = messages[index];

        // Aplica o fade in
        messageElement.style.opacity = 1;
    }, 500); // mesmo tempo definido na transição do CSS
}, 4000);