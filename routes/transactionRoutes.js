const express=require('express')
const router=express.Router()
const {deposits,withdrawals,referrals}=require('../controllers/transaction')
const verify=require('../middlewares/verifyEmail')
const authenticate=require('../middlewares/auth')


router.route('/transactiondeposits').get(authenticate,verify,deposits)
router.route('/userreferrals').get(authenticate,verify,referrals)

router.route('/transactionwithdrawals').get(authenticate,verify,withdrawals)

module.exports=router