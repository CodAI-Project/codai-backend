import Response from '../types/Response.js';
import db from '../config/firestore.js';
import OpenAIService from '../services/openai-service.js';
import ChatHistory from '../database/strategies/firestore/schemas/chat-history-schema.js';
import status from 'http-status-codes'

const collection = 'chat-history'


class ProcessAIModel {

    static async generateAnswerOpenAI(req) {
        const { userId, chatId, ask, template } = req.body;
        let content = null
        try {
            console.time('conversationHistory')
            const conversationHistory = await this.getConversationHistory(chatId, userId);
            console.timeEnd('conversationHistory')

            if (conversationHistory.userId !== userId) {
                return new Response(status.FORBIDDEN, "Forbidden", "O usuario não tem acesso a esse chat", []);
            }

            if (!conversationHistory.history.length) {
                content = await this.firstPrompt(ask, template);
            } else {
                content = await this.generatorUsingHistoryPrompt(ask, template)
            }


            let conversation = this.buildConversation(content, conversationHistory.history, ask);


            console.time('responseOpenAI')
            const responsePrompt = await OpenAIService.generateResponseFromAPI(conversation);
            console.timeEnd('responseOpenAI');
            const assistantResponse = responsePrompt.choices[0].message.content;

            conversation = this.buildConversation(content, conversationHistory.history, ask, assistantResponse);
            console.time('updateHistory')
            await this.updateConversationHistory(userId, conversationHistory.chatId, conversation,);
            console.timeEnd('updateHistory')
            return new Response(status.OK, null, 'Sucess', assistantResponse);
        } catch (e) {
            throw new Response(status.BAD_REQUEST, "Bad Request", e, null);
        }
    }

    static buildConversation(content, conversationHistory, ask, responseOpenAI = null) {
        const conversation = [...conversationHistory];
        conversation.push({ role: 'system', content: content });
        conversation.push({ role: 'user', content: ask });

        if (responseOpenAI) {
            conversation.push({ role: 'assistant', content: responseOpenAI });
        }

        return conversation;
    }
    static async getConversationHistory(chatId, userId) {
        try {

            const docRef = chatId ? db.collection(collection).doc(chatId) : db.collection(collection).doc();
            const doc = await docRef.get();

            let newChatId;

            if (!chatId) {
                newChatId = docRef.id;
            } else {
                newChatId = chatId
            }

            let chatHistory;

            if (doc.exists) {
                // Retornando sempre os últimos 12

                chatHistory = new ChatHistory(
                    doc.data().history.slice(-12),
                    doc.data.title,
                    Date.now(),
                    doc.data().userId)

                chatHistory = { chatId: newChatId, ...chatHistory }

                return chatHistory
            } else {
                chatHistory = new ChatHistory([], '', Date.now(), userId);
                await docRef.set({
                    history: chatHistory.history,
                    title: chatHistory.title,
                    userId: chatHistory.userId,
                    lastModified: chatHistory.lastModified
                });

                chatHistory = { chatId: newChatId, ...chatHistory }
                return chatHistory;
            }
        } catch (error) {
            console.error('Erro ao fazer algo no Firestore', error);
            return [];
        }
    }



    static async updateConversationHistory(userId, chatId, conversation) {
        const chatFireStoreUpdate = ChatHistory.toFirestoreObjectUpdate(conversation, Date.now());

        try {
            const chatDocRef = db.collection('chat-history').doc(chatId);
            await chatDocRef.update(chatFireStoreUpdate);

            const userDocRef = db.collection('user-chat').doc(userId);
            await userDocRef.set(
                { chats: { [chatId]: chatDocRef } },
                { merge: true }
            );
        } catch (error) {
            console.error('Error ao realizar update:', error);
        }
    }

    static async generatorUsingHistoryPrompt(ask) {

        return `
                Levando em consideração as ultimas conversas do usuario, e a solicitação do sistema

                faça as modificações do objeto files 

                não esqueça de nenhum import
                
                ajuste o objeto e mande novamente, mude só o atributo de files 

                modificações solicitadas pelo usuario: ${ask}

                `

    }


    static async firstPrompt(ask, template) {

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
                Se eu mandar a seguinte pergunta: ${ask}, gere o objeto conforme as instruções acima.

                
                `;
    }

}

export default ProcessAIModel;
