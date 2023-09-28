const mongoose=require('mongoose')

const salesSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    productName:{
        type:String,
        required:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    



})
const Sale=mongoose.model('sale',salesSchema)

module.exports=Sale