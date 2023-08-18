import Response from './../types/Response.js';
import db from './../config/firestore.js';
import axios from 'axios';
import functions from "firebase-functions"
const OPENAI_KEY = functions.config().node.npl.openai_key;
const collection = 'chat-history'
class ProcessAIModel {

    static async generateAnswerOpenAI(req) {
        const { userId, chatId, answer, template } = req.body;
        let content = null
        try {
            const conversationHistory = await this.getConversationHistory(chatId);


            if (!conversationHistory.length) {
                content = await this.firstPrompt(answer, template);
            } else {
                content = await this.generatorUsingHistoryPrompt(answer, template)
            }


            let conversation = this.buildConversation(content, conversationHistory, answer);

            const response = await this.generateResponseFromAPI(conversation);

            const assistantResponse = response.choices[0].message.content;

            conversation = this.buildConversation(content, conversationHistory, answer, assistantResponse);

            await this.updateConversationHistory(userId, chatId, conversation,);

            return assistantResponse;
        } catch (e) {
            throw new Response(400, e, '', e);
        }
    }

    static buildConversation(content, conversationHistory, answer, responseOpenAI = null) {
        const conversation = [...conversationHistory];
        conversation.push({ role: 'system', content: content });
        conversation.push({ role: 'user', content: answer });

        if (responseOpenAI) {
            conversation.push({ role: 'assistant', content: responseOpenAI });
        }

        return conversation;
    }
    static async getConversationHistory(chatId) {
        try {
            const docRef = db.collection(collection).doc(chatId);
            const doc = await docRef.get();
            if (doc.exists) {
                return doc.data().history || [];
            } else {
                // Create a new document if it doesn't exist
                await docRef.set({ history: [] });
                return [];
            }
        } catch (error) {
            console.error('Erro ao pegar a conversa', error);
            return [];
        }
    }

    static async updateConversationHistory(userId, chatId, conversation) {
        try {
            const chatDocRef = db.collection('chat-history').doc(chatId);
            await chatDocRef.set({ history: conversation }, { merge: true });

            const userDocRef = db.collection('user-chat').doc(userId);
            await userDocRef.set(
                { chats: { [chatId]: chatDocRef } },
                { merge: true }
            );
        } catch (error) {
            console.error('Error ao realizar update:', error);
        }
    }

    static async generatorUsingHistoryPrompt(answer) {

        return `
                Levando em consideração as ultimas conversas do usuario, e a solicitação do sistema

                faça as modificações do objeto files 

                não esqueça de nenhum import
                
                ajuste o objeto e mande novamente, mude só o atributo de files 

                modificações solicitadas pelo usuario: ${answer}

                `

    }


    static async firstPrompt(answer, template) {

        return `
                Crie um objeto com as informações necessárias para configurar um projeto de aplicativo. O objeto deve ter a seguinte estrutura:

                A estrutura deve retornar no padrão ${template}

            {
                "files": {
                    "index.html": "<!DOCTYPE html>\\n<html>\\n<head>\\n<title>My App</title>\\n</head>\\n<body>\\n<h1>Hello World</h1>\\n<script src=\\"index.js\\"></script>\\n</body>\\n</html>",
                    "index.js": "alert('Hello World');"
                    // Inclua outros arquivos necessários aqui
                    // Cada objeto aqui dentro recebe primeiro o nome do arquivo e o valor é o conteúdo do arquivo
                },
                "title": "Título do App",
                "description": "Descrição do que este aplicativo faz e como executá-lo. Coloque uma marca no topo escrito 'CodAI Generator'.",
                "template": ${template}"
            }

                Certifique-se de incluir todos os arquivos necessários para fazer o projeto funcionar em um editor sem erros. Preencha os campos 'title' e 'description' com informações adequadas.

                **Exemplo de Uso:**
                Se eu mandar a seguinte pergunta: ${answer}, gere o objeto conforme as instruções acima.

                
                `;
    }

    static async generateResponseFromAPI(conversation) {
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    messages: conversation,
                    model: 'gpt-3.5-turbo',
                    temperature: 0
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_KEY}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error generating response from OpenAI:', error);
            throw new Error(error);
        }



    }

}

export default ProcessAIModel;
