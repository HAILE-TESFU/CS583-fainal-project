const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const customerSchema = new Schema({
    firstname: {
        type: String,
        require: true,
    },
    lastname: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            _id: String,
            name: String,
            imageUrl: String,
            price: Number,
            quantity: Number,
            description: String,
            totalPriceOneItem: Number,
            farmerId: String
        }],
        totalPrice: Number,
    },
});

module.exports = mongoose.model("customer", customerSchema);