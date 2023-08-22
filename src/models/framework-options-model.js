import db from '../config/firestore.js';
import Response from '../types/Response.js';
import status from 'http-status-codes'

class FrameworkModel {
    static frameworkOptionsCollection = db.collection('frameworks-options');

    static async getFrameworksOptins() {
        try {
            const snapshot = await this.frameworkOptionsCollection.get();
            const frameworks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return new Response(status.OK, null, 'Sucesso', frameworks);
        } catch (error) {
            return new Response(status.INTERNAL_SERVER_ERROR, null, 'erro no serviço', []);
        }
    }

    static async getFrameworksOptinsById(id) {
        try {
            const docRef = this.frameworkOptionsCollection.doc(id);
            const doc = await docRef.get();
            if (!doc.exists) {
                return new Response(status.NOT_FOUND, null, 'Opção nao encontrado', []);

            }
            return new Response(status.OK, null, 'Sucesso', { id: doc.id, ...doc.data() });

        } catch (error) {
            return new Response(status.INTERNAL_SERVER_ERROR, null, 'erro no serviço', []);
        }
    }

    static async createFrameworkOptions(title, template) {
        try {
            const result = await this.frameworkOptionsCollection.add({ title, template });
            return new Response(status.CREATED, null, 'Opção de framework criado com sucesso', { id: result.id, title, template });
        } catch (error) {
            return new Response(status.INTERNAL_SERVER_ERROR, null, 'erro no serviço', []);

        }
    }

    static async patchFrameWorksOptionsById(id, title, template) {
        try {
            const docRef = this.frameworkOptionsCollection.doc(id);
            const doc = await docRef.get();
            if (!doc.exists) {
                return new Response(status.NOT_FOUND, null, 'Opção nao encontrado', []);

            }
            await docRef.update({ title, template });
            return new Response(status.OK, null, 'Sucesso', { id, title, template })
        } catch (error) {
            return new Response(status.INTERNAL_SERVER_ERROR, null, 'erro no serviço', []);
        }
    }

    static async deleteFrameWork(id) {
        try {
            const docRef = this.frameworkOptionsCollection.doc(id);
            const doc = await docRef.get();
            if (!doc.exists) {
                return new Response(status.NOT_FOUND, null, 'Opção nao encontrado', []);
            }
            await docRef.delete();
            return new Response(status.NO_CONTENT, null, 'Excluido com sucesso', []);
        } catch (error) {
            return new Response(status.INTERNAL_SERVER_ERROR, null, 'erro no serviço', []);
        }
    }
}

export default FrameworkModel;