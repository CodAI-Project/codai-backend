import express from 'express'
const router = express.Router();
import routerCodeAI from '../routers/generator-code-router.js'
import routerChat from '../routers/chat-history-router.js'


router.get("/", (_, res) => {
    res.json({
        message: "CodAI ON!"
    })
})

router.use("/code", routerCodeAI)
router.use("/chats", routerChat)

export default router