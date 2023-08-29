const express = require('express');
const loginController = require('../controllers/loginController');

const router = express.Router();


router.get('/login', loginController.login);

router.post('/register', loginController.registrar);

router.post('/login', loginController.auth);
router.post('/loginApi', loginController.authAPI);

router.get('/logout', loginController.logout);


router.get('/olvidar_contrase', loginController.olvido);
router.post('/olvidar_contrase', loginController.recuperar);

router.get('/restaurar_contrase', loginController.restablecer);
router.post('/restaurar_contrase', loginController.restablecerContraseña);



module.exports = router;