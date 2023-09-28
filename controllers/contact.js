const nodemailer=require('nodemailer')
const customErrorAPI=require('../customError/customError')
const {StatusCodes}=require('http-status-codes')
const validator=require('validator')
const contact=(req,res)=>{
    const {firstName,lastName,email,phone,messageBody}=req.body
     if(firstName==''||lastName==''||email==''||phone==''){
        throw new customErrorAPI('Fill all the required Form Fields',StatusCodes.BAD_REQUEST)

     }
     if(!validator.isEmail(email)){
        throw new customErrorAPI('Wrong Email',StatusCodes.BAD_REQUEST)
     }



    try {

  const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
      user:'aiaffiliatedmarketing@gmail.com',
      pass:process.env.SMTP_PASSWORD
    }
  })
  const message={
    from:'aiaffiliatedmarketing@gmail.com',
    to:'aiaffiliatedmarketing@gmail.com',
    subject:'Contact Form',
    html:`<div>
       <p>Nmae: ${firstName} ${lastName}</p>
       <p>Email: ${email}</p>
       <p> Phone Number: ${phone}</p>
       <p>Message: ${messageBody}</p>
        </div>`
  }
  transporter.sendMail(message,(error, info)=>{
    if(error){
      // console.log(error)
      res.status(500).json({error:'Failed to send'})
    }else{
      // console.log('success' + info )
      res.status(StatusCodes.OK).json({msg:'Message Sent Successfully'})
    }

  })
 
     } catch (error) {
        // console.log(error)
        res.status(500).json({error:'Failed to send'})
        
     }


}
module.exports=contact