const express = require('express');
const ProduccionesController = require('../controllers/produccionesController');

// Middleware de verificación de sesión
const checkSession = (req, res, next) => {
    if (req.session.loggedin && tienePermisos(req.session)) {
        // Si hay una sesión activa, continuar con la siguiente ruta
        res.locals.name = req.session.name;
        res.locals.asignacion = req.session.asignacion;
        next();
    } else {
        // Si no hay una sesión activa, redireccionar al login
        res.redirect('/login');
    }
};

// Función para verificar los permisos
const tienePermisos = (session) => {
    const asignacion = session.asignacion;

    if (asignacion && asignacion.includes('roles')) {
        return true;
    }

    return false;
};

const router = express.Router();

router.get('/produccion', checkSession, ProduccionesController.producciones_listar);
router.get('/produccion/:idOrdenProduccion', checkSession, ProduccionesController.producciones_detallar);
router.get('/produccion_registrar', checkSession, ProduccionesController.producciones_crear);
router.post('/produccion_registrar', checkSession, ProduccionesController.producciones_registrar);
router.get('/produccion_editar/:idOrden', checkSession, ProduccionesController.producciones_editar);
router.post('/produccion_editar/:idOrden', checkSession, ProduccionesController.producciones_modificar);
router.post('/produccion_eliminar', checkSession, ProduccionesController.producciones_eliminar);

module.exports = router;