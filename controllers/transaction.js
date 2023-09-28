const customErrorAPI = require('../customError/customError')
const Transaction=require('../models/transactionModel')
const User=require('../models/authModel')
const {StatusCodes} =require('http-status-codes')

const deposits=async(req,res)=>{
    const {username,id}=req.user
     console.log(username)
    if(!username){
        throw new customErrorAPI('Invalid USer',StatusCodes.UNAUTHORIZED)
    }
    const deposits=await Transaction.find({
        username:username,transactionType:'deposit'})
    if(deposits.length==0){
        throw new customErrorAPI('You Have Made No Deposits',StatusCodes.NOT_FOUND)
    }
    res.status(StatusCodes.OK).json(deposits)

}

    const withdrawals=async(req,res)=>{
        const {username,id}=req.user
    
        if(!username){
            throw new customErrorAPI('Invalid USer',StatusCodes.UNAUTHORIZED)
        }
        const  withdrawals=await Transaction.find({username:username,transactionType:'withdrawal'})
        if(withdrawals.length==0){
            throw new customErrorAPI('You Have Made No Withdrawals',StatusCodes.NOT_FOUND)
        }else{
            res.status(StatusCodes.OK).json(withdrawals)

        }
        

}

const referrals=async(req,res)=>{
    const {username,id}=req.user
    if(!username){
        throw new customErrorAPI('Invalid USer',StatusCodes.UNAUTHORIZED)

    }
    const user=await User.find({referral:username})
    if(user.length==0){
        throw new customErrorAPI('You Have Made No Referrals',StatusCodes.NOT_FOUND)
    }
    else{
        res.status(StatusCodes.OK).json(user)
    }
    
}

module.exports={deposits,withdrawals,referrals}