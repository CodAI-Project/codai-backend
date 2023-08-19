import db from '../config/firestore.js';
import Response from '../types/Response.js';
import status from 'http-status-codes'

class FirestoreModel {
    static userChatCollection = db.collection('user-chat');
    static chatHistoryCollection = db.collection('chat-history');

    static async getChatsForUser(userId) {
        try {
            const userDocRef = FirestoreModel.userChatCollection.doc(userId);
            const userDoc = await userDocRef.get();

            if (!userDoc.exists) {
                return new Response(status.BAD_REQUEST, null, 'Not Found', []);
            }

            const userData = userDoc.data();
            const chats = userData.chats || {};
            const chatIds = Object.keys(chats);

            const chatInfoPromises = chatIds.map(async chatId => {
                const chatDocRef = FirestoreModel.chatHistoryCollection.doc(chatId);
                const chatDoc = await chatDocRef.get();

                if (chatDoc.exists) {
                    const chatData = chatDoc.data();
                    return {
                        id: chatId,
                        title: chatData.title,
                        lastModified: chatData.lastModified || 0
                    };
                }

                return null;
            });

            const chatInfo = await Promise.all(chatInfoPromises);

            const filteredChatInfo = chatInfo.filter(chat => chat !== null);
            filteredChatInfo.sort((a, b) => b.lastModified - a.lastModified);

            return new Response(status.OK, null, 'Success', filteredChatInfo);
        } catch (error) {
            console.error('Error', error);
            return new Response(status.INTERNAL_SERVER_ERROR, null, 'Service Error', error);
        }
    }

    static async getChatsUsingChatId(chatId) {
        try {
            const chatDocRef = FirestoreModel.chatHistoryCollection.doc(chatId);
            const chatDoc = await chatDocRef.get();

            if (!chatDoc.exists) {
                return new Response(status.NOT_FOUND, null, 'Not Found', []);
            }

            const chatData = chatDoc.data();
            const chatInfo = {
                id: chatId,
                ...chatData
            };

            return new Response(status.OK, null, 'Success', chatInfo);
        } catch (error) {
            console.error('Error', error);
            return new Response(status.INTERNAL_SERVER_ERROR, null, 'Service error', error);
        }
    }
    
    static async patchTitleChat(chatId, title) {
        try {
            const chatDocRef = FirestoreModel.chatHistoryCollection.doc(chatId);
            const chatDoc = await chatDocRef.get();

            if (!chatDoc.exists) {
                return new Response(status.NOT_FOUND, null, 'Not Found', []);
            }

            await chatDocRef.update({ title });

            return new Response(status.OK, null, 'Success', null);
        } catch (error) {
            console.error('Error', error);
            return new Response(status.INTERNAL_SERVER_ERROR, null, 'Service error', error);
        }
    }

    static async deleteChat(chatId) {
        try {
            const chatDocRef = FirestoreModel.chatHistoryCollection.doc(chatId);
            const chatDoc = await chatDocRef.get();

            if (!chatDoc.exists) {
                return new Response(status.NOT_FOUND, null, 'Chat Not Found', []);
            }

            await chatDocRef.delete();

            return new Response(status.NO_CONTENT, null, 'Chat Deleted', null);
        } catch (error) {
            console.error('Error', error);
            return new Response(status.INTERNAL_SERVER_ERROR, null, 'Service Error', error);
        }
    }


    static async checkUserChatPermission(chatsObject, userId) {
        if (chatsObject.data.userId === userId) {
            return true
        }
        return new Response(status.FORBIDDEN, null, 'not permited', []);
    }
}

export default FirestoreModel;
