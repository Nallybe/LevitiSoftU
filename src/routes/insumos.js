const express = require('express');
const insumosController = require('../controllers/insumosController');
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

    if (asignacion && asignacion.includes('insumos')) {
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

router.get('/insumos', checkSession, checkTokenExpiration, insumosController.listar); //router.get('/insumos/:ins?', checkSession, insumosController.listar);
router.get('/insumosAPI', insumosController.listarAPI);
router.get('/EditarInsumo/:idInsumo', checkSession, checkTokenExpiration, insumosController.editar);
router.get('/EditarInsumoAPI/:idInsumo', insumosController.editarAPI);

// router.get('/AgregarInsumo', checkSession, insumosController.crear);

router.post('/insumos', checkSession, checkTokenExpiration, insumosController.registrar);
router.post('/insumosAPI', insumosController.registrarAPI);

router.post('/EditarInsumo/:idInsumo', checkSession, checkTokenExpiration, insumosController.actualizar);
router.post('/EditarInsumoAPI/:idInsumo', insumosController.actualizarAPI);


module.exports = router;