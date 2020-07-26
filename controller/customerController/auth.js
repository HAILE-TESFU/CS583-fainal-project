const Customer = require('../../model/customerModel/auth');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('farmer validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;
    const userStatus = "active";

    bcrypt.hash(password, 12)
        .then(hashPass => {
            const customer = new Customer({
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: hashPass,
                role: role,
                status: userStatus
            });

            return customer.save();
        })
        .then(result => {
            res.status(201).json({
                message: "customer created",
                farmerId: result._id,
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err);
        })
}

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    //console.log(email, password)
    let loadedCustomer;

    Customer.findOne({ email: email })
        .then(result => {
            if (!result) {
                const error = new Error('Email you have entered is not found');
                error.statusCode = 401;
                throw error;
            }
            if(result.status === "inactive"){
                const error = new Error('Email is deactivated');
                error.statusCode = 401;
                throw error;
            }
            loadedCustomer = result;
            return bcrypt.compare(password, result.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('Wrong password');
                error.statusCode = 401;
                throw error;
            };

            const token = jwt.sign({
                    email: loadedCustomer.email,
                    customerId: loadedCustomer._id.toString(),
                },
                "this is my final project", { expiresIn: "1hr" }
            );

            res.status(200).json({
                token: token,
                customerId: loadedCustomer._id.toString()
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}