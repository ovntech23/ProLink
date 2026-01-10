const express = require('express');
const router = express.Router();
const { getFeatures, getFeatureById, createFeature, updateFeature, deleteFeature } = require('../controllers/featureController');
const { protect, admin } = require('../middleware/auth');

// GET /api/features - Get all active features
router.get('/', getFeatures);

// GET /api/features/:id - Get feature by ID
router.get('/:id', getFeatureById);

// POST /api/features - Create a new feature (admin only)
router.post('/', protect, admin, createFeature);

// PUT /api/features/:id - Update a feature (admin only)
router.put('/:id', protect, admin, updateFeature);

// DELETE /api/features/:id - Delete a feature (admin only)
router.delete('/:id', protect, admin, deleteFeature);

module.exports = router;
