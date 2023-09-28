const mongooose=require('mongoose')

const connectDB=async(uri)=>{
    await mongooose.connect(uri)
}


module.exports=connectDB