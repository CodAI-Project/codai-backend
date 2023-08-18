import db from '../../../config/firestore.js'



class Firestore {
  constructor() {
    this.db = db;
  }

  async create(path, documentId, data) {
    const collection = this.db.collection(path).doc(documentId);
    const result = collection.set(data)
    return result;
  }

  async read(collectionName, pageSize, startAfterDocument) {
    const collectionRef = this.db.collection(collectionName);
    
    let query = collectionRef.orderBy('lastModified');
    
    if (startAfterDocument) {
      const startAfterDoc = await collectionRef.doc(startAfterDocument).get();
      query = query.startAfter(startAfterDoc);
    }

    const querySnapshot = await query.limit(pageSize).get();
    const documents = [];

    querySnapshot.forEach(doc => {
      documents.push({ id: doc.id, data: doc.data() });
    });

    return documents;
  }

  async update(path, data) {
    await this.db.ref(path).update(data);
  }

  async delete(path) {
    await this.db.ref(path).remove();
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

module.exports = Firestore;
