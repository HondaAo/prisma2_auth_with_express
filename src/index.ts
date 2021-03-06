import express from 'express'
import { helloRouter } from './routes/helloRouter'
import { userRouter } from './routes/userRouter'

const app: express.Express = express()

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(helloRouter)
app.use(userRouter)

app.listen(3000,() => {
    console.log("Server running!")
})