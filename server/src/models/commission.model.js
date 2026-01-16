const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    orderItemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    commissionRate: Number,
    commissionAmount: Number,
    vendorEarning: Number
}, { timestamps: true });

module.exports = mongoose.model('Commission', commissionSchema);
