const express=require('express')
const {botClick,activateBot}=require('../controllers/botController')
const authenticate=require('../middlewares/auth')
const router=express.Router()
const verify=require('../middlewares/verifyEmail')
const planCheck=require('../middlewares/planCheck')

router.route('/reward').get(authenticate,verify,planCheck,botClick)
router.route('/activate').get(authenticate,verify,planCheck,activateBot)

module.exports=router