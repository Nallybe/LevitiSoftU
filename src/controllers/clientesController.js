function listar(req, res) {
    req.getConnection((err, conn) => {
        conn.query(`
        SELECT 
        ROW_NUMBER() OVER () AS cont,
        ui.idInfo,
        ua.correo,
        ui.documento,
        ui.nombre,
        ui.telefono,
        ui.estado,
        COALESCE(ventas.numero_ventas, 0) AS numero_ventas,
        COALESCE(reparaciones.numero_reparaciones, 0) AS numero_reparaciones
    FROM
        users_info ui
    JOIN
        users_access ua ON ui.idAccess = ua.idAccess
    JOIN
        tbl_roles r ON ua.idRoles = r.idRoles
    LEFT JOIN (
        SELECT
            ui.idInfo,
            COUNT(uv.idVentas) AS numero_ventas
        FROM
            users_info ui
        LEFT JOIN
            tbl_ventas uv ON ui.idInfo = uv.idInfo
        GROUP BY
            ui.idInfo
    ) ventas ON ui.idInfo = ventas.idInfo
    LEFT JOIN (
        SELECT
            ui.idInfo,
            COUNT(ur.idReparacion) AS numero_reparaciones
        FROM
            users_info ui
        LEFT JOIN
            tbl_reparaciones ur ON ui.idInfo = ur.idInfo
        GROUP BY
            ui.idInfo
    ) reparaciones ON ui.idInfo = reparaciones.idInfo
    WHERE
        r.nombreRoles = 'Cliente';
    
        `, (err, clientes) => {
            if (err) {
                res.json(err);
            }

            // Reemplazar los valores 'A' por 'Activo' y 'I' por 'Inactivo' en los resultados
            clientes.forEach(cliente => {
                cliente.estado = cliente.estado === 'A' ? 'Activo' : 'Inactivo';
            });



            res.render('clientes/clientes', { clientes });
        });
    });
}





function crear(req, res) {
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM users_info WHERE estado = 'A'", (err, clientes) => {
            if (err) {
                res.json(err);
            }
            conn.query("SELECT * FROM tbl_roles WHERE estado = 'A'", (err, roles) => {
                if (err) {
                    res.json(err);
                }
                res.render("usuarios/registrar", { clientes, roles });
            })

        })

    });
}

function registrar(req, res) {
    const data = req.body;
    console.log(data)
    const RegistroUser = {
        documento: data.documento,
        nombre: data.nombre,
        telefono: data.telefono,
        estado: data.estado,
    };
    console.log(RegistroUser)

    req.getConnection((err, conn) => {
        conn.query(
            "INSERT INTO users_info SET ?",
            [RegistroUser],
            (error, result) => {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    console.log("Información del usuario guardado");
                }
                res.redirect("/clientes");
            }
        );
    });
}

function editar(req, res) {
    const idInfo = req.params.idInfo;

    req.getConnection((err, conn) => {
        conn.query(`SELECT * FROM users_info WHERE idInfo = ?`, [idInfo], (err, info) => {
            if (err) {
                res.json(err);
            }
            conn.query(`SELECT documento FROM users_info WHERE idInfo = ?`, [idInfo], (err, documentos) => {
                if (err) {
                    res.json(err);
                }
                res.render("clientes/clientes_editar", { info, documentos });
            })

        });
    });
}

function actualizar(req, res) {
    const idInfo = req.params.idInfo;
    const data = req.body;
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error de conexión: ', err);
            return;
        }
        conn.query('UPDATE users_info SET ? WHERE idInfo = ?', [data, idInfo], (err, rows) => {
            if (err) {
                console.error('Error al actualizar los datos: ', err);
                return;
            } else
                console.log("Se actualizaron los datos")

            res.redirect('/clientes');
        });
    });
}

module.exports = {
    listar: listar,
    crear: crear,
    registrar: registrar,
    editar: editar,
    actualizar: actualizar
}