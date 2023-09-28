const express=require('express')
const {login,register,getUser,verifyjwt}=require('../controllers/authController')
const verify=require('../middlewares/verifyEmail')
const {verifyEmail,sendVerification}=require('../controllers/verifyEmail')
const authenticate=require('../middlewares/auth')
const planCheck=require('../middlewares/planCheck')

const router=express.Router()



router.route('/register').post(register)
// router.route('/register').post(referral)
router.route('/login').post(login)
router.route('/user').get(authenticate,verify,planCheck,getUser)
router.route('/verifyjwt').get(verifyjwt)
router.route('/verify/:token').get(authenticate,verifyEmail)
router.route('/sendverify').get(authenticate,sendVerification)



module.exports=router