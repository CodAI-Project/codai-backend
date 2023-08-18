import express from "express";
import { body, validationResult } from "express-validator";
import ProcessAIModel from "../models/process-code.js";

const router = express.Router();

router.post(
  "/code-openai",
  [
    body("answer").notEmpty().withMessage("O campo 'answer' é obrigatório"),
    body("template").notEmpty().withMessage("O campo 'template' é obrigatório"),
    body("userId").notEmpty().withMessage("O campo 'userId' é obrigatório"),
    body("chatId").notEmpty().withMessage("O campo 'chatId' é obrigatório"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const response = await ProcessAIModel.generateAnswerOpenAI(req);
      return res.json(response);
    } catch (error) {
      // Aqui você pode tratar qualquer erro que ocorra na função generateAnswerBard
      console.error(error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
);


export default router;
