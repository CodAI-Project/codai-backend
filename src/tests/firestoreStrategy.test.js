const assert = require('assert')
const MongoDB = require('../db/strategies/mongodb/mongodb')
const Context = require('../db/strategies/base/contextStrategy')
const HeroiSchema = require('./../db/strategies/mongodb/schemas/heroisShema')


//MOCKS
const MOCK_HEROI_CADASTRAR = { nome: `Gaviao Negro-${Date.now}`, poder: "Flexas" }
let MOCK_HEROI_ID = ''
const MOCK_HEROI_ATUALIZAR = { nome: `Batman-${Date.now()}`, poder: "Dinheiro" }


// CONTEXT
let context = {}
describe('MongoDB Strategy', () => {
    before(async () => {
        const connection = MongoDB.connect()
        context = new Context(new MongoDB(connection, HeroiSchema))
        const result = await context.create(MOCK_HEROI_CADASTRAR)
        MOCK_HEROI_ID = result.id

    })

    it('MongoDBSQL Connection', async () => {
        const result = await context.isConnected()
        assert.equal(result, 'Conectado')
    })

    it('MongoDBSQL Create', async () => {
        const { nome, poder } = await context.create(MOCK_HEROI_CADASTRAR)
        assert.deepEqual({ nome, poder }, MOCK_HEROI_CADASTRAR)
    })

    it('MongoDBSQL Read', async () => {
        const [{ nome, poder}] = await context.read({ nome: MOCK_HEROI_CADASTRAR.nome });

        const result = {
            nome, poder
        }
        assert.deepEqual(result, MOCK_HEROI_CADASTRAR)
    })

    it('MongoDBSQL Update', async () => {
        const result = await context.update(MOCK_HEROI_ID, { nome: "Pernalonga" })

        assert.deepEqual(result.nModified, 1)
    })

    it('MongoDBSQL Delete', async () => {
        const result = await context.delete(MOCK_HEROI_ID)
        assert.deepEqual(result.deletedCount, 1)
    })

})
