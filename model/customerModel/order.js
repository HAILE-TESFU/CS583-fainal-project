const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    customerId: {
        type: Schema.Types.ObjectId,
        ref: "customers",
        required: true
    },
    farmerId: {
        type: Schema.Types.ObjectId,
        ref: "farmers",
        required: true
    },
    status: {
        type: String,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    orders: [{
        _id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            required: true
        },
        imageUrl: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        }
    }],
}, { timestamps: true });


module.exports = mongoose.model('orders', orderSchema);