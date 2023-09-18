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

    if (asignacion && asignacion.includes('producción')) {
        return true;
    }

    return false;
};

const router = express.Router();

router.get('/produccion', checkSession, ProduccionesController.producciones_listar);
router.get('/API_produccion',  ProduccionesController.producciones_listar_api);

router.get('/produccion/:idOrdenProduccion', checkSession, ProduccionesController.producciones_detallar);
router.get('/API_produccion/:idOrdenProduccion', ProduccionesController.producciones_detallar_api);


router.get('/produccion_registrar', checkSession, ProduccionesController.producciones_crear);
router.post('/produccion_registrar', checkSession, ProduccionesController.producciones_registrar);
//router.post('/API_produccion_registrar', checkSession, ProduccionesController.producciones_registrar_api);


router.get('/produccion_editar/:idOrden', checkSession, ProduccionesController.producciones_editar);
router.post('/produccion_editar/:idOrden', checkSession, ProduccionesController.producciones_modificar);
//router.put('/API_produccion_editar/:idOrden', checkSession, ProduccionesController.producciones_modificar_api);

router.post('/produccion_eliminar', checkSession, ProduccionesController.producciones_eliminar);
//router.delete('/API_produccion_eliminar', checkSession, ProduccionesController.producciones_eliminar_api);

module.exports = router;