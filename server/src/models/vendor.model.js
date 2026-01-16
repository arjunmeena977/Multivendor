const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    shopName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

vendorSchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'vendorId'
});

module.exports = mongoose.model('Vendor', vendorSchema);
