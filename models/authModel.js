const validator=require('validator')
const mongoose=require('mongoose')
const bycrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const customErrorAPI = require('../customError/customError')
const { StatusCodes } = require('http-status-codes')

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true, 
        trim:true,
        lowercase:true 

    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true 

    },
    emailVerifyAt:{
        type:Date,
        default:null
    },
    accountBalnace:{
        type:Number,
        default:0

    },
    phoneNumber:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    plan:{
        planId:{
            type:mongoose.Types.ObjectId,
            ref:'Plan',
            default:null,
    
        },
        planUpdtae:{
            type:Date,
            default:Date.now()
        }
    },
    referral:{
        type:String,
        default:null,
    },
    bonus:{
        type:Number,
        default:null
    },
    welcomeBonus:{
        type:Number,
        default:200,
    },
    isAdmin:{
        type:Boolean,
        default:false,

    }, 
    password:{
        type:String,
        required:true

    },
    botClickTime:{
        type:Date,
        default:null

    }
    

},{timestamps:true})

userSchema.pre('save',async function(next){
    
    this.username = this.username.replace(/ /g, "");
    const salt= await bycrypt.genSalt(10)
    this.password=  await bycrypt.hash(this.password,salt)


})
// userSchema.methods.email=async function(email){
//     if(!validator.isEmail(email)){
//         throw new customErrorAPI('Invalid Email',StatusCodes.BAD_REQUEST)
//     }

    

// }
userSchema.methods.signJWT=function(){
    return jwt.sign({id:this._id,username:this.username},process.env.JWT_SECRET,{expiresIn:'1d'})
}
userSchema.methods.verifyPassword=async function(password){
    const isMatch= await bycrypt.compare(password,this.password)
    return isMatch
}
userSchema.methods.signPass=function(emails){
    return jwt.sign({email:emails},process.env.JWT_SECRET,{expiresIn:'1d'})
}
const User=mongoose.model('User',userSchema)

module.exports=User