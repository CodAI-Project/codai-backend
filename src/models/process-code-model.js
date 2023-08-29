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
            const conversationHistory = await this.getConversationHistory(chatId, userId);

            if (conversationHistory.userId !== userId) {
                return new Response(status.FORBIDDEN, "Forbidden", "O usuario não tem acesso a esse chat", []);
            }

            if (!conversationHistory.history.length) {
                content = await this.firstPrompt(ask, template);
            } else {
                content = await this.generatorUsingHistoryPrompt(ask, template)
            }


            let conversation = this.buildConversation(content, conversationHistory.history, ask);


            const responsePrompt = await OpenAIService.generateResponseFromAPI(conversation);
            const assistantResponse = responsePrompt.choices[0].message.content;



            conversation = this.buildConversation(content, conversationHistory.history, ask, assistantResponse);
            const chat = await this.updateConversationHistory(userId, conversationHistory.chatId, conversation,);

            const response = {
                chat: chat,
                lastAwnser: assistantResponse
            }

            return new Response(status.OK, null, 'Sucess', response);
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
                chatHistory = new ChatHistory(
                    doc.data().history.slice(-6),
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
            const chatUpdated = await chatDocRef.get()


            const userDocRef = db.collection('user-chat').doc(userId);
            await userDocRef.set(
                { chats: { [chatId]: chatDocRef } },
                { merge: true }
            );

            const responseUpdate = {
                id: chatId,
                userId: userId,
                title: chatUpdated.data().title,
                history: chatUpdated.data().history.slice(-12)
            }

            return responseUpdate
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
        **Instrução:** 

        Você é um gerador de template de react e deve fazer um template de acordo com o qual o usuario solicitou, faça tudo com boas práticas e tudo que vc importar no componente deve existir, siga as boas práticas e realize tudo o qual o usuario pedir
        
        ** Requisitos **
        
        -Não se esqueça de importar tudo que usar, pois se nao realizar isso ele da erro no editor, pois esse objeto deve ser capaz de funcionar no stackbliz,  e deve retornar exatamente o objeto solicitado pois se não dará erro e o usuario não vai gostar da sua utlização
        
        -Tudo deve ser resposivo pois se não o usuario não vai gostar de utilizar a plataforma
        
        -No atributo "title" e "description" vc deve realizar o preechimento tambem de acordo com oq o usuario solicitou, atenção aos detalhes e seja bem caprichoso
        
        -Não utilize template strings acentos pois eles quebram o codigo, e por favor, retorne apenas o objeto, nunca retorne frases explicando o codigo, apenas o objeto com o que foi solicitado
        
        NÂO ESQUEÇA DOS IMPORTES NA ROTAS TBM
        
        O objeto deve ser a unica coisa a ser retornada
        
        **  O que retornar?**
        
        Apenas o objeto usado de exemplo logo abaixo
        {
          "files": {
            "src/index.js": "",
            "src/App.js": "",
            "public/index.html": "",
            "package.json": ""
          },
          "title": "",
          "description": "",
          "template": "create-react-app",
          "dependencies": {
            "react": "^17.0.2",
            "react-dom": "^17.0.2",
            "react-router-dom": "^5.3.0"
          }
        }
        
        **SOLICITAÇÃO DO USUARIO ABAIXO**
       ${ask}
                
                `;
    }

}

export default ProcessAIModel;
