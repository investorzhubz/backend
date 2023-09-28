const express=require('express')
const cors=require('cors')
require('express-async-errors')
require('dotenv').config()
const connectDB=require('./db/connect')
const bodyParser=require('body-parser')
const multer=require
const authRoute=require('./routes/authRoute')
const notFoundMiddleware=require('./middlewares/notFound')
const errorMiddleware=require('./middlewares/error')
const productRoute=require('./routes/productRoute')
const momoRoute=require('./routes/momoRoute')
const planRouter=require('./routes/planRoute')
const botRoute=require('./routes/botRoute')
const transactionRoute=require('./routes/transactionRoutes')
const contactRoute=require('./routes/contactRoute')
const forgetPasswordRoute=require('./routes/forgotPasswordRoute')
const device=require('express-device')

require('./models/planModel')

const start=async ()=>{
    try {
        await connectDB(process.env.MONGO_URI)
    app.listen(process.env.PORT,console.log(`DB connected and Server Running at port ${process.env.PORT}`))
    } catch (error) {
        console.log(` There was error during database connection: ${error}`)
        
    }
}

start()


const app=express()
 app.use(cors())
 app.use(bodyParser.urlencoded({
    extended:false
 }))
 app.use(bodyParser.json())
app.use(device.capture({parseUserAgent:true}))
app.use(express.json())

app.use('/api/affiliate',planRouter)
app.use('/api/affiliate',productRoute)
app.use('/api/affiliate',momoRoute)
app.use('/api/affiliate',authRoute)
app.use('/api/affiliate',botRoute)
app.use('/api/affiliate',forgetPasswordRoute)
app.use('/api/affiliate',transactionRoute)
app.use('/api/affilaite',contactRoute)

app.use(notFoundMiddleware)
app.use(errorMiddleware)


