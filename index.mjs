import * as functions from "firebase-functions/v1";
import server from './src/config/server.js';

export const codai = functions
  .region("southamerica-east1")
  .runWith({
    timeoutSeconds: 60,
    memory: '256MB',
    minInstances: 1,
    maxInstances: 10,
    ingressSettings: 'ALLOW_ALL'
  }).https.onRequest(server);
