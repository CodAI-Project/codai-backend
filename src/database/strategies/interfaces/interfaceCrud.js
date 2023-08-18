class NotImplementatedException extends Error {
    constructor() {
        super("Not Implemented Exception")
    }
}

class ICrud {
    create(item) {
        throw new NotImplementatedException()
    }

    read(item) {
        throw new NotImplementatedException()
    }

    update(id, item) {
        throw new NotImplementatedException()
    }

    delete(id) {
        throw new NotImplementatedException()
    }

    isConnected(){
        throw new NotImplementatedException()
    }

    connect(){
        throw new NotImplementatedException()
    }
}


module.exports = ICrud