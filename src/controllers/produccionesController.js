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
                                        if (usersI[iI].idInfoUser == producciones[index].idInfoUser && usersI[iI].idAccess == usersA[iA].idAccess) {
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
                                const numOP = producciones.length;
                                res.render('producciones/listar', { producciones, numOP });
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
/*
function producciones_detallar(req, res) {
    const idOrdenProduccion = req.params.idOrdenProduccion;
    req.getConnection((err, conn) => {
        if (err) {
            // Si hay un error al obtener la conexión, enviar una respuesta con el error
            return res.status(500).json(err);
        }
        // Consultar la reparación por su id
        conn.query("SELECT * FROM tbl_ordenes_produccion WHERE idOrdenProduccion = ?", [idOrdenProduccion], (err, producciones) => {
            if (err) {
                // Si hay un error al consultar la reparación, enviar una respuesta con el error
                return res.status(500).json(err);
            }

            // Actualizar los campos de la reparación para parsear las fechas y los precios 
            for (let index in producciones) {
                producciones[index].fechaInicio = producciones[index].fechaInicio.toLocaleDateString();
                producciones[index].fechaFin = producciones[index].fechaFin.toLocaleDateString();

                // Actualizar el estado de la reparación para que en el hbs el estado tenga su propio diseño dependiendo del valor
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


            // Consultar los usuarios de la tabla tbl_users_info
            conn.query("SELECT * FROM tbl_users_info", (err, users) => {
                if (err) {
                    // Si hay un error al consultar los usuarios, enviar una respuesta con el error
                    return res.status(500).json(err);
                }

                // Actualizar los campos de la reparación con la información de los usuarios
                for (let index in producciones) {
                    for (let i in users) {
                        if (users[i].idInfoUser == producciones[index].idInfoUser) {
                            producciones[index].userName = users[i].nombre;
                            producciones[index].userTell = users[i].telefono;
                            producciones[index].userNumOP = users[i].numProducciones;
                            // producciones[index].userEmail = users[i].correo
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
                                // img
                            }
                        }
                    }

                    // Consultar la reparación por su id
                    conn.query("SELECT * FROM tbl_ordenes_produccion_detalles WHERE idOrdenProduccion = ?", [idOrdenProduccion], (err, d_produccion) => {
                        if (err) {
                            // Si hay un error al consultar la reparación, enviar una respuesta con el error
                            return res.status(500).json(err);
                        }
                        // Actualizar los campos de la reparación para parsear las fechas y los precios 
                        var cont = 1;
                        for (let index in d_produccion) {
                            // Actualizar el estado de la reparación para que en el hbs el estado tenga su propio diseño dependiendo del valor
                            // Actualizar el estado de la reparación
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


                        conn.query("SELECT * FROM tbl_users_info", (err, users1) => {
                            if (err) {
                                // Si hay un error al consultar los usuarios, enviar una respuesta con el error
                                return res.status(500).json(err);
                            }

                            for (index in d_produccion) {
                                // Consultar la reparación por su id
                                conn.query("SELECT * FROM tbl_ordenes_produccion_detalles_participes WHERE idDetalleOrdenProduccion = ?", [d_produccion[index].idDetalleOrdenProduccion], (err, participes) => {
                                    if (err) {
                                        // Si hay un error al consultar la reparación, enviar una respuesta con el error
                                        return res.status(500).json(err);
                                    }
                                    d_produccion[index].participes = participes;
                                    // console.log(d_produccion[index]);
                                    // Consultar los usuarios de la tabla tbl_users_info

                                    for (index1 in d_produccion[index].participes) {
                                        for (let i in users1) {
                                            if (users1[i].idInfoUser == d_produccion[index].participes[index1].idInfoUser) {
                                                d_produccion[index].participes[index1].userName = users1[i].nombre;
                                                d_produccion[index].participes[index1].userTell = users1[i].telefono;
                                                d_produccion[index].participes[index1].userNumOP = users1[i].numProducciones;
                                                // producciones[index].userEmail = users[i].correo
                                            }
                                        }
                                    }

                                    //console.log(d_produccion[index])
                                });


                            }
                            //console.log(d_produccion)
                            //res.render("producciones/detallar", { producciones, d_produccion });
                        });

                    });
                });
            });
        })
    });
}
*/

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
            conn.query("SELECT * FROM tbl_users_info", (err, users) => {
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
                if (users[i].idInfo == producciones[index].idInfo) {
                    producciones[index].userName = users[i].nombre;
                    producciones[index].userTell = users[i].telefono;
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
                contd ++;
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


        /*
        const dates3 = [];
        for (let i = 0; i < dates2.length; i++) {
            const parts = dates2[i].split('-');
            const day = parts[2];
            const month = parts[1];
            const year = parts[0];
            const newDate = `${day}/${month}/${year}`;
            dates3.push(newDate);
        }

        console.log(dates3);
*/

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
            if(d_produccion[i].estado1){
                color = '#62a1fd'
            }
            if(d_produccion[i].estado2){
               color = '#6ab090'
            }
            if(d_produccion[i].estado3){
                color = '#a0a6ab'
            }

            var evento = {
                title: 'Evento #'+d_produccion[i].cont+' '+d_produccion[i].titulo,
                start: d_produccion[i].fechaInicio,
                end: d_produccion[i].fechaFin,
                color: color
            }
            eventos.push(evento);
        }

        console.log(eventos)

        eventosList={
            eventos
        } 

        console.log(eventosList)

        res.render("producciones/detallar", {producciones, d_produccion, d_producto, eventosList});
    } catch (err) {
        res.status(500).json(err);
    }
}

/*
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
                        //producciones[index].fechaInicio = producciones[index].fechaInicio.toLocaleDateString();
                        //producciones[index].fechaFin = producciones[index].fechaFin.toLocaleDateString();

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
            conn.query("SELECT * FROM tbl_users_info", (err, users) => {
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
                if (users[i].idInfoUser == producciones[index].idInfoUser) {
                    producciones[index].userName = users[i].nombre;
                    producciones[index].userTell = users[i].telefono;
                    producciones[index].userNumOP = users[i].numProducciones;
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

            for (let index1 in d_produccion[index].participes) {
                for (let i in users) {
                    if (users[i].idInfoUser == d_produccion[index].participes[index1].idInfoUser) {
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
                    d_producto[index].cantidadI = insumos[i].cantidad;
                    d_producto[index].estadoI = insumos[i].estado;
                }
            }
            cont++;
        }

        const DOP = d_produccion.length;




        //////////////Inicio Fechas Calendario 

        //Obtener el rango de 2 fechas
        function getDatesInRange(startDate, endDate) {
            const datesf = [];
            const currentDate = new Date(startDate);

            while (currentDate <= endDate) {
                datesf.push(currentDate.toISOString().split('T')[0]);
                currentDate.setDate(currentDate.getDate() + 1);
            }

            return datesf;
        }

        // Obtén los datos del primer y segundo array
        const firstArray = producciones;
        const secondArray = d_produccion;

        const dates = firstArray.map(date => {
            const datesDate = getDatesInRange(new Date(date.fechaInicio), new Date(date.fechaFin));
            return {
                datesDate
            };
        });
        //console.log(dates)

        var dates2 = [];
        for (i in dates) {
            for (ix in dates[i]) {
                for (x in dates[i][ix]) {
                    dates2.push(dates[i][ix][x])
                }
            }
        }
        console.log('Dates2')
        console.log(dates2)


        // Prepara los datos para el cronograma
        const records = secondArray.map(record => {
            const recordDates = getDatesInRange(new Date(record.fechaInicio), new Date(record.fechaFin));
            return {
                recordDates
            };
        });

        //console.log(records)

        var records2 = [];
        for (i in records) {
            for (ix in records[i]) {
                records2.push(records[i][ix])
            }
        }
        console.log('recod2')
        console.log(records2)

        console.log('Records')

        let records3 = []
        for (i in records2) {
            records3[i] = [{ titulo: d_produccion[i].titulo, descripcion:d_produccion[i].descripcion, observacion: d_produccion[i].observacion, estado: d_produccion[i].estado, fechaInicio: d_produccion[i].fechaInicio, fechaFin: d_produccion[i].fechaFin }, ...dates2];
            //console.log(records3[i])

            for (ix in records2[i]) {

                for (x in records3[i]) {
                    
                    if (records3[i][x] == records2[i][ix]) {
                        const f = { fecha: records3[i][x], seleccionado: true }
                        records3[i][x] = f
                    }
                }
            }
        }
        console.log('record')
        console.log(records3)


        const dates3 = [];
        for (let i = 0; i < dates2.length; i++) {
            const parts = dates2[i].split('-');
            const day = parts[2];
            const month = parts[1];
            const year = parts[0];
            const newDate = `${day}/${month}/${year}`;
            dates3.push(newDate);
        }

        console.log('dates3')
        console.log(dates3);


        for(i in producciones){
            producciones[i].fechaInicio = producciones[i].fechaInicio.toLocaleDateString();
            producciones[i].fechaFin = producciones[i].fechaFin.toLocaleDateString();

        }

        res.render("producciones/detallar", { dates3, dates2, records2, records3, producciones, d_produccion, d_producto, DOP });
    } catch (err) {
        res.status(500).json(err);
    }
}
*/
//End Detallar


//Crear (Función para redireccionar al hbs donde se encuentra el formulario)
function producciones_crear(req, res) {
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM users_access WHERE estado ='A' AND idRoles != 4", (err, usuarios) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                conn.query("SELECT * FROM tbl_productos WHERE estado ='A'", (err, productos) => {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        res.render("producciones/registrar", { usuarios, productos });
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
                        data.idInfoUser = 0;
                        for (index in usersA) {
                            for (i in usersI) {
                                if (data.idEncargado == usersA[index].correo && usersA[index].idAccess == usersI[i].idAccess) {
                                    data.idInfoUser = usersI[i].idInfoUser;
                                    console.log("Usuario encontrado");
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
                                        console.log("Producto encontrado");
                                    }
                                }
                                //End Capturar Producto

                                const RegistroProduccion = {
                                    idInfoUser: data.idInfoUser,
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

                                        //Captura id
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