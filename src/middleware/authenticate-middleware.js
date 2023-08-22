import admin from 'firebase-admin';
import Response from './../types/Response.js'
import status from 'http-status-codes'

async function authenticateMiddleware(req, res, next) {
  const idToken = req.header('Authorization');

  if (!idToken) {

    const response = new Response(status.UNAUTHORIZED, '', 'Necessário enviar autenticação', [])
    return res.status(response.status).json(response);
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken.replace('Bearer ', ''));
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    const response = new Response(status.UNAUTHORIZED, '', 'Token de autenticação invalido', [])

    return res.status(response.status).json(response);
  }

}

export default authenticateMiddleware;