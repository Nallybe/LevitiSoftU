function listar(req, res) {
    req.getConnection((err, conn) => {
        conn.query('SELECT tbl_ventas.*, users_info.nombre FROM tbl_ventas JOIN users_info ON tbl_ventas.idInfo = users_info.idInfo;', (err, ventas) => {
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
                    estado: venta.estado
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
            } conn.query("SELECT nombre FROM users_info", (err, nombre) => {
                if (err) {
                    res.json(err);
                } res.render("ventas/AgregarVenta", { ventas, nombre });
            })
        })
    });
}

function registrar(req, res) {
    const data = req.body;
    console.log(data) 

    req.getConnection((err, conn) => {
        conn.query('SELECT idInfo FROM users_info WHERE nombre = ?', [data.nombre], (error, results) => {
            console.log(data.nombre)
            if (error) {
                console.error('Error al obtener el idInfo:', error);
                res.status(500).json({ error: 'Error al obtener el idInfo' });
            } else if (results.length === 0) {
                console.error('No se encontró el nombre en la tabla users_info');
                res.status(404).json({ error: 'No se encontró el nombre en la tabla users_info' });
            } else {
                const idInfo = results[0].idInfo;
                //console.log(results)
                const RegistroVenta = {
                    idInfo: idInfo,
                    total: data.total,
                    fecha: data.fecha,
                    estado: data.estado,
                };
                //console.log(RegistroVenta)
                // Insertar los datos en la tabla tbl_ventas
                conn.query('INSERT INTO tbl_ventas SET ?', [RegistroVenta], (error, result) => {
                    if (error) {
                        console.error('Error al insertar los datos en tbl_ventas:', error);
                        res.status(500).json({ error: 'Error al insertar los datos en tbl_ventas' });
                    } else {
                        const idVentas = result.insertId;
                        const idProductos = data.IdProductos.split(','); // Convierte la cadena de entrada en un array de valores
                        const Unidad = data.cantidadProductos;
                        const unidadesArray = Unidad.split(',');
                        for (let i = 0; i < idProductos.length; i++) {
                            const RegistroDetVent = {
                                idVentas: idVentas,
                                idProductos: idProductos[i],
                                Unidad: unidadesArray[i]
                            };
                            //console.log(RegistroDetVent)
                            req.getConnection((err, conn) => {

                                conn.query(
                                    "INSERT INTO tbl_detalleventas SET ?",
                                    [RegistroDetVent],
                                    (error, result) => {
                                        if (error) {
                                            console.log(error);
                                            return;
                                        } else {
                                            console.log("Detalle venta guardada");
                                        }

                                    }
                                );
                            });
                        }
                        res.redirect('/ventas');
                    }
                });
            }
        });
    });
    // Obtener el idInfo correspondiente al nombre en la tabla users_info

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
    const baseUrl = 'http://localhost:8181'
    req.getConnection((err, conn) => {
        conn.query('SELECT p.nombre, p.precioUnd, dv.Unidad FROM tbl_productos p INNER JOIN tbl_detalleventas dv ON p.idProductos = dv.idProductos WHERE dv.idVentas = ?', [idVentas], (err, productos) => {
            if (err) {
                res.json(err);
            }
            //console.log(productos)
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