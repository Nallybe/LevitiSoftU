
function listar(req, res) {
  req.getConnection((err, conn) => {
    conn.query('SELECT tbl_roles.*, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS cont FROM tbl_roles', (err, roles) => {
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

function crearAPI(req, res) {
  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM tbl_permisos", (err, permisos) => {
      if (err) {
        res.json(err);
      } else {
        res.json({ permisos });
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
                    console.log("Asignacion guardada");

                  }

                }
              );
            });
          }
          res.redirect("/roles?alert=success");
        }

      }
    );
  });
}

function registrarApi(req, res) {
  const data = req.body;

  const RegistroRol = {
    nombreRoles: data.nombreRol,
    estado: 'A',
  };

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión: ', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }

    conn.query('INSERT INTO tbl_roles SET ?', [RegistroRol], (error, result) => {
      if (error) {
        console.error('Error al guardar el rol: ', error);
        return res.status(500).json({ error: 'Error al guardar el rol' });
      } else {
        console.log('Rol guardado');
        const idRoles = result.insertId;
        const idPermisos = data.idSeleccionado.split(','); // Convierte la cadena de entrada en un array de valores
        const estado = 'Activo';

        for (let i = 0; i < idPermisos.length; i++) {
          const RegistroAsignacion = {
            idRoles: idRoles,
            idPermisos: idPermisos[i],
            estado: estado,
          };

          conn.query('INSERT INTO tbl_asignacion SET ?', [RegistroAsignacion], (error, result) => {
            if (error) {
              console.error('Error al guardar la asignación: ', error);
            } else {
              console.log('Asignación guardada');
            }
          });
        }

        res.status(201).json({ message: 'Rol y asignaciones guardados con éxito' });
      }
    });
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

        for (index in permisos) {
          if (permisos[index].asignado == 1) {
            permisos[index].idRoles = idRoles;
          }

        }


        res.render('roles/EditarRol', { roles, permisos });
        //console.log(permisos);
      });


    });
  });
}

function editarAPI(req, res) {
  const idRoles = req.params.idRoles;

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión: ', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }

    conn.query('SELECT * FROM tbl_roles WHERE idRoles = ?', [idRoles], (err, roles) => {
      if (err) {
        console.error('Error al obtener el rol: ', err);
        return res.status(500).json({ error: 'Error al obtener el rol' });
      }

      conn.query('SELECT p.idPermisos, p.nombrePermisos, IF(a.idRoles IS NOT NULL, 1, 0) as asignado FROM tbl_permisos p LEFT JOIN tbl_asignacion a ON p.idPermisos = a.idPermisos AND a.idRoles = ?', [idRoles], (err, permisos) => {
        if (err) {
          console.error('Error al obtener los permisos: ', err);
          return res.status(500).json({ error: 'Error al obtener los permisos' });
        }

        for (let index in permisos) {
          if (permisos[index].asignado == 1) {
            permisos[index].idRoles = idRoles;
          }
        }

        const responseData = {
          roles: roles[0], // Suponiendo que solo hay un rol con ese ID
          permisos: permisos,
        };

        res.status(200).json(responseData);
      });
    });
  });
}


function actualizar(req, res) {
  const idRoles = req.params.idRoles;
  const data = req.body;
  //console.log(data);
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

function actualizarAPI(req, res) {
  const idRoles = req.params.idRoles;
  const data = req.body;
  //console.log(data);
  const roles = {
    nombreRoles: data.nombreRol,
    estado: data.estadoRol,
  };

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión: ', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }

    conn.query('UPDATE tbl_roles SET ? WHERE idRoles = ?', [roles, idRoles], (err, rows) => {
      if (err) {
        console.error('Error al actualizar los datos del rol: ', err);
        return res.status(500).json({ error: 'Error al actualizar los datos del rol' });
      } else {
        console.log('Se actualizaron los datos del rol');

        if (data.idSeleccionado) {
          const idPermisos = data.idSeleccionado.split(','); // Convierte la cadena de entrada en un array de valores
          const estado = 'Activo';

          for (let i = 0; i < idPermisos.length; i++) {
            const RegistroAsignacion = {
              idRoles: idRoles,
              idPermisos: idPermisos[i],
              estado: estado,
            };

            conn.query('INSERT INTO tbl_asignacion SET ?', [RegistroAsignacion], (error, result) => {
              if (error) {
                console.error('Error al guardar la asignación: ', error);
              } else {
                console.log('Asignación guardada');
              }
            });
          }
        }

        res.status(200).json({ message: 'Datos de rol actualizados con éxito' });
      }
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

function permisosAPI(req, res) {
  const idRoles = req.params.idRoles;

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión: ', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }

    conn.query('SELECT p.idPermisos, p.nombrePermisos, a.estado FROM tbl_roles r INNER JOIN tbl_asignacion a ON r.idRoles = a.idRoles INNER JOIN tbl_permisos p ON a.idPermisos = p.idPermisos WHERE r.idRoles = ?', [idRoles], (err, permisos) => {
      if (err) {
        console.error('Error al obtener los permisos: ', err);
        return res.status(500).json({ error: 'Error al obtener los permisos' });
      }

      res.status(200).json({ permisos });
    });
  });
}

function eliminarAsignacion(req, res) {
  const idRoles = req.body.idRoles;
  const idPermisos = req.body.idPermisos;
  //console.log(idRoles)

  req.getConnection((err, conn) => {
    conn.query('DELETE FROM tbl_asignacion WHERE idRoles = ? AND idPermisos = ?', [idRoles, idPermisos], (err, rows) => {
      if (err) {
        console.error('Error al eliminar los datos: ', err);
        return;
      } else
        console.log("Se eliminaron los datos")

      res.redirect('/EditarRol/' + idRoles);
    });
  })
}

function eliminarAsignacionAPI(req, res) {
  const idRoles = req.body.idRoles;
  const idPermisos = req.body.idPermisos;

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión: ', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }

    conn.query('DELETE FROM tbl_asignacion WHERE idRoles = ? AND idPermisos = ?', [idRoles, idPermisos], (err, rows) => {
      if (err) {
        console.error('Error al eliminar los datos: ', err);
        return res.status(500).json({ error: 'Error al eliminar los datos' });
      } else {
        console.log('Se eliminaron los datos');
        res.status(200).json({ message: 'Asignación eliminada con éxito' });
      }
    });
  });
}



module.exports = {
  listar: listar,
  listarApi: listarApi,
  crear: crear,
  crearAPI: crearAPI,
  registrar: registrar,
  registrarApi:registrarApi,
  editar: editar,
  editarAPI:editarAPI,
  actualizar: actualizar,
  actualizarAPI:actualizarAPI,
  eliminarAsignacion: eliminarAsignacion,
  eliminarAsignacionAPI:eliminarAsignacionAPI,
  permisos: permisos,
  permisosAPI:permisosAPI


}