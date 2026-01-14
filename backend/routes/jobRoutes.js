const express = require('express');
const router = express.Router();
const {
    getJobs,
    createJob,
    reactToJob,
    updateJobStatus
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

// Get all active jobs (Any authenticated user)
router.get('/', protect, getJobs);

// Create a new job (Brokers and Admins only)
router.post('/', protect, authorize('broker', 'admin'), createJob);

// Toggle reaction on a job (Any authenticated user)
router.post('/:id/react', protect, reactToJob);

// Update job status (Posted by user or Admin)
router.put('/:id/status', protect, updateJobStatus);

module.exports = router;
