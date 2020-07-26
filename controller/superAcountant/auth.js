const AllFarmers = require('../../model/farmerModel/auth');
const AllCustomers = require('../../model/customerModel/auth');
const Order = require('../../model/customerModel/order');
const bcrypt = require('bcryptjs');


exports.getAllFarmers = (req, res, next) => {

    const farmer = req.params.farmer;

    AllFarmers.find({role: farmer})
        .then(farmers => {
            if (!farmers) {
                const error = new Error('No farmers available');
                error.statusCode = 402;
                throw error;
            }
            res.status(200).json(farmers);
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}


//get all customers
exports.getAllCustomers = (req, res, next) => {

    AllCustomers.find()
        .then(customers => {
            if (!customers) {
                const error = new Error('No farmers available');
                error.statusCode = 402;
                throw error;
            }
            res.status(200).json(customers);
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

//update farmer status
exports.updateFarmerStatus = (req, res, next) => {
    const farmerStatus = req.body.status;
    const farmerId = req.body.farmerId;

    AllFarmers.updateOne({ _id: farmerId }, { status: farmerStatus })
        .then(response => {
            res.status(200).json(response);
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

//update customer status
exports.updateCustomerStatus = (req, res, next) => {

    const customerStatus = req.body.status;
    const customerId = req.body.customerId;

    AllCustomers.updateOne({ _id: customerId }, { status: customerStatus })
        .then(response => {
            res.status(200).json(response);
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })

}

//change customer password
exports.updateCustomerPassword = (req, res, next) => {

    const customerId = req.params.id;
    const password = req.body.password;
    console.log(customerId,password,',,,,,,,,');

    bcrypt.hash(password, 12)
    .then(hashPass => {
         AllCustomers.updateOne({_id:customerId},{$set:{password:hashPass}})
        .then(response=>{
            res.status(200).json(response);
        });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err);
    })
}

//change farmer password
exports.updateFarmerPassword = (req, res, next) => {

    const farmerId = req.params.id;
    const password = req.body.password;
    console.log(farmerId,password);

    bcrypt.hash(password, 12)
    .then(hashPass => {
         AllFarmers.updateOne({_id:farmerId},{$set:{password:hashPass}})
        .then(response=>{
            res.status(200).json(response);
        });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err);
    })
}

//get all orders transactions
exports.getAllOrders = (req,res,next)=>{
    Order.find()
    .then(response =>{
        res.status(200).json(response)
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err)
    })
}