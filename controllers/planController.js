const customErrorAPI = require('../customError/customError')
const mongoose=require('mongoose')
const Plan=require('../models/planModel')
const User=require('../models/authModel')
const Flutterwave=require('flutterwave-node-v3');
const Transaction=require('../models/transactionModel')
const { StatusCodes } = require('http-status-codes');
const { referral } = require('./authController');
const axios=require('axios')
const https=require('https')
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);


const getPlans=async(req,res)=>{
    const plan=await Plan.find().sort({price:1})
    res.status(200).json(plan)

}
const getSinglePlan=async(req,res)=>{
    const {pid}=req.params
    console.log('this is ' +pid)
    if(pid==null){
        throw new customErrorAPI('You have No plan',StatusCodes.BAD_REQUEST)
    }
    const planID= mongoose.Types.ObjectId.isValid(pid);
    if(!planID){
        throw new customErrorAPI('You have No plan',StatusCodes.BAD_REQUEST)

    }

    const plan = await Plan.findOne({_id:pid})

    res.status(StatusCodes.OK).json(plan)

}


const buyPlan=async(req,res)=>{
    console.log('starting to buy plan')
    const {username,id}=req.user
    console.log({msg:'User accesing request',data:req.user})
    //pid plan id from destructured from req.params
    const {pid}=req.params
    console.log(pid)
    const {number}=req.body
    console.log(req.body.number)
    const plan=await Plan.findOne({_id:pid})
    const user=await User.findOne({_id:id})
    const new_balance=user.accountBalnace-plan.price
    // console.log(plan)
    // console.log(user)
    if(user.accountBalnace>=plan.price){
        console.log('This is ' +new_balance)
        const findUser=await User.findOneAndUpdate({_id:id},{
                                    $set:{accountBalnace:new_balance,
                                        'plan.planId':plan._id,'plan.planUpdtae':Date.now(),botClickTime:Date.now()}})
            
        const transaction=await Transaction.create({username:username,transactionType:'balancePlan',amount:plan.price})

        if(user.referral && !user.bonus){
            const bonus=Math.floor(0.14*plan.price);
            const bonusUpdate=await User.findOneAndUpdate({username:user.referral},{$inc:{accountBalnace:bonus}},{new:true})
            const bonusStatus=await User.findOneAndUpdate({_id:id},{bonus:Date.now()})
            
        }
        res.status(StatusCodes.OK).json({msg:`${plan.title} bought Succesfully`})


    }else{
           if(!number){
            throw new customErrorAPI('Enter a valid Number',StatusCodes.BAD_REQUEST)


           }
           if(number.length!=9){
            throw new customErrorAPI('Enter a valid Number of 9 digits',StatusCodes.BAD_REQUEST)

           }
        try {
            // Initiate payment
         
    
            const auth={
                username:process.env.IWOMI_USERNAME,
                password:process.env.IWOMI_PASSWORD
              }
            let apiKey;
            let  apiSecret;
            let type;
            if(number[1]==9){
                type='om'
                 apiKey = process.env.IWOMI_OM_DEPOSIT_API;
                 apiSecret = process.env.IWOMI_OM_DEPOSIT_SECRET;
               }
              else if(number[1]==5 && number[2]==5){
                type='om'
                apiKey = process.env.IWOMI_OM_DEPOSIT_API;
                 apiSecret = process.env.IWOMI_OM_DEPOSIT_SECRET;
              }
              else{
                type='momo'
                 apiKey = process.env.IWOMI_MOMO_DEPOSIT_API;
                 apiSecret = process.env.IWOMI_MOMO_DEPOSIT_SECRET;
        
              }
             
            const accountKey = Buffer.from(apiKey + ':' + apiSecret).toString('base64');
            console.log(type,accountKey )
              const data = {
                  country: 'CM',
                  op_type:'credit',
                  amount: plan.price,
                  external_id: '123456',
                  motif: 'Deposit',
                  tel: `237${number}`,
                  type: type,
          
                };
              
              axios.post('https://www.pay.iwomitechnologies.com/api/iwomipay_prodv1/authenticate',auth,{
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            }
              
              ).then(response=>{
                token=response.data.token
                // console.log("this is the token " + token)
                axios.post('https://www.pay.iwomitechnologies.com/api/iwomipay_prodv1/iwomipay', data, {
                    headers: {
                      'content-type': 'application/json',
                      'accountKey': accountKey,
                      'authorization': `Bearer ${token}`
                    },
                    httpsAgent: new https.Agent({ rejectUnauthorized: false }) // Use this option to bypass SSL certificate verification if needed
                  })
                  .then(response => {
                    // console.log(response.data)
                    
                    const internalID=response.data.internal_id;
                    const pollPaymentStatus= setInterval(()=>{
                        axios.get(`https://www.pay.iwomitechnologies.com/api/iwomipay_prodv1/iwomipayStatus/${internalID}`,{
                            headers: {
                                'content-type': 'application/json',
                                'authorization': `Bearer ${token}`
                              },
                              httpsAgent: new https.Agent({ rejectUnauthorized: false })
                        }).then(async(response)=>{
                         
                            const paymentStatus=response.data.status
                            console.log(`Payment status: ${paymentStatus}`);
                            if(paymentStatus==1){
                                const findUser=await User.findOneAndUpdate({_id:id},{
                                    $set:{
                                        'plan.planId':plan._id,'plan.planUpdtae':Date.now(),botClickTime:Date.now()}})

            
                                const transaction=await Transaction.create({username:username,transactionType:'plan',amount:plan.price,phoneNumber:number})
                                if(user.referral && !user.bonus){
                                    const bonus=Math.floor(0.14*plan.price);
                                    
                                    const bonusUpdate=await User.findOneAndUpdate({username:user.referral},{$inc:{accountBalnace:bonus}},{new:true})
                                    const bonusStatus=await User.findOneAndUpdate({_id:id},{bonus:Date.now()})
                                }
                                 console.log('Bot Bought  successfully');
                                 res.status(200).json({msg:`${plan.title} Bought Successfully`})
                                 clearInterval(pollPaymentStatus);
                            }else if(paymentStatus==100){
                                console.log('Payment unsuccessful');
                                res.status(500).json({error:'Payment unsuccessful'})
                                clearInterval(pollPaymentStatus);
                            }
                            else if(paymentStatus==500){
                                console.log('Payment unsuccessful');
                                res.status(500).json({error:'Payment unsuccessful'})
                                clearInterval(pollPaymentStatus);
                            }
                            else if(paymentStatus==404){
                                console.log('Payment unsuccessful');
                                res.status(500).json({error:'Payment unsuccessful'})
                                clearInterval(pollPaymentStatus);
                            }
                       }).catch(error=>{
                        console.error(error);
                        res.status(500).json({error:'Payment unsuccessful'})
                        clearInterval(pollPaymentStatus);
                       })
        
        
                    },5000)
                    console.log(response.data)
                  })
                  .catch((error) => {
                    console.error(error);
                    res.status(500).json({ error: 'Payment unsuccessful' });
                  });
              }).catch(error=>{
                // res.status(500).json(error)
                console.log(error)
                res.status(500).json({ error: 'Payment unsuccessful' });
              })
          
        } catch (error) {
         console.log(error);
          res.status(500).json({error:'Payment Error'})
            
        }

    }

    
   
        
    
}

const buyPlanflutter=async(req,res)=>{
  console.log('starting to buy plan')
    const {username,id}=req.user
    console.log({msg:'User accesing request',data:req.user})
    //pid plan id from destructured from req.params
    const {pid}=req.params
    console.log(pid)
    const {number}=req.body
    console.log(req.body.number)
    const plan=await Plan.findOne({_id:pid})
    const user=await User.findOne({_id:id})
  if(!number){
    throw new customErrorAPI('Enter a valid Number',StatusCodes.BAD_REQUEST)


   }
   if(number.length!=9){
    throw new customErrorAPI('Enter a valid Number of 9 digits',StatusCodes.BAD_REQUEST)

   }
   try {
    const payload = {
      phone_number: `237${number}`,
      amount: plan.price,
      currency: 'XAF',
      email: 'aiaffiliatedmarketing@gmail.com',
      country: 'CM',
      tx_ref: `deposit by ${id} ${Date.now()}`,
    };

    const depositResponse = await flw.MobileMoney.franco_phone(payload);
    console.log(depositResponse);

    // Set a timeout of 30 seconds
    const timeout = 200 * 1000; // Convert 30 seconds to milliseconds

    // Start polling for transaction verification
    const pollVerification = setInterval(async () => {
      console.log(`paymentStatus: ${depositResponse.data.status}`);
      try {
        const verificationResponse = await flw.Transaction.verify({ id: depositResponse.data.id.toString() });

        if (verificationResponse.data.status === 'successful') {
          // Success! Confirm the customer's payment

          // Update the database with the successful payment
          const customerId = verificationResponse.data.customer.id;
          const amountSettled = verificationResponse.data.amount_settled;
          if(amountSettled==plan.price){
            console.log('Payment successful');
          const findUser=await User.findOneAndUpdate({_id:id},{
            $set:{
                'plan.planId':plan._id,'plan.planUpdtae':Date.now(),botClickTime:Date.now()}})


        const transaction=await Transaction.create({username:username,transactionType:'plan',amount:plan.price,phoneNumber:number})
        if(user.referral && !user.bonus){
            const bonus=Math.floor(0.14*plan.price);
            
            const bonusUpdate=await User.findOneAndUpdate({username:user.referral},{$inc:{accountBalnace:bonus}},{new:true})
            const bonusStatus=await User.findOneAndUpdate({_id:id},{bonus:Date.now()})
        }
          console.log('Plan Bought Successfully');
          clearInterval(pollVerification); // Stop polling

          // Send the response only once
          if (!res.headersSent) {
            return res.status(200).json({ msg: `${plan.title} Bought Successfully` });
          }

          }else{
            if (!res.headersSent) {
              return res.status(500).json({ msg: `insufficient Amount for plan` });
            }
          }
          
        }
      } catch (error) {
        console.error(error);
        clearInterval(pollVerification); // Stop polling

        // Send the response only once
        if (!res.headersSent) {
          return res.status(500).json({ error: 'Deposit Failed' });
        }
      }
    }, 5000); // Poll every 5 seconds

    // Set a timeout to cancel the transaction after 30 seconds
    setTimeout(() => {
      console.log('Transaction timed out');
      clearInterval(pollVerification); // Stop polling
      // Handle the cancellation logic here

      // Send the response only once
      if (!res.headersSent) {
        return res.status(400).json({ error: 'Transaction timed out.' });
      }
    }, timeout);

    console.log('Plan payment initiated. Polling for verification...');
  } catch (error) {
    console.error(error);
    // return res.status(500).json({ error: 'An error occurred while processing the payment.' });

    // Send the response only once
    if (!res.headersSent) {
      return res.status(500).json({ error: 'An error occurred while processing the plan payment.' });
    }
  }
};





module.exports={getPlans,buyPlan,getSinglePlan,buyPlanflutter}