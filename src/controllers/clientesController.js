function listar(req, res) {
    req.getConnection((err, conn) => {
        conn.query(`SELECT 
        ROW_NUMBER() OVER () AS cont,
        subconsulta.*
      FROM (
        SELECT 
          ui.idInfo, 
          ua.correo, 
          ui.documento, 
          ui.nombre, 
          ui.telefono, 
          ui.estado, 
          COUNT(DISTINCT uv.idVentas) AS numero_ventas, 
          COUNT(DISTINCT ur.idReparacion) AS numero_reparaciones 
        FROM users_access ua 
        JOIN users_info ui ON ua.idAccess = ui.idAccess 
        LEFT JOIN tbl_ventas uv ON ui.idVentas = uv.idVentas 
        LEFT JOIN tbl_reparaciones ur ON ui.idReparaciones = ur.idReparacion 
        JOIN tbl_roles r ON ua.idRoles = r.idRoles 
        WHERE r.nombreRoles = 'Cliente' 
        GROUP BY ui.idInfo, ua.correo, ui.documento, ui.nombre, ui.telefono, ui.estado
      ) AS subconsulta;
      
    `, (err, clientes) => {
            if (err) {
                res.json(err);
            }
            res.render('clientes/clientes', { clientes });
        });
    });

}

function crear(req, res) {
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM users_info", (err, clientes) => {
            if (err) {
                res.json(err);
            }
            conn.query("SELECT * FROM tbl_roles", (err, roles) => {
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
        conn.query('SELECT * FROM users_info WHERE idInfo = ?', [idInfo], (err, info) => {
            if (err) {
                res.json(err);
            }
            conn.query('SELECT documento FROM users_info WHERE idInfo = ?', [idInfo], (err, documentos) => {
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