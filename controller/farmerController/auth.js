const Farmer = require('../../model/farmerModel/auth');
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
    const farmerStatus = "active";
    const rating=5;

    bcrypt.hash(password, 12)
        .then(hashPass => {
            const farmer = new Farmer({
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: hashPass,
                role: role,
                status: farmerStatus,
                rating: rating
            });

            return farmer.save();
        })
        .then(result => {
            res.status(201).json({
                message: "farmer created",
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
    let loadedFarmer;

    Farmer.findOne({ email: email })
        .then(result => {
            if (!result) {
                const error = new Error('Email you have entered is not found');
                err.statusCode = 401;
                throw error;
            }
            if(result.status === 'inactive'){
                const error = new Error('Email is deactivated by Super hero');
                error.statusCode = 401;
                throw error
            }
            loadedFarmer = result;
            return bcrypt.compare(password, result.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('Wrong password');
                error.statusCode = 401;
                throw error;
            };

            const token = jwt.sign({
                    email: loadedFarmer.email,
                    farmerId: loadedFarmer._id.toString(),
                },
                "this is my final project", { expiresIn: "1hr" }
            );

            res.status(200).json({
                token: token,
                farmerId: loadedFarmer._id.toString(),
                email: loadedFarmer.email,
                expiresIn: "1hr",
                role: loadedFarmer.role
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}