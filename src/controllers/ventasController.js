function listar(req, res) {
    req.getConnection((err, conn) => {
        conn.query(`SELECT tbl_ventas.*, users_info.nombre, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS cont
        FROM tbl_ventas
        JOIN users_info ON tbl_ventas.idInfo = users_info.idInfo;
        `, (err, ventas) => {
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
                    estado: venta.estado,
                    cont: venta.cont
                };
            });
            res.render('ventas/ventas', { ventas: ventasFormateadas });
        });
    });


}

function crear(req, res) {
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM tbl_ventas", (err, ventas) => {
            if (err) {
                res.json(err);
            } conn.query(`SELECT ui.nombre FROM users_info ui JOIN users_access ua ON ui.idAccess = ua.idAccess JOIN tbl_roles tr ON ua.idRoles = tr.idRoles WHERE tr.nombreRoles = 'cliente' AND tr.estado = 'activo';
            `, (err, nombre) => {
                if (err) {
                    res.json(err);
                } conn.query(`SELECT idProducto, imagen, nombre, precio, stock FROM tbl_productos`, (err, productos) => {
                    if (err) {
                        res.json(err);
                    } res.render("ventas/AgregarVenta", { ventas, nombre, productos });
                })

            })
        })
    });
}


function registrar(req, res) {
    const data = req.body;
    console.log(data);
    let idProducto = data.idProducto;
    let unidadesArray = data.cantidadProducto;

    // Verificar si idProducto es una cadena y convertirlo en un array si es necesario
    if (typeof idProducto === 'string') {
        idProducto = idProducto.split(',');
    } else if (!Array.isArray(idProducto)) {
        idProducto = [idProducto];
    }

    // Verificar si unidadesArray es una cadena y convertirlo en un array si es necesario
    if (typeof unidadesArray === 'string') {
        unidadesArray = unidadesArray.split(',');
    } else if (!Array.isArray(unidadesArray)) {
        unidadesArray = [unidadesArray];
    }

    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error al obtener la conexión:', err);
            res.status(500).json({ error: 'Error al obtener la conexión' });
            return;
        }

        conn.query('SELECT idInfo FROM users_info WHERE nombre = ?', [data.nombre], (error, results) => {
            if (error) {
                console.error('Error al obtener el idInfo:', error);
                res.status(500).json({ error: 'Error al obtener el idInfo' });
            } else if (results.length === 0) {
                console.error('No se encontró el nombre en la tabla users_info');
                res.status(404).json({ error: 'No se encontró el nombre en la tabla users_info' });
            } else {
                const idInfo = results[0].idInfo;

                const RegistroVenta = {
                    idInfo: idInfo,
                    total: data.total,
                    fecha: data.fecha,
                    estado: data.estado,
                };

                conn.query('INSERT INTO tbl_ventas SET ?', [RegistroVenta], (error, result) => {
                    if (error) {
                        console.error('Error al insertar los datos en tbl_ventas:', error);
                        res.status(500).json({ error: 'Error al insertar los datos en tbl_ventas' });
                    } else {
                        const idVentas = result.insertId;

                        for (let i = 0; i < idProducto.length; i++) {
                            const RegistroDetVent = {
                                idVentas: idVentas,
                                idProducto: idProducto[i],
                                Unidad: unidadesArray[i]
                            };
                            console.log("Registro de venta: ", RegistroDetVent)
                            conn.query(
                                "INSERT INTO tbl_detalleventas SET ?",
                                [RegistroDetVent],
                                (error, result) => {
                                    if (error) {
                                        console.error('Error al insertar los datos en tbl_detalleventas:', error);
                                    } else {
                                        console.log("Detalle venta guardada");
                                    }
                                }
                            );
                        }

                        res.redirect('/ventas');
                    }
                });
            }
        });
    });
}




function agregarProducto(req, res) {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM tbl_productos', (err, productos) => {
            if (err) {
                res.json(err);
            }

            res.render('ventas/AgregarProduc', { productos });
        })
    })

}
function listarProducto(req, res) {
    const idVentas = req.params.idVentas;
    console.log("IdVentas: ",idVentas)
    const baseUrl = 'http://localhost:8181'
    req.getConnection((err, conn) => {
        conn.query('SELECT p.imagen, p.nombre, p.precio, dv.Unidad FROM tbl_productos p INNER JOIN tbl_detalleventas dv ON p.idProducto = dv.idProducto WHERE dv.idVentas = ?', [idVentas], (err, productos) => {
            if (err) {
                res.json(err);
            }
            console.log(productos)
            res.render('ventas/ListarProduc', { productos, baseUrl });
        })
    })

}

module.exports = {
    listar: listar,
    crear: crear,
    registrar: registrar,
    agregarProducto: agregarProducto,
    listarProducto: listarProducto
}