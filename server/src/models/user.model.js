const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['ADMIN', 'VENDOR', 'CUSTOMER'],
        default: 'CUSTOMER'
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.virtual('vendor', {
    ref: 'Vendor',
    localField: '_id',
    foreignField: 'userId',
    justOne: true
});

module.exports = mongoose.model('User', userSchema);
