const Product=require('../models/productModel')
const {StatusCodes}=require('http-status-codes')
const Sale=require('../models/sale')
const customErrorAPI = require('../customError/customError')
const User=require('../models/authModel')
const mongoose=require('mongoose')
const fs=require('fs')
const upload=require('../middlewares/upload')


const getAllProduct=async(req,res)=>{
    const product=await Product.find().sort({createAt:-1})
    if(product.length==0){
        throw new customErrorAPI("No Products yet", StatusCodes.NOT_FOUND)
    }

    res.status(StatusCodes.OK).json(product)
}
const getAllUserProduct=async(req,res)=>{
    const {id,useraname}=req.user
    const product=await Product.find({userid:id})
    res.status(StatusCodes.OK).json(product)
}

const createProduct=async(req,res)=>{
   
    const {id,username}=req.user
    const user= await User.findById(id)
    if(!user.isAdmin){
        throw new customErrorAPI("For Now, Only Admins Can Create Products", StatusCodes.UNAUTHORIZED)
    }
    
    try {
    const productImage=req.file


   
    const {title,price,description}=req.body
    console.log(req.body)
    console.log(description)
    
    const obj={
        title:title,
        price:price,
        description:description,
        userId:id,
       
        image:{
            data:fs.readFileSync("uploads/" + req.file.filename),
            contentType:"image/png"
        },
        
        
        
    }
    const product=await Product.create(obj)
     res.status(StatusCodes.OK).json({msg:"Product Created Successfullyis saved"})
    
    
   } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error:"Failed to create new product"})
   }

}
const getSingleProduct=async(req,res)=>{
    const {id}=req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new customErrorAPI('No Product With such product id', StatusCodes.NOT_FOUND)

    }
    const product =await Product.findById(id)
    res.status(StatusCodes.OK).json(product)
}
const updateProduct=async(req,res)=>{
    const {id}=req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new customErrorAPI('No Product With such product Id', StatusCodes.NOT_FOUND)

    }
    const product=await Product.updateOne({_id:id},req.body)
    res.status(StatusCodes.OK).json(product)


}
const deleteProduct=async(req,res)=>{
    const {id}=req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new customErrorAPI('No Product With such product id', StatusCodes.NOT_FOUND)

    }
    const product=await Product.findOneAndDelete({_id:id})
    res.status(StatusCodes.OK).json(product)

}
const buyProduct=async (req,res)=>{
    const {username,id}=req.user
    const {pid}=req.params
    const user=await User.findOne({_id:id})
    const product=await Product.findById(pid)
    if(!product){
        throw new customErrorAPI('No such Product',StatusCodes.BAD_REQUEST)
    }

    if(user.accountBalnace>product.price){
        await User.findOneAndUpdate({_id:id},{$inc:{accountBalnace:-product.price}})
        const sale=await Sale.create({username:username,productName:product.title,amount:product.price})
        res.status(StatusCodes.OK).json({msg:`You Havae Successfully Purchased ${product.title} `})
    }else{
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error:`Insufficient Balance. Refill your Account`})


    }


}

module.exports={getAllProduct,getAllUserProduct,getSingleProduct,createProduct,updateProduct,deleteProduct,buyProduct}