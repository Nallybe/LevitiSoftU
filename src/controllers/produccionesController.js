//Listar
function producciones_listar(req, res) {
    // Obtener la conexión a la base de datos
    req.getConnection((err, conn) => {
        if (err) {
            // Si hay un error al obtener la conexión, enviar una respuesta con el error
            return res.status(500).json(err);
        }
        // Consultar las producciones en la base de datos
        conn.query('SELECT * FROM tbl_ordenes_produccion', (err, producciones) => {
            if (err) {
                // Si hay un error al consultar las producciones, enviar una respuesta con el error
                return res.status(500).json(err);
            }

            // Consultar los detalles de las producciones para cada reparación
            var cont = 1
            for (let index in producciones) {
                // Actualizar los campos de la reparación con la información obtenida
                producciones[index].cont = cont;
                cont++;
                producciones[index].fechaInicio = producciones[index].fechaInicio.toLocaleDateString();
                producciones[index].fechaFin = producciones[index].fechaFin.toLocaleDateString();

                // Actualizar el estado de la reparación
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

                                // Actualizar los campos de la reparación con la información de los usuarios
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
                                res.render('producciones/listar', { producciones });
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
                    if (users[i].idInfo == d_produccion[index].participes[index1].idInfo) {
                        d_produccion[index].participes[index1].userName = users[i].nombre;
                        d_produccion[index].participes[index1].userTell = users[i].telefono;
                        d_produccion[index].participes[index1].userNumOP = users[i].numProducciones;
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
                title: 'Evento #' + d_produccion[i].cont + ' ' + d_produccion[i].titulo,
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

        res.render("producciones/detallar", { producciones, d_produccion, d_producto, eventosList });
    } catch (err) {
        res.status(500).json(err);
    }
}
//End Detallar


//Crear (Función para redireccionar al hbs donde se encuentra el formulario)
function producciones_crear(req, res) {
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM users_access WHERE estado ='A' AND idRoles != 4", (err, usuarios) => {
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
                                res.render("producciones/registrar", { usuarios, productos });
                            }
                        });
                    }
                });
            }
        });
    });
}
//End Crear


//Registrar Reparación
function producciones_registrar(req, res) {
    var data = req.body;
    //console.log(data)

    //Capturar Encargado
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM users_access", (err, usersA) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                conn.query("SELECT * FROM users_info", (err, usersI) => {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        for (index in usersA) {
                            for (i in usersI) {
                                if (data.idEncargado == usersA[index].correo && usersA[index].idAccess == usersI[i].idAccess) {
                                    data.idEncargado = usersI[i].idInfo;
                                    //console.log("Usuario encontrado");
                                }
                            }
                        }
                        //End Capturar Encargado

                        //Capturar Producto 
                        conn.query("SELECT * FROM tbl_productos", (err, productos) => {
                            if (err) {
                                return res.status(500).json(err);
                            } else {
                                for (index in productos) {
                                    if (data.idProducto == productos[index].nombre) {
                                        data.idProducto = productos[index].idProducto;
                                        //console.log("Producto encontrado");
                                    }
                                }
                                //End Capturar Producto

                                const RegistroProduccion = {
                                    idInfo: data.idEncargado,
                                    idProducto: data.idProducto,
                                    cantidad: data.cantidad,
                                    fechaInicio: data.fechaInicio,
                                    fechaFin: data.fechaFin
                                };

                                //Registrar Producción
                                conn.query("INSERT INTO tbl_ordenes_produccion SET ?", [RegistroProduccion], (err, result) => {
                                    if (err) {
                                        return res.status(500).json(err);
                                    } else {
                                        console.log("Produccion Registrada");
                                        //End Registrar Producción 

                                        //Captura id produccion
                                        const idOrdenProduccion = result.insertId;

                                        //Registrar Detalles y Reconocer si se manda 1 o más detalles
                                        if (data.titulo[0].length > 1) {

                                            //Más de un detalle
                                            for (index in data.titulo) {
                                                conn.query(`INSERT INTO tbl_ordenes_produccion_detalles(idOrdenProduccion,titulo,descripcion,observacion, fechaInicio, fechaFin) VALUES (?,?,?,?,?,?)`,
                                                    [
                                                        idOrdenProduccion,
                                                        data.titulo[index],
                                                        data.descripcion[index],
                                                        data.observacion[index],
                                                        data.fechaInicio_detalle[index],
                                                        data.fechaFin_detalle[index]
                                                    ],
                                                    (err) => {
                                                        if (err) {
                                                            return res.status(500).json(err);
                                                        } else {
                                                            console.log("Detalle Registrado");
                                                        }
                                                    }
                                                );
                                            }
                                        } else {
                                            //Un detalle
                                            conn.query(`INSERT INTO tbl_ordenes_produccion_detalles(idOrdenProduccion,titulo,descripcion,observacion, fechaInicio, fechaFin) VALUES (?,?,?,?,?,?)`,
                                                [
                                                    idOrdenProduccion,
                                                    data.titulo,
                                                    data.descripcion,
                                                    data.observacion,
                                                    data.fechaInicio_detalle,
                                                    data.fechaFin_detalle
                                                ],
                                                (err) => {
                                                    if (err) {
                                                        return res.status(500).json(err);
                                                    } else {
                                                        console.log("Detalle Registrado");
                                                    }
                                                }
                                            );
                                        }
                                        //End Registrar Detalles

                                        //Redireccionar
                                        console.log("Registro de orden de producción exitoso");
                                        res.redirect("/producciones");
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
}
//End Registrar Reparación

//EN PROCESO
//Editar
function producciones_editar(req, res) {
    const idOrden = req.params.idOrden;
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM tbl_ordenes_produccion WHERE idOrdenProduccion = ?', [idOrden], (err, produccion) => {
            if (err) {
                return res.status(500).json(err);
            } else {

                for (i in produccion) {
                    // Actualizar el estado de la reparación
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
                conn.query('SELECT * FROM tbl_ordenes_produccion_detalles WHERE idOrdenProduccion = ?', [idOrden], (err, d_produccion) => {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        for (let index in d_produccion) {
                            // Actualizar el estado de la reparación para que en el hbs el estado tenga su propio diseño dependiendo del valor
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
                        }
                        //console.log(d_produccion)

                        res.render('producciones/editar', { produccion, d_produccion });
                    }
                });
            }
        });
    });
}
//End Editar


module.exports = {
    producciones_listar: producciones_listar,
    producciones_detallar: producciones_detallar,
    producciones_crear: producciones_crear,
    producciones_registrar: producciones_registrar,
    producciones_editar: producciones_editar
}