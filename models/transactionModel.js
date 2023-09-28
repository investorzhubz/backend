const mongoose=require('mongoose')

const transactionSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    transactionType:{
        type:String,
        enum:['deposit','withdrawal','plan','balancePlan','welcome bonus withdrawal']
    },
    amount:{
        type:Number,
        required:true
    },
    phoneNumber:{
        type:String,
        default:'Account'
    }
},{timestamps:true})

 
const Transaction=mongoose.model('Transaction',transactionSchema)

module.exports=Transaction