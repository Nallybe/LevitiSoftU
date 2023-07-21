const express = require('express');
const ProductosController = require('../controllers/productosController');
const multer = require('multer');

// Define the storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
       // cb(null, 'uploads/'); // Specify the destination directory for uploaded files
        cb(null, './public/assets/img/Productos/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original filename for the uploaded file
    }
});

// Create the multer middleware using the storage configuration
const upload = multer({ storage: storage });


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

router.get('/productos', checkSession,ProductosController.productos_listar);
router.get('/productos/:idProducto', checkSession,ProductosController.productos_detallar);

router.get('/productos_registrar', checkSession,ProductosController.productos_crear);
router.post('/productos_registrar', upload.single('imagen'), checkSession,ProductosController.productos_registrar);

router.get('/productos_editar/:idProducto', checkSession,ProductosController.productos_editar);
router.post('/productos_editar/:idProducto', checkSession,ProductosController.productos_modificar);

router.post('/productos_eliminar', checkSession,ProductosController.productos_eliminar);

router.get('/productos_estado/:idProducto', checkSession,ProductosController.productos_estado);

module.exports = router;