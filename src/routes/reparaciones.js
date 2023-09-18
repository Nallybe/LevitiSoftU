const express = require('express');
const ReparacionesController = require('../controllers/reparacionesController');

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

    if (asignacion && asignacion.includes('reparaciones')) {
        return true;
    }

    return false;
};
const router = express.Router();

router.get('/reparaciones',checkSession,ReparacionesController.reparaciones_listar);
router.get('/API_reparaciones', ReparacionesController.reparaciones_listar_api);

router.get('/reparaciones/:idReparacion',checkSession,ReparacionesController.reparaciones_detallar);
router.get('/API_reparaciones/:idReparacion', ReparacionesController.reparaciones_detallar_api);

router.get('/reparaciones_registrar',checkSession,ReparacionesController.reparaciones_crear);
router.post('/reparaciones_registrar',checkSession,ReparacionesController.reparaciones_registrar);
//router.post('/API_reparaciones_registrar',checkSession,ReparacionesController.reparaciones_registrar_api);

router.get('/reparaciones_editar/:idReparacion',checkSession,ReparacionesController.reparaciones_editar);
router.post('/reparaciones_editar/:idReparacion',checkSession,ReparacionesController.reparaciones_modificar);
//router.put('/API_reparaciones_editar_api/:idReparacion',checkSession,ReparacionesController.reparaciones_modificar_api);

router.post('/reparaciones_eliminar',checkSession,ReparacionesController.reparaciones_eliminar);
//router.delete('/API_reparaciones_eliminar',checkSession,ReparacionesController.reparaciones_eliminar_api);

router.post('/reparaciones_estadoTyE',checkSession,ReparacionesController.reparaciones_estadoTyE);

module.exports = router;