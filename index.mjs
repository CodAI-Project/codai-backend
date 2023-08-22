import * as functions from "firebase-functions/v1";
import server from './src/config/server.js';
import autheauthenticateMiddleware from './src/middleware/authenticate-middleware.js'

export const codai = functions
  .region("southamerica-east1")
  .runWith({
    timeoutSeconds: 60,
    memory: '256MB',
    minInstances: 1,
    maxInstances: 10,
    ingressSettings: 'ALLOW_ALL'
  }).https.onRequest(async (req, res) => {
    await autheauthenticateMiddleware(req, res, async () => {
      server(req, res);
    });
  });