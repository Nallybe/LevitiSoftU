const express = require('express');
const ventasController = require('../controllers/ventasController');

const router = express.Router();

// Middleware de verificación de sesión
const checkSession = (req, res, next) => {
    if (req.session.loggedin && tienePermisos(req.session)) {
        // Si hay una sesión activa, continuar con la siguiente ruta
        res.locals.name = req.session.name;
        res.locals.asignacion = req.session.asignacion;
        res.locals.rol = req.session.roles;
        next();
    } else {
        // Si no hay una sesión activa, redireccionar al login
        res.redirect('/login');
    }
};

// Función para verificar los permisos
const tienePermisos = (session) => {
    const asignacion = session.asignacion;

    if (asignacion && asignacion.includes('ventas')) {
        return true;
    }

    return false;
};

router.get('/ventas', checkSession, ventasController.listar);
router.get('/ventasAPI', checkSession, ventasController.listarAPI);

router.get('/AgregarVenta', checkSession, ventasController.crear);
router.get('/AgregarVentaAPI', checkSession, ventasController.crearAPI);


router.post('/AgregarVenta', checkSession, ventasController.registrar);
router.post('/AgregarVentaAPI', checkSession, ventasController.registrarAPI);

router.get('/AgregarProduc', checkSession, ventasController.agregarProducto);
router.get('/AgregarProducAPI', checkSession, ventasController.agregarProductoAPI);

router.get('/ListarProduc/:idVentas', checkSession, ventasController.listarProducto);
router.get('/ListarProducAPI/:idVentas', checkSession, ventasController.listarProductoAPI);


module.exports = router;
