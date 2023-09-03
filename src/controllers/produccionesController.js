//Listar
function producciones_listar(req, res) {
    // Obtener la conexión a la base de datos
    req.getConnection((err, conn) => {
        if (err) {
            // Si hay un error al obtener la conexión, enviar una respuesta con el error
            return res.status(500).json(err);
        }
        // Consultar las producciones en la base de datos
        conn.query('SELECT * FROM tbl_ordenes_produccion ORDER BY fechaRegistro DESC;', (err, producciones) => {
            if (err) {
                // Si hay un error al consultar las producciones, enviar una respuesta con el error
                return res.status(500).json(err);
            }

            // Consultar los detalles de las producciones para cada Producción
            var cont = 1
            for (let index in producciones) {
                // Actualizar los campos de la Producción con la información obtenida
                producciones[index].cont = cont;
                cont++;
                producciones[index].fechaInicio = producciones[index].fechaInicio.toLocaleDateString();
                producciones[index].fechaFin = producciones[index].fechaFin.toLocaleDateString();

                // Actualizar el estado de la Producción
                switch (producciones[index].estado) {
                    case 'Iniciado':
                        producciones[index].estado1 = true;
                        break;
                    case 'Proceso':
                        producciones[index].estado2 = true;
                        break;
                    case 'Terminado':
                        producciones[index].estado3 = true;
                        break;
                }

            }

            // Consultar los usuarios
            conn.query("SELECT * FROM users_access", (err, usersA) => {
                if (err) {
                    return res.status(500).json(err);
                } else {
                    conn.query("SELECT * FROM users_info", (err, usersI) => {
                        if (err) {
                            return res.status(500).json(err);
                        } else {
                            for (index in producciones) {
                                producciones[index].userName;
                                producciones[index].userTell;
                                producciones[index].userNumC;
                                producciones[index].userEmail;
                                for (iA in usersA) {
                                    for (iI in usersI) {
                                        if (usersI[iI].idInfo == producciones[index].idInfo && usersI[iI].idAccess == usersA[iA].idAccess) {
                                            producciones[index].userName = usersI[iI].nombre;
                                            producciones[index].userTell = usersI[iI].telefono;
                                            producciones[index].userEmail = usersA[iA].correo;
                                        }
                                    }
                                }
                            }

                            // Consultar los productos de la tabla tbl_productos
                            conn.query("SELECT * FROM tbl_productos", (err, productos) => {
                                if (err) {
                                    // Si hay un error al consultar los usuarios, enviar una respuesta con el error
                                    return res.status(500).json(err);
                                }

                                // Actualizar los campos de la Producción con la información de los usuarios
                                for (let index in producciones) {
                                    for (let i in productos) {
                                        if (productos[i].idProducto == producciones[index].idProducto) {
                                            producciones[index].proName = productos[i].nombre;
                                            producciones[index].proDes = productos[i].descripcion;
                                            producciones[index].proPrecio = productos[i].precio;
                                            producciones[index].proStock = productos[i].stock;
                                            producciones[index].proImg = productos[i].imagen;
                                            // img
                                        }
                                    }
                                }

                                // Renderizar la plantilla 'producciones/listar' y enviar los datos a la vista
                                res.render('produccion/listar', { producciones });
                            });
                        }
                    });
                }
            });
        });
    });
}
//End Listar


//Detallar
async function producciones_detallar(req, res) {
    try {
        const idOrdenProduccion = req.params.idOrdenProduccion;
        const conn = await new Promise((resolve, reject) => {
            req.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(conn);
                }
            });
        });

        const producciones = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM tbl_ordenes_produccion WHERE idOrdenProduccion = ?", [idOrdenProduccion], (err, producciones) => {
                if (err) {
                    reject(err);
                } else {
                    for (let index in producciones) {

                        switch (producciones[index].estado) {
                            case 'Iniciado':
                                producciones[index].estado1 = true;
                                break;
                            case 'Proceso':
                                producciones[index].estado2 = true;
                                break;
                            case 'Terminado':
                                producciones[index].estado3 = true;
                                break;
                        }
                    }
                    resolve(producciones);
                }
            });
        });

        const users = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM users_info", (err, users) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(users);
                }
            });
        });

        const users2 = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM users_access", (err, users) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(users);
                }
            });
        });

        let idProducto;
        let cantidadProducir;

        for (let index in producciones) {
            for (let i in users) {
                for (let i2 in users2) {
                    if (users[i].idInfo == producciones[index].idInfo && users[i].idAccess == users2[i2].idAccess) {
                        producciones[index].userName = users[i].nombre;
                        producciones[index].userTell = users[i].telefono;
                        producciones[index].userEmail = users2[i2].correo;
                    }
                }
            }
            idProducto = producciones[index].idProducto;
            cantidadProducir = producciones[index].cantidad;
        }

        const productos = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM tbl_productos", (err, productos) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(productos);
                }
            });
        });

        for (let index in producciones) {
            for (let i in productos) {
                if (productos[i].idProducto == producciones[index].idProducto) {
                    producciones[index].proName = productos[i].nombre;
                    producciones[index].proDes = productos[i].descripcion;
                    producciones[index].proPrecio = productos[i].precio;
                    producciones[index].proStock = productos[i].stock;
                    producciones[index].proImg = productos[i].imagen;
                }
            }
        }

        const d_produccion = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM tbl_ordenes_produccion_detalles WHERE idOrdenProduccion = ?", [idOrdenProduccion], (err, d_produccion) => {
                if (err) {
                    reject(err);
                } else {
                    var cont = 1;
                    for (let index in d_produccion) {
                        switch (d_produccion[index].estado) {
                            case 'Iniciado':
                                d_produccion[index].estado1 = true;
                                break;
                            case 'Proceso':
                                d_produccion[index].estado2 = true;
                                break;
                            case 'Terminado':
                                d_produccion[index].estado3 = true;
                                break;
                        }
                        d_produccion[index].cont = cont;
                        cont++;
                    }
                    resolve(d_produccion);
                }
            });
        });

        for (let index in d_produccion) {
            const participes = await new Promise((resolve, reject) => {
                conn.query("SELECT * FROM tbl_ordenes_produccion_detalles_participes WHERE idDetalleOrdenProduccion = ?", [d_produccion[index].idDetalleOrdenProduccion], (err, participes) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(participes);
                    }
                });
            });

            d_produccion[index].participes = participes;

            var contd = 1;
            for (let index1 in d_produccion[index].participes) {
                d_produccion[index].participes[index1].cont = contd;
                contd++;
                for (let i in users) {
                    for (let i2 in users2) {
                        if (users[i].idInfo == d_produccion[index].participes[index1].idInfo && users2[i2].idAccess == users[i].idAccess) {
                            d_produccion[index].participes[index1].userName = users[i].nombre;
                            d_produccion[index].participes[index1].userTell = users[i].telefono;
                            d_produccion[index].participes[index1].userEmail = users2[i2].correo;
                        }
                    }
                }
            }
        }

        const d_producto = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM tbl_productos_detalles WHERE idProducto = ?", [idProducto], (err, d_producto) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(d_producto);
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

        let cont = 1;
        for (index in d_producto) {
            d_producto[index].cont = cont;
            d_producto[index].nombreI;
            d_producto[index].medidaI;
            d_producto[index].cantidadI;
            d_producto[index].estadoI;
            d_producto[index].totalN = d_producto[index].cantidad_n * cantidadProducir;

            for (i in insumos) {
                if (insumos[i].idInsumo == d_producto[index].idInsumo) {
                    d_producto[index].nombreI = insumos[i].nombre;
                    d_producto[index].medidaI = insumos[i].medida;
                    d_producto[index].cantidadI = insumos[i].stock;
                    d_producto[index].estadoI = insumos[i].estado;
                }
            }
            cont++;
        }

        for (i in producciones) {
            producciones[i].fechaInicio = producciones[i].fechaInicio.toLocaleDateString();
            producciones[i].fechaFin = producciones[i].fechaFin.toLocaleDateString();
        }

        function convertToISODate(dateString) {
            const parts = dateString.split('/');
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${year}-${month}-${day}`;
        }

        var eventos = []
        for (i in d_produccion) {
            d_produccion[i].fechaInicio = convertToISODate(d_produccion[i].fechaInicio.toLocaleDateString());  //
            d_produccion[i].fechaFin = convertToISODate(d_produccion[i].fechaFin.toLocaleDateString()); //;
            d_produccion[i].fechaEstado = d_produccion[i].fechaEstado.toLocaleString();

            var color;
            if (d_produccion[i].estado1) {
                color = '#62a1fd'
            }
            if (d_produccion[i].estado2) {
                color = '#6ab090'
            }
            if (d_produccion[i].estado3) {
                color = '#a0a6ab'
            }

            var evento = {
                title: 'Tarea #' + d_produccion[i].cont + ' ' + d_produccion[i].titulo,
                start: d_produccion[i].fechaInicio,
                end: d_produccion[i].fechaFin,
                color: color
            }
            eventos.push(evento);
        }

        //console.log(eventos)
        eventosList = {
            eventos
        }
        //console.log(eventosList)

        res.render("produccion/detallar", { producciones, d_produccion, d_producto, eventosList });
    } catch (err) {
        res.status(500).json(err);
    }
}
//End Detallar


//Crear (Función para redireccionar al hbs donde se encuentra el formulario)
function producciones_crear(req, res) {
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM users_access WHERE estado ='A'", (err, usuarios) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                conn.query("SELECT * FROM users_info", (err, usuarios2) => {
                    if (err) {
                        return res.status(500).json(err);
                    } else {

                        for (let i in usuarios) {
                            for (let i2 in usuarios2) {
                                if (usuarios[i].idAccess == usuarios2[i2].idAccess) {
                                    usuarios[i].nombre = usuarios2[i].nombre;
                                    usuarios[i].telefono = usuarios2[i].telefono;
                                }
                            }
                        }

                        conn.query("SELECT * FROM tbl_productos WHERE estado ='A'", (err, productos) => {
                            if (err) {
                                return res.status(500).json(err);
                            } else {

                                for (i in productos) {
                                    switch (productos[i].idCategoria) {
                                        case 1:
                                            productos[i].categoria = 'Accesorios';
                                            break;
                                        case 2:
                                            productos[i].categoria = 'Billeteras';
                                            break;
                                        case 3:
                                            productos[i].categoria = 'Bolsos';
                                            break;
                                        case 4:
                                            productos[i].categoria = 'Chaquetas';
                                            break;
                                        case 5:
                                            productos[i].categoria = 'Morrales';
                                            break;
                                        case 6:
                                            productos[i].categoria = 'Zapatos';
                                            break;
                                    }
                                }
                                res.render("produccion/registrar", { usuarios, productos });
                            }
                        });
                    }
                });
            }
        });
    });
}
//End Crear


//Registrar Producción
async function producciones_registrar(req, res) {
    try {
        var data = req.body;
        console.log(data);

        // Capturar Encargado
        const conn = await new Promise((resolve, reject) => {
            req.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(conn);
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

        for (let index in usersA) {
            for (let i in usersI) {
                if (data.idEncargado == usersA[index].correo && usersA[index].idAccess == usersI[i].idAccess) {
                    data.idEncargado = usersI[i].idInfo;
                    console.log("Encargado encontrado");
                }
            }
        }
        // End Capturar Encargado

        //Capturar idProducto
        const productos = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM tbl_productos", (err, productos) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(productos);
                }
            });
        });

        for (let i in productos) {
            if (data.idProducto == productos[i].nombre) {
                data.idProducto = productos[i].idProducto;
                console.log("Producto encontrado");
            }
        }
        //End capturar idProducto

        // Definir registro orden
        const RegistroOrden = {
            idInfo: data.idEncargado,
            idProducto: data.idProducto,
            cantidad: data.cantidad,
            fechaInicio: data.fechaInicio,
            fechaFin: data.fechaFin
        };

        // Registrar Orden
        const result = await new Promise((resolve, reject) => {
            conn.query("INSERT INTO tbl_ordenes_produccion SET ?", [RegistroOrden], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("Orden Registrada");
                    resolve(result);
                }
            });
        });
        // End Registrar Orden

        // Captura idOrden
        const idOrdenProduccion = result.insertId;

        // Registrar Detalles y Reconocer si se manda 1 o más detalles
        if (data.titulo[0].length > 1) {
            // Más de un detalle

            for (let index_d in data.titulo) {
                const detalle = await new Promise((resolve, reject) => {
                    conn.query(`INSERT INTO tbl_ordenes_produccion_detalles(idOrdenProduccion, titulo, descripcion, observacion, fechaInicio, fechaFin) VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            idOrdenProduccion,
                            data.titulo_a[index_d],
                            data.descripcion[index_d],
                            data.observacion[index_d],
                            data.fechaInicio_detalle[index_d],
                            data.fechaFin_detalle[index_d]
                        ],
                        (err, detalle) => {
                            if (err) {
                                reject(err);
                            } else {
                                console.log("Detalle Registrado");
                                resolve(detalle);
                            }
                        }
                    );
                });

                // Capturar idDetalleReparación
                const idDetalleOrdenProduccion = detalle.insertId;
                const part = data.titulo[index_d] + '_idParticipante';

                //Registrar Participantes
                if (data[part][0].length > 1) {
                    // Más de un participante

                    for (let index in data[part]) {

                        //Capturar idParticipante
                        for (let ix in usersA) {
                            for (let i in usersI) {
                                if (data[part][index] == usersA[ix].correo && usersA[ix].idAccess == usersI[i].idAccess) {
                                    data[part][index] = usersI[i].idInfo;
                                    //console.log("Participante encontrado");
                                }
                            }
                        }
                        //End Capturar idParticipante

                        await new Promise((resolve, reject) => {
                            conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                                [
                                    idDetalleOrdenProduccion,
                                    data[part][index]
                                ],
                                (err) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        console.log("Participante Registrado");
                                        resolve();
                                    }
                                }
                            );
                        });
                    }

                } else {
                    // Un Partícipe

                    //Capturar idParticipante
                    for (let index in usersA) {
                        for (let i in usersI) {
                            if (data[part] == usersA[index].correo && usersA[index].idAccess == usersI[i].idAccess) {
                                data[part] = usersI[i].idInfo;
                                //console.log("Participante encontrado");
                            }
                        }
                    }
                    //End Capturar idParticipante


                    await new Promise((resolve, reject) => {
                        conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                            [
                                idDetalleOrdenProduccion,
                                data[part],
                            ],
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    console.log("Participante Registrado");
                                    resolve();
                                }
                            }
                        );
                    });
                }
                //End Registrar Participantes
            }

        } else {
            // Un detalle

            const detalle = await new Promise((resolve, reject) => {
                conn.query(`INSERT INTO tbl_ordenes_produccion_detalles(idOrdenProduccion, titulo, descripcion, observacion, fechaInicio, fechaFin) VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        idOrdenProduccion,
                        data.titulo_a,
                        data.descripcion,
                        data.observacion,
                        data.fechaInicio_detalle,
                        data.fechaFin_detalle
                    ],
                    (err, detalle) => {
                        if (err) {
                            reject(err);
                        } else {
                            console.log("Detalle Registrado");
                            resolve(detalle);
                        }
                    }
                );
            });

            // Capturar idDetalleReparación
            const idDetalleOrdenProduccion = detalle.insertId;
            const part = data.titulo + '_idParticipante';

            //Registrar Participantes
            if (data[part][0].length > 1) {
                // Más de un participante

                for (let index in data[part]) {

                    //Capturar idParticipante
                    for (let ix in usersA) {
                        for (let i in usersI) {
                            if (data[part] == usersA[ix].correo && usersA[ix].idAccess == usersI[i].idAccess) {
                                data[part] = usersI[i].idInfo;
                                //console.log("Participante encontrado");
                            }
                        }
                    }
                    //End Capturar idParticipante

                    await new Promise((resolve, reject) => {
                        conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                            [
                                idDetalleOrdenProduccion,
                                data[part][index]
                            ],
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    console.log("Participante Registrado");
                                    resolve();
                                }
                            }
                        );
                    });
                }

            } else {
                // Un Partícipe

                //Capturar idParticipante
                for (let index in usersA) {
                    for (let i in usersI) {
                        if (data[part] == usersA[index].correo && usersA[index].idAccess == usersI[i].idAccess) {
                            data[part] = usersI[i].idInfo;
                            //console.log("Participante encontrado");
                        }
                    }
                }
                //End Capturar idParticipante


                await new Promise((resolve, reject) => {
                    conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                        [
                            idDetalleOrdenProduccion,
                            data[part],
                        ],
                        (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                console.log("Participante Registrado");
                                resolve();
                            }
                        }
                    );
                });
            }
            //End Registrar Participantes

        }
        // End Registrar Detalles

        // Redireccionar
        console.log("Registro de orden de producción exitoso");
        res.redirect("/produccion");
    } catch (err) {
        res.status(500).json(err);
    }
}
//End Registrar Producción


//Editar
function producciones_editar(req, res) {
    const idOrden = req.params.idOrden;
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM tbl_ordenes_produccion WHERE idOrdenProduccion = ?', [idOrden], async (err, produccion) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                const usersI = await new Promise((resolve, reject) => {
                    conn.query("SELECT * FROM users_info", (err, info) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(info);
                        }
                    });
                });
                const usersA = await new Promise((resolve, reject) => {
                    conn.query("SELECT * FROM users_access", (err, access) => {
                        if (err) {
                            reject(err);
                        } else {
                            for (let i in access) {
                                for (let i2 in usersI) {
                                    if (access[i].idAccess == usersI[i2].idAccess) {
                                        access[i].nombre = usersI[i].nombre;
                                        access[i].telefono = usersI[i].telefono;
                                    }
                                }
                            }
                            resolve(access);
                        }
                    });
                });

                const productos = await new Promise((resolve, reject) => {
                    conn.query("SELECT * FROM tbl_productos", (err, prod) => {
                        if (err) {
                            reject(err);
                        } else {

                            for (i in prod) {
                                switch (prod[i].idCategoria) {
                                    case 1:
                                        prod[i].categoria = 'Accesorios';
                                        break;
                                    case 2:
                                        prod[i].categoria = 'Billeteras';
                                        break;
                                    case 3:
                                        prod[i].categoria = 'Bolsos';
                                        break;
                                    case 4:
                                        prod[i].categoria = 'Chaquetas';
                                        break;
                                    case 5:
                                        prod[i].categoria = 'Morrales';
                                        break;
                                    case 6:
                                        prod[i].categoria = 'Zapatos';
                                        break;
                                }
                            }
                            resolve(prod);
                        }
                    });
                });

                for (i in produccion) {
                    for (iI in usersI) {
                        for (iA in usersA) {
                            if (produccion[i].idInfo == usersI[iI].idInfo && usersI[iI].idAccess == usersA[iA].idAccess) {
                                produccion[i].idInfo = usersI[iI].nombre;
                            }
                        }

                    }

                    // Actualizar el estado de la Producción
                    switch (produccion[i].estado) {
                        case 'Iniciado':
                            produccion[i].estado1 = true;
                            break;
                        case 'Proceso':
                            produccion[i].estado2 = true;
                            break;
                    }

                    let day = produccion[i].fechaInicio.getDate();
                    let month = produccion[i].fechaInicio.getMonth() + 1;
                    let year = produccion[i].fechaInicio.getFullYear();

                    if (month < 10 && day < 10) {
                        produccion[i].fechaInicio = `${year}-0${month}-0${day}`
                    } else {
                        if (month < 10 && day >= 10) {
                            produccion[i].fechaInicio = `${year}-0${month}-${day}`
                        } else {
                            if (month >= 10 && day < 10) {
                                produccion[i].fechaInicio = `${year}-${month}-0${day}`
                            } else {
                                if (month >= 10 && day >= 10) {
                                    produccion[i].fechaInicio = `${year}-${month}-${day}`
                                }
                            }
                        }
                    }

                    let day1 = produccion[i].fechaFin.getDate();
                    let month1 = produccion[i].fechaFin.getMonth() + 1;
                    let year1 = produccion[i].fechaFin.getFullYear();

                    if (month1 < 10 && day1 < 10) {
                        produccion[i].fechaFin = `${year1}-0${month1}-0${day1}`
                    } else {
                        if (month1 < 10 && day1 >= 10) {
                            produccion[i].fechaFin = `${year1}-0${month1}-${day1}`
                        } else {
                            if (month1 >= 10 && day1 < 10) {
                                produccion[i].fechaFin = `${year1}-${month1}-0${day1}`
                            } else {
                                if (month1 >= 10 && day1 >= 10) {
                                    produccion[i].fechaFin = `${year1}-${month1}-${day1}`
                                }
                            }
                        }
                    }

                    conn.query('SELECT * FROM tbl_productos', (err, productos) => {
                        if (err) {
                            return res.status(500).json(err);
                        } else {
                            for (i in produccion) {
                                for (index in productos) {
                                    if (produccion[i].idProducto == productos[index].idProducto) {
                                        produccion[i].idProducto = productos[index].nombre;
                                    }
                                }
                            }
                        }
                    });

                }
                conn.query('SELECT * FROM tbl_ordenes_produccion_detalles WHERE idOrdenProduccion = ?', [idOrden], async (err, d_produccion) => {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        var cont = 0;
                        var contMas = 0;
                        for (let index in d_produccion) {
                            cont--;
                            contMas++;
                            d_produccion[index].cont = cont;
                            d_produccion[index].contMas = contMas;
                            // Actualizar el estado de la Producción para que en el hbs el estado tenga su propio diseño dependiendo del valor
                            switch (d_produccion[index].estado) {
                                case 'Iniciado':
                                    d_produccion[index].estado1 = true;
                                    break;
                                case 'Proceso':
                                    d_produccion[index].estado2 = true;
                                    break;
                                case 'Terminado':
                                    d_produccion[index].estado3 = true;
                                    break;
                            }


                            let day = d_produccion[index].fechaInicio.getDate();
                            let month = d_produccion[index].fechaInicio.getMonth() + 1;
                            let year = d_produccion[index].fechaInicio.getFullYear();

                            if (month < 10 && day < 10) {
                                d_produccion[index].fechaInicio = `${year}-0${month}-0${day}`
                            } else {
                                if (month < 10 && day >= 10) {
                                    d_produccion[index].fechaInicio = `${year}-0${month}-${day}`
                                } else {
                                    if (month >= 10 && day < 10) {
                                        d_produccion[index].fechaInicio = `${year}-${month}-0${day}`
                                    } else {
                                        if (month >= 10 && day >= 10) {
                                            d_produccion[index].fechaInicio = `${year}-${month}-${day}`
                                        }
                                    }
                                }
                            }

                            let day1 = d_produccion[index].fechaFin.getDate();
                            let month1 = d_produccion[index].fechaFin.getMonth() + 1;
                            let year1 = d_produccion[index].fechaFin.getFullYear();

                            if (month1 < 10 && day1 < 10) {
                                d_produccion[index].fechaFin = `${year1}-0${month1}-0${day1}`
                            } else {
                                if (month1 < 10 && day1 >= 10) {
                                    d_produccion[index].fechaFin = `${year1}-0${month1}-${day1}`
                                } else {
                                    if (month1 >= 10 && day1 < 10) {
                                        d_produccion[index].fechaFin = `${year1}-${month1}-0${day1}`
                                    } else {
                                        if (month1 >= 10 && day1 >= 10) {
                                            d_produccion[index].fechaFin = `${year1}-${month1}-${day1}`
                                        }
                                    }
                                }
                            }


                            d_produccion[index].participes = await new Promise((resolve, reject) => {
                                conn.query("SELECT * FROM tbl_ordenes_produccion_detalles_participes WHERE idDetalleOrdenProduccion = ?", [d_produccion[index].idDetalleOrdenProduccion], async (err, participes) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        var cont_i = 0;
                                        var cont_c = 0;

                                        const usersI = await new Promise((resolve, reject) => {
                                            conn.query("SELECT * FROM users_info", (err, info) => {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    resolve(info);
                                                }
                                            });
                                        });
                                        const usersA = await new Promise((resolve, reject) => {
                                            conn.query("SELECT * FROM users_access", (err, access) => {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    resolve(access);
                                                }
                                            });
                                        });

                                        for (i in participes) {
                                            for (iI in usersI) {
                                                for (iA in usersA) {
                                                    if (participes[i].idInfo == usersI[iI].idInfo && usersI[iI].idAccess == usersA[iA].idAccess) {
                                                        cont_i--;
                                                        cont_c++;
                                                        participes[i].cont_i = cont_i;
                                                        participes[i].cont_c = cont_c;
                                                        participes[i].idInfo = usersA[iA].correo;
                                                    }
                                                }

                                            }
                                        }
                                        resolve(participes);
                                    }
                                });
                            });


                        }

                        res.render('produccion/editar', { produccion, d_produccion, productos, usersA });
                    }
                });
            }
        });
    });
}
//End Editar


//Modificar
async function producciones_modificar(req, res) {
    try {
        const idOrdenProduccion = req.params.idOrden;
        const data = req.body;
        console.log(data);

        const conn = await new Promise((resolve, reject) => {
            req.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(conn);
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

        //Capturar idProducto
        const productos = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM tbl_productos", (err, productos) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(productos);
                }
            });
        });

        for (let i in productos) {
            if (data.idProducto == productos[i].nombre) {
                data.idProducto = productos[i].idProducto;
                console.log("Producto encontrado");
            }
        }
        //End capturar idProducto

        // Definir registro orden
        const RegistroOrden = {
            //idInfo: data.idEncargado,
            idProducto: data.idProducto,
            cantidad: data.cantidad,
            fechaInicio: data.fechaInicio,
            fechaFin: data.fechaFin
        };


        // Actualizar Orden
        await new Promise((resolve, reject) => {
            conn.query("UPDATE tbl_ordenes_produccion SET ? WHERE idOrdenProduccion = ?", [RegistroOrden, idOrdenProduccion], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("Orden Actualizada");
                    resolve();
                }
            });
        });
        // End Actualizar Orden



        //Reconocer si se mandan detalles ya registrados 
        if (data.titulo_1) {

            //Capturar detalles
            const detalles_1 = await new Promise((resolve, reject) => {
                conn.query("SELECT * FROM tbl_ordenes_produccion_detalles WHERE idOrdenProduccion = ?", [idOrdenProduccion], (err, detalles) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(detalles);
                    }
                });
            });

            // Editar Detalles y Reconocer si se manda 1 o más detalles ya registrados 
            if (data.titulo_1[0].length > 1) {
                // Más de un detalle

                let editar_s = true;

                for (let index_d in data.titulo_1) {
                    if (data.titulo_2 || data.estado_1[index_d] != "Terminado") {
                        editar_s = false;
                    }
                }

                if (editar_s == true) {

                    const orden = await new Promise((resolve, reject) => {
                        conn.query("SELECT * FROM tbl_ordenes_produccion WHERE idOrdenProduccion = ?", [idOrdenProduccion], (err, orden) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(orden);
                            }
                        });
                    });

                    const d_producto = await new Promise((resolve, reject) => {
                        conn.query("SELECT * FROM tbl_productos_detalles WHERE idProducto = ?", [data.idProducto], (err, d_producto) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(d_producto);
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

                    let editar_d = true;

                    for (let o in orden) {
                        for (let p in d_producto) {
                            for (let ins in insumos) {
                                if (d_producto[p].idInsumo == insumos[ins].idInsumo) {

                                    if ((parseInt(orden[o].cantidad) * parseInt(d_producto[p].cantidad_n)) > parseInt(insumos[ins].stock)) {
                                        editar_d = false;
                                    }

                                }

                            }

                        }

                    }

                    if (editar_d == true) {

                        for (let index_d in data.titulo_1) {

                            const RegistroDetalleOrden = {
                                titulo: data.titulo_1_a[index_d],
                                descripcion: data.descripcion_1[index_d],
                                observacion: data.observacion_1[index_d],
                                fechaInicio: data.fechaInicio_detalle_1[index_d],
                                fechaFin: data.fechaFin_detalle_1[index_d],
                                estado: data.estado_1[index_d]
                            }

                            await new Promise((resolve, reject) => {
                                conn.query(`UPDATE tbl_ordenes_produccion_detalles SET ? WHERE idOrdenProduccion = ? AND idDetalleOrdenProduccion = ?`,
                                    [
                                        RegistroDetalleOrden,
                                        idOrdenProduccion,
                                        data.idDetalleOrdenProduccion_1[index_d],
                                    ],
                                    (err, detalle) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            console.log("Detalle Actualizado");
                                            resolve();
                                        }
                                    }
                                );
                            });

                            // Capturar idDetalleReparación
                            const idDetalleOrdenProduccion = data.idDetalleOrdenProduccion_1[index_d];
                            const part = data.titulo_1[index_d] + '_idParticipante';

                            // Eliminar detalles de los detalle
                            await new Promise((resolve, reject) => {
                                conn.query("DELETE FROM tbl_ordenes_produccion_detalles_participes WHERE idDetalleOrdenProduccion = ?", [idDetalleOrdenProduccion], (err, result) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        //console.log("Parts Eliminados");
                                        resolve();
                                    }
                                });
                            });
                            // End Eliminar detalles de los detalle

                            //Registrar Participantes
                            if (data[part][0].length > 1) {
                                // Más de un participante

                                for (let index in data[part]) {

                                    //Capturar idParticipante
                                    for (let ix in usersA) {
                                        for (let i in usersI) {
                                            if (data[part][index] == usersA[ix].correo && usersA[ix].idAccess == usersI[i].idAccess) {
                                                data[part][index] = usersI[i].idInfo;
                                                //console.log("Participante encontrado");
                                            }
                                        }
                                    }
                                    //End Capturar idParticipante

                                    await new Promise((resolve, reject) => {
                                        conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                                            [
                                                idDetalleOrdenProduccion,
                                                data[part][index]
                                            ],
                                            (err) => {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    //console.log("Participante Registrado");
                                                    resolve();
                                                }
                                            }
                                        );
                                    });
                                }

                            } else {
                                // Un Partícipe

                                //Capturar idParticipante
                                for (let index in usersA) {
                                    for (let i in usersI) {
                                        if (data[part] == usersA[index].correo && usersA[index].idAccess == usersI[i].idAccess) {
                                            data[part] = usersI[i].idInfo;
                                            //console.log("Participante encontrado");
                                        }
                                    }
                                }
                                //End Capturar idParticipante


                                await new Promise((resolve, reject) => {
                                    conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                                        [
                                            idDetalleOrdenProduccion,
                                            data[part],
                                        ],
                                        (err) => {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                //console.log("Participante Registrado");
                                                resolve();
                                            }
                                        }
                                    );
                                });
                            }
                            //End Registrar Participantes

                        }


                        ////RESTAR INSUMOS Y SUMAR PRODUCTOS 

                        for (let o in orden) {
                            for (let p in d_producto) {
                                for (let ins in insumos) {
                                    if (d_producto[p].idInsumo == insumos[ins].idInsumo) {
                                        let cantidadRestar = parseInt(orden[o].cantidad) * parseInt(d_producto[p].cantidad_n);

                                        await new Promise((resolve, reject) => {
                                            conn.query(`UPDATE tbl_insumos SET stock = stock - ? WHERE idInsumo = ?`,
                                                [
                                                    cantidadRestar,
                                                    insumos[ins].idInsumo
                                                ],
                                                (err, insumo) => {
                                                    if (err) {
                                                        reject(err);
                                                    } else {
                                                        console.log("Insumo Actualizado");
                                                        resolve();
                                                    }
                                                }
                                            );
                                        });
                                    }
                                }
                            }

                            await new Promise((resolve, reject) => {
                                conn.query(`UPDATE tbl_productos SET stock = stock + ? WHERE idProducto = ?`,
                                    [
                                        orden[o].cantidad,
                                        orden[o].idProducto
                                    ],
                                    (err, producto) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            console.log("Producto Actualizado");
                                            resolve();
                                        }
                                    }
                                );
                            });
                        }


                        ////END RESTAR INSUMOS Y SUMAR PRODUCTOS  

                    } else {
                        for (let index_d in data.titulo_1) {

                            const RegistroDetalleOrden = {
                                titulo: data.titulo_1_a[index_d],
                                descripcion: data.descripcion_1[index_d],
                                observacion: data.observacion_1[index_d],
                                fechaInicio: data.fechaInicio_detalle_1[index_d],
                                fechaFin: data.fechaFin_detalle_1[index_d]
                            }

                            await new Promise((resolve, reject) => {
                                conn.query(`UPDATE tbl_ordenes_produccion_detalles SET ? WHERE idOrdenProduccion = ? AND idDetalleOrdenProduccion = ?`,
                                    [
                                        RegistroDetalleOrden,
                                        idOrdenProduccion,
                                        data.idDetalleOrdenProduccion_1[index_d],
                                    ],
                                    (err, detalle) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            console.log("Detalle Actualizado");
                                            resolve();
                                        }
                                    }
                                );
                            });

                            // Capturar idDetalleReparación
                            const idDetalleOrdenProduccion = data.idDetalleOrdenProduccion_1[index_d];
                            const part = data.titulo_1[index_d] + '_idParticipante';

                            // Eliminar detalles de los detalle
                            await new Promise((resolve, reject) => {
                                conn.query("DELETE FROM tbl_ordenes_produccion_detalles_participes WHERE idDetalleOrdenProduccion = ?", [idDetalleOrdenProduccion], (err, result) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        //console.log("Parts Eliminados");
                                        resolve();
                                    }
                                });
                            });
                            // End Eliminar detalles de los detalle

                            //Registrar Participantes
                            if (data[part][0].length > 1) {
                                // Más de un participante

                                for (let index in data[part]) {

                                    //Capturar idParticipante
                                    for (let ix in usersA) {
                                        for (let i in usersI) {
                                            if (data[part][index] == usersA[ix].correo && usersA[ix].idAccess == usersI[i].idAccess) {
                                                data[part][index] = usersI[i].idInfo;
                                                //console.log("Participante encontrado");
                                            }
                                        }
                                    }
                                    //End Capturar idParticipante

                                    await new Promise((resolve, reject) => {
                                        conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                                            [
                                                idDetalleOrdenProduccion,
                                                data[part][index]
                                            ],
                                            (err) => {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    //console.log("Participante Registrado");
                                                    resolve();
                                                }
                                            }
                                        );
                                    });
                                }

                            } else {
                                // Un Partícipe

                                //Capturar idParticipante
                                for (let index in usersA) {
                                    for (let i in usersI) {
                                        if (data[part] == usersA[index].correo && usersA[index].idAccess == usersI[i].idAccess) {
                                            data[part] = usersI[i].idInfo;
                                            //console.log("Participante encontrado");
                                        }
                                    }
                                }
                                //End Capturar idParticipante


                                await new Promise((resolve, reject) => {
                                    conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                                        [
                                            idDetalleOrdenProduccion,
                                            data[part],
                                        ],
                                        (err) => {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                //console.log("Participante Registrado");
                                                resolve();
                                            }
                                        }
                                    );
                                });
                            }
                            //End Registrar Participantes

                            console.log("No se pudo actualizar el estado ya que no hay insumos suficientes");

                        }
                    }

                } else {
                    for (let index_d in data.titulo_1) {

                        const RegistroDetalleOrden = {
                            titulo: data.titulo_1_a[index_d],
                            descripcion: data.descripcion_1[index_d],
                            observacion: data.observacion_1[index_d],
                            fechaInicio: data.fechaInicio_detalle_1[index_d],
                            fechaFin: data.fechaFin_detalle_1[index_d],
                            estado: data.estado_1[index_d]
                        }

                        await new Promise((resolve, reject) => {
                            conn.query(`UPDATE tbl_ordenes_produccion_detalles SET ? WHERE idOrdenProduccion = ? AND idDetalleOrdenProduccion = ?`,
                                [
                                    RegistroDetalleOrden,
                                    idOrdenProduccion,
                                    data.idDetalleOrdenProduccion_1[index_d],
                                ],
                                (err, detalle) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        console.log("Detalle Actualizado");
                                        resolve();
                                    }
                                }
                            );
                        });

                        // Capturar idDetalleReparación
                        const idDetalleOrdenProduccion = data.idDetalleOrdenProduccion_1[index_d];
                        const part = data.titulo_1[index_d] + '_idParticipante';

                        // Eliminar detalles de los detalle
                        await new Promise((resolve, reject) => {
                            conn.query("DELETE FROM tbl_ordenes_produccion_detalles_participes WHERE idDetalleOrdenProduccion = ?", [idDetalleOrdenProduccion], (err, result) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    //console.log("Parts Eliminados");
                                    resolve();
                                }
                            });
                        });
                        // End Eliminar detalles de los detalle

                        //Registrar Participantes
                        if (data[part][0].length > 1) {
                            // Más de un participante

                            for (let index in data[part]) {

                                //Capturar idParticipante
                                for (let ix in usersA) {
                                    for (let i in usersI) {
                                        if (data[part][index] == usersA[ix].correo && usersA[ix].idAccess == usersI[i].idAccess) {
                                            data[part][index] = usersI[i].idInfo;
                                            //console.log("Participante encontrado");
                                        }
                                    }
                                }
                                //End Capturar idParticipante

                                await new Promise((resolve, reject) => {
                                    conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                                        [
                                            idDetalleOrdenProduccion,
                                            data[part][index]
                                        ],
                                        (err) => {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                //console.log("Participante Registrado");
                                                resolve();
                                            }
                                        }
                                    );
                                });
                            }

                        } else {
                            // Un Partícipe

                            //Capturar idParticipante
                            for (let index in usersA) {
                                for (let i in usersI) {
                                    if (data[part] == usersA[index].correo && usersA[index].idAccess == usersI[i].idAccess) {
                                        data[part] = usersI[i].idInfo;
                                        //console.log("Participante encontrado");
                                    }
                                }
                            }
                            //End Capturar idParticipante


                            await new Promise((resolve, reject) => {
                                conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                                    [
                                        idDetalleOrdenProduccion,
                                        data[part],
                                    ],
                                    (err) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            //console.log("Participante Registrado");
                                            resolve();
                                        }
                                    }
                                );
                            });
                        }
                        //End Registrar Participantes



                    }
                }

            } else {
                // Un detalle

                if (!data.titulo_2 && data.estado_1 == "Terminado") {

                    const orden = await new Promise((resolve, reject) => {
                        conn.query("SELECT * FROM tbl_ordenes_produccion WHERE idOrdenProduccion = ?", [idOrdenProduccion], (err, orden) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(orden);
                            }
                        });
                    });

                    const d_producto = await new Promise((resolve, reject) => {
                        conn.query("SELECT * FROM tbl_productos_detalles WHERE idProducto = ?", [data.idProducto], (err, d_producto) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(d_producto);
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

                    let editar = true;

                    for (let o in orden) {
                        for (let p in d_producto) {
                            for (ins in insumos) {
                                if (d_producto[p].idInsumo == insumos[ins].idInsumo) {

                                    if ((parseInt(orden[o].cantidad) * parseInt(d_producto[p].cantidad_n)) > parseInt(insumos[ins].stock)) {
                                        editar = false;
                                    }

                                }

                            }

                        }

                    }

                    if (editar == true) {

                        const RegistroDetalleOrden = {
                            titulo: data.titulo_1_a,
                            descripcion: data.descripcion_1,
                            observacion: data.observacion_1,
                            fechaInicio: data.fechaInicio_detalle_1,
                            fechaFin: data.fechaFin_detalle_1,
                            estado: data.estado_1
                        }
    
                        await new Promise((resolve, reject) => {
                            conn.query(`UPDATE tbl_ordenes_produccion_detalles SET ? WHERE idOrdenProduccion = ? AND idDetalleOrdenProduccion = ?`,
                                [
                                    RegistroDetalleOrden,
                                    idOrdenProduccion,
                                    data.idDetalleOrdenProduccion_1,
                                ],
                                (err, detalle) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        console.log("Detalle Actualizado");
                                        resolve();
                                    }
                                }
                            );
                        });
    
                        // Capturar idDetalleReparación
                        const idDetalleOrdenProduccion = data.idDetalleOrdenProduccion_1;
                        const part = data.titulo_1 + '_idParticipante';
    
                        // Eliminar detalles de los detalle
                        await new Promise((resolve, reject) => {
                            conn.query("DELETE FROM tbl_ordenes_produccion_detalles_participes WHERE idDetalleOrdenProduccion = ?", [idDetalleOrdenProduccion], (err, result) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    //console.log("Insumos Eliminados");
                                    resolve();
                                }
                            });
                        });
                        // End Eliminar detalles de los detalle
    
                        //Registrar Participantes
                        if (data[part][0].length > 1) {
                            // Más de un participante
    
                            for (let index in data[part]) {
    
                                //Capturar idParticipante
                                for (let ix in usersA) {
                                    for (let i in usersI) {
                                        if (data[part][index] == usersA[ix].correo && usersA[ix].idAccess == usersI[i].idAccess) {
                                            data[part][index] = usersI[i].idInfo;
                                            //console.log("Participante encontrado");
                                        }
                                    }
                                }
                                //End Capturar idParticipante
    
                                await new Promise((resolve, reject) => {
                                    conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                                        [
                                            idDetalleOrdenProduccion,
                                            data[part][index]
                                        ],
                                        (err) => {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                //console.log("Participante Registrado");
                                                resolve();
                                            }
                                        }
                                    );
                                });
                            }
    
                        } else {
                            // Un Partícipe
    
                            //Capturar idParticipante
                            for (let index in usersA) {
                                for (let i in usersI) {
                                    if (data[part] == usersA[index].correo && usersA[index].idAccess == usersI[i].idAccess) {
                                        data[part] = usersI[i].idInfo;
                                        //console.log("Participante encontrado");
                                    }
                                }
                            }
                            //End Capturar idParticipante
    
    
                            await new Promise((resolve, reject) => {
                                conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                                    [
                                        idDetalleOrdenProduccion,
                                        data[part],
                                    ],
                                    (err) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            //console.log("Participante Registrado");
                                            resolve();
                                        }
                                    }
                                );
                            });
                        }
                        //End Registrar Participantes


                        ////RESTAR INSUMOS Y SUMAR PRODUCTOS 
                        for (let o in orden) {
                            for (let p in d_producto) {
                                for (let ins in insumos) {
                                    if (d_producto[p].idInsumo == insumos[ins].idInsumo) {
                                        let cantidadRestar = parseInt(orden[o].cantidad) * parseInt(d_producto[p].cantidad_n);

                                        await new Promise((resolve, reject) => {
                                            conn.query(`UPDATE tbl_insumos SET stock = stock - ? WHERE idInsumo = ?`,
                                                [
                                                    cantidadRestar,
                                                    insumos[ins].idInsumo
                                                ],
                                                (err, insumo) => {
                                                    if (err) {
                                                        reject(err);
                                                    } else {
                                                        console.log("Insumo Actualizado");
                                                        resolve();
                                                    }
                                                }
                                            );
                                        });
                                    }
                                }
                            }

                            await new Promise((resolve, reject) => {
                                conn.query(`UPDATE tbl_productos SET stock = stock + ? WHERE idProducto = ?`,
                                    [
                                        orden[o].cantidad,
                                        orden[o].idProducto
                                    ],
                                    (err, producto) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            console.log("Producto Actualizado");
                                            resolve();
                                        }
                                    }
                                );
                            });
                        }
                        ////END RESTAR INSUMOS Y SUMAR PRODUCTOS  

                    } else {

                        const RegistroDetalleOrden = {
                            titulo: data.titulo_1_a,
                            descripcion: data.descripcion_1,
                            observacion: data.observacion_1,
                            fechaInicio: data.fechaInicio_detalle_1,
                            fechaFin: data.fechaFin_detalle_1
                        }

                        await new Promise((resolve, reject) => {
                            conn.query(`UPDATE tbl_ordenes_produccion_detalles SET ? WHERE idOrdenProduccion = ? AND idDetalleOrdenProduccion = ?`,
                                [
                                    RegistroDetalleOrden,
                                    idOrdenProduccion,
                                    data.idDetalleOrdenProduccion_1,
                                ],
                                (err, detalle) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        console.log("Detalle Actualizado");
                                        resolve();
                                    }
                                }
                            );
                        });

                        // Capturar idDetalleReparación
                        const idDetalleOrdenProduccion = data.idDetalleOrdenProduccion_1;
                        const part = data.titulo_1 + '_idParticipante';

                        // Eliminar detalles de los detalle
                        await new Promise((resolve, reject) => {
                            conn.query("DELETE FROM tbl_ordenes_produccion_detalles_participes WHERE idDetalleOrdenProduccion = ?", [idDetalleOrdenProduccion], (err, result) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    //console.log("Insumos Eliminados");
                                    resolve();
                                }
                            });
                        });
                        // End Eliminar detalles de los detalle

                        //Registrar Participantes
                        if (data[part][0].length > 1) {
                            // Más de un participante

                            for (let index in data[part]) {

                                //Capturar idParticipante
                                for (let ix in usersA) {
                                    for (let i in usersI) {
                                        if (data[part][index] == usersA[ix].correo && usersA[ix].idAccess == usersI[i].idAccess) {
                                            data[part][index] = usersI[i].idInfo;
                                            //console.log("Participante encontrado");
                                        }
                                    }
                                }
                                //End Capturar idParticipante

                                await new Promise((resolve, reject) => {
                                    conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                                        [
                                            idDetalleOrdenProduccion,
                                            data[part][index]
                                        ],
                                        (err) => {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                //console.log("Participante Registrado");
                                                resolve();
                                            }
                                        }
                                    );
                                });
                            }

                        } else {
                            // Un Partícipe

                            //Capturar idParticipante
                            for (let index in usersA) {
                                for (let i in usersI) {
                                    if (data[part] == usersA[index].correo && usersA[index].idAccess == usersI[i].idAccess) {
                                        data[part] = usersI[i].idInfo;
                                        //console.log("Participante encontrado");
                                    }
                                }
                            }
                            //End Capturar idParticipante


                            await new Promise((resolve, reject) => {
                                conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                                    [
                                        idDetalleOrdenProduccion,
                                        data[part],
                                    ],
                                    (err) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            //console.log("Participante Registrado");
                                            resolve();
                                        }
                                    }
                                );
                            });
                        }
                        //End Registrar Participantes

                        console.log("No se pudo actualizar el estado ya que no hay insumos suficientes")

                    }
                } else {

                    const RegistroDetalleOrden = {
                        titulo: data.titulo_1_a,
                        descripcion: data.descripcion_1,
                        observacion: data.observacion_1,
                        fechaInicio: data.fechaInicio_detalle_1,
                        fechaFin: data.fechaFin_detalle_1,
                        estado: data.estado_1
                    }

                    await new Promise((resolve, reject) => {
                        conn.query(`UPDATE tbl_ordenes_produccion_detalles SET ? WHERE idOrdenProduccion = ? AND idDetalleOrdenProduccion = ?`,
                            [
                                RegistroDetalleOrden,
                                idOrdenProduccion,
                                data.idDetalleOrdenProduccion_1,
                            ],
                            (err, detalle) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    console.log("Detalle Actualizado");
                                    resolve();
                                }
                            }
                        );
                    });

                    // Capturar idDetalleReparación
                    const idDetalleOrdenProduccion = data.idDetalleOrdenProduccion_1;
                    const part = data.titulo_1 + '_idParticipante';

                    // Eliminar detalles de los detalle
                    await new Promise((resolve, reject) => {
                        conn.query("DELETE FROM tbl_ordenes_produccion_detalles_participes WHERE idDetalleOrdenProduccion = ?", [idDetalleOrdenProduccion], (err, result) => {
                            if (err) {
                                reject(err);
                            } else {
                                //console.log("Insumos Eliminados");
                                resolve();
                            }
                        });
                    });
                    // End Eliminar detalles de los detalle

                    //Registrar Participantes
                    if (data[part][0].length > 1) {
                        // Más de un participante

                        for (let index in data[part]) {

                            //Capturar idParticipante
                            for (let ix in usersA) {
                                for (let i in usersI) {
                                    if (data[part][index] == usersA[ix].correo && usersA[ix].idAccess == usersI[i].idAccess) {
                                        data[part][index] = usersI[i].idInfo;
                                        //console.log("Participante encontrado");
                                    }
                                }
                            }
                            //End Capturar idParticipante

                            await new Promise((resolve, reject) => {
                                conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                                    [
                                        idDetalleOrdenProduccion,
                                        data[part][index]
                                    ],
                                    (err) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            //console.log("Participante Registrado");
                                            resolve();
                                        }
                                    }
                                );
                            });
                        }

                    } else {
                        // Un Partícipe

                        //Capturar idParticipante
                        for (let index in usersA) {
                            for (let i in usersI) {
                                if (data[part] == usersA[index].correo && usersA[index].idAccess == usersI[i].idAccess) {
                                    data[part] = usersI[i].idInfo;
                                    //console.log("Participante encontrado");
                                }
                            }
                        }
                        //End Capturar idParticipante


                        await new Promise((resolve, reject) => {
                            conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                                [
                                    idDetalleOrdenProduccion,
                                    data[part],
                                ],
                                (err) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        //console.log("Participante Registrado");
                                        resolve();
                                    }
                                }
                            );
                        });
                    }
                    //End Registrar Participantes

                }
            }
            // End Editar Detalles


        } else {
            //Eliminar todos los detalles registrados si fueron eliminados del form
            if (!data.titulo_1 && data.titulo_2) {

                //Capturar detalles
                const detalles1 = await new Promise((resolve, reject) => {
                    conn.query("SELECT * FROM tbl_ordenes_produccion_detalles WHERE idOrdenProduccion = ?", [idOrdenProduccion], (err, detalles) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(detalles);
                        }
                    });
                });

                for (i in detalles1) {
                    // Eliminar detalles de los detalle
                    await new Promise((resolve, reject) => {
                        conn.query("DELETE FROM tbl_ordenes_produccion_detalles_participes WHERE idDetalleOrdenProduccion = ?", [detalles1[i].idDetalleOrdenProduccion], (err, result) => {
                            if (err) {
                                reject(err);
                            } else {
                                console.log("Participaciones eliminadas");
                                resolve();
                            }
                        });
                    });
                    // End Eliminar detalles de los detalle
                }

                // Eliminar Detalles
                await new Promise((resolve, reject) => {
                    conn.query("DELETE FROM tbl_ordenes_produccion_detalles WHERE idOrdenProduccion = ?", [idOrdenProduccion], (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            console.log("Detalles Eliminados");
                            resolve();
                        }
                    });
                });
                // End Eliminar Detalles
            }
        }
        //console.log('termina la edicion de los ya existentes')


        //Registrar Detalles
        //Verificar si se enviaron nuevos detalles
        if (data.titulo_2) {
            console.log("Se ingresan nuevas tareas");
            // Registrar Detalles y Reconocer si se manda 1 o más detalles
            if (data.titulo_2[0].length > 1) {
                // Más de un detalle

                for (let index_d in data.titulo_2) {
                    const detalle = await new Promise((resolve, reject) => {
                        conn.query(`INSERT INTO tbl_ordenes_produccion_detalles(idOrdenProduccion, titulo, descripcion, observacion, fechaInicio, fechaFin) VALUES (?, ?, ?, ?, ?, ?)`,
                            [
                                idOrdenProduccion,
                                data.titulo_2_a[index_d],
                                data.descripcion_2[index_d],
                                data.observacion_2[index_d],
                                data.fechaInicio_detalle_2[index_d],
                                data.fechaFin_detalle_2[index_d]
                            ],
                            (err, detalle) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    console.log("Detalle Registrado");
                                    resolve(detalle);
                                }
                            }
                        );
                    });

                    // Capturar idDetalleReparación
                    const idDetalleOrdenProduccion = detalle.insertId;
                    const part = data.titulo_2[index_d] + '_idParticipante';

                    //Registrar Participantes
                    if (data[part][0].length > 1) {
                        // Más de un participante

                        for (let index in data[part]) {

                            //Capturar idParticipante
                            for (let ix in usersA) {
                                for (let i in usersI) {
                                    if (data[part][index] == usersA[ix].correo && usersA[ix].idAccess == usersI[i].idAccess) {
                                        data[part][index] = usersI[i].idInfo;
                                        //console.log("Participante encontrado");
                                    }
                                }
                            }
                            //End Capturar idParticipante

                            await new Promise((resolve, reject) => {
                                conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                                    [
                                        idDetalleOrdenProduccion,
                                        data[part][index]
                                    ],
                                    (err) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            console.log("Participante Registrado");
                                            resolve();
                                        }
                                    }
                                );
                            });
                        }

                    } else {
                        // Un Partícipe

                        //Capturar idParticipante
                        for (let index in usersA) {
                            for (let i in usersI) {
                                if (data[part] == usersA[index].correo && usersA[index].idAccess == usersI[i].idAccess) {
                                    data[part] = usersI[i].idInfo;
                                    //console.log("Participante encontrado");
                                }
                            }
                        }
                        //End Capturar idParticipante


                        await new Promise((resolve, reject) => {
                            conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                                [
                                    idDetalleOrdenProduccion,
                                    data[part],
                                ],
                                (err) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        console.log("Participante Registrado");
                                        resolve();
                                    }
                                }
                            );
                        });
                    }
                    //End Registrar Participantes
                }

            } else {
                // Un detalle

                const detalle = await new Promise((resolve, reject) => {
                    conn.query(`INSERT INTO tbl_ordenes_produccion_detalles(idOrdenProduccion, titulo, descripcion, observacion, fechaInicio, fechaFin) VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            idOrdenProduccion,
                            data.titulo_2_a,
                            data.descripcion_2,
                            data.observacion_2,
                            data.fechaInicio_detalle_2,
                            data.fechaFin_detalle_2
                        ],
                        (err, detalle) => {
                            if (err) {
                                reject(err);
                            } else {
                                console.log("Detalle Registrado");
                                resolve(detalle);
                            }
                        }
                    );
                });

                // Capturar idDetalleReparación
                const idDetalleOrdenProduccion = detalle.insertId;
                const part = data.titulo_2 + '_idParticipante';

                //Registrar Participantes
                if (data[part][0].length > 1) {
                    // Más de un participante

                    for (let index in data[part]) {

                        //Capturar idParticipante
                        for (let ix in usersA) {
                            for (let i in usersI) {
                                if (data[part][index] == usersA[ix].correo && usersA[ix].idAccess == usersI[i].idAccess) {
                                    data[part][index] = usersI[i].idInfo;
                                    //console.log("Participante encontrado");
                                }
                            }
                        }
                        //End Capturar idParticipante

                        await new Promise((resolve, reject) => {
                            conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                                [
                                    idDetalleOrdenProduccion,
                                    data[part][index]
                                ],
                                (err) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        console.log("Participante Registrado");
                                        resolve();
                                    }
                                }
                            );
                        });
                    }

                } else {
                    // Un Partícipe

                    //Capturar idParticipante
                    for (let index in usersA) {
                        for (let i in usersI) {
                            if (data[part] == usersA[index].correo && usersA[index].idAccess == usersI[i].idAccess) {
                                data[part] = usersI[i].idInfo;
                                //console.log("Participante encontrado");
                            }
                        }
                    }
                    //End Capturar idParticipante


                    await new Promise((resolve, reject) => {
                        conn.query(`INSERT INTO tbl_ordenes_produccion_detalles_participes(idDetalleOrdenProduccion, idInfo) VALUES (?, ?)`,
                            [
                                idDetalleOrdenProduccion,
                                data[part],
                            ],
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    console.log("Participante Registrado");
                                    resolve();
                                }
                            }
                        );
                    });
                }
                //End Registrar Participantes
            }
            //End Registrar Detalles
        }

        // Redireccionar
        console.log("Orden de producción modificada correctamente");
        res.redirect("/produccion");
    } catch (err) {
        res.status(500).json(err);
    }
}
//End Modificar


//Eliminar Reparacion
async function producciones_eliminar(req, res) {
    try {
        const idOrdenProduccion = req.body.idOrdenProduccion;

        const conn = await new Promise((resolve, reject) => {
            req.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(conn);
                }
            });
        });

        const d_orden = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM tbl_ordenes_produccion_detalles WHERE idOrdenProduccion = ?", [idOrdenProduccion], (err, d_orden) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(d_orden);
                }
            });
        });

        for (i in d_orden) {
            await new Promise((resolve, reject) => {
                conn.query("DELETE FROM tbl_ordenes_produccion_detalles_participes WHERE idDetalleOrdenProduccion = ?", [d_orden[i].idDetalleOrdenProduccion], (err, d_d_orden) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }
        console.log("Participaciones Eliminadas");

        await new Promise((resolve, reject) => {
            conn.query("DELETE FROM tbl_ordenes_produccion_detalles WHERE idOrdenProduccion = ?", [idOrdenProduccion], (err, e_orden) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        console.log("Tareas Eliminadas");


        await new Promise((resolve, reject) => {
            conn.query("DELETE FROM tbl_ordenes_produccion WHERE idOrdenProduccion = ?", [idOrdenProduccion], (err, orden_e) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        console.log("Orden de produccion eliminada exitosamente");

        res.redirect("/produccion");
    } catch (err) {
        res.status(500).json(err);
    }
}
//End Eliminar Reparacion



module.exports = {
    producciones_listar: producciones_listar,
    producciones_detallar: producciones_detallar,
    producciones_crear: producciones_crear,
    producciones_registrar: producciones_registrar,
    producciones_editar: producciones_editar,
    producciones_modificar: producciones_modificar,
    producciones_eliminar: producciones_eliminar
}