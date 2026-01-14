const JobPost = require('../models/JobPost');

// @desc    Get all active job posts
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res) => {
    try {
        const jobs = await JobPost.find({ status: 'open' })
            .populate('postedBy', 'name avatar')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: jobs
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new job post
// @route   POST /api/jobs
// @access  Private (Broker/Admin)
const createJob = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Toggle reaction on a job post
// @route   POST /api/jobs/:id/react
// @access  Private
const reactToJob = async (req, res) => {
    try {
        const { emoji } = req.body;
        const job = await JobPost.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
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
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update job status (e.g., mark as filled)
// @route   PUT /api/jobs/:id/status
// @access  Private (Posted user or Admin)
const updateJobStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const job = await JobPost.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check ownership
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to update this job' });
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
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getJobs,
    createJob,
    reactToJob,
    updateJobStatus
};
