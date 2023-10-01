const express=require('express')
const {getPlans,buyPlan,getSinglePlan, buyPlanflutter,faphshiBuyPlan}=require('../controllers/planController')
const authenticate=require('../middlewares/auth')
const router=express.Router()
const verify=require('../middlewares/verifyEmail')
const planCheck=require('../middlewares/planCheck')
  

router.route('/plans').get(getPlans)
router.route('/plans/:pid').post(authenticate,verify,planCheck,buyPlan).get(getSinglePlan)
router.route('/flutterplans/:pid').post(authenticate,verify,planCheck,faphshiBuyPlan).get(getSinglePlan)

module.exports=router



