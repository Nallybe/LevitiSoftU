const express = require('express');
const insumosController = require('../controllers/insumosController');

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

    if (asignacion && asignacion.includes('insumos')) {
        return true;
    }

    return false;
};

router.get('/insumos', checkSession, insumosController.listar); //router.get('/insumos/:ins?', checkSession, insumosController.listar);
router.get('/insumosAPI', insumosController.listarAPI);
router.get('/EditarInsumo/:idInsumo', checkSession, insumosController.editar);
router.get('/EditarInsumoAPI/:idInsumo', insumosController.editarAPI);

// router.get('/AgregarInsumo', checkSession, insumosController.crear);

router.post('/insumos', checkSession, insumosController.registrar);
router.post('/insumosAPI',  insumosController.registrarAPI);

router.post('/EditarInsumo/:idInsumo', checkSession, insumosController.actualizar);
router.post('/EditarInsumoAPI/:idInsumo', insumosController.actualizarAPI);


module.exports = router;