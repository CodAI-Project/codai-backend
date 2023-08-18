import express from "express";
import { body, validationResult } from "express-validator";
import ProcessAIModel from "../models/process-code-model.js";

const router = express.Router();

router.post(
  "/code-openai",
  [
    body("ask").notEmpty().withMessage("O campo 'ask' é obrigatório"),
    body("template").notEmpty().withMessage("O campo 'template' é obrigatório"),
    body("userId").notEmpty().withMessage("O campo 'userId' é obrigatório"),
    body("chatId")
      .custom((value, { req }) => {
        if (value === null) {
          return true;
        }
        return !!value;
      })
      .withMessage("O campo 'chatId' deve ser enviado"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const response = await ProcessAIModel.generateAnswerOpenAI(req);
      return res.json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
);


export default router;
