const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'PAID'],
        default: 'PENDING'
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    paidAt: Date
});

module.exports = mongoose.model('Settlement', settlementSchema);
