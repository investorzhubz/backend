const customErrorAPI = require("../customError/customError")
const {StatusCodes}=require('http-status-codes')

const error=(err,req,res,next)=>{
    if(err instanceof customErrorAPI){
        res.status(err.status).json({error:err.message})
    }
    // console.log(err)
   else{
    console.log(err)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({errors:err.message})
   }
   next()
}

module.exports=error