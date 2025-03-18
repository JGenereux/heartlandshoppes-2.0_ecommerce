import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cookieParser from "cookie-parser";

dotenv.config()

const PORT = process.env.PORT || 5000


const app = express()

app.use(cors({
    origin: ['http://13.59.194.63', 'http://localhost:80'], // ✅ Explicitly allow frontend origin
    credentials: true, // ✅ Allow sending cookies
}));

app.use('/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json())
app.use(cookieParser())

const URI = process.env.ATLAS_URI || ''
mongoose.connect(URI)

const connection = mongoose.connection
connection.once("open", () => {
    console.log("MongoDB connected successfully")
})

import inventoryRouter from './src/Routes/Inventory'
import userRouter from './src/Routes/Users'
import orderRouter from './src/Routes/Orders'
import authRouter from './src/Routes/Auth'
import imageRouter from './src/Routes/Images'
import paymentRouter from './src/Routes/Payment'

app.use('/inventory', inventoryRouter)
app.use('/users', userRouter)
app.use('/orders', orderRouter)
app.use('/auth', authRouter)
app.use('/image', imageRouter)
app.use('/payment', paymentRouter)

app.get('/', (req: any, res: any) => {
    res.send('API is running')
})

app.listen(PORT,() => {
    console.log(`listening on port ${PORT}`)
})
