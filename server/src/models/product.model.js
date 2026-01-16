const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    price: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        get: (v) => v ? parseFloat(v.toString()) : v
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    isVisible: {
        type: Boolean,
        default: false
    }
}, { timestamps: true, toJSON: { getters: true, virtuals: true }, toObject: { getters: true, virtuals: true } });

module.exports = mongoose.model('Product', productSchema);
