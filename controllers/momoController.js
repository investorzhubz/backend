const Flutterwave=require('flutterwave-node-v3');
const customErrorAPI = require('../customError/customError');
const Transaction=require('../models/transactionModel')
const User=require('../models/authModel');
const axios=require('axios')
const https=require('https')
const { StatusCodes } = require('http-status-codes');
const {PaymentOperation, Signature} =require('@hachther/mesomb') ;
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);




  const flutterDeposit=async(req,res)=>{
    
 let token;
    

    const {username,id}=req.user

    const {amount,number}=req.body
    if(number==''){
        throw new customErrorAPI('Enter a valid MTN or ORANGE number',StatusCodes.BAD_REQUEST)
    }
    if(amount==''){
        throw new customErrorAPI('Enter an amount',StatusCodes.BAD_REQUEST)
    }
    if(amount<500){
        throw new customErrorAPI('Enter an amount of at least 500 XAF',StatusCodes.BAD_REQUEST)
    }

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
          amount: amount,
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
                        const user=await User.findOneAndUpdate({_id:id},{$inc:{accountBalnace:amount}})
                        const transaction=await Transaction.create({username:username,transactionType:'deposit',amount:amount,phoneNumber:number})
                        console.log({msg:"Deposit Succesful"})
                         console.log('Payment successful');
                         res.status(200).json({msg:`Succesfully deposited  ${amount} XAF`})
                         clearInterval(pollPaymentStatus);
                    }else if(paymentStatus==100){
                        console.log('Payment unsuccessful');
                        res.status(500).json({error:'Deposit Attempt Failed'})
                        clearInterval(pollPaymentStatus);
                    }
                    else if(paymentStatus==404){
                      console.log('Payment unsuccessful');
                      res.status(500).json({error:'Deposit Attempt Failed'})
                      clearInterval(pollPaymentStatus);
                  }
                  else if(paymentStatus==500){
                    console.log('Payment unsuccessful');
                    res.status(500).json({error:'Deposit Attempt Failed'})
                    clearInterval(pollPaymentStatus);
                }
               }).catch(error=>{
                console.error(error);
                res.status(500).json({error:'Deposit Attempt Failed'})
                clearInterval(pollPaymentStatus);
               })


            },5000)
            console.log(response.data)
          })
          .catch((error) => {
            console.error(error);
            res.status(500).json({ error: 'Deposit Failed' });
          });
      }).catch(error=>{
        // res.status(500).json(error)
        console.log(error)
        res.status(500).json({ error: 'Deposit Failed' });
      })

   
  
    
};











    const flutterWithdrawal=async(req,res)=>{
        const {id,username}=req.user
        const {amount}=req.body
        const user=await User.findOne({_id:id})
        if(!user){
            throw new customErrorAPI('You are not authorized to access this route',StatusCodes.UNAUTHORIZED)
        }
           console.log(user.accountBalnace)
           if(!amount){
            throw new customErrorAPI('Enter an amount to withdraw',StatusCodes.BAD_REQUEST)
        }
        if(amount<500){
          throw new customErrorAPI('Minimum withrawal amount is 500 FCFA',StatusCodes.BAD_REQUEST)
         }
         let  type;
         let  apiKey;
         let  apiSecret;

           if(user.phoneNumber[1]==9){
            type='om'
             apiKey = process.env.IWOMI_OM_WITHDRAW_API;
             apiSecret = process.env.IWOMI_OM_WITHDRAW_SECRET;
           }
          else if(user.phoneNumber[1]==5 && user.phoneNumber[2]==5){
            type='om'
            apiKey = process.env.IWOMI_OM_WITHDRAW_API;
             apiSecret = process.env.IWOMI_OM_WITHDRAW_SECRET;
          }
          else{
            type='momo'
             apiKey = process.env.IWOMI_MOMO_WITHDRAW_API;
             apiSecret = process.env.IWOMI_MOMO_WITHDRAW_SECRET;

          }

           console.log(type,apiKey,apiSecret)

        if(amount>user.accountBalnace){
            throw new customErrorAPI('Insufficient Balance',StatusCodes.BAD_REQUEST)
        }else{
      const accountKey = Buffer.from(apiKey + ':' + apiSecret).toString('base64');
            const auth={
                username:process.env.IWOMI_USERNAME,
                password:process.env.IWOMI_PASSWORD
              }
              console.log('This is the auth '+ auth.password)
            try {
                const data = {
                    country: 'CM',
                    op_type:'debit',
                    amount: amount,
                    external_id: '121345567645563456',
                    motif: 'Withdrawal',
                    tel: `237${user.phoneNumber}`,
                    type: type,
            
                  };
        axios.post('https://www.pay.iwomitechnologies.com/api/iwomipay_prodv1/authenticate',auth,{
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
    }
      
      ).then(response=>{
        token=response.data.token
        console.log(response.data)
        console.log("this is the token " + token)
        axios.post('https://www.pay.iwomitechnologies.com/api/iwomipay_prodv1/iwomipay', data, {
            headers: {
              'content-type': 'application/json',
              'accountKey': accountKey,
              'authorization': `Bearer ${token}`
            },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }) // Use this option to bypass SSL certificate verification if needed
          })
          .then(async(response) => {
            // Process the response
            console.log(response.data);
            if(response.data.status==400||response.data.status==500||response.data.status==409){
                throw new customErrorAPI('Withdrawal Failed',StatusCodes.BAD_REQUEST)

            }
            const user=await User.findOneAndUpdate({_id:id},{$inc:{accountBalnace:-amount}})
            const transaction=await Transaction.create({username:username,transactionType:'withdrawal',amount:amount,phoneNumber:user.phoneNumber})
            res.status(200).json({msg:'withdrawal successful'});
          })
          .catch(error => {
            console.error(error);
            res.status(500).json({ error: "Withdrawal Failed" });
          });
      }).catch(error=>{
        console.log(error);
        res.status(500).json({error:'Withdrawal Failed'})
      })

    } catch (error) {
                console.log(error)
                res.status(500).json({error:'Withdrawal Failed'})
                
               }
        }
      
    }
    const flutterwaveDeposit = async (req, res) => {
      const { username, id } = req.user;
      const { amount, number } = req.body;
    
      if (!number) {
        throw new customErrorAPI('Enter a valid MTN or ORANGE number', StatusCodes.BAD_REQUEST);
      }
    
      if (!amount) {
        throw new customErrorAPI('Enter an amount', StatusCodes.BAD_REQUEST);
      }
      if(amount<500){
        throw new customErrorAPI('Enter an amount of at least 500 XAF',StatusCodes.BAD_REQUEST)
    }
    
      try {
        const payload = {
          phone_number: `237${number}`,
          amount: amount,
          currency: 'XAF',
          email: 'aiaffiliatedmarketing@gmail.com',
          country: 'CM',
          tx_ref: `deposit by ${id} ${Date.now()}`,
        };
    
        const depositResponse = await flw.MobileMoney.franco_phone(payload);
        console.log(depositResponse);
    
        // Set a timeout of 200 seconds
        const timeout = 200 * 1000; // Convert 200 seconds to milliseconds
    
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
    
              // Assuming you have a database connection and a customers collection
              // Update the customer's account balance
              console.log('Payment successful');
              await User.findOneAndUpdate({ _id: id }, { $inc: { accountBalnace: amountSettled } });
              const transaction = await Transaction.create({
                username: username,
                transactionType: 'deposit',
                amount: amountSettled,
                phoneNumber: number,
              });
              console.log('Deposit Successful');
              clearInterval(pollVerification); // Stop polling
    
              // Send the response only once
              if (!res.headersSent) {
                return res.status(200).json({ msg: `Successfully deposited ${amountSettled} XAF` });
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
    
        console.log('Payment initiated. Polling for verification...');
      } catch (error) {
        console.error(error);
        // return res.status(500).json({ error: 'An error occurred while processing the payment.' });
    
        // Send the response only once
        if (!res.headersSent) {
          return res.status(500).json({ error: 'An error occurred while processing the payment.' });
        }
      }
    };
    

    const flutterwaveWithdrawal=async(req,res)=>{
      const {id,username}=req.user
        const {amount,momoname}=req.body
        console.log(req.body)
        const user=await User.findOne({_id:id})
        if(!user){
            throw new customErrorAPI('You are not authorized to access this route',StatusCodes.UNAUTHORIZED)
        }
           console.log(user.accountBalnace)
           if(!amount){
            throw new customErrorAPI('Enter an amount to withdraw',StatusCodes.BAD_REQUEST)
        }
        if(amount<500){
          throw new customErrorAPI('Minimum withrawal amount is 500 FCFA',StatusCodes.BAD_REQUEST)
         }
        if(amount>user.accountBalnace){
          throw new customErrorAPI('Insufficient Balance',StatusCodes.BAD_REQUEST)
      }else{
      const details = {
        account_bank: "FMM",
        account_number: `237${user.phoneNumber}`,
        amount: amount,
        currency: "XAF",
        beneficiary_name:momoname,
      };
      try{
        flw.Transfer.initiate(details).then(async(response)=>{
          if(response.message=='This request cannot be processed. Please contact your account administrator'){
            throw new customErrorAPI("Withdrawal Failed. Try again",StatusCodes.BAD_GATEWAY)
          }
          const user=await User.findOneAndUpdate({_id:id},{$inc:{accountBalnace:-amount}})
          const transaction=await Transaction.create({username:username,transactionType:'withdrawal',amount:amount,phoneNumber:user.phoneNumber})
          
          res.status(StatusCodes.OK).json({msg:response})
        }).catch(err=>{
          console.log(err)
          if(!res.headersSent){
            console.log(err)
            res.status(500).json({error:"Withdrawal Failed. Try again"})

          }
         
        })
      

      }catch(error){
        
        res.status(500).josn({error:"Withdrawal Failed"})

      }


    }




    }   

    const mesombDeposits=async(req,res)=>{
      const baseUrl = 'https://live.fapshi.com'
      const headers =  {
        apiuser: process.env.FAPSHI_USER,
        apikey: process.env.FAPSHI_APIKEY
    }

      const { username, id } = req.user;
      const { amount, number } = req.body;
      console.log(amount)
      const timout=10*1000;
    
      if (!number) {
        throw new customErrorAPI('Enter a valid MTN or ORANGE number', StatusCodes.BAD_REQUEST);
      }
    
      if (!amount) {
        throw new customErrorAPI('Enter an amount', StatusCodes.BAD_REQUEST);
      }
      if(amount<500){
        throw new customErrorAPI('Enter an amount of at least 500 XAF',StatusCodes.BAD_REQUEST)
    }
      const  data = {
        "amount":amount ,
        "phone": `${number}` ,
    }

  const config = {
    method: 'post',
    url: baseUrl + '/direct-pay',
    headers: headers,
    data: data,
  };

  axios(config)
    .then(async (response) => {

      const paymentMsg=response.data.message
      if(paymentMsg==='Accepted'){
        const paymentStatusConfig = {
          method: 'get',
          url: baseUrl + '/payment-status/' + response.data.transId,
          headers: headers,
        };

        const pollPaymentStatus=setInterval(()=>{
          
          axios(paymentStatusConfig).then( async(response)=>{
            console.log(`Payment Status ${response.data.status}`)
            if(response.data.status==="SUCCESSFUL"){
              var count=0;

              if(count<1){
                console.log(`This is the data amount ${amount}`)
              const user=await User.findOneAndUpdate({_id:id},{$inc:{accountBalnace:parseInt(amount)}})
              const transaction=await Transaction.create({username:username,transactionType:'deposit',amount:amount,phoneNumber:number})
                        console.log({msg:"Deposit Succesful"})
                         console.log('Payment successful');
                        
                         count=count+1
                         if(!res.headersSent){
                          res.status(StatusCodes.OK).json({msg:"Deposit Successful"})
                         clearInterval(pollPaymentStatus);
                         }
              }else{
                console.log("Deposit Successfull")
              }


            } else if( response.data.status === 'EXPIRED'){
              console.log(`Failed with status ${response.data.status}`)

              if(!res.headersSent){
                
                res.status(500).json({error:'Deposit Attempt Failed'})
                clearInterval(pollPaymentStatus);
              }


            }else if( response.data.status === 'FAILED'){
              console.log(`Failed with status ${response.data.status}`)

              if(!res.headersSent){
                
                res.status(500).json({error:'Deposit Attempt Failed'})
                clearInterval(pollPaymentStatus);
              }


            }


          }).catch((error)=>{
            console.log(error)
            if(!res.headersSent){
              res.status(500).json({error:'Deposit Attempt Failed'})
              clearInterval(pollPaymentStatus);

            }
          })


        },5000)
        
        



      }

      // if(!res.headersSent){
      //   console.lo
      //   res.status(500).json({error:'Deposit Attempt Failed'})
      //   clearInterval(pollPaymentStatus);

      // }
      
      


    }).catch(error=>{
      console.log(error)
      if(!res.headersSent){
        res.status(500).json({error:'Deposit Attempt Failed'})
      }
    })


    }

  

//     const mesombWithdrawal=async(req,res)=>{
//       // try {
//         const { username, id } = req.user;
//       const { amount } = req.body;
//       const user=await User.findOne({_id:id})
//       if(!user){
//         throw new customErrorAPI('You are not authorized to access this route',StatusCodes.UNAUTHORIZED)
//     }
//       if (!amount) {
//         throw new customErrorAPI('Enter an amount', StatusCodes.BAD_REQUEST);
//       }
//       if(amount<500){
//         throw new customErrorAPI('Enter an amount of at least 500 XAF',StatusCodes.BAD_REQUEST)
//     }
//     if(amount>user.accountBalnace){
//       throw new customErrorAPI('Insufficient Balance',StatusCodes.BAD_REQUEST)
//   }
//      let type;
//     if(user.phoneNumber[1]==9){
//       type='ORANGE'
       
//      }
//     else if(user.phoneNumber[1]==5 && user.phoneNumber[2]==5){
//       type='ORANGE'
//     }
//     else{
//       type='MTN'
//     }

// const payment = new PaymentOperation({applicationKey:process.env.M_APPLICATIONKEY, accessKey: process.env.M_ACCESSKEY, secretKey: process.env.M_SECRETKEY});
// const response = await payment.makeDeposit(amount, type,user.phoneNumber, new Date(), Signature.nonceGenerator());
// console.log(response.isOperationSuccess());
// console.log(response.isTransactionSuccess());

// if(response.isOperationSuccess()&&response.isTransactionSuccess()){
//   const user=await User.findOneAndUpdate({_id:id},{$inc:{accountBalnace:-amount}})
//           const transaction=await Transaction.create({username:username,transactionType:'withdrawal',amount:amount,phoneNumber:user.phoneNumber})
          
//           res.status(StatusCodes.OK).json({msg:"Withdrawal Successful"})

// }else{
//   res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error:"Withdrawal Failed"})
// }
        
//       // } catch (error) {
//       //   console.log(error)
//       //   if(!res.headersSent){
//       //     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error:"Withdrawal jk Failed"})

//       //   }
        
//       // }
  
//     }
const mesombWithdrawal = async (req, res) => {
  try {
    const { username, id } = req.user;
    const { amount } = req.body;

    // Fetch the user's information from a secure source (e.g., JWT claims).
    const user = await User.findOne({ _id: id });

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'You are not authorized to access this route' });
    }

    if (!amount || isNaN(amount) || amount < 500) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Enter a valid amount of at least 500 XAF' });
    }

    if (amount > user.accountBalnace) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Insufficient Balance' });
    }



    let type;

    if (user.phoneNumber[1] === '9') {
      type = 'ORANGE';
    } else if (user.phoneNumber[1] === '5' && user.phoneNumber[2] === '5') {
      type = 'ORANGE';
    } else {
      type = 'MTN';
    }

    // Use environment variables or a secure configuration management system for sensitive keys.
    const payment = new PaymentOperation({
      applicationKey: process.env.M_APPLICATIONKEY,
      accessKey: process.env.M_ACCESSKEY,
      secretKey: process.env.M_SECRETKEY,
    });

    const response = await payment.makeDeposit(amount, type, user.phoneNumber, new Date(), Signature.nonceGenerator());

    if (response.isOperationSuccess() && response.isTransactionSuccess()) {
      // Deduct the withdrawal amount from the user's account balance within a secure database transaction.
      const updatedUser = await User.findOneAndUpdate({ _id: id }, { $inc: { accountBalnace: -amount } });

      // Log the withdrawal transaction securely.
      const transaction = await Transaction.create({
        username: username,
        transactionType: 'withdrawal',
        amount: amount,
        phoneNumber: user.phoneNumber,
      });

      return res.status(StatusCodes.OK).json({ msg: 'Withdrawal Successful' });
    } else {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Withdrawal Failed' });
    }
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Withdrawal Failed' });
    }
  }
};

    const withdrawWelcomeBonus=async(req,res)=>{
      // try {
        const { username, id } = req.user;
        
      const user=await User.findOne({_id:id})

      if(!user){
        throw new customErrorAPI('You are not authorized to access this route',StatusCodes.UNAUTHORIZED)
    }
      const hasUserreffered=await User.find({referral:username})
      console.log(hasUserreffered)
     
    if(hasUserreffered.length==0){
      throw new customErrorAPI('You must refer a new user to withdraw welcome bonus',StatusCodes.FORBIDDEN)

    }
    if(user.welcomeBonus==0){
      throw new customErrorAPI('You have withdrawn your bonus already',StatusCodes.UNAUTHORIZED)
    }
     
     let type;
    if(user.phoneNumber[1]==9){
      type='ORANGE'
       
     }
    else if(user.phoneNumber[1]==5 && user.phoneNumber[2]==5){
      type='ORANGE'
    }
    else{
      type='MTN'
    }

const payment = new PaymentOperation({applicationKey:process.env.M_APPLICATIONKEY, accessKey: process.env.M_ACCESSKEY, secretKey: process.env.M_SECRETKEY});
const response = await payment.makeDeposit(user.welcomeBonus, type,user.phoneNumber, new Date(), Signature.nonceGenerator());
console.log(response.isOperationSuccess());
console.log(response.isTransactionSuccess());

if(response.isOperationSuccess()&&response.isTransactionSuccess()){
  const user=await User.findOneAndUpdate({_id:id},{$set:{welcomeBonus:0}})
          const transaction=await Transaction.create({username:username,transactionType:'welcome bonus withdrawal',amount:user.welcomeBonus,phoneNumber:user.phoneNumber})
          
          res.status(StatusCodes.OK).json({msg:"Withdrawal Successful"})

}else{
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error:"Withdrawal Failed"})
}
        
      // } catch (error) {
      //   console.log(error)
      //   if(!res.headersSent){
      //     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error:"Withdrawal jk Failed"})

      //   }
        
      // }
  
    }
    
    module.exports={flutterDeposit,flutterWithdrawal,flutterwaveDeposit,flutterwaveWithdrawal,mesombWithdrawal,mesombDeposits,withdrawWelcomeBonus}