import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cookieParser from "cookie-parser";

dotenv.config()

const PORT = process.env.PORT || 5000

const app = express()

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://heartlandshoppes.ca',
      'https://www.heartlandshoppes.ca',
      'http://18.119.6.239',
      'http://10.0.0.228',
      'http://localhost:8080',
      'http://10.0.0.1/',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:8080'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin); // ✅ Echo back the origin
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie', 'Date', 'ETag'],
}));
   
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
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
import emailRouter from './src/Routes/Emails'

app.use('/api/inventory', inventoryRouter)
app.use('/api/users', userRouter)
app.use('/api/orders', orderRouter)
app.use('/api/auth', authRouter)
app.use('/api/image', imageRouter)
app.use('/api/payment', paymentRouter)
app.use('/api/email', emailRouter)

app.get('/api', (req: any, res: any) => {
    res.send('API is running')
})

app.listen(PORT,() => {
    console.log(`listening on port ${PORT}`)
})
