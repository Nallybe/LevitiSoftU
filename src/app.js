const express = require('express')
const hbs = require('hbs')
const app = express()
const { engine } = require('express-handlebars');
const myconnection = require('express-myconnection');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql');
require('dotenv').config();
const clientesRoutes = require('./routes/clientes');
const insumosRoutes = require('./routes/insumos');
const rolesRoutes = require('./routes/roles');
const ventasRoutes = require('./routes/ventas');
const loginRoutes = require('./routes/login');
const comprasRoutes = require('./routes/compras');
const reparacionesRoutes = require('./routes/reparaciones');
//const produccionesRoutes = require('./routes/producciones');
const productosRoutes = require('./routes/productos');
const usuariosRoutes = require('./routes/usuarios');
const port = process.env.PORT

//Especificar el directorio público
app.use(express.static('public'))
app.set('src', __dirname + '/src')
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Motor de plantilla
hbs.registerPartials(__dirname + '/views/partials', function (err) { });
app.set('view engine', 'hbs')
app.engine('.hbs', engine({
    extname: '.hbs',
}));
app.set('views', __dirname + '/views')

app.use(myconnection(mysql, {
    host: 'localhost',
    user: 'root',
    password: '',
    port: '', //Aquí se coloca el puerto del MySQL en el panel del xampp, si usas wampserver dejarlo vacio 
    database: 'crudnodejs'
}, 'single'));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))



app.use('/', clientesRoutes);
app.use('/', insumosRoutes);
app.use('/', rolesRoutes);
app.use('/', ventasRoutes);
app.use('/', loginRoutes);
app.use('/', usuariosRoutes);
app.use('/', productosRoutes);
//app.use('/', produccionesRoutes);
app.use('/', reparacionesRoutes);
app.use('/', comprasRoutes);

app.get('/', (req, res) => {
    res.render('home', {
        nombre: 'home'
    })
})

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

    if (asignacion && asignacion.includes('dashboard')) {
        return true;
    }

    return false;
};

app.get('/dashboard', checkSession, (req, res) => {
    res.render('dashboard');
});

app.get('/home', (req, res) => {
    // Obtener la conexión a la base de datos
    req.getConnection((err, conn) => {
        if (err) {
            // Si hay un error al obtener la conexión, enviar una respuesta con el error
            return res.status(500).json(err);
        } else {
            // Consultar los productos en la base de datos
            conn.query('SELECT * FROM tbl_productos', (err, productos) => {
                if (err) {
                    // Si hay un error al consultar las productos, enviar una respuesta con el error
                    return res.status(500).json(err);
                } else {
                    for (let index in productos) {
                        // Parsear estado
                        if (productos[index].estado == 'A') {
                            productos[index].estado1 = true;
                        } else {
                            productos[index].estado2 = true;
                        }

                        // Parsear precio
                        productos[index].precio = "$ " + productos[index].precio.toLocaleString('es-CO');
                       
                    }
                    // Renderizar la plantilla 'productos/listar' y enviar los datos a la vista
                    res.render('home', { productos});
                }
            });
        }
    });
})

app.get('/ProductosH', (req, res) => {

    // Obtener la conexión a la base de datos
    req.getConnection((err, conn) => {
        if (err) {
            // Si hay un error al obtener la conexión, enviar una respuesta con el error
            return res.status(500).json(err);
        } else {
            // Consultar los productos en la base de datos
            conn.query('SELECT nombre, descripcion, imagen, precio, stock FROM tbl_productos', (err, productos) => {
                if (err) {
                    // Si hay un error al consultar las productos, enviar una respuesta con el error
                    return res.status(500).json(err);
                } else {
                    for (let index in productos) {
                        // Parsear estado
                        if (productos[index].estado == 'A') {
                            productos[index].estado1 = true;
                        } else {
                            productos[index].estado2 = true;
                        }

                        // Parsear precio
                        productos[index].precio = "$ " + productos[index].precio.toLocaleString('es-CO');
                       
                    }
                    // Renderizar la plantilla 'productos/listar' y enviar los datos a la vista
                    res.render('ProductosH', { productos});
                }
            });
        }
    });
})

app.get('/ProduZapatos', (req, res) => {

    res.render('ProduZapatos', {
        nombre: 'ProduZapatos'
    })
})

app.get('/ProduBolsos', (req, res) => {

    res.render('ProduBolsos', {
        nombre: 'ProduBolsos'
    })
})

app.get('/ProduRino', (req, res) => {

    res.render('ProduRino', {
        nombre: 'ProduRino'
    })
})

app.get('/ProduMorral', (req, res) => {

    res.render('ProduMorral', {
        nombre: 'ProduMorral'
    })
})

app.get('/ProduBilletera', (req, res) => {

    res.render('ProduBilletera', {
        nombre: 'ProduBilletera'
    })
})

app.get('/ProduChaquetas', (req, res) => {

    res.render('ProduChaquetas', {
        nombre: 'ProduChaquetas'
    })
})

app.get('/ProduCorreas', (req, res) => {

    res.render('ProduCorreas', {
        nombre: 'ProduCorreas'
    })
})

app.get('/recomendaciones', (req, res) => {

    res.render('recomendaciones', {
        nombre: 'Recomendaciones'
    })
})

app.get('/sobre_nosotros', (req, res) => {

    res.render('sobre_nosotros', {
        nombre: 'sobre_nosotros'
    })
})

app.get('/contactanos', (req, res) => {

    res.render('contactanos', {
        nombre: 'contactanos'
    })
})

app.get('/homeDash', (req, res) => {
    if (req.session.loggedin) {
        
      res.render('homeDash', { name: req.session.name, asignacion: req.session.asignacion});
    } else {
      res.redirect('/login');
    }
  });







app.get('*', (req, res) => {
    res.render('404', {
        nombre: 'Página no encontrada'
    })
})


//verificar si el puerto esta escuchando
app.listen(port, () => {
    console.log(`Escuchando por el puerto ${port}`)
}) 