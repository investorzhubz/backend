const express=require('express')
const router=express.Router()
const authenticate=require('../middlewares/auth')
const {getAllProduct,getAllUserProduct,getSingleProduct,createProduct,updateProduct,deleteProduct,buyProduct}=require('../controllers/productController')
const upload=require('../middlewares/upload')
const verify=require('../middlewares/verifyEmail')
  



router.route('/products').get(getAllProduct).post(authenticate,upload,createProduct)
router.route('/products/:id').get(authenticate,verify,getSingleProduct).patch(authenticate,verify,updateProduct).delete(authenticate,verify,deleteProduct)
router.route('/products/user').get(authenticate,verify,getAllUserProduct)
router.route('/buy/:pid').get(authenticate,verify,buyProduct)

module.exports=router
