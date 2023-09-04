const express = require('express');
const loginController = require('../controllers/loginController');

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

router.get('/login', loginController.login);

router.post('/register', loginController.registrar);

router.post('/login', loginController.auth);
//router.post('/loginApi', loginController.authAPI);

router.get('/logout', loginController.logout);


router.get('/olvidar_contrase', loginController.olvido);
router.post('/olvidar_contrase', loginController.recuperar);

router.get('/restaurar_contrase', loginController.restablecer);
router.post('/restaurar_contrase', loginController.restablecerContraseña);

//router.post('/actualizar_grafico_producto',checkSession, loginController.dashboard_pro);


module.exports = router;