const mongoose=require('mongoose')
const obj=require('../object')

const planSchema=new mongoose.Schema({
    title:String,
    price:Number,
    dailyTurnover:Number,
    monthlyIncome:Number,
    dailySale:Number,
    lifeSpan:Number


})
const Plan=mongoose.model('Plan',planSchema)
// const savePlan=async()=>{
//     await Plan.create(obj)
// }
// savePlan()


module.exports=Plan









