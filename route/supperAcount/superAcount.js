const express = require('express');
const { body } = require('express-validator');


const superController = require('../../controller/superAcountant/auth');


const router = express.Router();

router.get('/farmers/:farmer', superController.getAllFarmers);
router.get('/customers', superController.getAllCustomers);
router.patch('/farmer/status', superController.updateFarmerStatus);
router.patch('/customer/status', superController.updateCustomerStatus);

router.patch('/farmer/password', superController.updateFarmerStatus);
router.patch('/customer/password', superController.updateCustomerStatus);

//get all order transactions
router.get('/orders', superController.getAllOrders);

//reset farmer password
router.patch('/farmer_password/:id', superController.updateFarmerPassword);

//reset farmer password
router.patch('/customer_password/:id', superController.updateCustomerPassword);



module.exports = router;