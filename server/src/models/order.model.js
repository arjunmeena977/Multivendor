const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PLACED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        default: 'PLACED'
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor'
        },
        qty: Number,
        unitPrice: Number,
        lineTotal: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
