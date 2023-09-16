const express = require('express');
const clientesController = require('../controllers/clientesController');
const session = require('express-session');
const jwt = require('jsonwebtoken');

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

router.get('/clientes', checkSession, checkTokenExpiration, clientesController.listar);
router.get('/clientesAPI', clientesController.listarAPI);

// router.get('/clientes_agregar', checkSession, clientesController.crear);
// router.get('/clientes_agregarAPI', clientesController.crearAPI);

router.get('/clientes_editar/:idInfo', checkSession, checkTokenExpiration, clientesController.editar);
router.get('/clientes_editarAPI/:idInfo', clientesController.editarAPI);


// router.post('/clientes_agregar', checkSession, clientesController.registrar);
router.post('/clientes_editar/:idInfo', checkSession, checkTokenExpiration, clientesController.actualizar);
router.post('/clientes_editarAPI/:idInfo', clientesController.actualizarAPI);


module.exports = router;