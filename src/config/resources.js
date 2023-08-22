import express from 'express'
const router = express.Router();
import routerCodeAI from '../routers/generator-code-router.js'
import routerChat from '../routers/chat-history-router.js'
import routerFramework from '../routers/framework-options.js'


router.get("/", (_, res) => {
    res.json({
        message: "CodAI ON!"
    })
})

router.use("/code", routerCodeAI)
router.use("/chats", routerChat)
router.use("/framework", routerFramework)

export default router