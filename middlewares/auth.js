const { StatusCodes } = require('http-status-codes')
const jwt=require('jsonwebtoken')
const customErrorAPI = require('../customError/customError')
const authenticate=(req,res,next)=>{

        const {authorization}=req.headers
        // console.log(authorization)
        const token=authorization.split(' ')[1]
        // console.log(token)
        if(!token){
            throw new customErrorAPI('You Must Be Logged In',StatusCodes.BAD_REQUEST)
        }
        try {
            const payload=jwt.verify(token,process.env.JWT_SECRET)
            req.user=payload
        console.log(payload)
        next();

        } catch (error) {
            console.log(error)
            throw new customErrorAPI("Invalid Token",StatusCodes.UNAUTHORIZED)
        }


    }

module.exports=authenticate