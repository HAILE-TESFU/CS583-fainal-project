const Product = require("../../model/farmerModel/product");
const Farmer = require("../../model/farmerModel/auth");


const uploadedImage = require('../../middleware/google-cloud-storage')




const { validationResult } = require("express-validator");

//create the Product farmer
exports.createProduct = async(req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error("The entered data is not valid");
        error.statusCode = 422;
        throw error;
    }

    if(!req.file){
        const error= new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    try{
        const myFile = req.file;
        const imageURL = await uploadedImage(myFile);
       
        const imageUrl = imageURL;
        const name = req.body.name;
        const price = +req.body.price;
        const quantity = +req.body.quantity;
        const description = req.body.description;
        const farmerId = req.body.farmerId;
        let creator;
    
        Product.findOne({ name: name, creator: farmerId })
            .then(response => {
                if (response) {
                    const updatedQuantity = response.quantity + quantity;
                    const updatedPrice = price;
                    const updatedDescription = description;
                    const updatedImageUrl = imageUrl
                    Product.updateOne(
                        { name: name, creator: farmerId }, 
                        { $set: { 
                            quantity: updatedQuantity, 
                            price: updatedPrice, 
                            description: updatedDescription,
                            imageUrl: updatedImageUrl
                         } })
                        .then(response => {
                            res.status(200).json(response);
                        })
                } else {
                    const product = new Product({
                        name: name,
                        price: price,
                        imageUrl: imageUrl,
                        quantity: quantity,
                        description: description,
                        creator: req.body.farmerId,
                    });
    
                    product
                        .save()
                        .then((result) => {
                            return Farmer.findById(req.body.farmerId);
                        })
                        .then((farmer) => {
                            // console.log(farmer);
                            creator = farmer;
                            farmer.products.push(product);
                            return farmer.save();
                        })
                        .then((result) => {
                            res.status(201).json({
                                message: "Product created Successfully",
                                product: product,
                                creator: { _id: creator._id, name: creator.name },
                            });
                        })
                        .catch((err) => {
                            if (!err.statusCode) {
                                err.statusCode = 500;
                            }
                            next(err);
                        });
    
                }
            })
    }
    catch(error){
        next(error)
    }
};

//get all products of the login farmer

exports.getAllProducts = (req, res, next) => {
    const farmerId = req.params.farmerId;

    Product.find({ creator: farmerId })
        .then(products => {
           // console.log(products,"ppppp")
            res.status(200).json(products)
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

//delete a product

exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.prodId;
    const farmerId = req.params.farmerId;
    // console.log(prodId, " ", farmerId);

    Product.findById(prodId)
        .then(product => {
            if (!product) {
                const error = new Error('Could not find product');
                error.statusCode = 403;
                throw error;
            }

            if (product.creator.toString() !== farmerId) {
                const error = new Error('Could not find product');
                error.statusCode = 403;
                throw error;
            }
            return Product.findByIdAndRemove(prodId);
        })
        .then(product => {
            return Farmer.findById(farmerId);
        })
        .then(farmer => {
            farmer.products.pull(prodId);
            return farmer.save();
        })
        .then(result => {
            res.status(200).json({ message: "Deleted post" });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

//update product

exports.updateProduct = async(req, res, next) => {
    const prodId = req.params.prodId;
    const farmerId = req.params.farmerId;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('entered Product is invalid');
        error.statusCode = 422;
        throw error;
    }
  
     try{
        const myFile = req.file;
        const imageURL = await uploadedImage(myFile);

        const name = req.body.name;
        const price = +req.body.price;
        const quantity= +req.body.quantity
        const description = req.body.description;
        const imageUrl =  imageURL;
    
        Product.findById(prodId)
            .then(product => {
                if (!product) {
                    const error = new Error('product nof found');
                    error.statusCode = 404;
                    throw error;
                }
                if (product.creator.toString() !== farmerId) {
                    const error = new Error('not authorized');
                    error.statusCode = 403;
                    throw error;
                }
    
                product.name = name;
                product.price = price;
                product.imageUrl = imageUrl;
                product.quantity = quantity;
                product.description = description;
    
                return product.save();
            })
            .then(result => {
                res.status(200).json({ message: "Product updated", product: result })
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
            })
     }catch(e){
         next(e)
     }
}