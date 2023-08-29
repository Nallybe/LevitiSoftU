const nodemailer = require('nodemailer')
const jwt = require("jsonwebtoken")
//const salt = 10
const bcrypt = require('bcrypt');

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
            conn.query('SELECT * FROM users_info', async (err, info) => {
              if (err) {
                return res.status(500).json(err);
              } else {
                for (index in usuarios) {
                  usuarios[index].documento;
                  usuarios[index].nombre;
                  usuarios[index].telefono;
                  usuarios[index].idInfo;

                  for (i in info) {
                    if (usuarios[index].idAccess == info[i].idAccess) {
                      usuarios[index].documento = info[i].documento;
                      usuarios[index].nombre = info[i].nombre;
                      usuarios[index].telefono = info[i].telefono;
                      usuarios[index].idInfo = info[i].idInfo;
                    }
                  }
                }



                //Determinar si el usuario se puede eliminar
                const ventas = await new Promise((resolve, reject) => {
                  conn.query("SELECT * FROM tbl_ventas", (err, result) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(result);
                    }
                  });
                });
                const reparaciones = await new Promise((resolve, reject) => {
                  conn.query("SELECT * FROM tbl_reparaciones", (err, result) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(result);
                    }
                  });
                });

                const ordenes = await new Promise((resolve, reject) => {
                  conn.query("SELECT * FROM tbl_ordenes_produccion", (err, result) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(result);
                    }
                  });
                });

                const ordenes_p = await new Promise((resolve, reject) => {
                  conn.query("SELECT * FROM tbl_ordenes_produccion_detalles_participes", (err, result) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(result);
                    }
                  });
                });


                for (index in usuarios) {
                  var eliminar = true;

                  for (i1 in ventas) {
                    if (usuarios[index].idInfo == ventas[i1].idInfo) {
                      eliminar = false;
                    }
                  }

                  for (i2 in reparaciones) {
                    if (usuarios[index].idInfo == reparaciones[i2].idInfo) {
                      eliminar = false;
                    }
                  }

                  for (i3 in ordenes) {
                    if (usuarios[index].idInfo == ordenes[i3].idInfo) {
                      eliminar = false;
                    }
                  }

                  for (i4 in ordenes_p) {
                    if (usuarios[index].idInfo == ordenes_p[i4].idInfo) {
                      eliminar = false;
                    }
                  }

                  if (eliminar == true) {
                    usuarios[index].eliminar = true;
                  }

                }

                console.log(usuarios)

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
        conn.query(`SELECT * FROM tbl_roles WHERE estado = 'A'`, (err, roles) => {
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


  //Registrar Usuario 
  req.getConnection((err, conn) => {

    const salt = 10;
    bcrypt.hash(data.password, salt, (err, hash) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error en la encriptación de la contraseña' });
      }

      let RegistroAccess = {
        idRoles: data.idRol,
        correo: data.correo,
        passsword: hash
      };

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
                    conn.query('SELECT * FROM tbl_roles WHERE estado = "A"', (err, roles) => {
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

module.exports = {
  usuarios_listar: usuarios_listar,
  usuarios_crear: usuarios_crear,
  usuarios_registrar: usuarios_registrar,
  usuarios_editar: usuarios_editar,
  usuarios_modificar: usuarios_modificar
}