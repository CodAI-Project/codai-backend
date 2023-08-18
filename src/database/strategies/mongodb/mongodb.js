import ICrud  from '../interfaces/interfaceCrud'
import Mongoose from 'mongoose'


const STATUS = {
    0: 'Desconectado',
    1: 'Conectado',
    2: 'Conectando',
    3: 'Desconectando'
}


class MongoDB extends ICrud {
    constructor(connection, schema) {
        super()

        this._connection = connection
        this._schema = schema
    }

    async create(item) {
        return await this._schema.create(item)
    }

    async read(item = {}, skip = 0, limit = 10) {
        return await this._schema.find(item).skip(skip).limit(limit);
    }

    async update(id, item) {
        return await this._schema.updateOne({ _id: id }, { $set: item })
    }

    async delete(id) {
        return await this._schema.deleteOne({ _id: id })
    }

    async isConnected() {
        const state = STATUS[this._connection.readyState]

        if (state == 'Conectado') return state

        if (state != 'Conectando') return state

        if (state == 'Conectando')
            await new Promise(resolve => setTimeout(resolve, 1000))
        return STATUS[this._connection.readyState]
    }


    static connect() {

        try {
            Mongoose.connect(process.env.MONGODB_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('Conexão com o banco de dados estabelecida');
        } catch (error) {
            console.error('Erro na conexão com o banco de dados:', error);
        }

        const connection = Mongoose.connection
        connection.once('open', () => console.log('database rodando'))
        return connection

    }
}


module.exports = MongoDB