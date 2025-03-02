const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const PORT = process.env.PORT || 5000

const app = express()

app.use(cors())
app.use(express.json())

const inventoryRouter = require('./Routes/Inventory')
const userRouter = require('./Routes/Users')
app.use('/inventory', inventoryRouter)
app.use('/users', userRouter)

app.get('/', (req: any, res: any) => {
    res.send('API is running')
})

app.listen(PORT,() => {
    console.log(`listening on port ${PORT}`)
})