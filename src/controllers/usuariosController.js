function usuarios_listar(req, res) {
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM users_access ORDER BY idRoles', (err, usuarios) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        conn.query('SELECT * FROM tbl_roles', (err, roles) => {
          if (err) {
            return res.status(500).json(err);
          } else {

            for (index in usuarios) {
              usuarios[index].nombreRol;
              usuarios[index].estadoRol;
              for (i in roles) {
                if (usuarios[index].idRoles == roles[i].idRoles) {
                  usuarios[index].nombreRol = roles[i].nombreRoles;
                  usuarios[index].estadoRol = roles[i].estado;
                }
              }

              if (usuarios[index].estado == 'A') {
                usuarios[index].estado1 = true;
              } else {
                usuarios[index].estado2 = true;
              }
            }

            let numU = usuarios.length;

            res.render('usuarios/listar', { usuarios, numU });
          }
        });
      }
    });
  });
}

//Función para redireccionar al hbs donde se encuentra el formulario
function usuarios_crear(req, res) {
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM users_access', (err, usuarios) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        conn.query(`SELECT * FROM tbl_roles WHERE estado = 'A'`, (err, roles) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            res.render('usuarios/registrar', { usuarios, roles });
          }
        });
      }

    });
  });
}

function usuarios_registrar(req, res) {
  const data = req.body;

  let RegistroAccess = {
    idRoles: data.idRol,
    correo: data.correo,
    passsword: data.password
  };

  //Registrar Usuario (Acceso)
  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM tbl_roles", (err, roles) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        for (index in roles) {
          if (roles[index].nombreRoles == RegistroAccess.idRoles) {
            RegistroAccess.idRoles = roles[index].idRoles;
          }
        }

        conn.query("INSERT INTO users_access SET ?", [RegistroAccess], (err, resultA) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            console.log("Usuario(Acceso) Registrado");
            //End Usuario (Acceso) 

            res.redirect('/usuarios');
          }
        });
      }
    });
  });
}


function usuarios_editar(req, res) {
  const idAccess = req.params.idAccess;

  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM users_access WHERE idAccess != ?', [idAccess], (err, usuarios) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        conn.query('SELECT * FROM users_access WHERE idAccess = ?', [idAccess], (err, usuario) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            conn.query('SELECT * FROM tbl_roles', [idAccess], (err, roles) => {
              if (err) {
                return res.status(500).json(err);
              } else {

                for (index in usuario) {
                  for (i in roles) {
                    if(usuario[index].idRoles == roles[i].idRoles){
                      usuario[index].idRoles = roles[i].nombreRoles;
                    }

                  }
                }




                res.render('usuarios/editar', { usuarios, usuario, roles });
              }
            });
          }
        });
      }
    });
  });
}


function usuarios_modificar(req, res) {
  const idAccess = req.params.idAccess;
  const data = req.body;

  let RegistroAccess = {
    idRoles: data.idRol,
    correo: data.correo,
    passsword: data.password
  };

  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM tbl_roles", (err, roles) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        for (index in roles) {
          if (roles[index].nombreRoles == RegistroAccess.idRoles) {
            RegistroAccess.idRoles = roles[index].idRoles;
          }
        }

        conn.query('UPDATE users_access SET ? WHERE idAccess = ?', [RegistroAccess, idAccess], (err, Access) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            console.log('Usuario(Acceso) Actualizado');
            res.redirect('/usuarios');
          }
        });
      }
    });

  });
}


/*function usuarios_eliminar(req, res) {
  const idAccess = req.body.idAccess;
  req.getConnection((err, conn) => {
    conn.query('DELETE FROM tbl_users_access WHERE idAccess = ?', [idAccess], (err, access) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        console.log('Usuario(Acceso) Eliminado');
        res.redirect('/usuarios');
      }
    });
  })
}*/



//Cambiar Estado Usuario
function usuarios_estado(req, res) {
  const idAccess = req.params.idAccess;
  req.getConnection((err, conn) => {
    conn.query(`SELECT * FROM users_access WHERE idAccess= ?`, [idAccess], (err, usuario) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        for (i in usuario) {
          if (usuario[i].estado == 'A') {
            var estado = {
              estado: 'I'
            }
            conn.query(`Update users_access SET ?  WHERE idAccess= ?`, [estado, idAccess],
              (err) => {
                if (err) {
                  return res.status(500).json(err);
                } else {
                  console.log("Estado Usuario(Acceso) Actualizado");
                }
              });
          } else {
            var estado = {
              estado: 'A'
            }
            conn.query(`Update users_access SET ?  WHERE idAccess= ?`, [estado, idAccess],
              (err) => {
                if (err) {
                  return res.status(500).json(err);
                } else {
                  console.log("Estado Usuario(Acceso) Actualizado");
                }
              });
          }
        }
      }
      res.redirect("/usuarios");
    });
  });
}


module.exports = {
  usuarios_listar: usuarios_listar,
  usuarios_crear: usuarios_crear,
  usuarios_registrar: usuarios_registrar,
  usuarios_editar: usuarios_editar,
  usuarios_modificar: usuarios_modificar,
  /*usuarios_eliminar: usuarios_eliminar,*/
  usuarios_estado: usuarios_estado
}