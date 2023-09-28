const User=require('../models/authModel')
const {StatusCodes} =require('http-status-codes')

const verify=async (req,res,next)=>{

    try {
        const {username,id}=req.user
        console.log("THIS IS ", req.user)

    const user=await User.findOne({_id:id})
    console.log(user)
     if(user.emailVerifyAt!==null){

        console.log(user.emailVerifyAt)
        next()

     }else{
        return res.status(StatusCodes.NOT_FOUND).json({error:'email not verified'})
     }

    } catch (error) {
        console.log(error)
    }

}

module.exports= verify