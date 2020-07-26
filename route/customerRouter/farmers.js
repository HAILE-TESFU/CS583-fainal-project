const express = require('express');


const farmerController = require('../../controller/customerController/farmers');
const farmerProducts = require('../../controller/farmerController/product');


const router = express.Router();

router.get('/farmers/:farmer', farmerController.getAllFarmers);
router.get('/farmer/products/:farmerId', farmerProducts.getAllProducts);



module.exports = router;