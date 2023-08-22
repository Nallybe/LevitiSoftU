//Listar
function reparaciones_listar(req, res) {
    // Obtener la conexión a la base de datos
    req.getConnection((err, conn) => {
        if (err) {
            // Si hay un error al obtener la conexión, enviar una respuesta con el error
            return res.status(500).json(err);
        }

        // Consultar las reparaciones en la base de datos   CASE WHEN estado = "Entregado" THEN 1 ELSE 0 END, estado ASC;
        conn.query('SELECT * FROM tbl_reparaciones ORDER BY fechaRegistro DESC;', (err, reparaciones) => {
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
                            res.status(200).render("reparaciones/listar", { reparaciones });
                        }
                    });
                }
            });
        });
    });
}
//End Listar


//Detallar
async function reparaciones_detallar(req, res) {
    try {
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

        console.log("total Insumos");
        console.log(totalInsumos);
        res.render("reparaciones/detallar", { detallesreparacion, reparacion, totalInsumos });
    } catch (err) {
        res.status(500).json(err);
    }
}
//End Detallar


//Crear (Función para redireccionar al hbs donde se encuentra el formulario)
function reparaciones_crear(req, res) {
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM users_access WHERE estado ='A'", (err, clientes) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                conn.query("SELECT * FROM tbl_insumos WHERE estado ='A'", (err, insumos) => {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        res.render("reparaciones/registrar", { clientes, insumos });

                    }
                });
            }
        });
    });
}
//End Crear


//Registrar Reparación
async function reparaciones_registrar(req, res) {
    try {
        var data = req.body;
        console.log(data);

        // Capturar Cliente
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
                if (data.idCliente == usersA[index].correo && usersA[index].idAccess == usersI[i].idAccess) {
                    data.idCliente = usersI[i].idInfo;
                    console.log("Cliente encontrado");
                }
            }
        }
        // End Capturar Cliente

        // Actualizar datos del cliente
        await new Promise((resolve, reject) => {
            conn.query(`UPDATE users_info SET numReparaciones = numReparaciones + 1 WHERE idInfo = ?`, [data.idCliente], (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("Cliente Actualizado +1 Reparación");
                    resolve();
                }
            });
        });
        // End Actualizar datos del cliente

        const insumos = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM tbl_insumos", (err, insumos) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(insumos);
                }
            });
        });

        // Definir registro Reparación
        const RegistroReparacion = {
            idInfo: data.idCliente,
            total: data.total,
            fechaEntrega: data.fechaEntrega
        };

        // Registrar Reparación
        const result = await new Promise((resolve, reject) => {
            conn.query("INSERT INTO tbl_reparaciones SET ?", [RegistroReparacion], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("Reparación Registrada");
                    resolve(result);
                }
            });
        });
        // End Registrar Reparación

        // Captura idReparación
        const idReparacion = result.insertId;

        // Registrar Detalles y Reconocer si se manda 1 o más detalles
        if (data.articulo[0].length > 1) {
            // Más de un detalle

            for (let index_d in data.articulo) {
                const detalle = await new Promise((resolve, reject) => {
                    conn.query(`INSERT INTO tbl_reparaciones_detalles(idReparacion, articulo, descripcion, observacion) VALUES (?, ?, ?, ?)`,
                        [
                            idReparacion,
                            data.articulo_a[index_d],
                            data.descripcion[index_d],
                            data.observacion[index_d],
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
                const idDetalleReparacion = detalle.insertId;
                const ins = data.articulo[index_d] + '_idInsumo';
                const cant = data.articulo[index_d] + '_cantidad';

                if (data[ins][0].length > 1) {
                    // Más de un insumo

                    //Capturar ids insumos
                    for (let index in data[ins]) {
                        for (let ix in insumos) {
                            if (data[ins][index] == insumos[ix].nombre) {
                                data[ins][index] = insumos[ix].idInsumo;
                            }
                        }
                        //End capturar ids insumos

                        await new Promise((resolve, reject) => {
                            conn.query(`INSERT INTO tbl_reparaciones_detalles_detalles(idDetalleReparacion, idInsumo, cantidad_n) VALUES (?, ?, ?)`,
                                [
                                    idDetalleReparacion,
                                    data[ins][index],
                                    data[cant][index]
                                ],
                                (err) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        console.log("Insumo Registrado");
                                        resolve();
                                    }
                                }
                            );
                        });
                    }

                } else {
                    // Un insumo

                    //Capturar id insumo
                    for (let ix in insumos) {
                        if (data[ins] == insumos[ix].nombre) {
                            data[ins] = insumos[ix].idInsumo;
                        }
                    }
                    //End capturar id insumo


                    await new Promise((resolve, reject) => {
                        conn.query(`INSERT INTO tbl_reparaciones_detalles_detalles(idDetalleReparacion, idInsumo, cantidad_n) VALUES (?, ?, ?)`,
                            [
                                idDetalleReparacion,
                                data[ins],
                                data[cant]
                            ],
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    console.log("Insumo Registrado");
                                    resolve();
                                }
                            }
                        );
                    });
                }
            }

        } else {
            // Un detalle

            const detalle = await new Promise((resolve, reject) => {
                conn.query(`INSERT INTO tbl_reparaciones_detalles(idReparacion, articulo, descripcion, observacion) VALUES (?, ?, ?, ?)`,
                    [
                        idReparacion,
                        data.articulo_a,
                        data.descripcion,
                        data.observacion,
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
            const idDetalleReparacion = detalle.insertId;
            const ins = data.articulo + '_idInsumo';
            const cant = data.articulo + '_cantidad';


            if (data[ins][0].length > 1) {
                // Más de un insumo

                //Capturar ids insumos
                for (let index in data[ins]) {
                    for (let ix in insumos) {
                        if (data[ins][index] == insumos[ix].nombre) {
                            data[ins][index] = insumos[ix].idInsumo;
                        }
                    }
                    //End capturar ids insumos

                    await new Promise((resolve, reject) => {
                        conn.query(`INSERT INTO tbl_reparaciones_detalles_detalles(idDetalleReparacion, idInsumo, cantidad_n) VALUES (?, ?, ?)`,
                            [
                                idDetalleReparacion,
                                data[ins][index],
                                data[cant][index]
                            ],
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    console.log("Insumo Registrado");
                                    resolve();
                                }
                            }
                        );
                    });
                }

            } else {
                // Un insumo

                //Capturar id insumo
                for (let ix in insumos) {
                    if (data[ins] == insumos[ix].nombre) {
                        data[ins] = insumos[ix].idInsumo;
                    }
                }
                //End capturar id insumo


                await new Promise((resolve, reject) => {
                    conn.query(`INSERT INTO tbl_reparaciones_detalles_detalles(idDetalleReparacion, idInsumo, cantidad_n) VALUES (?, ?, ?)`,
                        [
                            idDetalleReparacion,
                            data[ins],
                            data[cant]
                        ],
                        (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                console.log("Insumo Registrado");
                                resolve();
                            }
                        }
                    );
                });
            }

        }
        // End Registrar Detalles

        // Redireccionar
        console.log("Registro de reparación exitoso");
        res.redirect("/reparaciones");
    } catch (err) {
        res.status(500).json(err);
    }
}
//End Registrar Reparación

//Editar
function reparaciones_editar(req, res) {
    const idReparacion = req.params.idReparacion;
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM tbl_reparaciones WHERE idReparacion = ?', [idReparacion], (err, reparacion) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                for (i in reparacion) {
                    // Actualizar el estado de la reparación
                    switch (reparacion[i].estado) {
                        case 'Iniciado':
                            reparacion[i].estado1 = true;
                            break;
                        case 'Proceso':
                            reparacion[i].estado2 = true;
                            break;
                    }

                    let day = reparacion[i].fechaEntrega.getDate();
                    let month = reparacion[i].fechaEntrega.getMonth() + 1;
                    let year = reparacion[i].fechaEntrega.getFullYear();

                    if (month < 10 && day < 10) {
                        reparacion[i].fechaEntrega = `${year}-0${month}-0${day}`
                    } else {
                        if (month < 10 && day >= 10) {
                            reparacion[i].fechaEntrega = `${year}-0${month}-${day}`
                        } else {
                            if (month >= 10 && day < 10) {
                                reparacion[i].fechaEntrega = `${year}-${month}-0${day}`
                            } else {
                                if (month >= 10 && day >= 10) {
                                    reparacion[i].fechaEntrega = `${year}-${month}-${day}`
                                }
                            }
                        }
                    }

                    let day1 = reparacion[i].fechaRegistro.getDate();
                    let month1 = reparacion[i].fechaRegistro.getMonth() + 1;
                    let year1 = reparacion[i].fechaRegistro.getFullYear();

                    if (month1 < 10 && day1 < 10) {
                        reparacion[i].fechaRegistro = `${year1}-0${month1}-0${day1}`
                    } else {
                        if (month1 < 10 && day1 >= 10) {
                            reparacion[i].fechaRegistro = `${year1}-0${month1}-${day1}`
                        } else {
                            if (month1 >= 10 && day1 < 10) {
                                reparacion[i].fechaRegistro = `${year1}-${month1}-0${day1}`
                            } else {
                                if (month1 >= 10 && day1 >= 10) {
                                    reparacion[i].fechaRegistro = `${year1}-${month1}-${day1}`
                                }
                            }
                        }
                    }

                    conn.query('SELECT * FROM users_info WHERE idInfo = ?', [reparacion[i].idInfo], (err, user) => {
                        if (err) {
                            return res.status(500).json(err);
                        } else {
                            for (i in user) {
                                reparacion[i].idInfo = user[i].nombre;
                            }
                        }
                    });
                }

                conn.query('SELECT * FROM tbl_reparaciones_detalles WHERE idReparacion = ?', [idReparacion], async (err, detallesreparacion) => {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        var cont = 0;
                        var contMas = 0;
                        for (let index in detallesreparacion) {
                            cont--;
                            contMas++;
                            detallesreparacion[index].cont = cont;
                            detallesreparacion[index].contMas = contMas;
                            detallesreparacion[index].fechaEstado = detallesreparacion[index].fechaEstado.toLocaleString();

                            // Actualizar el estado de la reparación para que en el hbs el estado tenga su propio diseño dependiendo del valor
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

                            detallesreparacion[index].insumos_r = await new Promise((resolve, reject) => {
                                conn.query("SELECT * FROM tbl_reparaciones_detalles_detalles WHERE idDetalleReparacion = ?", [detallesreparacion[index].idDetalleReparacion], async (err, insumos) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        var cont_i = 0;
                                        var cont_c = 0;
                                        const insumos_r = await new Promise((resolve, reject) => {
                                            conn.query("SELECT * FROM tbl_insumos", (err, insumos) => {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    resolve(insumos);
                                                }
                                            });
                                        });

                                        for (i in insumos) {
                                            for (ix in insumos_r) {
                                                if (insumos[i].idInsumo == insumos_r[ix].idInsumo) {
                                                    cont_i--;
                                                    cont_c++;
                                                    insumos[i].cont_i = cont_i;
                                                    insumos[i].cont_c = cont_c;
                                                    insumos[i].idInsumo = insumos_r[ix].nombre;
                                                }

                                            }
                                        }
                                        resolve(insumos);
                                    }
                                });
                            });

                        }







                        //console.log(reparacion);
                        //console.log(detallesreparacion);

                        conn.query("SELECT * FROM tbl_insumos WHERE estado ='A'", (err, insumos) => {
                            if (err) {
                                return res.status(500).json(err);
                            } else {
                                res.render('reparaciones/editar', { reparacion, detallesreparacion, insumos });
                            }
                        });

                    }
                });
            }
        });
    });
}
//End Editar


//Modificar
async function reparaciones_modificar(req, res) {
    try {
        const idReparacion = req.params.idReparacion;
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

        const insumos = await new Promise((resolve, reject) => {
            conn.query("SELECT * FROM tbl_insumos", (err, insumos) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(insumos);
                }
            });
        });

        // Definir registro Reparación
        const RegistroReparacion = {
            total: data.total,
            fechaEntrega: data.fechaEntrega
        };

        // Actualizar Reparación
        await new Promise((resolve, reject) => {
            conn.query("UPDATE tbl_reparaciones SET ? WHERE idReparacion = ?", [RegistroReparacion, idReparacion], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("Reparación Actualizada");
                    resolve();
                }
            });
        });
        // End Actualizar Reparación



        //Reconocer si se mandan detalles ya registrados 
        if (data.articulo_1) {

            //Capturar detalles
            const detalles_1 = await new Promise((resolve, reject) => {
                conn.query("SELECT * FROM tbl_reparaciones_detalles WHERE idReparacion = ?", [idReparacion], (err, detalles) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(detalles);
                    }
                });
            });

            // Editar Detalles y Reconocer si se manda 1 o más detalles ya registrados 
            if (data.articulo_1[0].length > 1) {
                // Más de un detalle

                for (let index_d in data.articulo_1) {
                    const RegistroDetalleReparacion = {
                        articulo: data.articulo_1_a[index_d],
                        descripcion: data.descripcion_1[index_d],
                        observacion: data.observacion_1[index_d],
                        estado: data.estado_1[index_d]
                    }

                    await new Promise((resolve, reject) => {
                        conn.query(`UPDATE tbl_reparaciones_detalles SET ? WHERE idReparacion = ? AND idDetalleReparacion = ?`,
                            [
                                RegistroDetalleReparacion,
                                idReparacion,
                                data.idDetalleReparacion_1[index_d],
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
                    const idDetalleReparacion = data.idDetalleReparacion_1[index_d];
                    const ins = data.articulo_1[index_d] + '_idInsumo';
                    const cant = data.articulo_1[index_d] + '_cantidad';


                    // Eliminar detalles de los detalle
                    await new Promise((resolve, reject) => {
                        conn.query("DELETE FROM tbl_reparaciones_detalles_detalles WHERE idDetalleReparacion = ?", [idDetalleReparacion], (err, result) => {
                            if (err) {
                                reject(err);
                            } else {
                                //console.log("Insumos Eliminados");
                                resolve();
                            }
                        });
                    });
                    // End Eliminar detalles de los detalle


                    if (data[ins][0].length > 1) {
                        // Más de un insumo

                        //Capturar ids insumos
                        for (let index in data[ins]) {
                            for (let ix in insumos) {
                                if (data[ins][index] == insumos[ix].nombre) {
                                    data[ins][index] = insumos[ix].idInsumo;
                                }
                            }
                            //End capturar ids insumos

                            await new Promise((resolve, reject) => {
                                conn.query(`INSERT INTO tbl_reparaciones_detalles_detalles(idDetalleReparacion, idInsumo, cantidad_n) VALUES (?, ?, ?)`,
                                    [
                                        idDetalleReparacion,
                                        data[ins][index],
                                        data[cant][index]
                                    ],
                                    (err) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            console.log("Insumo Registrado");
                                            resolve();
                                        }
                                    }
                                );
                            });
                        }

                    } else {
                        // Un insumo

                        //Capturar id insumo
                        for (let ix in insumos) {
                            if (data[ins] == insumos[ix].nombre) {
                                data[ins] = insumos[ix].idInsumo;
                            }
                        }
                        //End capturar id insumo


                        await new Promise((resolve, reject) => {
                            conn.query(`INSERT INTO tbl_reparaciones_detalles_detalles(idDetalleReparacion, idInsumo, cantidad_n) VALUES (?, ?, ?)`,
                                [
                                    idDetalleReparacion,
                                    data[ins],
                                    data[cant]
                                ],
                                (err) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        console.log("Insumo Registrado");
                                        resolve();
                                    }
                                }
                            );
                        });
                    }




                }

            } else {
                // Un detalle
                const RegistroDetalleReparacion = {
                    articulo: data.articulo_1_a,
                    descripcion: data.descripcion_1,
                    observacion: data.observacion_1,
                    estado: data.estado_1
                }

                await new Promise((resolve, reject) => {
                    conn.query(`UPDATE tbl_reparaciones_detalles SET ? WHERE idReparacion = ? AND idDetalleReparacion = ?`,
                        [
                            RegistroDetalleReparacion,
                            idReparacion,
                            data.idDetalleReparacion_1,
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
                const idDetalleReparacion = data.idDetalleReparacion_1;
                const ins = data.articulo_1 + '_idInsumo';
                const cant = data.articulo_1 + '_cantidad';


                // Eliminar detalles de los detalle
                await new Promise((resolve, reject) => {
                    conn.query("DELETE FROM tbl_reparaciones_detalles_detalles WHERE idDetalleReparacion = ?", [idDetalleReparacion], (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            //console.log("Insumos Eliminados");
                            resolve();
                        }
                    });
                });
                // End Eliminar detalles de los detalle


                if (data[ins][0].length > 1) {
                    // Más de un insumo

                    //Capturar ids insumos
                    for (let index in data[ins]) {
                        for (let ix in insumos) {
                            if (data[ins][index] == insumos[ix].nombre) {
                                data[ins][index] = insumos[ix].idInsumo;
                            }
                        }
                        //End capturar ids insumos

                        await new Promise((resolve, reject) => {
                            conn.query(`INSERT INTO tbl_reparaciones_detalles_detalles(idDetalleReparacion, idInsumo, cantidad_n) VALUES (?, ?, ?)`,
                                [
                                    idDetalleReparacion,
                                    data[ins][index],
                                    data[cant][index]
                                ],
                                (err) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        console.log("Insumo Registrado");
                                        resolve();
                                    }
                                }
                            );
                        });
                    }

                } else {
                    // Un insumo

                    //Capturar id insumo
                    for (let ix in insumos) {
                        if (data[ins] == insumos[ix].nombre) {
                            data[ins] = insumos[ix].idInsumo;
                        }
                    }
                    //End capturar id insumo


                    await new Promise((resolve, reject) => {
                        conn.query(`INSERT INTO tbl_reparaciones_detalles_detalles(idDetalleReparacion, idInsumo, cantidad_n) VALUES (?, ?, ?)`,
                            [
                                idDetalleReparacion,
                                data[ins],
                                data[cant]
                            ],
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    console.log("Insumo Registrado");
                                    resolve();
                                }
                            }
                        );
                    });
                }

            }
            // End Editar Detalles


        } else {
            //Eliminar todos los detalles registrados si fueron eliminados del form
            if (!data.articulo_1 && data.articulo_2) {

                //Capturar detalles
                const detalles1 = await new Promise((resolve, reject) => {
                    conn.query("SELECT * FROM tbl_reparaciones_detalles WHERE idReparacion = ?", [idReparacion], (err, detalles) => {
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
                        conn.query("DELETE FROM tbl_reparaciones_detalles_detalles WHERE idDetalleReparacion = ?", [detalles1[i].idDetalleReparacion], (err, result) => {
                            if (err) {
                                reject(err);
                            } else {
                                console.log("Insumos Eliminados");
                                resolve();
                            }
                        });
                    });
                    // End Eliminar detalles de los detalle
                }

                // Eliminar Detalles
                await new Promise((resolve, reject) => {
                    conn.query("DELETE FROM tbl_reparaciones_detalles WHERE idReparacion = ?", [idReparacion], (err, result) => {
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

        //Registrar Detalles
        //Verificar si se enviaron nuevos detalles
        if (data.articulo_2) {

            // Registrar Detalles y Reconocer si se manda 1 o más detalles
            if (data.articulo_2[0].length > 1) {
                // Más de un detalle

                for (let index_d in data.articulo_2) {
                    const detalle_2 = await new Promise((resolve, reject) => {
                        conn.query(`INSERT INTO tbl_reparaciones_detalles(idReparacion, articulo, descripcion, observacion) VALUES (?, ?, ?, ?)`,
                            [
                                idReparacion,
                                data.articulo_2_a[index_d],
                                data.descripcion_2[index_d],
                                data.observacion_2[index_d],
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
                    const idDetalleReparacion = detalle_2.insertId;
                    const ins = data.articulo_2[index_d] + '_idInsumo';
                    const cant = data.articulo_2[index_d] + '_cantidad';

                    if (data[ins][0].length > 1) {
                        // Más de un insumo

                        //Capturar ids insumos
                        for (let index in data[ins]) {
                            for (let ix in insumos) {
                                if (data[ins][index] == insumos[ix].nombre) {
                                    data[ins][index] = insumos[ix].idInsumo;
                                }
                            }
                            //End capturar ids insumos

                            await new Promise((resolve, reject) => {
                                conn.query(`INSERT INTO tbl_reparaciones_detalles_detalles(idDetalleReparacion, idInsumo, cantidad_n) VALUES (?, ?, ?)`,
                                    [
                                        idDetalleReparacion,
                                        data[ins][index],
                                        data[cant][index]
                                    ],
                                    (err) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            console.log("Insumo Registrado");
                                            resolve();
                                        }
                                    }
                                );
                            });
                        }

                    } else {
                        // Un insumo

                        //Capturar id insumo
                        for (let ix in insumos) {
                            if (data[ins] == insumos[ix].nombre) {
                                data[ins] = insumos[ix].idInsumo;
                            }
                        }
                        //End capturar id insumo


                        await new Promise((resolve, reject) => {
                            conn.query(`INSERT INTO tbl_reparaciones_detalles_detalles(idDetalleReparacion, idInsumo, cantidad_n) VALUES (?, ?, ?)`,
                                [
                                    idDetalleReparacion,
                                    data[ins],
                                    data[cant]
                                ],
                                (err) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        console.log("Insumo Registrado");
                                        resolve();
                                    }
                                }
                            );
                        });
                    }
                }

            } else {
                // Un detalle

                const detalle2 = await new Promise((resolve, reject) => {
                    conn.query(`INSERT INTO tbl_reparaciones_detalles(idReparacion, articulo, descripcion, observacion) VALUES (?, ?, ?, ?)`,
                        [
                            idReparacion,
                            data.articulo_2_a,
                            data.descripcion_2,
                            data.observacion_2,
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
                const idDetalleReparacion = detalle2.insertId;
                const ins = data.articulo_2 + '_idInsumo';
                const cant = data.articulo_2 + '_cantidad';


                if (data[ins][0].length > 1) {
                    // Más de un insumo

                    //Capturar ids insumos
                    for (let index in data[ins]) {
                        for (let ix in insumos) {
                            if (data[ins][index] == insumos[ix].nombre) {
                                data[ins][index] = insumos[ix].idInsumo;
                            }
                        }
                        //End capturar ids insumos

                        await new Promise((resolve, reject) => {
                            conn.query(`INSERT INTO tbl_reparaciones_detalles_detalles(idDetalleReparacion, idInsumo, cantidad_n) VALUES (?, ?, ?)`,
                                [
                                    idDetalleReparacion,
                                    data[ins][index],
                                    data[cant][index]
                                ],
                                (err) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        console.log("Insumo Registrado");
                                        resolve();
                                    }
                                }
                            );
                        });
                    }

                } else {
                    // Un insumo

                    //Capturar id insumo
                    for (let ix in insumos) {
                        if (data[ins] == insumos[ix].nombre) {
                            data[ins] = insumos[ix].idInsumo;
                        }
                    }
                    //End capturar id insumo


                    await new Promise((resolve, reject) => {
                        conn.query(`INSERT INTO tbl_reparaciones_detalles_detalles(idDetalleReparacion, idInsumo, cantidad_n) VALUES (?, ?, ?)`,
                            [
                                idDetalleReparacion,
                                data[ins],
                                data[cant]
                            ],
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    console.log("Insumo Registrado");
                                    resolve();
                                }
                            }
                        );
                    });
                }

            }
            // End Registrar Detalles
        }
        //End Registrar Detalles

        // Redireccionar
        console.log("Registro de reparación exitoso");
        res.redirect("/reparaciones");
    } catch (err) {
        res.status(500).json(err);
    }
}
//End Modificar


//Eliminar Reparacion
function reparaciones_eliminar(req, res) {
    const idReparacion = req.body.idReparacion;
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM tbl_reparaciones WHERE idReparacion = ?', [idReparacion], (err, reparacion) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                for (i in reparacion) {
                    conn.query(`Update users_info set numReparaciones=numReparaciones- 1 where idInfo= ?`, [reparacion[i].idInfoUser1],
                        (err) => {
                            if (err) {
                                return res.status(500).json(err);
                            } else {
                                console.log("Registrador Actualizado -1Reparación");
                                conn.query(`Update users_info set numReparaciones=numReparaciones- 1 where idInfo= ?`, [reparacion[i].idInfo],
                                    (err) => {
                                        if (err) {
                                            return res.status(500).json(err);
                                        } else {
                                            console.log("Cliente Actualizado -1Reparación");

                                            conn.query("DELETE FROM tbl_reparaciones_detalles WHERE idReparacion = ?", [idReparacion], (err, detalles) => {
                                                if (err) {
                                                    return res.status(500).json(err);
                                                } else {
                                                    console.log("Detalles Eliminados");

                                                    conn.query("DELETE FROM tbl_reparaciones WHERE idReparacion = ?", [idReparacion], (err, reparacion) => {
                                                        if (err) {
                                                            return res.status(500).json(err);
                                                        } else {
                                                            console.log("Reparación Eliminada");
                                                        }
                                                    });
                                                }
                                                res.redirect("/reparaciones");
                                            });
                                        }
                                    }
                                );
                            }
                        }
                    );
                }
            }
        });
    });
}
//End Eliminar Reparacion


//Cambiar Estado Reparacion
function reparaciones_estadoTyE(req, res) {
    const idReparacion = req.body.idReparacion;
    estado = {
        estado: 'Entregado'
    }
    req.getConnection((err, conn) => {
        conn.query(`Update tbl_reparaciones set ? where idReparacion= ?`, [estado, idReparacion],
            (err) => {
                if (err) {
                    return res.status(500).json(err);
                } else {
                    console.log("Estado Reparación Actualizado");

                    res.redirect("/reparaciones");
                }
            });
    });
}

//Cambiar Estado Reparacion

module.exports = {
    reparaciones_listar: reparaciones_listar,
    reparaciones_detallar: reparaciones_detallar,
    reparaciones_crear: reparaciones_crear,
    reparaciones_registrar: reparaciones_registrar,
    reparaciones_editar: reparaciones_editar,
    reparaciones_modificar: reparaciones_modificar,
    reparaciones_eliminar: reparaciones_eliminar,
    reparaciones_estadoTyE: reparaciones_estadoTyE
}