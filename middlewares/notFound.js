const {StatusCodes}=require('http-status-codes')
const notFound=(req,res)=>{
    res.status(StatusCodes.NOT_FOUND).json({msg:'404 Not Found'})
}
module.exports=notFound