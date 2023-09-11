const express = require('express');
const clientesController = require('../controllers/clientesController');
const session = require('express-session');

const router = express.Router();

// Middleware de verificación de sesión
const checkSession = (req, res, next) => {
    if (req.session.loggedin &&tienePermisos(req.session)) {
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

    if (asignacion && asignacion.includes('clientes')) {
        return true;
    }

    return false;
};

router.get('/clientes', checkSession, clientesController.listar);
router.get('/clientesAPI', checkSession, clientesController.listarAPI);

router.get('/clientes_agregar', checkSession, clientesController.crear);
router.get('/clientes_agregarAPI', checkSession, clientesController.crearAPI);

router.get('/clientes_editar/:idInfo', checkSession, clientesController.editar);
router.get('/clientes_editarAPI/:idInfo', checkSession, clientesController.editarAPI);


// router.post('/clientes_agregar', checkSession, clientesController.registrar);
router.post('/clientes_editar/:idInfo', checkSession, clientesController.actualizar);
router.post('/clientes_editarAPI/:idInfo', checkSession, clientesController.actualizarAPI);


module.exports = router;