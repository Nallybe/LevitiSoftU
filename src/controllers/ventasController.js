const PDFDocument = require('pdfkit');
const fs = require('fs');
const handlebars = require('handlebars');
const nodemailer = require('nodemailer');
const path = require('path');


function listar(req, res) {
    usuarioRoles = req.session.roles;
    req.getConnection((err, conn) => {
        conn.query(`
                SELECT tbl_ventas.*, users_info.nombre, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS cont
                FROM tbl_ventas
                JOIN users_info ON tbl_ventas.idInfo = users_info.idInfo;
            `, (err, ventas) => {
            if (err) {
                return res.json(err);
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
            res.render('ventas/ventas', { ventas: ventasFormateadas });
        })

    });
}

function crear(req, res) {
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM tbl_ventas", (err, ventas) => {
            if (err) {
                res.json(err);
            } conn.query(`SELECT ui.nombre FROM users_info ui JOIN users_access ua ON ui.idAccess = ua.idAccess JOIN tbl_roles tr ON ua.idRoles = tr.idRoles WHERE tr.nombreRoles = 'cliente' AND tr.estado = 'A';
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
    //console.log(data);
    const valoresNoVacios = [];

    for (const valor of data.cantidadProducto) {
        if (valor !== '') {
            valoresNoVacios.push(valor);
        }
    }

    if (valoresNoVacios.length > 0) {
        const valorUnico = valoresNoVacios.join(', '); // Unir los valores en una cadena
        //console.log("Valores no vacíos:", valorUnico);

        let idProducto = data.idProducto;
        let unidadesArray = valorUnico;
        //console.log("Unidades: ", unidadesArray)
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
        console.log("Data: ", data)
        req.getConnection((err, conn) => {
            if (err) {
                console.error('Error al obtener la conexión:', err);
                res.status(500).json({ error: 'Error al obtener la conexión' });
                return;
            }

            conn.query('SELECT ui.idInfo, ua.correo FROM users_info ui JOIN users_access ua ON ui.idAccess = ua.idAccess WHERE ui.nombre = ? ', [data.nombre], (error, results) => {
                if (error) {
                    console.error('Error al obtener el idInfo:', error);
                    res.status(500).json({ error: 'Error al obtener el idInfo' });
                } else if (results.length === 0) {
                    console.error('No se encontró el nombre en la tabla users_info');
                    res.status(404).json({ error: 'No se encontró el nombre en la tabla users_info' });
                } else {
                    const idInfo = results[0].idInfo;
                    const correo = results[0].correo;
                    const RegistroVenta = {
                        idInfo: idInfo,
                        total: data.total,
                        fecha: data.fecha,
                        descripcion: data.descripcion,
                        estado: data.estado,
                    };
                    console.log("Ventas: ", RegistroVenta)
                    nombre = data.nombre;
                    conn.query('INSERT INTO tbl_ventas SET ?', [RegistroVenta], (error, result) => {
                        if (error) {
                            console.error('Error al insertar los datos en tbl_ventas:', error);
                            res.status(500).json({ error: 'Error al insertar los datos en tbl_ventas' });
                        } else {
                            const idVentas = result.insertId;
                            // Actualizar número de ventas en la tabla "users_access"
                            conn.query(`UPDATE users_info SET idVentas = idVentas + 1 WHERE idAccess IN (SELECT ua.idAccess FROM users_access ua JOIN tbl_roles tr ON ua.idRoles = tr.idRoles WHERE tr.nombreRoles = 'Cliente') AND nombre = ?;
                            `, [data.nombre], (error) => {
                                if (error) {
                                    console.error('Error al actualizar el número de ventas:', error);
                                } else {
                                    console.log('Número de ventas actualizadas ');
                                }
                            });
                            for (let i = 0; i < idProducto.length; i++) {
                                const RegistroDetVent = {
                                    idVentas: idVentas,
                                    idProducto: idProducto[i],
                                    Unidad: unidadesArray[i]
                                };
                                //console.log("Registro de venta: ", RegistroDetVent)
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
                                // Obtener las unidades disponibles del producto
                                conn.query('SELECT stock FROM tbl_productos WHERE idProducto = ?', [idProducto[i]], (error, productoResult) => {
                                    if (error) {
                                        console.error('Error al obtener las unidades del producto:', error);
                                    } else {
                                        const unidadesDisponibles = productoResult[0].stock;
                                        const unidadesVendidas = unidadesArray[i];

                                        // Restar las unidades vendidas de las unidades disponibles
                                        const nuevasUnidadesDisponibles = unidadesDisponibles - unidadesVendidas;

                                        // Actualizar las unidades disponibles en la tabla "tbl_productos"
                                        conn.query('UPDATE tbl_productos SET stock = ? WHERE idProducto = ?', [nuevasUnidadesDisponibles, idProducto[i]], (error) => {
                                            if (error) {
                                                console.error('Error al actualizar las unidades del producto:', error);
                                            } else {
                                                console.log('Unidades actualizadas en tbl_productos');
                                            }
                                        });

                                    }
                                });

                            }
                        }
                    });
                    // Obtener la información de los productos
                    conn.query('SELECT idProducto, nombre, descripcion FROM tbl_productos WHERE idProducto IN (?)', [idProducto], (error, productoResults) => {
                        if (error) {
                            console.error('Error al obtener la información de los productos:', error);
                            res.status(500).json({ error: 'Error al obtener la información de los productos' });
                        } else {

                            crearFacturaPDF(RegistroVenta, productoResults, unidadesArray, nombre, correo, (facturaPath, nombreUsuario, correo) => {
                                enviarFacturaPorCorreo(correo, facturaPath, nombreUsuario);
                                res.redirect('/ventas?alert=success')
                            });
                        }
                    });
                }
            });
        });
    }
}

// Función para crear la factura PDF
function crearFacturaPDF(venta, productos, unidades, nombre, correo, callback) {
    const doc = new PDFDocument();

    // Configurar las cabeceras del PDF
    doc.info['Title'] = 'Factura de Venta';
    doc.info['Author'] = 'Tu Nombre';
    doc.info['Subject'] = `Factura_${venta.idInfo}_${venta.fecha}.pdf`;



    // Información de la venta
    const nombreUsuario = nombre;
    const totalVenta = venta.total;
    const fechaVenta = venta.fecha;
    const estadoVenta = venta.estado;
    const descripcionVenta = venta.descripcion; // Agregar la descripción de la venta

    // Encabezado de la factura
    doc.font('Helvetica-Bold').fontSize(16).text('Factura de Venta', { align: 'center' });
    doc.moveDown();

    // Detalles de la venta
    const detallesVenta = [
        `Nombre del Cliente: ${nombreUsuario}`,
        `Fecha de Venta: ${fechaVenta}`,
        `Estado de la Venta: ${estadoVenta}`,
        `Descripción de la Venta: ${descripcionVenta}`
    ];

    detallesVenta.forEach((detalle) => {
        doc.font('Helvetica').fontSize(12).text(detalle);
    });

    // Productos comprados
    doc.moveDown().text('Productos comprados:');
    doc.moveDown();

    // Calculate the starting Y-coordinate for the table
    const tableTop = doc.y + 20; // Move the table down by 50 points
    const columnSpacing = 150;
    const rowSpacing = 30;

    // Calculate the center X-coordinate for the table
    const centerX = (doc.page.width - columnSpacing * 2) / 2;

    // Table headers
    doc.font('Helvetica-Bold').fontSize(12).text('Nombre', centerX - columnSpacing / 2, tableTop);
    doc.text('Unidades', centerX + columnSpacing / 2, tableTop);

    // Table rows
    productos.forEach((producto, index) => {
        const { nombre } = producto;
        const y = tableTop + rowSpacing * (index + 1);
        doc.font('Helvetica').fontSize(12).text(nombre, centerX - columnSpacing / 2, y);
        doc.text(unidades[index], centerX + columnSpacing / 2, y);
    });

    // Total de la venta
    doc.moveDown().font('Helvetica-Bold').fontSize(14).text(`Total: ${totalVenta}`, { align: 'right' });

    // Finalizar el PDF y guardar en un archivo temporal
    const tempFilePath = path.join(__dirname, 'factura_temp.pdf');
    doc.end();
    doc.pipe(fs.createWriteStream(tempFilePath));

    // Llamar a la función de envío de correo electrónico con el archivo adjunto
    callback(tempFilePath, nombre, correo);
}

//Funcion para enviar el correo
function enviarFacturaPorCorreo(correo, facturaPath) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: 'levitisoft2021@gmail.com',
            pass: 'omqseuasqhquwqbp'
        },
    });

    let info = transporter.sendMail({
        from: '"Factura de venta Levitico" <levitisoft2021@gmail.com>',
        to: correo,
        subject: "Factura de Venta Levitico",
        text: "Adjuntamos la factura de su compra.",
        attachments: [
            {
                filename: 'factura.pdf',
                path: facturaPath
            }
        ]
    }, (err, info) => {
        if (err) {
            console.error(err);
        } else {
            //console.log('Correo enviado: ' + info.response);
        }
    });

    // Verificar si el archivo temporal existe antes de intentar eliminarlo
    if (fs.existsSync(facturaPath)) {
        // Eliminar el archivo temporal después de enviar el correo
        fs.unlink(facturaPath, (err) => {
            if (err) {
                console.error('Error al eliminar el archivo temporal:', err);
            } else {
                console.log('Archivo temporal eliminado:', facturaPath);

            }
        });
    }

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
    //console.log("IdVentas: ", idVentas)
    const baseUrl = 'http://localhost:8181'
    req.getConnection((err, conn) => {
        conn.query('SELECT p.imagen, p.nombre, p.precio, dv.Unidad FROM tbl_productos p INNER JOIN tbl_detalleventas dv ON p.idProducto = dv.idProducto WHERE dv.idVentas = ?', [idVentas], (err, productos) => {
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