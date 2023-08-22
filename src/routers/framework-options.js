import express from "express";
import { body, param, validationResult } from "express-validator";
import FrameworkModel from "../models/framework-options-model.js";
const router = express.Router();


router.get("/", async (req, res) => {

    const result = await FrameworkModel.getFrameworksOptins();
    return res.status(result.status).json(result);

}
);
router.get(
    "/:id",
    [
        param("id").notEmpty().withMessage("O parâmetro 'id' não pode estar vazio"),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params

        const result = await FrameworkModel.getFrameworksOptinsById(id);

        return res.status(result.status).json(result);


    }
);

router.post(
    "/",
    [
        body("title").notEmpty().withMessage("O 'title' não pode estar vazio"),
        body("template").notEmpty().withMessage("O 'template' não pode estar vazio")
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, template } = req.body
        const result = await FrameworkModel.createFrameworkOptions(title, template);

        return res.status(result.status).json(result);


    }
);

router.patch(
    "/:id",
    [
        body("title").notEmpty().withMessage("O 'title' não pode estar vazio"),
        body("template").notEmpty().withMessage("O 'template' não pode estar vazio")

    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params
        const { title, template } = req.body

        const result = await FrameworkModel.patchFrameWorksOptionsById(id, title, template);

        return res.status(result.status).json(result);

    }

);



router.delete(
    "/:id",
    [
        param("id").notEmpty().withMessage("O parâmetro 'id' não pode estar vazio"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;

        const result = await FrameworkModel.deleteFrameWork(id);

        return res.status(result.status).json(result);
    }
);

export default router;
