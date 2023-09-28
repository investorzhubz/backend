const {StatusCodes}=require('http-status-codes')
const customErrorAPI = require('../customError/customError')
const User=require('../models/authModel')
const validator=require('validator')
const jwt=require('jsonwebtoken')
const nodemailer=require('nodemailer')
const mongoose=require('mongoose')
const register=async(req,res)=>{
  const {username,email,password,phoneNumber}=req.body
  const {referral}=req.query
  if(username==''){
    throw new customErrorAPI("Enter a username",StatusCodes.BAD_REQUEST)

  }
  if(!validator.isEmail(email)){
    throw new customErrorAPI("Invalid Email",StatusCodes.BAD_REQUEST)
  }
  if(phoneNumber.length!=9){
    throw new customErrorAPI("Number is invalid",StatusCodes.BAD_REQUEST)

  }
  const numberexist=await User.findOne({phoneNumber:phoneNumber})
    const emailexist=await User.findOne({email:email})
    const usernameexist=await User.findOne({username:username})
    if(usernameexist){
      throw new customErrorAPI("Username already exists",StatusCodes.BAD_REQUEST)

    }
    if(emailexist){
      throw new customErrorAPI("Email already exists",StatusCodes.BAD_REQUEST)

    }
    if(numberexist){
      throw new customErrorAPI("Phone Number already exists",StatusCodes.BAD_REQUEST)

    }
  console.log(referral)
  if(referral){
    const findReferral=await User.findOne({username:referral})
    if(findReferral){
      req.body.referral=referral
    
    }
    
  
  }
 
    const user=await User.create(req.body)
    const token=user.signJWT()
    console.log(token)
     const transporter=nodemailer.createTransport({
      service:'gmail',
        auth:{
          user:'aiaffiliatedmarketing@gmail.com',
          pass:process.env.SMTP_PASSWORD
        }
      })
      const message={
        from: {
          name: 'AFM-Bot',
          address: 'aiaffiliatedmarketing@gmail.com'
        },
        to:user.email,
        subject:'Email Confirmation',
        html:`<!DOCTYPE html>
        <html>
        <head>
        
          <meta charset="utf-8">
          <meta http-equiv="x-ua-compatible" content="ie=edge">
          <title>Email Confirmation</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style type="text/css">
          /**
           * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
           */
          @media screen {
            @font-face {
              font-family: 'Source Sans Pro';
              font-style: normal;
              font-weight: 400;
              src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
            }
            @font-face {
              font-family: 'Source Sans Pro';
              font-style: normal;
              font-weight: 700;
              src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
            }
          }
          /**
           * Avoid browser level font resizing.
           * 1. Windows Mobile
           * 2. iOS / OSX
           */
          body,
          table,
          td,
          a {
            -ms-text-size-adjust: 100%; /* 1 */
            -webkit-text-size-adjust: 100%; /* 2 */
          }
          /**
           * Remove extra space added to tables and cells in Outlook.
           */
          table,
          td {
            mso-table-rspace: 0pt;
            mso-table-lspace: 0pt;
          }
          /**
           * Better fluid images in Internet Explorer.
           */
          img {
            -ms-interpolation-mode: bicubic;
          }
          /**
           * Remove blue links for iOS devices.
           */
          a[x-apple-data-detectors] {
            font-family: inherit !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
            color: inherit !important;
            text-decoration: none !important;
          }
          /**
           * Fix centering issues in Android 4.4.
           */
          div[style*="margin: 16px 0;"] {
            margin: 0 !important;
          }
          body {
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /**
           * Collapse table borders to avoid space between cells.
           */
          table {
            border-collapse: collapse !important;
          }
          a {
            color: #1a82e2;
          }
          img {
            height: auto;
            line-height: 100%;
            text-decoration: none;
            border: 0;
            outline: none;
          }
          </style>
        
        </head>
        <body style="background-color: #e9ecef;">
        
          <!-- start preheader -->
          <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
            Confirm Your Email Address
          </div>
          <!-- end preheader -->
        
          <!-- start body -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
        
            <!-- start logo -->
            <tr>
              <td align="center" bgcolor="#e9ecef">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                  <tr>
                    <td align="center" valign="top" style="padding: 36px 24px;">
                      
                    </td>
                  </tr>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
              </td>
            </tr>
            <!-- end logo -->
        
            <!-- start hero -->
            <tr>
              <td align="center" bgcolor="#e9ecef">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                  <tr>
                    <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
                      <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Confirm Your Email Address</h1>
                    </td>
                  </tr>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
              </td>
            </tr>
            <!-- end hero -->
        
            <!-- start copy block -->
            <tr>
              <td align="center" bgcolor="#e9ecef">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
        
                  <!-- start copy -->
                  <tr>
                    <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                      <p style="margin: 0;">Tap the button below to confirm your email address. If you didn't create an account with <a href="${process.env.SITE_NAME}">AFM-Bot</a>, you can safely delete this email.</p>
                    </td>
                  </tr>
                  <!-- end copy -->
        
                  <!-- start button -->
                  <tr>
                    <td align="left" bgcolor="#ffffff">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                            <table border="0" cellpadding="0" cellspacing="0">
                              <tr>
                                <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
                                  <a href="${process.env.SITE_NAME}/verify-email?token=${token}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Confirm Email</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- end button -->
        
                  <!-- start copy -->
                  <tr>
                    <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                      <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
                      <p style="margin: 0;"><a href="${process.env.SITE_NAME}/verify-email?token=${token}" target="_blank">${process.env.SITE_NAME}/verify-email?token=${token}</a></p>
                    </td>
                  </tr>
                  <!-- end copy -->
        
                  <!-- start copy -->
                  <tr>
                    <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
                      <p style="margin: 0;">Cheers,<br> AFM-Bot</p>
                    </td>
                  </tr>
                  <!-- end copy -->
        
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
              </td>
            </tr>
            <!-- end copy block -->
        
            <!-- start footer -->
            <tr>
              <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
        
                  <!-- start permission -->
                  <tr>
                    <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
                      <p style="margin: 0;">You received this email because we received a request for [type_of_action] for your account. If you didn't request [type_of_action] you can safely delete this email.</p>
                    </td>
                  </tr>
                  <!-- end permission -->
        
                  <!-- start unsubscribe -->
                  <tr>
                    <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
                      <p style="margin: 0;">AFM-Bot</p>
                      
                    </td>
                  </tr>
                  <!-- end unsubscribe -->
        
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
              </td>
            </tr>
            <!-- end footer -->
        
          </table>
          <!-- end body -->
        
        </body>
        </html>`

      }
      transporter.sendMail(message,(error, info)=>{
        if(error){
          console.log(error)
        }else{
          console.log('success' + info )
        
        }
  
      })
    

  
    res.status(StatusCodes.OK).json({token:token})

    

    

   
}



const login=async(req,res)=>{
   const {username,password}=req.body
   if(!username|| !password){
     throw new customErrorAPI('Enter Both Password and email',StatusCodes.BAD_REQUEST)
    
   }

   const user=await User.findOne({username:username})
   
   if(!user){
   
      throw new customErrorAPI('Username Does not exist',StatusCodes.UNAUTHORIZED)

   }
   const isMatch=await user.verifyPassword(password)
   console.log(isMatch)
   if(!isMatch){
   throw new customErrorAPI('Wrong Password',StatusCodes.UNAUTHORIZED)

   }
   const token=user.signJWT()
   res.status(StatusCodes.OK).json({token:token})

}
const getUser= async (req,res)=>{
  const {username,id}=req.user
  if(!mongoose.Types.ObjectId.isValid(id)){
    throw new customErrorAPI('Invalid Id', StatusCodes.UNAUTHORIZED)
  }
  const user=await User.findOne({_id:id})
  if(!user){
    throw new customErrorAPI('You Must be logged in to access this resource', StatusCodes.UNAUTHORIZED)
  }
  else{
 
    res.status(200).json(user)
  }


}

const verifyjwt= async(req,res)=>{
  const{authorization} =req.headers;

  const token=authorization.split(' ')[1]
  // console.log(token)

    const user =jwt.verify(token,process.env.JWT_SECRET,(err,response)=>{
      if(err){
        console.log(err)
        res.status(StatusCodes.UNAUTHORIZED).json({error:'token expired'})
        
      }
      // if(response){
      //   console.log('')
      // }
    })
  

}
// const referral=async(req,res)=>{
  
//   console.log(referral)
 

// }
module.exports={register,login,getUser,verifyjwt}