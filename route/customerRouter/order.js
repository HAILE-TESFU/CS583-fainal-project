const express = require('express');


const customerOrder = require('../../controller/customerController/order');

const router = express.Router();

//add to cart
router.post('/cart/:prodId/:customerId/:farmerId', customerOrder.addToCart);

router.get('/cart/:customerId', customerOrder.getAllShoppingCart);

//add to order data base
router.post('/orders', customerOrder.addOrder);

//get from order data base for farmers
router.get('/orders/:farmerId', customerOrder.getAllOrders);

//update status of order to ready
router.patch('/orders-ready', customerOrder.updateToReady);

//update status of order to complete
router.patch('/orders-complete', customerOrder.updateToComplete);

//get all orders of a customer
router.get('/customer/order/:customerId', customerOrder.getAllCustomersOrder);

//for rating of afarmer
router.post('/rating/:farmerId/:rating', customerOrder.changeRatingFarmer);

//deleting from cart
router.delete('/cart/items/:prodId/:customerId',customerOrder.deleteFromCart);

//view detail of orders
router.get('/order/details/:orderId',customerOrder.viewDetails);



module.exports = router;