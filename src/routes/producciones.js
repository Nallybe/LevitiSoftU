const express = require('express');
const ProduccionesController = require('../controllers/produccionesController');

const router = express.Router();

router.get('/producciones', ProduccionesController.producciones_listar);
router.get('/producciones/:idOrdenProduccion', ProduccionesController.producciones_detallar);
router.get('/producciones_registrar', ProduccionesController.producciones_crear);
router.post('/producciones_registrar', ProduccionesController.producciones_registrar);
router.get('/producciones_editar/:idOrden', ProduccionesController.producciones_editar);
module.exports = router;