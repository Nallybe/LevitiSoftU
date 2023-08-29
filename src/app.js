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
const produccionesRoutes = require('./routes/producciones');
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


// Helper personalizado para serializar un objeto a JSON
const helpers = {
    toJson: function (obj) {
        return JSON.stringify(obj);
    },
    range: function (start, end) {
        const result = [];
        for (let i = start; i <= end; i++) {
            result.push(i);
        }
        return result;
    },
    equals: function (val1, val2) {
        return val1 === val2;
    }
};


// Motor de plantilla
hbs.registerPartials(__dirname + '/views/partials', function (err) { });
app.set('view engine', 'hbs');
app.engine('.hbs', engine({
    extname: '.hbs',
    helpers: helpers // Agregar los helpers personalizados aquí
}));
app.set('views', __dirname + '/views');

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
app.use('/', produccionesRoutes);
app.use('/', reparacionesRoutes);
app.use('/', comprasRoutes);

app.get('/', (req, res) => {
    res.render('home', {
        nombre: 'home'
    })
})
// Middleware de verificación de sesión
const sesion = (req, res, next) => {
    if (req.session.loggedin) {
        // Si hay una sesión activa, continuar con la siguiente ruta
        res.locals.name = req.session.name;
        res.locals.asignacion = req.session.asignacion;
        res.locals.roles = req.session.roles;
        next();
    } else {
        // Si no hay una sesión activa, redireccionar al login
        res.redirect('/login');
    }
};
// Middleware de verificación de sesión
const checkSession = (req, res, next) => {
    if (req.session.loggedin && tienePermisos(req.session)) {
        // Si hay una sesión activa, continuar con la siguiente ruta
        res.locals.name = req.session.name;
        res.locals.asignacion = req.session.asignacion;
        res.locals.roles = req.session.roles;
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
    req.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json(err);
        } else {
            // Obtener datos de ventas
            conn.query(`SELECT MONTH(fecha) AS mes, COUNT(*) AS cantidad_registros
                        FROM tbl_ventas
                        GROUP BY MONTH(fecha)
                        ORDER BY mes;
            `, (err, ventas) => {
                if (err) {
                    return res.status(500).json(err);
                } else {
                    // Obtener datos de compras
                    conn.query(`SELECT MONTH(fechaRegistro) AS mes, COUNT(*) AS cantidad_registros
                    FROM tbl_compras
                    WHERE estado = 'A'
                    GROUP BY MONTH(fechaRegistro)
                    ORDER BY mes;
                    
                    `, (err, compras) => {
                        if (err) {
                            return res.status(500).json(err);
                        } else {
                            const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                            const currentDate = new Date();
                            const currentMonth = currentDate.getMonth();

                            const ventasData = Array.from({ length: currentMonth + 1 }, (_, i) => {
                                const ventaMes = ventas.find(venta => venta.mes === (i + 1));
                                return ventaMes ? ventaMes.cantidad_registros : 0;
                            });

                            const comprasData = Array.from({ length: currentMonth + 1 }, (_, i) => {
                                const compraMes = compras.find(compra => compra.mes === (i + 1));
                                return compraMes ? compraMes.cantidad_registros : 0;
                            });

                            res.render('dashboard', { labels: months.slice(0, currentMonth + 1), ventasData, comprasData });
                        }
                    });
                }
            });
        }
    });
});

app.get('/home', (req, res) => {
    const loggedIn = req.session.loggedin || false;
    const name = req.session.name
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error connecting to database:', err);
            return res.status(500).send('Internal Server Error');
        }

        conn.query('SELECT p.nombre, p.descripcion, p.imagen, p.precio, p.stock, c.nombre AS nombre_categoria, SUM(dv.Unidad) AS total_vendido FROM tbl_productos p INNER JOIN tbl_categoria c ON p.idCategoria = c.idCategoria INNER JOIN tbl_detalleventas dv ON p.idProducto = dv.idProducto GROUP BY p.idProducto ORDER BY total_vendido ASC LIMIT 8;;', (err, productos) => {
            if (err) {
                console.error('Error querying database:', err);
                return res.status(500).send('Internal Server Error');
            }

            productos.forEach(producto => {
                producto.estado1 = producto.estado === 'A';
                producto.estado2 = !producto.estado1;
                producto.precio = "$ " + producto.precio.toLocaleString('es-CO');
            });

            const data = { productos, sesion: loggedIn, name };
            res.render('home', data);
        });
    });
});


app.get('/ProductosH', (req, res) => {
    const loggedIn = req.session.loggedin || false;
    const name = req.session.name
    // Obtener la conexión a la base de datos
    req.getConnection((err, conn) => {
        if (err) {
            // Si hay un error al obtener la conexión, enviar una respuesta con el error
            return res.status(500).json(err);
        } else {
            // Obtener la página actual desde la URL o de alguna otra forma
            const currentPage = req.query.page || 1;
            const productsPerPage = 6; // Número de productos por página

            // Calcular el desplazamiento para la consulta LIMIT
            const offset = (currentPage - 1) * productsPerPage;

            // Consultar el total de productos para calcular el número total de páginas
            conn.query('SELECT COUNT(*) AS total FROM tbl_productos', (err, totalResult) => {
                if (err) {
                    // Si hay un error al consultar el total de productos, enviar una respuesta con el error
                    return res.status(500).json(err);
                } else {
                    const totalProducts = totalResult[0].total;

                    // Consultar los productos en la base de datos con paginación
                    conn.query(`
                        SELECT p.nombre, p.descripcion, p.imagen, p.precio, p.stock, c.nombre AS nombre_categoria
                        FROM tbl_productos p
                        INNER JOIN tbl_categoria c ON p.idCategoria = c.idCategoria
                        LIMIT ${offset}, ${productsPerPage}
                    `, (err, productos) => {
                        if (err) {
                            // Si hay un error al consultar los productos, enviar una respuesta con el error
                            return res.status(500).json(err);
                        } else {
                            // Renderizar la plantilla 'ProductosH' y enviar los datos a la vista
                            res.render('ProductosH', {
                                productos: productos,
                                currentPage: currentPage,
                                totalPages: Math.ceil(totalProducts / productsPerPage), sesion: loggedIn, name
                            });
                        }
                    });
                }
            });
        }
    });
});




app.get('/recomendaciones', (req, res) => {
    const loggedIn = req.session.loggedin || false;
    const name = req.session.name
    res.render('recomendaciones', {
        nombre: 'Recomendaciones', sesion: loggedIn, name
    })
})

app.get('/misCompras', sesion, (req, res) => {
    const loggedIn = req.session.loggedin || false;
    const name = req.session.name
    req.getConnection((err, conn) => {
        conn.query(`SELECT tbl_ventas.*, users_info.nombre, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS cont FROM tbl_ventas JOIN users_info ON tbl_ventas.idInfo = users_info.idInfo WHERE users_info.nombre = ?;`, [name], (err, ventas) => {
            if (err) {
                res.json(err);
            }
            const ventasFormateadas = ventas.map(venta => {
                const fecha = new Date(venta.fecha);
                const dia = fecha.getDate();
                const mes = fecha.toLocaleString('default', { month: 'long' });
                const anio = fecha.getFullYear();
                const fechaFormateada = `${dia} de ${mes} de ${anio}`;
                return {
                    idVentas: venta.idVentas,
                    nombre: venta.nombre,
                    total: venta.total,
                    fecha: fechaFormateada,
                    descripcion: venta.descripcion,
                    estado: venta.estado,
                    cont: venta.cont
                };
            });

            res.render('misCompras', {
                nombre: 'Mis compras', sesion: loggedIn, name, ventas: ventasFormateadas
            })
        })
    })
})
app.get('/misComprasProductos/:idVentas', sesion, (req, res) =>{
    const idVentas = req.params.idVentas;
    const loggedIn = req.session.loggedin || false;
    const name = req.session.name
    //console.log("IdVentas: ", idVentas)
    const baseUrl = 'http://localhost:8181'
    req.getConnection((err, conn) => {
        conn.query('SELECT p.imagen, p.nombre, p.precio, dv.Unidad FROM tbl_productos p INNER JOIN tbl_detalleventas dv ON p.idProducto = dv.idProducto WHERE dv.idVentas = ?', [idVentas], (err, productos) => {
            if (err) {
                res.json(err);
            }
            //console.log(productos)
            res.render('misComprasProductos', { productos, baseUrl, sesion: loggedIn });
        })
    })
})
app.get('/misRepara', sesion, (req, res) => {
    const loggedIn = req.session.loggedin || false;
    const name = req.session.name
    res.render('misRepara', {
        nombre: 'Mis reparaciones', sesion: loggedIn, name
    })
})

app.get('/sobre_nosotros', (req, res) => {
    const loggedIn = req.session.loggedin || false;
    const name = req.session.name
    res.render('sobre_nosotros', {
        nombre: 'sobre_nosotros', sesion: loggedIn, name
    })
})

app.get('/contactanos', (req, res) => {
    const loggedIn = req.session.loggedin || false;
    const name = req.session.name
    res.render('contactanos', {
        nombre: 'contactanos', sesion: loggedIn, name
    })
})

app.get('*', (req, res) => {
    res.render('404', {
        nombre: 'Página no encontrada'
    })
})


//verificar si el puerto esta escuchando
app.listen(port, () => {
    console.log(`Escuchando por el puerto ${port}`)
}) 