import Response from "../types/Response.js";
import db from "../config/firestore.js";
import Bard from "bard-ai";
import status from "http-status-codes";
import functions from "firebase-functions";
import ChatHistory from "../database/strategies/firestore/schemas/chat-history-schema.js";

const collection = "chat-history";
const bardConfig = functions.config().node.npl.bard;

class ProcessAIModelBard {
  static async generateAnswerOpenAI(req) {
    const { userId, chatId, ask, template } = req.body;
    let content = null;

    try {
      const conversationHistory = await this.getConversationHistory(
        chatId,
        userId
      );

      if (conversationHistory.userId !== userId) {
        return new Response(
          status.FORBIDDEN,
          "Forbidden",
          "O usuario não tem acesso a esse chat",
          []
        );
      }

      if (!conversationHistory.history.length) {
        content = await this.firstPrompt(ask, template);
      } else {
        content = await this.generatorUsingHistoryPrompt(ask, template);
      }

      const myBard = new Bard(bardConfig);
      const responsePrompt = await myBard.ask(content);
      let assistantResponse = responsePrompt;
     
      const jsonContent = assistantResponse.slice(assistantResponse.indexOf(``), assistantResponse.lastIndexOf(``) + 3);
      console.log(jsonContent.replace("```json", ""))
      
      const conversation = this.buildConversation(
        content,
        conversationHistory.history,
        ask,
        assistantResponse
      );

      const chat = await this.updateConversationHistory(
        userId,
        conversationHistory.chatId,
        conversation
      );

      const response = {
        chat: chat,
        lastAwnser: assistantResponse,
      };

      return new Response(status.OK, null, "Sucesso", response);
    } catch (e) {
      console.error("Erro ao gerar resposta:", e);
      return new Response(status.BAD_REQUEST, "Bad Request", e, null);
    }
  }

  static buildConversation(
    content,
    conversationHistory,
    ask,
    responseOpenAI = null
  ) {
    const conversation = [...conversationHistory];
    conversation.push({ role: "system", content: content });
    conversation.push({ role: "user", content: ask });

    if (responseOpenAI) {
      conversation.push({ role: "assistant", content: responseOpenAI });
    }

    return conversation;
  }

  static async getConversationHistory(chatId, userId) {
    try {
      const docRef = chatId
        ? db.collection(collection).doc(chatId)
        : db.collection(collection).doc();
      const doc = await docRef.get();

      let newChatId;

      if (!chatId) {
        newChatId = docRef.id;
      } else {
        newChatId = chatId;
      }

      let chatHistory;

      if (doc.exists) {
        chatHistory = new ChatHistory(
          doc.data().history.slice(-6),
          doc.data.title,
          Date.now(),
          doc.data().userId
        );

        chatHistory = { chatId: newChatId, ...chatHistory };

        return chatHistory;
      } else {
        chatHistory = new ChatHistory([], "", Date.now(), userId);
        await docRef.set({
          history: chatHistory.history,
          title: chatHistory.title,
          userId: chatHistory.userId,
          lastModified: chatHistory.lastModified,
        });

        chatHistory = { chatId: newChatId, ...chatHistory };
        return chatHistory;
      }
    } catch (error) {
      console.error("Erro ao fazer algo no Firestore", error);
      return [];
    }
  }

  static async updateConversationHistory(userId, chatId, conversation) {
    const chatFireStoreUpdate = ChatHistory.toFirestoreObjectUpdate(
      conversation,
      Date.now()
    );

    try {
      const chatDocRef = db.collection("chat-history").doc(chatId);
      await chatDocRef.update(chatFireStoreUpdate);
      const chatUpdated = await chatDocRef.get();

      const userDocRef = db.collection("user-chat").doc(userId);
      await userDocRef.set(
        { chats: { [chatId]: chatDocRef } },
        { merge: true }
      );

      const responseUpdate = {
        id: chatId,
        userId: userId,
        title: chatUpdated.data().title,
        history: chatUpdated.data().history.slice(-12),
      };

      return responseUpdate;
    } catch (error) {
      console.error("Error ao realizar update:", error);
    }
  }

  static async generatorUsingHistoryPrompt(ask) {
    return `
      Levando em consideração as últimas conversas do usuário, e a solicitação do sistema

      faça as modificações do objeto files 

      não esqueça de nenhum import

      ajuste o objeto e mande novamente, mude só o atributo de files 
      

      modificações solicitadas pelo usuário: ${ask}
    `;
  }

  static async firstPrompt(ask, template) {
    return `
    Você é um gerador de códigos. e deve retornar um objeto igual descrito nos itens abaixo

    *****
    Solicitação do usuario: ${ask}
    *****

    - Regras você deve retornar apenas o objeto solicitado.
    
    - O usuario irá te mandar uma solicitação e você deve criar o fielmente possivel e bem completo.
    
    - Faça sempre com bastante css ou styled componentes. (priorizando como o usuario solicitou)

    - Atenção ao criar esse objeto, ele precisa está no formato corretor pra eu fazer um parse disso. se nao ele vai dar erro.


    - Certifique-se de retornar apenas o objeto abaixo como resposta, excluindo qualquer texto explicativo ou adicional:
    
      *** o objeto a ser retornado é esse preenchido com os códigos em cada arquivo necessários para o funcionamento desse objeto. *** 

      caso necessário crie mais arquivos caso o usuario for pedindo e tbm caso seja necessário para o funcionamento app


      ATENÇAO: RETORNE ESSE TIPO DE OBJETO ABAIXO PREECHIDO COM OS CODIGOS.


    {
            "files": {
              "src/index.js": "",
              "src/App.js": "",
              "public/index.html": "",
              "package.json": ""
            },
            "title": "",
            "description": "",
            "template": "${template}",
            "dependencies": {
              "react": "^17.0.2",
              "react-dom": "^17.0.2",
              "react-router-dom": "^5.3.0"
            }
          }
    `;
  }
}

export default ProcessAIModelBard;
