const admin = require('firebase-admin');
admin.initializeApp();

function authenticateMiddleware(req, res, next) {
  const idToken = req.header('Authorization');

  if (!idToken) {
    return res.status(401).json({ message: 'Token de autenticação ausente' });
  }

  admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      next(); 
    })
    .catch(() => {
      res.status(403).json({ message: 'Token de autenticação inválido' });
    });
}

module.exports = authenticateMiddleware;
