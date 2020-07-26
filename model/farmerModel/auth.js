const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const farmerSchema = new Schema({
    firstname: {
        type: String,
        require: true
    },
    lastname: {
        type: String,
        require: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    rating: {
       type: Number,
       required: true,
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: "products"
    }]
})

module.exports = mongoose.model('farmers', farmerSchema);