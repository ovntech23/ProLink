const express = require('express');
const router = express.Router();
const { 
  getFeatures, 
  getFeatureById, 
  createFeature, 
  updateFeature, 
  deleteFeature 
} = require('../controllers/featureController');

// GET /api/features - Get all active features
router.get('/', getFeatures);

// GET /api/features/:id - Get feature by ID
router.get('/:id', getFeatureById);

// POST /api/features - Create a new feature
router.post('/', createFeature);

// PUT /api/features/:id - Update a feature
router.put('/:id', updateFeature);

// DELETE /api/features/:id - Delete a feature
router.delete('/:id', deleteFeature);

module.exports = router;