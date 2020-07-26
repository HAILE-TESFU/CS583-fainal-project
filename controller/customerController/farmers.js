const Products = require('../../model/farmerModel/product');
const Farmers = require('../../model/farmerModel/auth');


//get all the registered farmers
exports.getAllFarmers = (req, res, next) => {
    const farmer = req.params.farmer;

    Farmers.find({role:farmer})
        .then(result => {
            //console.log('farmers')
            res.status(200).json(result)
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}