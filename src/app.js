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



app.post('/actualizar_grafico_producto', checkSession, async (req, res) => {
    try {
        const data = req.body;
        // console.log(data);

        const conn = await new Promise((resolve, reject) => {
            req.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(conn);
                }
            });
        });

        const ventas = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM tbl_ventas WHERE LEFT(fecha, 7) = ?", [data.graf_pro], (err, ventas) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(ventas);
                }
            });
        });



        let productos = []
        for (i in ventas) {
            const d_ventas = await new Promise((resolve, reject) => {
                conn.query("SELECT * FROM tbl_detalleventas WHERE idVentas = ?", [ventas[i].idVentas], (err, d_ventas) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(d_ventas);
                    }
                });
            });

            for (ix in d_ventas) {
                let producto = {
                    idProducto: d_ventas[ix].idProducto,
                    cantidad: d_ventas[ix].Unidad
                }

                let agregar = true;

                if (productos) {
                    for (ic in productos) {
                        if (productos[ic].idProducto == producto.idProducto) {
                            productos[ic].cantidad += producto.cantidad;
                            agregar = false;
                        }
                    }
                }

                if (agregar == true) {
                    productos.push(producto);
                }

            }

        }


        const prod = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM tbl_productos", (err, pro) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(pro);
                }
            });
        });

        let totalP = 0;
        for (i in productos) {
            for (ix in prod) {
                if (productos[i].idProducto == prod[ix].idProducto) {
                    productos[i].nombre = prod[ix].nombre;
                }
            }
            totalP += productos[i].cantidad;
        }

        //console.log(productos)


        // Ordena el array en orden descendente según la cantidad
        productos.sort((a, b) => b.cantidad - a.cantidad);

        // Toma los primeros 5 elementos del array ordenado
        const top5Productos = productos.slice(0, 5);

        //console.log(top5Productos)

        let nombres = [];
        let datos = [];

        for (i in top5Productos) {
            nombres.push(top5Productos[i].nombre);
            datos.push(top5Productos[i].cantidad);
        }
        //console.log(nombres);
        //console.log(datos);

        let valor = data.graf_pro;
        let labels = data.label_p;
        let ventasData = data.ventas_p;
        let comprasData = data.compras_p;

        res.render('dashboard', {nombres, datos, valor, labels, ventasData, comprasData})

    } catch (err) {
        res.status(500).json(err);
    }
})


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
app.get('/misComprasProductos/:idVentas', sesion, (req, res) => {
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

    req.getConnection(async (err, conn) => {
        if (err) {
            // Si hay un error al obtener la conexión, enviar una respuesta con el error
            return res.status(500).json(err);
        }

        const usersI = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM users_info", (err, usersI) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(usersI);
                }
            });
        });

        var IDInfo_user;
        for (let iI in usersI) {
            if (usersI[iI].nombre == req.session.name) {
                IDInfo_user = usersI[iI].idInfo;
            }
        }

        conn.query('SELECT * FROM tbl_reparaciones WHERE idInfo = ? ORDER BY fechaRegistro DESC;', [IDInfo_user], (err, reparaciones) => {
            if (err) {
                // Si hay un error al consultar las reparaciones, enviar una respuesta con el error
                return res.status(500).json(err);
            }
            var cont = 1;

            // Consultar los detalles de las reparaciones para cada reparación
            for (let index in reparaciones) {
                reparaciones[index].cont = cont;
                cont++;
                conn.query('SELECT * FROM tbl_reparaciones_detalles WHERE idReparacion=?', [reparaciones[index].idReparacion], (err, d_reparaciones) => {
                    if (err) {
                        // Si hay un error al consultar los detalles de la reparación, enviar una respuesta con el error
                        return res.status(500).json(err);
                    }

                    // Actualizar los campos de la reparación con la información obtenida
                    reparaciones[index].numPR = d_reparaciones.length;
                    reparaciones[index].fechaEntrega = reparaciones[index].fechaEntrega.toLocaleDateString();
                    reparaciones[index].fechaRegistro = reparaciones[index].fechaRegistro.toLocaleString();
                    reparaciones[index].total = "$ " + reparaciones[index].total.toLocaleString('es-CO');

                    // Actualizar el estado de la reparación
                    switch (reparaciones[index].estado) {
                        case 'Iniciado':
                            reparaciones[index].estado1 = true;
                            break;
                        case 'Proceso':
                            reparaciones[index].estado2 = true;
                            break;
                        case 'Terminado':
                            reparaciones[index].estado3 = true;
                            break;
                        case 'Entregado':
                            reparaciones[index].estado4 = true;
                            break;
                    }
                });
            }

            conn.query("SELECT * FROM users_access", (err, usersA) => {
                if (err) {
                    return res.status(500).json(err);
                } else {
                    conn.query("SELECT * FROM users_info", (err, usersI) => {
                        if (err) {
                            return res.status(500).json(err);
                        } else {
                            for (index in reparaciones) {
                                reparaciones[index].userName;
                                reparaciones[index].userTell;
                                reparaciones[index].userEmail;
                                for (iA in usersA) {
                                    for (iI in usersI) {
                                        if (usersI[iI].idInfo == reparaciones[index].idInfo && usersI[iI].idAccess == usersA[iA].idAccess) {
                                            reparaciones[index].userName = usersI[iI].nombre;
                                            reparaciones[index].userTell = usersI[iI].telefono;
                                            reparaciones[index].userEmail = usersA[iA].correo;
                                        }
                                    }
                                }
                            }
                            //res.status(200).render("reparaciones/listar", { reparaciones });
                            res.render('misRepara', {
                                nombre: 'Mis reparaciones', sesion: loggedIn, name, reparaciones
                            })
                        }
                    });
                }
            });
        });
    })
})


app.get('/misReparaDetalle/:idReparacion', sesion, async (req, res) => {
    try {
        const loggedIn = req.session.loggedin || false;
        const name = req.session.name

        const idReparacion = req.params.idReparacion;
        const conn = await new Promise((resolve, reject) => {
            req.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(conn);
                }
            });
        });

        const reparacion = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM tbl_reparaciones WHERE idReparacion = ?", [idReparacion], (err, reparacion) => {
                if (err) {
                    reject(err);
                } else {
                    for (let index in reparacion) {
                        reparacion[index].fechaEntrega = reparacion[index].fechaEntrega.toLocaleDateString();
                        reparacion[index].fechaRegistro = reparacion[index].fechaRegistro.toLocaleDateString(); //toLocaleString();
                        reparacion[index].total = "$ " + reparacion[index].total.toLocaleString('es-CO');

                        switch (reparacion[index].estado) {
                            case 'Iniciado':
                                reparacion[index].estado1 = true;
                                break;
                            case 'Proceso':
                                reparacion[index].estado2 = true;
                                break;
                            case 'Terminado':
                                reparacion[index].estado3 = true;
                                break;
                            case 'Entregado':
                                reparacion[index].estado4 = true;
                                break;
                        }
                    }
                    resolve(reparacion);
                }
            });
        });

        const usersA = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM users_access", (err, usersA) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(usersA);
                }
            });
        });

        const usersI = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM users_info", (err, usersI) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(usersI);
                }
            });
        });

        for (let index in reparacion) {
            reparacion[index].userName;
            reparacion[index].userTell;
            reparacion[index].userEmail;
            for (let iA in usersA) {
                for (let iI in usersI) {
                    if (usersI[iI].idInfo == reparacion[index].idInfo && usersI[iI].idAccess == usersA[iA].idAccess) {
                        reparacion[index].userName = usersI[iI].nombre;
                        reparacion[index].userTell = usersI[iI].telefono;
                        reparacion[index].userEmail = usersA[iA].correo;
                    }
                }
            }
        }

        const detallesreparacion = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM tbl_reparaciones_detalles WHERE idReparacion = ?", [idReparacion], (err, detallesreparacion) => {
                if (err) {
                    reject(err);
                } else {
                    let cont = 1;
                    for (let index in detallesreparacion) {
                        detallesreparacion[index].fechaEstado = detallesreparacion[index].fechaEstado.toLocaleString();
                        detallesreparacion[index].cont = cont;
                        cont++;

                        switch (detallesreparacion[index].estado) {
                            case 'Iniciado':
                                detallesreparacion[index].estado1 = true;
                                break;
                            case 'Proceso':
                                detallesreparacion[index].estado2 = true;
                                break;
                            case 'Terminado':
                                detallesreparacion[index].estado3 = true;
                                break;
                        }
                        detallesreparacion[index].fechaEstado = detallesreparacion[index].fechaEstado.toLocaleString();
                    }
                    resolve(detallesreparacion);
                }
            });
        });

        const insumos = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM tbl_insumos", (err, insumos) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(insumos);
                }
            });
        });


        for (let ix in detallesreparacion) {
            const detalles = await new Promise((resolve, reject) => {
                conn.query("SELECT * FROM tbl_reparaciones_detalles_detalles WHERE idDetalleReparacion = ?", [detallesreparacion[ix].idDetalleReparacion], (err, detalles) => {
                    if (err) {
                        reject(err);
                    } else {
                        var contD = 1;
                        for (let i in detalles) {
                            for (let ix in insumos) {
                                if (insumos[ix].idInsumo == detalles[i].idInsumo) {
                                    detalles[i].idInsumo = insumos[ix].nombre;
                                    detalles[i].medida = insumos[ix].medida;
                                    detalles[i].stock = insumos[ix].stock;
                                }
                            }
                            detalles[i].cont = contD;
                            contD++;
                        }
                        resolve(detalles);
                    }
                });
            });
            detallesreparacion[ix].detalles = detalles;
        }


        const DetallesDetalles = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM tbl_reparaciones_detalles_detalles", (err, DetallesDetalles) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(DetallesDetalles);
                }
            });
        });

        const R_Detalles = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM tbl_reparaciones_detalles WHERE idReparacion = ?", [idReparacion], (err, DetallesDetalles) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(DetallesDetalles);
                }
            });
        });

        const totalInsumos = [];
        let contDD = 1;

        for (const dd of DetallesDetalles) {
            for (const d of R_Detalles) {
                if (d.idDetalleReparacion === dd.idDetalleReparacion) {
                    const matchingInsumo = insumos.find(ins => ins.idInsumo === dd.idInsumo);

                    if (matchingInsumo) {
                        const existingInsumo = totalInsumos.find(ti => ti.idInsumo === dd.idInsumo);

                        if (existingInsumo) {
                            existingInsumo.cantidad_n += dd.cantidad_n;
                        } else {
                            totalInsumos.push({
                                cont: contDD,
                                idInsumo: dd.idInsumo,
                                nombre: matchingInsumo.nombre,
                                medida: matchingInsumo.medida,
                                stock: matchingInsumo.stock,
                                cantidad_n: dd.cantidad_n
                            });

                            contDD++;
                        }
                    }
                }
            }
        }

        // Redireccionar

        //console.log("total Insumos");
        // console.log(totalInsumos);
        //res.render("reparaciones/detallar", { detallesreparacion, reparacion, totalInsumos });
        res.render('misReparaDetalle', {
            nombre: 'Mis reparaciones', sesion: loggedIn, name, detallesreparacion, reparacion, totalInsumos
        })

    } catch (err) {
        res.status(500).json(err);
    }
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