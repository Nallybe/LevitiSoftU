const express = require('express');
const UsuariosController = require('../controllers/usuariosController');


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

router.get('/usuarios', checkSession, UsuariosController.usuarios_listar);

router.get('/usuarios_registrar', checkSession, UsuariosController.usuarios_crear);
router.post('/usuarios_registrar', checkSession, UsuariosController.usuarios_registrar);

/*router.post('/usuarios_eliminar', checkSession, UsuariosController.usuarios_eliminar);*/

router.get('/usuarios_editar/:idAccess', checkSession, UsuariosController.usuarios_editar);
router.post('/usuarios_editar/:idAccess', checkSession, UsuariosController.usuarios_modificar);

router.get('/usuarios_estado/:idAccess', checkSession, UsuariosController.usuarios_estado);

module.exports = router;
