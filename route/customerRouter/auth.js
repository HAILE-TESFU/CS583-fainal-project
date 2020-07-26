const express = require('express');
const { body } = require('express-validator');


const Customer = require('../../model/customerModel/auth');
const customerController = require('../../controller/customerController/auth');


const router = express.Router();



router.put('/signup', [
        body('email').isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req }) => {
            return Customer.findOne({ email: value })
                .then(farmerDoc => {
                    if (farmerDoc) {
                        return Promise.reject('Email adress already exists');
                    }
                })
        }).normalizeEmail(),
        body('password').trim().isLength({ min: 5 }),
        body('firstname').trim().not().isEmpty(),
        body('lastname').trim().not().isEmpty(),
        body('role').trim().not().isEmpty(),
    ],
    customerController.signup);

router.post('/signin', customerController.login);


module.exports = router;