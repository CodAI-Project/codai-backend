import Response from '../types/Response.js';
import db from '../config/firestore.js';
import OpenAIService from '../services/openai-service.js';
import ChatHistory from '../database/strategies/firestore/schemas/chat-history-schema.js';
import status from 'http-status-codes'
import { firstPrompt, generatorUsingHistoryPrompt } from '../prompts/prompt-chatgpt.js';

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
                content = firstPrompt(ask, template);
            } else {
                content = generatorUsingHistoryPrompt(ask, template)
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
}

export default ProcessAIModel;
