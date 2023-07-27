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
            var cont = 1;
            for (index in usuarios) {
              usuarios[index].cont = cont;
              usuarios[index].nombreRol;
              for (i in roles) {
                if (usuarios[index].idRoles == roles[i].idRoles) {
                  usuarios[index].nombreRol = roles[i].nombreRoles;
                }
              }

              if (usuarios[index].estado == 'A') {
                usuarios[index].estado1 = true;
              } else {
                usuarios[index].estado2 = true;
              }

              cont += 1;
            }

            conn.query('SELECT * FROM users_info', (err, info) => {
              if (err) {
                return res.status(500).json(err);
              } else {
                for (index in usuarios) {
                  usuarios[index].documento;
                  usuarios[index].nombre;
                  usuarios[index].telefono;

                  for (i in info) {
                    if (usuarios[index].idAccess == info[i].idAccess) {
                      usuarios[index].documento = info[i].documento;
                      usuarios[index].nombre = info[i].nombre;
                      usuarios[index].telefono = info[i].telefono;

                    }

                  }
                }
                res.render('usuarios/listar', { usuarios });
              }
            });
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
        conn.query(`SELECT * FROM tbl_roles WHERE estado = 'Activo'`, (err, roles) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            conn.query(`SELECT * FROM users_info`, (err, info) => {
              if (err) {
                return res.status(500).json(err);
              } else {
                //Seleccionar cliente
                for (i in roles) {
                  if (roles[i].nombreRoles == 'Usuario') {
                    roles[i].seleccionado = true
                  }
                }
                //End seleccionar cliente
                res.render('usuarios/registrar', { usuarios, roles, info });

              }
            });
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

  //Registrar Usuario 
  req.getConnection((err, conn) => {
    conn.query("INSERT INTO users_access SET ?", [RegistroAccess], (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        //console.log("Usuario Registrado");

        //Captura idAccess
        const idAccess = result.insertId;

        let RegistroInfo = {
          idAccess: idAccess,
          documento: data.documento,
          nombre: data.nombre,
          telefono: data.telefono,
        }

        conn.query("INSERT INTO users_info SET ?", [RegistroInfo], (err, result2) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            console.log("Usuario Registrado");
            //End Usuario 
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
            conn.query('SELECT * FROM users_info WHERE idAccess != ?', [idAccess], (err, infos) => {
              if (err) {
                return res.status(500).json(err);
              } else {
                conn.query('SELECT * FROM users_info WHERE idAccess = ?', [idAccess], (err, info) => {
                  if (err) {
                    return res.status(500).json(err);
                  } else {
                    conn.query('SELECT * FROM tbl_roles WHERE estado = "Activo"', (err, roles) => {
                      if (err) {
                        return res.status(500).json(err);
                      } else {

                        for (index in usuario) {
                          for (i in roles) {
                            if (usuario[index].idRoles == roles[i].idRoles) {
                              usuario[index].idRoles = roles[i].nombreRoles;
                              roles[i].seleccionado = true;
                            }
                          }

                          if (usuario[index].estado == 'A') {
                            usuario[index].estado1 = true;
                          } else {
                            usuario[index].estado2 = true;
                          }
                        }

                        res.render('usuarios/editar', { usuarios, usuario, infos, info, roles });
                      }
                    });
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


function usuarios_modificar(req, res) {
  const idAccess = req.params.idAccess;
  const data = req.body;

  let RegistroAccess = {
    idRoles: data.idRol,
    correo: data.correo,
    passsword: data.password,
    estado: data.estado
  };

  let RegistroInfo = {
    nombre: data.nombre,
    documento: data.documento,
    telefono: data.telefono
  };

  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM tbl_roles", (err, roles) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        conn.query('UPDATE users_access SET ? WHERE idAccess = ?', [RegistroAccess, idAccess], (err, Access) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            conn.query('UPDATE users_info SET ? WHERE idAccess = ?', [RegistroInfo, idAccess], (err, Info) => {
              if (err) {
                return res.status(500).json(err);
              } else {
                console.log('Usuario Actualizado');
                res.redirect('/usuarios');
              }
            })
          }
        });
      }
    });
  });
}
/*
//Cambiar Estado Usuario
function usuarios_estado(req, res) {
  const idAccess = req.params.idAccess;
  req.getConnection((err, conn) => {
    conn.query(`SELECT * FROM tbl_users_access WHERE idAccess= ?`, [idAccess], (err, usuario) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        for (i in usuario) {
          if (usuario[i].estado == 'A') {
            var estado = {
              estado: 'I'
            }
            conn.query(`Update tbl_users_access SET ?  WHERE idAccess= ?`, [estado, idAccess],
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
            conn.query(`Update tbl_users_access SET ?  WHERE idAccess= ?`, [estado, idAccess],
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
*/

module.exports = {
  usuarios_listar: usuarios_listar,
  usuarios_crear: usuarios_crear,
  usuarios_registrar: usuarios_registrar,
  usuarios_editar: usuarios_editar,
  usuarios_modificar: usuarios_modificar,
  /*usuarios_estado: usuarios_estado*/
}