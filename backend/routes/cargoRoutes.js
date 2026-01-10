const express = require('express');
const router = express.Router();
const { getCargos, getCargoById, createCargo, updateCargo, deleteCargo } = require('../controllers/cargoController');
const { protect, admin } = require('../middleware/auth');

// GET /api/cargos - Get all active cargo items
router.get('/', getCargos);

// GET /api/cargos/:id - Get cargo by ID
router.get('/:id', getCargoById);

// POST /api/cargos - Create a new cargo item (admin only)
router.post('/', protect, admin, createCargo);

// PUT /api/cargos/:id - Update a cargo item (admin only)
router.put('/:id', protect, admin, updateCargo);

// DELETE /api/cargos/:id - Delete a cargo item (admin only)
router.delete('/:id', protect, admin, deleteCargo);

module.exports = router;
