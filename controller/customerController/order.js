const Order = require("../../model/customerModel/order");
const Products = require("../../model/farmerModel/product");
const Customer = require("../../model/customerModel/auth");
const Farmer = require('../../model/farmerModel/auth');
const nodeMailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');


//socket io file
const io = require('../../config/socket');


const transport = nodeMailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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',
    }
}))

exports.addToCart = (req, res, next) => {
    const prodId = req.params.prodId;
    const customerId = req.params.customerId;
    const farmerId = req.params.farmerId;
    let product;

    Products.findById(prodId)
        .then((result) => {
            if (!result) {
                const error = new Error("Product not found");
                error.statusCode = 403;
                throw error;
            }
            product = result;
            result.quantity = result.quantity -1
            if(result.quantity === 0 || result.quantity < 0){
               return Products.findByIdAndRemove(prodId);
            }
            //console.log(product.creator, farmerId);
            //console.log(product);
            return  result.save();
        })
        .then(response=>{
            return Customer.findById(customerId);
        })
        .then((customer) => {
            if (!customer) {
                const error = new Error("Customer not found");
                error.statusCode = 403;
                throw error;
            }
            const filteredProduct = customer.cart.items.filter(item =>item.farmerId === farmerId);
            //console.log(filteredProduct)
            // customer.cart.items = filteredProduct;
            let productFound = filteredProduct.find(
                (item) => item._id == product._id
                
            );
            if (productFound) {
                productFound.quantity += 1;
                productFound.totalPriceOneItem += productFound.price;
                const itemIndex = filteredProduct.findIndex(
                    (item) => item._id === productFound._id
                );
                filteredProduct[itemIndex] = productFound;
            } else {
                const newItem = {
                    _id: product._id,
                    name: product.name,
                    imageUrl: product.imageUrl,
                    price: product.price,
                    farmerId: product.creator,
                    quantity: 1,
                    description: product.description,
                    totalPriceOneItem: product.price,
                };
                console.log(newItem,"=====")
                filteredProduct.push(newItem);
            }
            customer.cart.items = filteredProduct;
            customer.cart.totalPrice = 0;
            for (let item of customer.cart.items) {
                customer.cart.totalPrice += item.totalPriceOneItem;
            }
            //console.log(customer.cart.totalPrice);
            return customer.save();
        })
        .then((result) => {
            // console.log('cart', result);
            res.status(200).json({
                message: "Products fetched succesfully",
                product: result.cart,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

//get the shopping cart

exports.getAllShoppingCart = (req, res, next) => {
    const customerId = req.params.customerId;
    console.log(customerId)

    Customer.findById(customerId)
        .then((customer) => {
            if (!customer) {
                const error = new Error("Customer not found");
                error.statusCode = 403;
                throw error;
            }
            return customer.cart;
        })
        .then((cart) => {
            res.status(200).json(cart);
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

//add order
exports.addOrder = (req, res, next) => {
    const newOrder = new Order({
        customerId: req.body.customerId,
        farmerId: req.body.farmerId,
        status: req.body.status,
        totalPrice: req.body.totalPrice,
        orders: req.body.orders,
    });

    //notification
    transport.sendMail({
        from: "hailewtesfu@gmail.com",
        to: "weldemariamhaile@gmail.com",
        //to: "hailewtesfu@gmail.com",
        subject: "Your Order" ,
        text: "Yourorder is ready at: "+ new Date() + " "+newOrder
    })
    //console.log(newOrder,"00000000000")
    newOrder.save()
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
};

//get from order database for farmers
exports.getAllOrders = (req, res, next) => {
    const farmerId = req.params.farmerId;
    Order.find({ farmerId: farmerId })
        .then(response => {
            console.log(response,"...")
            if (!response) {
                const error = new Error("order not found");
                error.statusCode = 403;
                throw error;
            }

            res.status(200).json(response);

        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

//update to ready status
exports.updateToReady = (req, res, next) => {
        const orderId = req.body.id;
        const status = req.body.status;

        Order.updateOne({ _id: orderId }, { $set: { status: status } })
            .then(response => {
                //console.log(response)
                transport.sendMail({
                    from: "hailewtesfu@gmail.com",
                    to: "weldemariamhaile@gmail.com",
                    subject: "Your Order" ,
                    text: "Yourorder is ready at: "+ new Date()
                })
                res.status(200).json({
                    message: "status updated"
                });
            }).catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
            })
    }
    //update to complete
exports.updateToComplete = (req, res, next) => {
    const orderId = req.body.id;
    const status = req.body.status;
    const farmerId = req.body.farmerId;
    //console.log(farmerId,"complete")

    io.getIO().emit('rating',{action: 'addRating', farmerId: farmerId})

    Order.updateOne({ _id: orderId }, { $set: { status: status } })
        .then(response => {
            res.status(200).json({
                message: "status updated"
            })
        })
}

//get all orders for a customer

exports.getAllCustomersOrder = (req,res,next) =>{
    const customerId = req.params.customerId;

    console.log(customerId,"===")

    Order.find({customerId:customerId})
    .then(response =>{
        //console.log(response);
        res.status(200).json(response)
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}

//change rating of farmer
exports.changeRatingFarmer = (req,res, next)=>{
    const farmerId = req.params.farmerId;
    const  rating = +req.params.rating;

    let farmer="";
    console.log(farmerId, rating,"fff")

    Farmer.findOne({_id:farmerId})
    .then(response =>{
        farmer = response;
        const newRating = farmer.rating + rating;
       Farmer.updateOne({_id: farmerId},{$set:{rating:newRating}})
        .then(result =>{
            res.status(200).json(result);
        })
    })
    //Farmer.update({_id:farmerId},{rating})
}

//delete from cart
exports.deleteFromCart = (req,res,next)=>{
    const prodId = req.params.prodId;
    const customerId = req.params.customerId;
    console.log(prodId, customerId, 'kkkkkkk')

    Customer.findById(customerId)
    .then(customer =>{
        const productIndex = customer.cart.items.findIndex(item => item._id === prodId);
        const productOrdered =customer.cart.items.find(item => item._id === prodId);
        productOrdered.quantity= productOrdered.quantity - 1;
         if(productOrdered.quantity === 0 || productOrdered.quantity < 0){
            const updatedCart = customer.cart.items.filter(item => item._id !== prodId);
            customer.cart.items = updatedCart; 
            customer.cart.totalPrice = customer.cart.totalPrice - productOrdered.price;    
            return customer.save();
         }else {
             customer.cart.items[productIndex] = productOrdered;
             customer.cart.totalPrice = customer.cart.totalPrice - productOrdered.price;    
             return customer.save();
         }
    })
    .then(response=>{
        Products.findById(prodId)
        .then(response=>{
            response.quantity= response.quantity + 1;
            return response.save();
        })
    })
    .catch(err =>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}

//view order Details
exports.viewDetails = (req,res,next)=>{
    const orderId = req.params.orderId;

    Order.findById(orderId)
    .then(response =>{
        const orders = response.orders;
        //console.log(orders,"orders");

        res.status(200).json(orders);
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}