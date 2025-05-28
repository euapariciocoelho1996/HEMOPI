# HEMOPI - Sangue Solidário

Sistema de gerenciamento de doação de sangue para o Centro de Hematologia e Hemoterapia do Piauí (HEMOPI).

## 📋 Sobre o Projeto

O **Sangue Solidário** é uma plataforma web desenvolvida para facilitar o gerenciamento de campanhas de doação de sangue, conectando doadores voluntários com locais de doação e organizando campanhas de forma eficiente.

### Funcionalidades Principais

- **Cadastro de Usuários**: Sistema de autenticação com Firebase
- **Gestão de Campanhas**: Criação, edição e visualização de campanhas de doação
- **Cadastro de Locais**: Registro de locais de doação com CNPJ
- **Intenções de Doação**: Registro de interesse dos usuários em participar das campanhas
- **Painel Administrativo**: Gerenciamento completo para administradores de locais

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Authentication, Firestore)
- **Bibliotecas**: SweetAlert2 para notificações
- **Arquitetura**: Modular com ES6 Modules

## 📁 Estrutura do Projeto

```
HEMOPI/
├── css/
│   ├── components.css      # Componentes reutilizáveis
│   ├── estilo.css         # Estilos principais
│   ├── header.css         # Estilos do cabeçalho
│   └── ...
├── js/
│   ├── firebase-config.js     # Configuração centralizada do Firebase
│   ├── auth-manager.js        # Gerenciamento de autenticação
│   ├── firebase-services.js   # Serviços do Firestore
│   ├── utils.js              # Funções utilitárias
│   ├── campanhas.js          # Gestão de campanhas para usuários
│   ├── perfil.js             # Gerenciamento de perfil
│   └── ...
├── img/                   # Imagens e recursos
├── index.html            # Página principal
├── login.html           # Página de login/cadastro
├── perfil.html          # Página de perfil
└── README.md
```

## 🔧 Instalação e Configuração

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/hemopi.git
   cd hemopi
   ```

2. **Configure o Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative Authentication (Email/Password e Google)
   - Ative Firestore Database
   - Atualize as configurações em `js/firebase-config.js`

3. **Execute o projeto**
   - Use um servidor local (Live Server, Python HTTP Server, etc.)
   - Acesse através de `http://localhost:porta`

## 📚 Arquitetura e Clean Code

### Módulos Centralizados

O projeto foi refatorado seguindo princípios de Clean Code para eliminar duplicação e melhorar a manutenibilidade:

#### 🔥 Firebase Configuration (`js/firebase-config.js`)
- Configuração centralizada do Firebase
- Exportação da instância da aplicação
- Evita duplicação de configurações

#### 🔐 Authentication Manager (`js/auth-manager.js`)
- Gerenciamento centralizado do estado de autenticação
- Atualização automática da UI do header
- Monitoramento de mudanças de estado

#### 🗄️ Firebase Services (`js/firebase-services.js`)
- Operações CRUD centralizadas para Firestore
- Funções reutilizáveis para documentos e consultas
- Tratamento consistente de erros

#### 🛠️ Utilities (`js/utils.js`)
- Funções utilitárias reutilizáveis
- Validações (email, CNPJ, senha)
- Notificações padronizadas
- Formatação de dados

#### 🎨 Components CSS (`css/components.css`)
- Estilos de componentes reutilizáveis
- Classes utilitárias
- Design system consistente

### Benefícios da Refatoração

✅ **Eliminação de Duplicação**: Código Firebase centralizado
✅ **Manutenibilidade**: Mudanças em um local refletem em todo o sistema
✅ **Reutilização**: Funções e componentes modulares
✅ **Consistência**: Padrões uniformes de código e UI
✅ **Testabilidade**: Módulos independentes e bem definidos

## 📝 Histórico de Mudanças

### 05 de Maio de 2025 - Refatoração Clean Code
- **Estruturação modular**: Criação de módulos reutilizáveis para Firebase, autenticação e utilitários
- **Sistema de utilitários**: Implementação de funções centralizadas para validações, notificações e formatação
- **Documentação JSDoc**: Adição de documentação completa para todas as funções
- **Eliminação de duplicação**: Remoção de código repetido em configurações Firebase e operações CRUD
- **Padronização de erros**: Implementação de tratamento consistente de erros em todo o sistema
- **Separação de responsabilidades**: Divisão clara de funcionalidades em módulos específicos

### Funcionalidades por Módulo

#### `auth-manager.js`
- Monitoramento de estado de autenticação
- Atualização automática do header
- Gerenciamento de logout

#### `firebase-services.js`
- `getDocument()` - Buscar documento por ID
- `setDocument()` - Criar/atualizar documento
- `addDocument()` - Adicionar novo documento
- `updateDocument()` - Atualizar documento existente
- `deleteDocument()` - Excluir documento
- `queryDocuments()` - Consultas com filtros
- `getAllDocuments()` - Buscar todos os documentos

#### `utils.js`
- `showNotification()` - Exibir notificações
- `showConfirmDialog()` - Diálogos de confirmação
- `validateEmail()` - Validação de email
- `validateCNPJ()` - Validação de CNPJ
- `validatePassword()` - Validação de senha
- `formatDate()` - Formatação de datas
- `calculateDonationEligibility()` - Cálculo de elegibilidade

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Contato

**HEMOPI - Centro de Hematologia e Hemoterapia do Piauí**
- 📍 Rua 1º de Maio, 235 - Centro Norte, Teresina - PI
- 📞 (86) 3216-3700
- 📧 contato@hemopi.pi.gov.br

---

Desenvolvido com ❤️ para salvar vidas através da doação de sangue.

## 👥 Equipe do Projeto

---

### 💻 Elias de Sousa Neto  
**Função:** Debugar  
**Responsabilidades:**  
- Encontrar falhas no projeto  
- Informar o que deve ser melhorado  

---

### 🎨 Francisco Aparício Nascimento Coelho  
**Função:** Frontend e Backend  
**Responsabilidades:**  
- Interface do usuário (UI)  
- Integração com Banco de Dados 
- Design responsivo  

---

### 🧹 Luis Eduardo Silva Brito  
**Função:** Clean Code  
**Responsabilidades:**  
- Deixar o código limpo  
- Tornar o código mais legível  

---

### 🧩 Victor Macedo Carvalho  
**Função:** Suporte no Frontend e Backend  
**Responsabilidades:**  
- Ajudar na interface do usuário (UI)  
- Ajudar na integração com Banco de Dados  

---
