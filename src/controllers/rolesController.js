
function listar(req, res) {
  req.getConnection((err, conn) => {
    conn.query('SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS cont,tbl_roles.* FROM tbl_roles;', (err, roles) => {
      if (err) {
        res.json(err);
      }

       // Reemplazar los valores 'A' por 'Activo' y 'I' por 'Inactivo' en los resultados
       roles.forEach(rol => {
        rol.estado = rol.estado === 'A' ? 'Activo' : 'Inactivo';
    });
      res.render('roles/roles', { roles });
    });
  });
}

function listarApi(req, res) {
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM tbl_roles', (err, roles) => {
      if (err) {
        res.json(err);
      }
      //res.render('roles/roles', { roles });
      res.json(roles);
    });
  });
}


function crear(req, res) {
  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM tbl_permisos", (err, permisos) => {
      if (err) {
        res.json(err);
      } else {
        res.render("roles/AgregarRol", { permisos });
      }
    })
  });
}

function registrar(req, res) {
  const data = req.body;
  //console.log(data)
  const RegistroRol = {
    nombreRoles: data.nombreRol,
    estado: "A",
  };

  req.getConnection((err, conn) => {
    conn.query(
      "INSERT INTO tbl_roles SET ?",
      [RegistroRol],
      (error, result) => {
        if (error) {
          console.log(error);
          return;
        } else {
          console.log("Rol guardado");
          const idRoles = result.insertId;
          const idPermisos = data.idSeleccionado.split(','); // Convierte la cadena de entrada en un array de valores
          const estado = "Activo";
          for (let i = 0; i < idPermisos.length; i++) {
            const RegistroAsignacion = {
              idRoles: idRoles,
              idPermisos: idPermisos[i],
              estado: estado
            };
            console.log(RegistroAsignacion)
            req.getConnection((err, conn) => {

              conn.query(
                "INSERT INTO tbl_asignacion SET ?",
                [RegistroAsignacion],
                (error, result) => {
                  if (error) {
                    console.log(error);
                    return;
                  } else {
                    console.log("Asignacion guardada");
                    var mensaje = "Registro éxitoso"
                    res.redirect("/roles?alert=success");
                  }

                }
              );
            });
          }
        }

      }
    );
  });

  
}
function editar(req, res) {
  const idRoles = req.params.idRoles;

  req.getConnection((err, conn) => {
    if (err) {
      res.json(err);
    }

    conn.query('SELECT * FROM tbl_roles WHERE idRoles = ?', [idRoles], (err, roles) => {
      if (err) {
        res.json(err);
      }

      conn.query('SELECT p.idPermisos, p.nombrePermisos, IF(a.idRoles IS NOT NULL, 1, 0) as asignado FROM tbl_permisos p LEFT JOIN tbl_asignacion a ON p.idPermisos = a.idPermisos AND a.idRoles = ?', [idRoles], (err, permisos) => {
        if (err) {
          res.json(err);
        }
        
        for (index in permisos){
          if(permisos[index].asignado==1){
            permisos[index].idRoles = idRoles;
          }
          
        }
        

        res.render('roles/EditarRol', { roles, permisos });
        //console.log(permisos);
      });
      
      
    });
  });
}




function actualizar(req, res) {
  const idRoles = req.params.idRoles;
  const data = req.body;
  console.log(data);
    const roles = {
    nombreRoles: data.nombreRol,
    estado: data.estadoRol,
  }
  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión: ', err);
      return;
    }
    conn.query('UPDATE tbl_roles SET ? WHERE idRoles = ?', [roles, idRoles], (err, rows) => {
      if (err) {
        console.error('Error al actualizar los datos: ', err);
        return;
      } else {
        console.log("Se actualizaron los datos de rol")
        console.log()
        if (data.idSeleccionado) {
          
          const idPermisos = data.idSeleccionado.split(','); // Convierte la cadena de entrada en un array de valores
          const estado = "Activo";
          for (let i = 0; i < idPermisos.length; i++) {
            const RegistroAsignacion = {
              idRoles: idRoles,
              idPermisos: idPermisos[i],
              estado: estado
            };
            //console.log(RegistroAsignacion)
            req.getConnection((err, conn) => {

              conn.query(
                "INSERT INTO tbl_asignacion SET ?",
                [RegistroAsignacion],
                (error, result) => {
                  if (error) {
                    console.log(error);
                    return;
                  } else {
                    console.log("Asignación guardada");
                  }

                }
              );
            });
          }
        }


      }
      res.redirect('/roles');
    });

  }); 
}



function permisos(req, res) {
  const idRoles = req.params.idRoles;
  req.getConnection((err, conn) => {
    conn.query('SELECT p.idPermisos, p.nombrePermisos, a.estado FROM tbl_roles r INNER JOIN tbl_asignacion a ON r.idRoles = a.idRoles INNER JOIN tbl_permisos p ON a.idPermisos = p.idPermisos WHERE r.idRoles = ?', [idRoles], (err, permisos) => {
      if (err) {
        res.json(err);
      }

      res.render('roles/Permisos', { permisos });
    });
  });
}

function eliminarAsignacion(req, res) {
  const idRoles = req.body.idRoles;
  const idPermisos = req.body.idPermisos;
  console.log(idRoles)
  
    req.getConnection((err, conn) => {
      conn.query('DELETE FROM tbl_asignacion WHERE idRoles = ? AND idPermisos = ?', [idRoles, idPermisos], (err, rows) => {
        if (err) {
            console.error('Error al eliminar los datos: ', err);
            return;
          }else
          console.log("Se eliminaron los datos")
          
          res.redirect('/EditarRol/' + idRoles);
      });
    })
} 



module.exports = {
  listar: listar,
  listarApi: listarApi,
  crear: crear,
  registrar: registrar,
  editar: editar,
  actualizar: actualizar,
  eliminarAsignacion: eliminarAsignacion,
  permisos: permisos,


}