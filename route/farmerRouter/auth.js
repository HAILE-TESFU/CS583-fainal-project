const express = require('express');
const { body } = require('express-validator');


const Farmer = require('../../model/farmerModel/auth');
const farmerController = require('../../controller/farmerController/auth');


const router = express.Router();



router.put('/signup', [
        body('email').isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req }) => {
            return Farmer.findOne({ email: value })
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
    farmerController.signup);
router.post('/signin', farmerController.login);


module.exports = router;