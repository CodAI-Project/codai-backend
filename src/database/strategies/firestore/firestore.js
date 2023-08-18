import db from '../../../config/firestore.js';

class Firestore {
  constructor() {
    this.db = db;
  }

  async create(path, documentId, data) {
    const collection = this.db.collection(path).doc(documentId);
    await collection.set(data);
  }

  async read(collectionName, skip = '', limit = 10) {
    const collectionRef = this.db.collection(collectionName);

    let query;

    if (skip) {
      const startAfterDoc = await collectionRef.doc(skip).get();
      query = query.startAfter(startAfterDoc);
    }

    const querySnapshot = await query.limit(limit).get();
    const documents = [];

    querySnapshot.forEach(doc => {
      documents.push({ id: doc.id, data: doc.data() });
    });

    return documents;
  }

  async update(path, data) {
    const documentRef = this.db.doc(path);
    await documentRef.update(data);
  }

  async delete(path) {
    const documentRef = this.db.doc(path);
    await documentRef.delete();
  }

  async isConnected() {
    try {
      await this.db.ref('.info/connected').once('value');
      return 'Conectado';
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      return 'Desconectado';
    }
  }
}

export default Firestore;
