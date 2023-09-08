# CodAI (Back-end)

## Demonstração
Link para o prototipo deployado [aqui](https://codai-hub-development.web.app/).

## Visão Geral
O CodAI Backend é a espinha dorsal da plataforma CodAI, responsável por gerenciar, armazenar e fornecer acesso aos dados essenciais para a funcionalidade da aplicação. Este componente é vital para o funcionamento do sistema, possibilitando a criação, leitura, atualização e exclusão de informações relacionadas ao desenvolvimento de código.


## Principais Recursos do CodAI Backend

O CodAI Backend oferece uma série de recursos essenciais que impulsionam a funcionalidade da plataforma:

1. **API RESTful:** Fornece uma API RESTful que segue as melhores práticas de design de API para interações eficazes entre o frontend e o backend.

2. **Banco de Dados Firebase:** Utiliza o Firestore como banco de dados para armazenar e recuperar dados de forma eficiente e escalável.

3. **CRUD de Chats (Projetos):** Oferece operações CRUD (Create, Read, Update e Delete) para projetos de desenvolvimento, permitindo que os usuários gerenciem seus projetos.

4. **Segurança e Controle de Acesso:** Garante a segurança dos dados dos usuários e implementa um controle de acesso eficiente para proteger informações sensíveis.


## Como Executar Localmente
Para executar o CodAI Back-end localmente, siga estas etapas:

1. Clone o repositório:
   ```
   git clone https://github.com/CodAI-Project/codai-backend.git
   cd codai-backend
    ```
2. Instale as dependencias e de um start na aplicação
    ```
    npm install
    npm run dev
    ```
## Principais Tecnologias Utilizadas
- Node 18
- Ecosistema Firebase
- Integração com ChatGPT API
- Express
- Axios



## Swagger para utilização.
 Necessário token de autenticação. obtido diretamente no Front-end no console do navegador (paliativo)
 Link do Swagger [aqui](https://app.swaggerhub.com/apis-docs/LUANSSRR/CodAI/1.0.0-oas3).
 

## Arquitetura
![Desenho da arquitetura](https://firebasestorage.googleapis.com/v0/b/codai-development.appspot.com/o/codai-arquitetura-CodAI.drawio.png?alt=media&token=8098019e-2bd0-4f2e-b604-ba9338a22e91)

