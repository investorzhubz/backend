const express=require('express')
const router=express.Router()

const {forgotPassword,resetPassword}=require('../controllers/forgotPassword')

router.route('/passemail').post(forgotPassword)
router.route('/reset/:token').post(resetPassword)


module.exports=router