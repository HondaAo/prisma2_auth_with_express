import express from "express"

const router = express.Router();

router.get('/', (req, res): string => {
    console.log("get hello route")
    return "hello world"
})

export { router as helloRouter }