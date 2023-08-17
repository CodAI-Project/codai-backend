const express = require("express");
const router = express.Router();
const sessaoModel = require("../models/sessao-model");



router.get("/", (req, res) => {

  res.json({ message: "Okay" });
});


router.post("/v1/generate", (req, res) => {

  const user = sessaoModel.loginUser(username, password);

  if (user) {
    res.json({ message: "Login bem-sucedido!" });
  } else {
    res.status(401).json({ message: "Credenciais inválidas" });
  }
});

module.exports = router;
