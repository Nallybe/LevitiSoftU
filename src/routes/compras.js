const express = require('express');
const ComprasController = require('../controllers/comprasController');

const router = express.Router();

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

router.get('/compras',checkSession,ComprasController.compras_listar);
router.get('/API_compras',ComprasController.compras_listar_api);

router.get('/compras/:idCompra',checkSession,ComprasController.compras_detallar);
router.get('/API_compras/:idCompra',ComprasController.compras_detallar_api);

router.get('/compras_registrar',checkSession,ComprasController.compras_crear);
router.post('/compras_registrar',checkSession,ComprasController.compras_registrar);
//router.post('/API_compras_registrar',checkSession,ComprasController.compras_registrar_api);

router.post('/compras_anular',checkSession,ComprasController.compras_anular);
//router.post('/API_compras_anular',checkSession,ComprasController.compras_anular_api);

module.exports = router;