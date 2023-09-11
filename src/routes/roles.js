const express = require('express');
const rolesController = require('../controllers/rolesController');

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

router.get('/roles', checkSession, rolesController.listar);
router.get('/rolesAPI', checkSession, rolesController.listarApi);
router.get('/AgregarRol', checkSession, rolesController.crear);
router.get('/AgregarRolAPI', checkSession, rolesController.crearAPI);

router.get('/Permisos/:idRoles', checkSession, rolesController.permisos);
router.get('/PermisosAPI/:idRoles', checkSession, rolesController.permisosAPI);

router.get('/EditarRol/:idRoles', checkSession, rolesController.editar);
router.get('/EditarRolAPI/:idRoles', checkSession, rolesController.editarAPI);


router.post('/AgregarRol/', checkSession, rolesController.registrar);
router.post('/AgregarRolAPI/', checkSession, rolesController.registrarApi);
router.post('/EditarRol/:idRoles', checkSession, rolesController.actualizar);
router.post('/EditarRolAPI/:idRoles', checkSession, rolesController.actualizarAPI);

//router.post('/EliminarRol', checkSession, rolesController.eliminar);
router.post('/EliminarAsignacion/:idRoles', checkSession, rolesController.eliminarAsignacion);
router.post('/EliminarAsignacionAPI/:idRoles', checkSession, rolesController.eliminarAsignacionAPI);

module.exports = router;