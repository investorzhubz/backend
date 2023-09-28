const customErrorAPI = require('../customError/customError')
const {StatusCodes}=require('http-status-codes')
const User=require('../models/authModel')
const Plan=require('../models/planModel')
const mongoose=require('mongoose')

const botClick=async(req,res)=>{

   
    const {id}=req.user
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new customErrorAPI('Invalid id',StatusCodes.BAD_REQUEST)
    }

    const user=await User.findOne({_id:id})
    if(!user.plan.planId){

           throw new customErrorAPI("Activate a plan to be able to claim  reward",StatusCodes.BAD_REQUEST)
        
    }
    if(!user.botClickTime){
        throw new customErrorAPI("Activate Bot to claim reward",StatusCodes.BAD_REQUEST)

    }
    const plan=await Plan.findOne({_id:user.plan.planId})
    if(!plan){

        throw new customErrorAPI("Invalid Plan Id",StatusCodes.UNAUTHORIZED)

    }


    const timeDifference = Date.now() - user.botClickTime.getTime()
    // console.log(`The time difference is for bot ${timeDifference}`);
    const hoursPassed = Math.floor(timeDifference / (1000*60*60));
    // console.log`The number of hours passed is ${hoursPassed}`

    if(hoursPassed>=24){
        
        const grantreward=await User.findOneAndUpdate({_id:id},{$inc:{accountBalnace:plan.dailyTurnover}})
        const updateClickTime=await User.findOneAndUpdate({_id:id}, {$set:{botClickTime:null}})
        res.status(StatusCodes.OK).json({msg:`${user.username} has earn sales of  ${plan.dailyTurnover}`})
        

    }else{
        throw new customErrorAPI("Bot Still Processing Sales",StatusCodes.UNAUTHORIZED)
    }

   
  


}
const activateBot=async(req,res)=>{
    const {id}=req.user
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new customErrorAPI('Invalid id',StatusCodes.BAD_REQUEST)
    }
    try {
        const user=await User.findOne({_id:id})
    if(!user.plan.planId){

           throw new customErrorAPI("Activate a plan to be able to claim  reward",StatusCodes.BAD_REQUEST)
        
    }
        const updateClickTime=await User.findOneAndUpdate({_id:id}, {$set:{botClickTime:Date.now()}})
        res.status(200).json({msg:'Bot Reactivated Successfully'})
    } catch (error) {
        // console.log(error)
        res.status(500).json({error:'Failed To Reactivate Bot'})
    }

}


module.exports={botClick,activateBot}