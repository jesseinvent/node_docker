const express = require('express')
const mongoose = require('mongoose')
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, REDIS_URL, REDIS_PORT, SESSION_SECRET } = require('./config/config')
const session = require('express-session')
const redis = require('redis')
const cors = require('cors');

let RedisStore = require('connect-redis')(session)
let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT
})  

const postRouter = require("./routes/postRoutes")
const userRouter = require("./routes/userRoutes")

const app = express()

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`

const connectWithRetry = () => {
    mongoose.connect(mongoURL)
        .then(() => console.log('Successfully connected to DB'))
        .catch(err => {
            console.log(err);
            setTimeout(connectWithRetry, 5000)
        })
}

connectWithRetry()

app.enable("trust proxy")

app.use(cors({}))

app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: 'secret',
    cookie: {
        secure: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 30000
    }
}))

app.use(express.json())

app.get("/api/v1", (req, res) => {
    res.send('<h2>Hi there!!</h2>')
    console.log("Yeah it ran")
})

app.use("/api/v1/posts", postRouter)
app.use("/api/v1/users", userRouter)

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Listening on port ${port}`))