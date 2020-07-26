const express = require('express');
const { body } = require('express-validator');

const auth = require('../../middleware/check-auth');



const Farmer = require('../../model/farmerModel/auth');
const Product = require('../../model/farmerModel/product');
const productController = require('../../controller/farmerController/product');


const router = express.Router();



router.post('/products', [
        body('name').trim().not().isEmpty(),
        body('description').isLength({ min: 10 }),
        body('price').trim().not().isEmpty(),
    ],
    productController.createProduct);

router.get('/products/:farmerId', productController.getAllProducts);

router.put('/products/:prodId/:farmerId',auth, [
        body('name').trim().not().isEmpty(),
        body('price').trim().not().isEmpty(),
        body('description').isLength({ min: 10 }),
    ],
    productController.updateProduct);

router.delete('/products/:prodId/:farmerId',auth,productController.deleteProduct);


module.exports = router;