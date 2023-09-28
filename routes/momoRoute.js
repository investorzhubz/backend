const express=require('express')
const {flutterDeposit,flutterWithdrawal,flutterwaveDeposit,withdrawWelcomeBonus,flutterwaveWithdrawal,mesombWithdrawal, mesombDeposits}=require('../controllers/momoController')
const authenticate=require('../middlewares/auth')
const router=express.Router()
const verify=require('../middlewares/verifyEmail')


router.route('/deposit').post(authenticate,verify,flutterDeposit)
router.route('/withdraw').post(authenticate,verify,flutterWithdrawal)
// router.route('/flutterdeposit').post(authenticate,verify,flutterwaveDeposit)
// router.route('/flutterwithdraw').post(authenticate,verify,flutterwaveWithdrawal)
router.route('/mesombwithdraw').post(authenticate,verify,mesombWithdrawal)
router.route('/mesombdeposit').post(authenticate,verify,mesombDeposits)
router.route('/withdrawwelcomebonus').post(authenticate,verify,withdrawWelcomeBonus)




module.exports=router