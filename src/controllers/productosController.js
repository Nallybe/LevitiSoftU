//Listar
function productos_listar(req, res) {
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
                    const numP = productos.length;
                    res.render('productos/listar', { productos, numP });
                }
            });
        }
    });
}
//End Listar


//Detallar
function productos_detallar(req, res) {
    const idProducto = req.params.idProducto;
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM tbl_productos WHERE idProducto = ?", [idProducto], (err, producto) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                for (index in producto) {
                    if (producto[index].estado == 'A') {
                        producto[index].estado1 = true;
                    } else {
                        producto[index].estado2 = true;
                    }
                }
                conn.query("SELECT * FROM tbl_productos_detalles WHERE idProducto = ?", [idProducto], (err, detallesproducto) => {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        conn.query("SELECT * FROM tbl_insumos", (err, insumos) => {
                            if (err) {
                                return res.status(500).json(err);
                            } else {
                                let cont = 1;
                                for (index in detallesproducto) {
                                    detallesproducto[index].cont = cont;
                                    detallesproducto[index].nombreI;
                                    detallesproducto[index].medidaI;
                                    detallesproducto[index].cantidadI;
                                    detallesproducto[index].estadoI;
                                    for (i in insumos) {
                                        if (insumos[i].idInsumo == detallesproducto[index].idInsumo) {
                                            detallesproducto[index].nombreI = insumos[i].nombre;
                                            detallesproducto[index].medidaI = insumos[i].medida;
                                            detallesproducto[index].cantidadI = insumos[i].cantidad;
                                            detallesproducto[index].estadoI = insumos[i].estado;
                                        }
                                    }
                                    cont++;
                                }

                                numDP = detallesproducto.length;
                                res.render("productos/detallar", { detallesproducto, producto, numDP });
                            }
                        });
                    }
                });
            }
        });
    });
}
//End Detallar


//Crear (Función para redireccionar al hbs donde se encuentra el formulario)
function productos_crear(req, res) {
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM tbl_insumos WHERE estado ='Disponible'", (err, insumos) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                conn.query("SELECT * FROM tbl_productos", (err, productos) => {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        res.render("productos/registrar", { insumos, productos });
                    }
                });
            }
        });
    });
}
//End Crear



//Registrar Producto
function productos_registrar(req, res) {
    var data = req.body;
    var imagen = req.file; // Aquí obtienes el archivo de imagen
    console.log(imagen)

    const RegistroProducto = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        stock: data.stock,
        imagen: imagen.filename // Guarda el nombre de la imagen en el objeto de registro
        //imagen: req.file
        //imagen: imagen.filename
    };

    req.getConnection((err, conn) => {
        //Registrar Producto
        conn.query("INSERT INTO tbl_productos SET ?", [RegistroProducto], (err, result) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                console.log("Producto Registrado");
                //End Registrar Producto 

                //Captura idProducto
                const idProducto = result.insertId;

                //Reconocer si se manda 1 o más detalles
                if (data.idInsumo[0].length > 1) {
                    //Más de un detalle

                    //Capturar idsInsumos
                    conn.query("SELECT * FROM tbl_insumos", (err, insumos) => {
                        if (err) {
                            return res.status(500).json(err);
                        } else {
                            for (index in data.idInsumo) {
                                for (i in insumos) {
                                    if (data.idInsumo[index] == insumos[i].nombre) {
                                        data.idInsumo[index] = insumos[i].idInsumo;
                                        console.log("Insumo encontrado");
                                    }
                                }
                            }
                            //End Capturar idsInsumos

                            //Registrar Detalles
                            for (index in data.idInsumo) {
                                conn.query(`INSERT INTO tbl_productos_detalles(idProducto,idInsumo,cantidad_n) VALUES (?,?,?)`,
                                    [
                                        idProducto,
                                        data.idInsumo[index],
                                        data.cantidad_n[index],
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
                        }
                    });

                } else {
                    //Un detalle

                    //Capturar idInsumo
                    conn.query("SELECT * FROM tbl_insumos", (err, insumos) => {
                        if (err) {
                            return res.status(500).json(err);
                        } else {
                            for (i in insumos) {
                                if (data.idInsumo == insumos[i].nombre) {
                                    data.idInsumo = insumos[i].idInsumo;
                                    console.log("Insumo encontrado")
                                }
                            }
                            //End Capturar idInsumo

                            //Registrar Detalle
                            conn.query(`INSERT INTO tbl_productos_detalles(idProducto,idInsumo,cantidad_n) VALUES (?,?,?)`,
                                [
                                    idProducto,
                                    data.idInsumo,
                                    data.cantidad_n,
                                ],
                                (err) => {
                                    if (err) {
                                        return res.status(500).json(err);
                                    } else {
                                        console.log("Detalle Registrado");
                                    }
                                }
                            );
                            //End Registrar Detalle
                        }
                    });
                }
                //Redireccionar
                res.redirect("/productos");
            }
        });
    });
}
//End Registrar Producto


//Editar
function productos_editar(req, res) {
    const idProducto = req.params.idProducto;
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM tbl_productos WHERE idProducto != ?', [idProducto], (err, productos) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                conn.query('SELECT * FROM tbl_productos WHERE idProducto = ?', [idProducto], (err, producto) => {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        for (i in producto) {
                            // Actualizar el estado de la Producto
                            switch (producto[i].estado) {
                                case 'A':
                                    producto[i].estado1 = true;
                                    break;
                                case 'I':
                                    producto[i].estado2 = true;
                                    break;
                            }
                        }
                        conn.query('SELECT * FROM tbl_productos_detalles WHERE idProducto = ?', [idProducto], (err, detallesproducto) => {
                            if (err) {
                                return res.status(500).json(err);
                            } else {

                                //Capturar idInsumo
                                conn.query("SELECT * FROM tbl_insumos", (err, insumos) => {
                                    if (err) {
                                        return res.status(500).json(err);
                                    } else {
                                        for (index in detallesproducto) {
                                            for (i in insumos) {
                                                if (detallesproducto[index].idInsumo == insumos[i].idInsumo) {
                                                    detallesproducto[index].idInsumo = insumos[i].nombre;
                                                }
                                            }
                                        }
                                    }
                                    res.render('productos/editar', { productos, producto, detallesproducto, insumos });

                                });
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
function productos_modificar(req, res) {
    const idProducto = req.params.idProducto;
    const data = req.body;

    console.log(data)

    const RegistroProducto = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        stock: data.stock
    };
    console.log(RegistroProducto)




    req.getConnection((err, conn) => {
        //Actualizar Producto
        conn.query('UPDATE tbl_productos SET ? WHERE idProducto = ?', [RegistroProducto, idProducto], (err, rows) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                console.log('Producto Actualizado')
                //End Actualizar Producto

                //Reconocer si se mandan detalles ya registrados 
                if (data.idInsumo_1) {
                    conn.query('SELECT * FROM tbl_productos_detalles WHERE idProducto = ?', [idProducto], (err, d_producto) => {
                        if (err) {
                            return res.status(500).json(err);
                        } else {

                            //Reconocer si se manda 1 o más detalles
                            if (data.idInsumo_1[0].length > 1) {
                                //Más de un detalle

                                //Actualizar Detalles
                                for (index in data.idInsumo_1) {

                                    const RegistroDetalleProducto = {
                                        cantidad_n: data.cantidad_n_1[index]
                                    }

                                    conn.query(`UPDATE tbl_productos_detalles SET ? WHERE idProducto = ? AND idDetalleProducto = ?`,
                                        [
                                            RegistroDetalleProducto, idProducto, data.idDetalleProducto_1[index]
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
                                //End Actualizar Detalles

                                //Eliminar Detalles
                                for (index in d_producto) {
                                    var r = 0;
                                    //Reconocer si se eliminó algún detalle que se había registrado con anterioridad
                                    //Comparando los detallas enviados vs los detalles ya registrados 
                                    for (i in data.idDetalleProducto_1) {
                                        if (d_producto[index].idDetalleProducto == data.idDetalleProducto_1[i]) {
                                            r = 1;
                                        }
                                    }

                                    if (r == 0) {
                                        conn.query("DELETE FROM tbl_productos_detalles WHERE idDetalleProducto = ?", [d_producto[index].idDetalleProducto], (err, res) => {
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
                                //Un Detalle 

                                //Actualizar Detalle
                                const RegistroDetalleProducto = {
                                    cantidad_n: data.cantidad_n_1
                                }

                                conn.query(`UPDATE tbl_productos_detalles SET ? WHERE idProducto = ? AND idDetalleProducto = ?`,
                                    [
                                        RegistroDetalleProducto, idProducto, data.idDetalleProducto_1
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
                                for (i in d_producto) {
                                    if (d_producto[i].idDetalleProducto != data.idDetalleProducto_1) {
                                        conn.query("DELETE FROM tbl_productos_detalles WHERE idDetalleProducto = ?", [d_producto[i].idDetalleProducto], (err, res) => {
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
                } else {
                    //Eliminar todos los detalles registrados si fueron eliminados del form
                    conn.query("DELETE FROM tbl_productos_detalles WHERE idProducto = ?", [idProducto], (err, res) => {
                        if (err) {
                            return res.status(500).json(err);
                        } else {
                            console.log("Detalles Eliminados");
                        }
                    });
                }

                //Registrar Detalles
                //Verificar si se enviaron nuevos detalles
                if (data.idInsumo_2) {
                    //Reconocer si se manda 1 o más detalles
                    if (data.idInsumo_2[0].length > 1) {
                        //Más de un detalle
                        conn.query("SELECT * FROM tbl_insumos", (err, insumos) => {
                            if (err) {
                                return res.status(500).json(err);
                            } else {
                                //Capturar idInsumos
                                for (index in data.idInsumo_2) {
                                    let idI;
                                    for (i in insumos) {
                                        if (data.idInsumo_2[index] == insumos[i].nombre) {
                                            data.idInsumo_2[index] = insumos[i].idInsumo;
                                        }
                                    }//End Capturar idInsumos

                                    //Registrar Detalle
                                    conn.query(`INSERT INTO tbl_productos_detalles(idProducto,idInsumo,cantidad_n) VALUES (?,?,?)`,
                                        [
                                            idProducto,
                                            data.idInsumo_2[index],
                                            data.cantidad_n_2[index],
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
                                //End Registrar Detalle
                            }
                        });
                    } else {
                        //Un detalle

                        conn.query("SELECT * FROM tbl_insumos", (err, insumos) => {
                            if (err) {
                                return res.status(500).json(err);
                            } else {
                                //Capturar idInsumo
                                for (i in insumos) {
                                    if (data.idInsumo_2 == insumos[i].nombre) {
                                        data.idInsumo_2 = insumos[i].idInsumo;
                                    }
                                }
                                //End Capturar idInsumo

                                //Registrar Detalle
                                conn.query(`INSERT INTO tbl_productos_detalles(idProducto,idInsumo,cantidad_n) VALUES (?,?,?)`,
                                    [
                                        idProducto,
                                        data.idInsumo_2,
                                        data.cantidad_n_2,
                                    ],
                                    (err) => {
                                        if (err) {
                                            return res.status(500).json(err);
                                        } else {
                                            console.log("Detalle Registrado");
                                        }
                                    }
                                );
                                //End Registrar Detalle
                            }
                        });
                    }
                }
                //End Registrar Detalles
            }
            res.redirect('/productos');
        });
    });
}
//End Modificar


//Eliminar Producto
function productos_eliminar(req, res) {
    const idProducto = req.body.idProducto;
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM tbl_productos WHERE idProducto = ?', [idProducto], (err, Producto) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                conn.query("DELETE FROM tbl_productos_detalles WHERE idProducto = ?", [idProducto], (err, detalles) => {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        console.log("Detalles Eliminados");

                        conn.query("DELETE FROM tbl_productos WHERE idProducto = ?", [idProducto], (err, result) => {
                            if (err) {
                                return res.status(500).json(err);
                            } else {
                                console.log("Producto Eliminado");
                            }
                        });
                    }
                    res.redirect("/productos");
                });
            }
        });
    });
}
//End Eliminar Producto


//Cambiar Estado Producto
function productos_estado(req, res) {
    const idProducto = req.params.idProducto;
    req.getConnection((err, conn) => {
        conn.query(`SELECT * FROM tbl_productos WHERE idProducto= ?`, [idProducto], (err, producto) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                for (i in producto) {
                    if (producto[i].estado == 'A') {
                        var estado = {
                            estado: 'I'
                        }

                        conn.query(`Update tbl_productos set ? where idProducto= ?`, [estado, idProducto],
                            (err) => {
                                if (err) {
                                    return res.status(500).json(err);
                                } else {
                                    console.log("Estado Producto Actualizado");
                                }
                            });
                    } else {
                        var estado = {
                            estado: 'A'
                        }

                        conn.query(`Update tbl_productos set ? where idProducto= ?`, [estado, idProducto],
                            (err) => {
                                if (err) {
                                    return res.status(500).json(err);
                                } else {
                                    console.log("Estado Producto Actualizado");


                                }
                            });

                    }
                }
            }
            res.redirect("/productos");
        });
    });
}

//Cambiar Estado Producto
module.exports = {
    productos_listar: productos_listar,
    productos_detallar: productos_detallar,
    productos_eliminar: productos_eliminar,
    productos_crear: productos_crear,
    productos_registrar: productos_registrar,
    productos_editar: productos_editar,
    productos_modificar: productos_modificar,
    productos_estado: productos_estado
}