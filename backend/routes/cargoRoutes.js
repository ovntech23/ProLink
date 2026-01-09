const express = require('express');
const router = express.Router();
const { 
  getCargos, 
  getCargoById, 
  createCargo, 
  updateCargo, 
  deleteCargo 
} = require('../controllers/cargoController');

// GET /api/cargos - Get all active cargo items
router.get('/', getCargos);

// GET /api/cargos/:id - Get cargo by ID
router.get('/:id', getCargoById);

// POST /api/cargos - Create a new cargo item
router.post('/', createCargo);

// PUT /api/cargos/:id - Update a cargo item
router.put('/:id', updateCargo);

// DELETE /api/cargos/:id - Delete a cargo item
router.delete('/:id', deleteCargo);

module.exports = router;