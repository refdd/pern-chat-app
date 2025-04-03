import express from "express"

const router = express.Router()
router.get("/conversations" , (req, res) => {
    res.json([
        { id: 1, title: "Chat 1" },
        { id: 2, title: "Chat 2" },
        { id: 3, title: "Chat 3" }
    ])
})

export default router