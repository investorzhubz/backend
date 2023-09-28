const multer=require('multer')


try {
    const storage=multer.diskStorage({
        destination:(req,file,cb)=>{
            const productImage=req.file
console.log('The product image is ' + productImage)
            cb(null,'uploads/')
        },
        filename: (req,file,cb)=>{
            const newFilename = `${Date.now()}_${file.originalname}`;
            cb(null, newFilename);
        }
     })
     const upload=multer({storage:storage}).single('productImage')
    
     module.exports=upload
} catch (error) {
    console.log(error)
}
 