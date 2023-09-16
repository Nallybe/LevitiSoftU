const express = require('express');
const rolesController = require('../controllers/rolesController');
const jwt = require('jsonwebtoken');
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

//Expiración del token
function checkTokenExpiration(req, res, next) {
    const token = req.cookies.auth_token; // Asegúrate de usar el mismo nombre de cookie que usaste al iniciar sesión

    if (!token) {
        // No se encontró el token, continua con la siguiente middleware o ruta
        return next();
    }

    jwt.verify(token, 'secretKey', (err, decoded) => {
        if (err) {
            // El token es inválido o ha caducado
            // Puedes redireccionar a una página de inicio de sesión o realizar otras acciones aquí
            res.clearCookie('auth_token'); // Elimina la cookie del token en el cliente
            req.session.destroy(); // Destruye la sesión en el servidor
            return res.redirect('/login'); // Redirecciona al inicio de sesión
        } else {
            // El token es válido, continúa con la solicitud
            next();
        }
    });
}


router.get('/roles', checkSession, checkTokenExpiration, rolesController.listar);
router.get('/rolesAPI', rolesController.listarApi);
router.get('/AgregarRol', checkSession, checkTokenExpiration, rolesController.crear);
router.get('/AgregarRolAPI', rolesController.crearAPI);

router.get('/Permisos/:idRoles', checkSession, checkTokenExpiration, rolesController.permisos);
router.get('/PermisosAPI/:idRoles', rolesController.permisosAPI);

router.get('/EditarRol/:idRoles', checkSession, checkTokenExpiration, rolesController.editar);
router.get('/EditarRolAPI/:idRoles', rolesController.editarAPI);


router.post('/AgregarRol/', checkSession, checkTokenExpiration, rolesController.registrar);
router.post('/AgregarRolAPI/', rolesController.registrarApi);
router.post('/EditarRol/:idRoles', checkSession, checkTokenExpiration, rolesController.actualizar);
router.post('/EditarRolAPI/:idRoles', rolesController.actualizarAPI);

//router.post('/EliminarRol', checkSession, rolesController.eliminar);
router.post('/EliminarAsignacion/:idRoles', checkSession, checkTokenExpiration, rolesController.eliminarAsignacion);
router.post('/EliminarAsignacionAPI/:idRoles', rolesController.eliminarAsignacionAPI);

module.exports = router;