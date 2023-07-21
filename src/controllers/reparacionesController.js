//Listar
function reparaciones_listar(req, res) {
    // Obtener la conexión a la base de datos
    req.getConnection((err, conn) => {
        if (err) {
            // Si hay un error al obtener la conexión, enviar una respuesta con el error
            return res.status(500).json(err);
        }

        // Consultar las reparaciones en la base de datos
        conn.query('SELECT * FROM tbl_reparaciones ORDER BY CASE WHEN estado = "Entregado" THEN 1 ELSE 0 END, estado ASC;', (err, reparaciones) => {
            if (err) {
                // Si hay un error al consultar las reparaciones, enviar una respuesta con el error
                return res.status(500).json(err);
            }

            // Consultar los detalles de las reparaciones para cada reparación
            for (let index in reparaciones) {
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
                                reparaciones[index].userName1;
                                reparaciones[index].userTell1;
                                reparaciones[index].userEmail1;
                                reparaciones[index].userName2;
                                reparaciones[index].userTell2;
                                reparaciones[index].userEmail2;
                                for (iA in usersA) {
                                    for (iI in usersI) {
                                        if (usersI[iI].idInfo == reparaciones[index].idInfoUser1 && usersI[iI].idAccess == usersA[iA].idAccess) {
                                            reparaciones[index].userName1 = usersI[iI].nombre;
                                            reparaciones[index].userTell1 = usersI[iI].telefono;
                                            reparaciones[index].userEmail1 = usersA[iA].correo;
                                        }
                                        if (usersI[iI].idInfoUser == reparaciones[index].idInfoUser2 && usersI[iI].idAccess == usersA[iA].idAccess) {
                                            reparaciones[index].userName2 = usersI[iI].nombre;
                                            reparaciones[index].userTell2 = usersI[iI].telefono;
                                            reparaciones[index].userEmail2 = usersA[iA].correo;
                                        }
                                    }
                                }
                            }
                            let numR = reparaciones.length;
                            res.status(200).render("reparaciones/listar", { reparaciones, numR });
                        }
                    });
                }
            });

        });
    });
}
//End Listar


//Detallar
function reparaciones_detallar(req, res) {
    const idReparacion = req.params.idReparacion;
    req.getConnection((err, conn) => {
        if (err) {
            // Si hay un error al obtener la conexión, enviar una respuesta con el error
            return res.status(500).json(err);
        }

        // Consultar la reparación por su id
        conn.query("SELECT * FROM tbl_reparaciones WHERE idReparacion = ?", [idReparacion], (err, reparacion) => {
            if (err) {
                // Si hay un error al consultar la reparación, enviar una respuesta con el error
                return res.status(500).json(err);
            }

            // Actualizar los campos de la reparación para parsear las fechas y los precios 
            for (let index in reparacion) {
                reparacion[index].fechaEntrega = reparacion[index].fechaEntrega.toLocaleDateString();
                reparacion[index].fechaRegistro = reparacion[index].fechaRegistro.toLocaleString();
                reparacion[index].total = "$ " + reparacion[index].total.toLocaleString('es-CO');

                // Actualizar el estado de la reparación para que en el hbs el estado tenga su propio diseño dependiendo del valor
                // Actualizar el estado de la reparación
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

            // Consultar los usuarios de la tabla tbl_users_info
            conn.query("SELECT * FROM users_info", (err, users) => {
                if (err) {
                    // Si hay un error al consultar los usuarios, enviar una respuesta con el error
                    return res.status(500).json(err);
                }

                // Actualizar los campos de la reparación con la información de los usuarios para los popovers en el hbs
                for (let index in reparacion) {
                    for (let i in users) {
                        if (users[i].idInfoUser == reparacion[index].idInfoUser1) {
                            reparacion[index].userName1 = users[i].nombre;
                            reparacion[index].userTell1 = users[i].telefono;
                            reparacion[index].userNumR1 = users[i].numReparaciones;
                            // reparaciones[index].userEmail = users[i].correo
                        }
                        if (users[i].idInfoUser == reparacion[index].idInfoUser2) {
                            reparacion[index].userName2 = users[i].nombre;
                            reparacion[index].userTell2 = users[i].telefono;
                            reparacion[index].userNumR2 = users[i].numReparaciones;
                            // reparaciones[index].userEmail = users[i].correo
                        }
                    }
                }

                // Consultar los detalles de la reparación
                conn.query("SELECT * FROM tbl_reparaciones_detalles WHERE idReparacion = ?", [idReparacion], (err, detallesreparacion) => {
                    if (err) {
                        // Si hay un error al consultar los detalles de la reparación, enviar una respuesta con el error
                        return res.status(500).json(err);
                    }

                    // Actualizar los campos de los detalles de la reparación 
                    let cont = 1;
                    for (let index in detallesreparacion) {
                        detallesreparacion[index].fechaEstado = detallesreparacion[index].fechaEstado.toLocaleString();
                        detallesreparacion[index].cont = cont;
                        cont++;

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

                        //Parsear fecha
                        detallesreparacion[index].fechaEstado = detallesreparacion[index].fechaEstado.toLocaleString();
                    }


                    //Calcular Número Detalles
                    let numDR = detallesreparacion.length;
                    for (let i in reparacion) {
                        reparacion[i].numDR = numDR;
                    }
                    //End Calcular Número Detalles

                    //Redireccionar 
                    res.render("reparaciones/detallar", { detallesreparacion, reparacion, numDR });
                });
            });
        });
    });
}
//End Detallar


//Crear (Función para redireccionar al hbs donde se encuentra el formulario)
function reparaciones_crear(req, res) {
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM users_access WHERE estado ='A' AND idRoles = 4", (err, clientes) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                /* conn.query("SELECT * FROM tbl_users_access WHERE estado ='A' AND idRol != 4", (err, registradores) => {
                     if (err) {
                         return res.status(500).json(err);
                     } else {*/
                res.render("reparaciones/registrar", { clientes });
                /*}
            });*/
            }
        });
    });
}
//End Crear


//Registrar Reparación
function reparaciones_registrar(req, res) {
    var data = req.body;

    //Capturar Cliente/Registrador 
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM users_access", (err, usersA) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                conn.query("SELECT * FROM users_info", (err, usersI) => {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        data.idInfoUser1 = 0;
                        data.idInfoUser2 = 0;

                        for (index in usersA) {
                            for (i in usersI) {
                                //if (data.idRegistrador == usersA[index].correo && usersA[index].idAccess == usersI[i].idAccess) {
                                //    data.idInfoUser1 = usersI[i].idInfoUser;
                                //    console.log("Registrador encontrado");
                                //}

                                if (data.idCliente == usersA[index].correo && usersA[index].idAccess == usersI[i].idAccess) {
                                    data.idInfoUser2 = usersI[i].idInfo;
                                    console.log("Cliente encontrado");
                                }
                            }
                        }
                        //conn.query(`Update tbl_users_info set numReparaciones=numReparaciones+ 1 where idInfoUser= ?`, [data.idInfoUser1],
                        //    (err) => {
                        //         if (err) {
                        //            return res.status(500).json(err);
                        //        } else {
                        //            console.log("Registrador Actualizado +1Reparación");
                        conn.query(`Update users_info set numReparaciones=numReparaciones+ 1 where idInfo= ?`, [data.idInfoUser2],
                            (err) => {
                                if (err) {
                                    return res.status(500).json(err);
                                } else {
                                    console.log("Cliente Actualizado +1Reparación");
                                }
                            }
                        );
                        // }
                        // }
                        // );

                        //End Capturar Cliente/Registrador 

                        const RegistroReparacion = {
                            // idInfoUser1: data.idInfoUser1,
                            idInfoUser2: data.idInfoUser2,
                            total: data.total,
                            fechaEntrega: data.fechaEntrega
                        };

                        //Registrar Reparación
                        conn.query("INSERT INTO tbl_reparaciones SET ?", [RegistroReparacion], (err, result) => {
                            if (err) {
                                return res.status(500).json(err);
                                return;
                            } else {
                                console.log("Reparación Registrada");
                                //End Registrar Reparación 

                                //Captura idReparación
                                const idReparacion = result.insertId;

                                //Registrar Detalles y Reconocer si se manda 1 o más detalles
                                if (data.productoReparar[0].length > 1) {
                                    //Más de un detalle
                                    for (index in data.productoReparar) {
                                        conn.query(`INSERT INTO tbl_reparaciones_detalles(idReparacion,productoReparar,descripcion,observacion) VALUES (?,?,?,?)`,
                                            [
                                                idReparacion,
                                                data.productoReparar[index],
                                                data.descripcion[index],
                                                data.observacion[index],
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
                                    conn.query(`INSERT INTO tbl_reparaciones_detalles(idReparacion,productoReparar,descripcion,observacion) VALUES (?,?,?,?)`,
                                        [
                                            idReparacion,
                                            data.productoReparar,
                                            data.descripcion,
                                            data.observacion,
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
                                console.log("Registro de reparación exitoso");
                                res.redirect("/reparaciones");
                            }
                        });
                    }
                });
            }
        });
    });
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

                    //conn.query('SELECT * FROM tbl_users_info WHERE idInfoUser = ?', [reparacion[i].idInfoUser1], (err, user1) => {
                    //    if (err) {
                    //        return res.status(500).json(err);
                    //    } else {
                    //        for (i2 in user1) {
                    //            reparacion[i].idInfoUser1 = user1[i2].nombre;
                    //        }
                    conn.query('SELECT * FROM users_info WHERE idInfo = ?', [reparacion[i].idInfoUser2], (err, user2) => {
                        if (err) {
                            return res.status(500).json(err);
                        } else {
                            for (i3 in user2) {
                                reparacion[i].idInfoUser2 = user2[i3].nombre;
                            }
                        }
                    });


                    //    }
                    //});

                }
                conn.query('SELECT * FROM tbl_reparaciones_detalles WHERE idReparacion = ?', [idReparacion], (err, detallesreparacion) => {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        for (let index in detallesreparacion) {
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
                        }
                        //console.log(detallesreparacion)

                        res.render('reparaciones/editar', { reparacion, detallesreparacion });
                    }
                });
            }
        });
    });
}
//End Editar


//Modificar
function reparaciones_modificar(req, res) {
    const idReparacion = req.params.idReparacion;
    const data = req.body;

    //console.log(data);

    const RegistroReparacion = {
        total: data.total,
        fechaEntrega: data.fechaEntrega
    };

    req.getConnection((err, conn) => {

    if(data.productoReparar_1){
        if (data.productoReparar_1[0].length > 1) {
            //Más de un detalle

            //Actualizar Detalles
            let e_proceso = false;
            let e_terminado = false;
            let e_iniciado = false;

            let e_terminado_1 = true;
            let e_iniciado_1 = true;
            let estadoF = '';
            for (index in data.productoReparar_1) {
                if (data.estado_1[index] == 'Iniciado' && e_iniciado_1 == true) {
                    e_iniciado = true;
                    e_iniciado_1 = true;
                } else {
                    e_iniciado_1 = false;
                    e_iniciado = false;
                }

                if (data.estado_1[index] == 'Terminado' && e_terminado_1 == true) {
                    e_terminado = true;
                    e_terminado_1 = true;
                } else {
                    e_terminado_1 = false;
                    e_terminado = false;
                }

                if (data.estado_1[index] == 'Proceso') {
                    e_proceso = true;
                }

                //End Actualizar Detalles
                if (e_iniciado == true) {
                    estadoF = 'Iniciado'
                } else {
                    if (e_terminado == true) {
                        estadoF = 'Terminado'
                    } else {
                        if (e_proceso == true) {
                            estadoF = 'Proceso'
                        } else {
                            if (e_iniciado == false && e_terminado == false) {
                                estadoF = 'Proceso'
                            }
                        }
                    }
                }
            }

            const ReparacionEstado = {
                estado: estadoF
            }

            //Actualizar Reparación
            conn.query('UPDATE tbl_reparaciones SET ?  WHERE idReparacion = ?', [ReparacionEstado, idReparacion], (err, rows) => {
                if (err) {
                    return res.status(500).json(err);
                } else {
                    console.log('Estado Reparación Actualizado')
                    //End Actualizar Reparación
                }
            });
        } else {
            if (data.productoReparar_1[0].length <= 1) {
                //Un detalle
                if (data.estado_1 == 'Iniciado') {
                    estadoF = 'Iniciado';
                } else {
                    if (data.estado_1 == 'Proceso') {
                        estadoF = 'Proceso';
                    } else {
                        if (data.estado_1 == 'Terminado') {
                            estadoF = 'Terminado';
                        }
                    }
                }

                const ReparacionEstado = {
                    estado: estadoF
                }

                //Actualizar Reparación
                conn.query('UPDATE tbl_reparaciones SET ?  WHERE idReparacion = ?', [ReparacionEstado, idReparacion], (err, rows) => {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        console.log('Estado Reparación Actualizado')
                        //End Actualizar Reparación
                    }
                });

            } else {
                if (!data.productoReparar_1 && data.productoReparar_2) {
                    const ReparacionEstado = {
                        estado: 'Iniciado'
                    }

                    //Actualizar Reparación
                    conn.query('UPDATE tbl_reparaciones SET ?  WHERE idReparacion = ?', [ReparacionEstado, idReparacion], (err, rows) => {
                        if (err) {
                            return res.status(500).json(err);
                        } else {
                            console.log('Estado Reparación Actualizado')
                            //End Actualizar Reparación
                        }
                    });

                }

            }
        }
    }
        //Actualizar Reparación
        conn.query('UPDATE tbl_reparaciones SET ? WHERE idReparacion = ?', [RegistroReparacion, idReparacion], (err, rows) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                console.log('Reparación Actualizada')
                //End Actualizar Reparación

                //Reconocer si se mandan detalles ya registrados 
                if (data.productoReparar_1) {
                    conn.query('SELECT * FROM tbl_reparaciones_detalles WHERE idReparacion = ?', [idReparacion], (err, d_reparacion) => {
                        if (err) {
                            return res.status(500).json(err);
                        } else {
                            //Reconocer si se manda 1 o más detalles
                            if (data.productoReparar_1[0].length > 1) {
                                //Más de un detalle

                                //Actualizar Detalles
                                for (index in data.productoReparar_1) {
                                    const RegistroDetalleReparacion = {
                                        //idReparacion: idReparacion,
                                        productoReparar: data.productoReparar_1[index],
                                        descripcion: data.descripcion_1[index],
                                        observacion: data.observacion_1[index],
                                        estado: data.estado_1[index]
                                    }

                                    conn.query(`UPDATE tbl_reparaciones_detalles SET ? WHERE idReparacion = ? AND idDetalleReparacion = ?`,
                                        [
                                            RegistroDetalleReparacion, idReparacion, data.idDetalleReparacion_1[index]
                                        ],
                                        (err) => {
                                            if (err) {
                                                return res.status(500).json(err);
                                            } else {
                                                console.log("Detalle Actualizado");
                                            }
                                        }
                                    );
                                }

                                //Eliminar Detalles
                                for (index in d_reparacion) {
                                    var r = 0;
                                    //Reconocer si se eliminó algún detalle que se había registrado con anterioridad
                                    //Comparando los detallas enviados vs los detalles ya registrados 
                                    for (i in data.idDetalleReparacion_1) {
                                        if (d_reparacion[index].idDetalleReparacion == data.idDetalleReparacion_1[i]) {
                                            r = 1;
                                        }
                                    }

                                    if (r == 0) {
                                        conn.query("DELETE FROM tbl_reparaciones_detalles WHERE idDetalleReparacion = ?", [d_reparacion[index].idDetalleReparacion], (err, res) => {
                                            if (err) {
                                                return res.status(500).json(err);
                                            } else {
                                                console.log("Detalle Eliminado");
                                            }
                                        });
                                    }
                                }
                                //End Eliminar Detalles
                            } else {
                                //Actualizar Detalle
                                const RegistroDetalleReparacion = {
                                    idReparacion: idReparacion,
                                    productoReparar: data.productoReparar_1,
                                    descripcion: data.descripcion_1,
                                    observacion: data.observacion_1,
                                    estado: data.estado_1
                                }

                                conn.query(`UPDATE tbl_reparaciones_detalles SET ? WHERE idReparacion = ? AND idDetalleReparacion = ?`,
                                    [
                                        RegistroDetalleReparacion, idReparacion, data.idDetalleReparacion_1
                                    ],
                                    (err) => {
                                        if (err) {
                                            return res.status(500).json(err);
                                        } else {
                                            console.log("Detalle Actualizado");
                                        }
                                    }
                                );
                                //End Actualizar Detalle

                                //Eliminar Detalles
                                for (i in d_reparacion) {
                                    if (d_reparacion[i].idDetalleReparacion != data.idDetalleReparacion_1) {
                                        conn.query("DELETE FROM tbl_reparaciones_detalles WHERE idDetalleReparacion = ?", [d_reparacion[i].idDetalleReparacion], (err, res) => {
                                            if (err) {
                                                return res.status(500).json(err);
                                            } else {
                                                console.log("Detalle Eliminado");
                                            }
                                        });
                                    }
                                }
                                //End Eliminar Detalles
                            }
                        }
                    });
                    //End Eliminar Detalles

                } else {
                    //Eliminar todos los detalles registrados si fueron eliminados del form

                    if (!data.productoReparar_1 && data.productoReparar_2) {
                        conn.query("DELETE FROM tbl_reparaciones_detalles WHERE idReparacion = ?", [idReparacion], (err, res) => {
                            if (err) {
                                return res.status(500).json(err);
                            } else {
                                console.log("Detalles Eliminados");
                            }
                        });
                    }

                }

                //Registrar Detalles
                //Verificar si se enviaron nuevos detalles
                if (data.productoReparar_2) {
                    //Reconocer si se manda 1 o más detalles
                    if (data.productoReparar_2[0].length > 1) {
                        //Más de un detalle
                        for (index in data.productoReparar_2) {
                            conn.query(`INSERT INTO tbl_reparaciones_detalles(idReparacion,productoReparar,descripcion,observacion) VALUES (?,?,?,?)`,
                                [
                                    idReparacion,
                                    data.productoReparar_2[index],
                                    data.descripcion_2[index],
                                    data.observacion_2[index]
                                    //data.estado_2[index] Estado por defecto es Iniciado
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
                        conn.query(`INSERT INTO tbl_reparaciones_detalles(idReparacion,productoReparar,descripcion,observacion) VALUES (?,?,?,?)`,
                            [
                                idReparacion,
                                data.productoReparar_2,
                                data.descripcion_2,
                                data.observacion_2
                                //data.estado_2  Estado por defecto es Iniciado
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
                }
                //End Registrar Detalles
            }
            res.redirect('/reparaciones');
        });

    });
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
                                conn.query(`Update users_info set numReparaciones=numReparaciones- 1 where idInfo= ?`, [reparacion[i].idInfoUser2],
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