const JobPost = require('../models/JobPost');
const asyncHandler = require('express-async-handler');

// @desc    Get all active job posts
// @route   GET /api/jobs
// @access  Private
const getJobs = asyncHandler(async (req, res) => {
    const jobs = await JobPost.find({ status: 'open' })
        .populate('postedBy', 'name avatar')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        data: jobs
    });
});

// @desc    Create a new job post
// @route   POST /api/jobs
// @access  Private (Broker/Admin)
const createJob = asyncHandler(async (req, res) => {
    const { title, description, origin, destination, budget, pickupDate } = req.body;

    const job = await JobPost.create({
        title,
        description,
        origin,
        destination,
        budget,
        pickupDate,
        postedBy: req.user.id
    });

    const populatedJob = await JobPost.findById(job._id).populate('postedBy', 'name avatar');

    // Emit WebSocket event for real-time update
    if (req.app.get('io')) {
        req.app.get('io').emit('jobCreated', populatedJob);
    }

    res.status(201).json({
        success: true,
        data: populatedJob
    });
});

// @desc    Toggle reaction on a job post
// @route   POST /api/jobs/:id/react
// @access  Private
const reactToJob = asyncHandler(async (req, res) => {
    const { emoji } = req.body;
    const job = await JobPost.findById(req.params.id);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    const existingReactionIndex = job.reactions.findIndex(
        (r) => r.user.toString() === req.user.id && r.emoji === emoji
    );

    if (existingReactionIndex > -1) {
        // Remove reaction
        job.reactions.splice(existingReactionIndex, 1);
    } else {
        // Add reaction
        job.reactions.push({ user: req.user.id, emoji });
    }

    await job.save();

    // Emit event for real-time update
    if (req.app.get('io')) {
        req.app.get('io').emit('jobReaction', {
            jobId: job._id,
            reactions: job.reactions
        });
    }

    res.status(200).json({
        success: true,
        data: job.reactions
    });
});

// @desc    Update job status (e.g., mark as filled)
// @route   PUT /api/jobs/:id/status
// @access  Private (Posted user or Admin)
const updateJobStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const job = await JobPost.findById(req.params.id);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to update this job');
    }

    job.status = status;
    await job.save();

    // Emit event
    if (req.app.get('io')) {
        req.app.get('io').emit('jobStatusUpdated', {
            jobId: job._id,
            status: job.status
        });
    }

    res.status(200).json({
        success: true,
        data: job
    });
});

module.exports = {
    getJobs,
    createJob,
    reactToJob,
    updateJobStatus
};
