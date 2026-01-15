const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a job description']
    },
    origin: {
        type: String,
        required: [true, 'Please add an origin location']
    },
    destination: {
        type: String,
        required: [true, 'Please add a destination location']
    },
    budget: {
        type: Number
    },
    pickupDate: {
        type: Date,
        required: [true, 'Please add a pickup date']
    },
    status: {
        type: String,
        enum: ['open', 'filled', 'cancelled'],
        default: 'open'
    },
    postedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    reactions: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            },
            emoji: String
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('JobPost', jobPostSchema);
