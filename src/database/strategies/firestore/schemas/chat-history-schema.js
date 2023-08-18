class ChatHistory {
    constructor(history, title, lastModified, userId) {
        this.history = history || [];
        this.title = title || '';
        this.lastModified = lastModified || null; // Unix timestamp (milliseconds)
        this.userId = userId || '';
    }


      
    static toFirestoreObjectUpdate(history, lastModified ) {
        return {
            history: history,
            lastModified: lastModified,
        };
    }

    static toFirestoreObject() {
        return {
            history: this.history,
            title: this.title,
            lastModified: this.lastModified,
            userId: this.userId
        };
    }

    static fromFirestoreObject(data) {
        return new ChatHistory(data.history, data.title, data.lastModified, data.userId);
    }
}

export default ChatHistory;
