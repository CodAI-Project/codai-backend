const functions = require('firebase-functions/v1');
const server = require('./src/config/server')


exports.codai = functions
  .region("southamerica-east1")
  .runWith({
    timeoutSeconds: 60,
    memory: '256MB',
    minInstances: 1,
    maxInstances: 10,
    ingressSettings: 'ALLOW_ALL'
  }).https.onRequest(server)


  // .https.onRequest((req, res) => {
  //   authenticateMiddleware(req, res, () => {
  //     // O usuário foi autenticado com sucesso.
  //     // Você pode prosseguir com a lógica da sua função aqui.
  //     server(req, res);
  //   });
  // });