const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const {} = require('./../models/process-code')

router.post(
  "/code",
  [
    body("answer").notEmpty().withMessage("O campo 'answer' é obrigatório"),
  ],
  (req, res, next) => {
    // Verifica se houve erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const iaLogic = new IALogic();



    next();
  }
);

// Outra função de middleware ou rota
router.get("/another-route", (req, res) => {
  res.json({ message: "Outra rota" });
});

module.exports = router;
