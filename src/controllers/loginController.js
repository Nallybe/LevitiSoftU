
const nodemailer = require('nodemailer')
const jwt = require("jsonwebtoken")
const salt = 10
const bcrypt = require('bcrypt');

// function login(req, res) {
//   if (req.session.loggedin != true) {
//     res.redirect('login');
//   } else {
//     res.redirect('homeDash');
//   }
// }

function auth(req, res) {
  const data = req.body;
  console.log(data)
  req.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error en la conexión a la base de datos' });
    }

    conn.query(
      'SELECT * FROM users_access WHERE correo = ?',
      [data.correol],
      (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        }

        if (results.length > 0) {
          const user = results[0];

          bcrypt.compare(data.passswordl, user.passsword, (err, isMatch) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ error: 'Error al comparar contraseñas' });
            }

            if (isMatch) {
              req.session.loggedin = true;

              // Obtener el nombre correspondiente al correo electrónico en users_info
              conn.query(
                'SELECT nombre FROM users_info WHERE idAccess = ?',
                [user.idAccess],
                (error, infoResults) => {
                  if (error) {
                    console.log(error);
                    return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
                  }

                  if (infoResults.length > 0) {
                    req.session.name = infoResults[0].nombre;

                    // Obtener los roles correspondientes al correo electrónico en users_access
                    conn.query(
                      'SELECT r.nombreRoles FROM tbl_roles AS r JOIN users_access AS ua ON r.idRoles = ua.idRoles WHERE ua.correo = ?',
                      [data.correol],
                      (error, roleResults) => {
                        if (error) {
                          console.log(error);
                          return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
                        }
                        req.session.roles = roleResults;
                        //console.log(req.session.roles)
                        //res.redirect('/dashboard');
                        conn.query(
                          'SELECT DISTINCT p.nombrePermisos FROM tbl_roles AS r JOIN tbl_asignacion AS a ON r.idRoles = a.idRoles JOIN tbl_permisos AS p ON a.idPermisos = p.idPermisos;'
                          ,
                          (error, permissionResults) => {
                            if (error) {
                              console.log(error);
                              return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
                            }
                            const permisos = permissionResults.map((row) => row.nombrePermisos);
                            //console.log('Permisos: ',permisos)
                            req.session.asignacion = permisos;
                            //console.log(req.session.asignacion)
                            // Redireccionar al primer permiso que coincida
                            var firstMatchingPermission = permisos.find((permiso) => req.session.roles.includes(permiso));
                            if (firstMatchingPermission) {
                              res.redirect('/' + firstMatchingPermission);
                            } else {
                              // Si no hay permisos coincidentes, redireccionar a una página predeterminada
                              res.redirect('/dashboard');
                            }
                          }
                        );

                      }
                    );
                  }
                }
              );
            } else {
              res.render('login', { errorl: 'Error, contraseña incorrecta' });
              // Aquí puedes redirigir al usuario a otra página o enviar una respuesta de éxito
              // res.redirect('/dashboard');
            }
          });
        } else {
          res.render('login', { errorl: 'Error, el correo no existe' });
        }
      }
    );
  });
}




function crear(req, res) {
  if (req.session.loggedin !== true) {
    req.getConnection((err, conn) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error en la conexión a la base de datos' });
      }

      conn.query("SELECT * FROM users_access", (err, users) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        }
        res.render("login", { users });
      });
    });
  } else {
    console.log("Ni idea porque entra aqui")
  }
}


function registrar(req, res) {
  const data = req.body;
  console.log(data)
  req.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error en la conexión a la base de datos' });
    }

    conn.query(
      'SELECT * FROM users_access WHERE correo = ?',
      [data.correo],
      (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        }

        if (results.length > 0) {
          conn.query("SELECT * FROM tbl_roles", (err, roles) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
            }

            return res.render('login', { error: 'Error, el correo ya existe', roles });
          });
        } else {
          const salt = 10;
          bcrypt.hash(data.password, salt, (err, hash) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ error: 'Error en la encriptación de la contraseña' });
            }

            const registroUsuario = {
              idRoles: 15,
              correo: data.correo,
              passsword: hash,
              estado: 'A'
            };

            conn.query(
              'INSERT INTO users_access SET ?',
              registroUsuario,
              (error, result) => {
                if (error) {
                  console.log(error);
                  return res.status(500).json({ error: 'Error en la inserción en la base de datos' });
                }
                const idAccess = result.insertId; // Obtiene el idAccess generado
                const registroUsuarioInfo = {
                  idAccess: idAccess,
                  documento: data.documento,
                  nombre: data.nombre,
                  telefono: data.telefono,
                  estado: 'A'
                };
                conn.query(
                  'INSERT INTO users_info SET ?',
                  registroUsuarioInfo, (error, result) => {
                    if (error) {
                      console.log(error);
                      return res.status(500).json({ error: 'Error en la inserción en la base de datos' });
                    }
                    console.log('Información del usuario guardada');
                    req.session.loggedin = true; // Establece la sesión como iniciada

                    conn.query(
                      'SELECT r.nombreRoles FROM tbl_roles AS r JOIN users_access AS ua ON r.idRoles = ua.idRoles WHERE ua.idRoles = ?',
                      [registroUsuario.idRoles],
                      (error, roleResults) => {
                        if (error) {
                          console.log(error);
                          return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
                        }
                        console.log(req.session.roles)
                        req.session.roles = roleResults;

                    conn.query(
                      'SELECT DISTINCT p.nombrePermisos FROM tbl_roles AS r JOIN tbl_asignacion AS a ON r.idRoles = a.idRoles JOIN tbl_permisos AS p ON a.idPermisos = p.idPermisos;'
                      ,
                      (error, permissionResults) => {
                        if (error) {
                          console.log(error);
                          return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
                        }
                        const permisos = permissionResults.map((row) => row.nombrePermisos);
                        //console.log('Permisos: ', permisos)
                        req.session.asignacion = permisos;
                        //console.log(req.session.asignacion)
                        // Redireccionar al primer permiso que coincida
                        var firstMatchingPermission = permisos.find((permiso) => req.session.roles.includes(permiso));
                        if (firstMatchingPermission) {
                          res.redirect('/' + firstMatchingPermission);
                        } else {
                          // Si no hay permisos coincidentes, redireccionar a una página predeterminada
                          res.redirect('/dashboard');
                        }
                      }
                      );}
                    );
                  }
                )
              }
            );
          });

        }
      }
    );
  });
}





function logout(req, res) {
  if (req.session.loggedin == true) {
    req.session.destroy();
  }
  res.redirect('/home');
}

function olvido(req, res) {
  res.render('olvidar_contrase')
}

function recuperar(req, res) {
  const correo = req.body.correo;
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM users_access WHERE correo = ?', [correo], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error en el servidor');
      }

      if (results.length > 0) {
        const userId = results[0].idAccess;
        const token = jwt.sign({ userId: userId }, 'secretKey', { expiresIn: '10m' });

        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: 'levitisoft2021@gmail.com',
            pass: 'omqseuasqhquwqbp'
          },
        });

        const resetPasswordLink = `http://localhost:8181/restaurar_contrase?token=${token}`;

        let info = await transporter.sendMail({
          from: '"Restauracion de contraseña" <levitisoft2021@gmail.com>', // sender address
          to: correo, // list of receivers
          subject: "Hola ✔", // Subject line
          text: "Hello world?", // plain text body
          html: `<p>Hola, solicitaste un cambio de contraseña.</p><p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><a href="${resetPasswordLink}">${resetPasswordLink}</a>`, // html body
        });
        return res.status(200).json({ existe: true });
      } else {
        return res.status(200).json({ existe: false });
      }

    });
  })
}
function restablecer(req, res) {
  res.render('restaurar_contrase')
}

function restablecerContraseña(req, res) {
  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ error: 'Token no proporcionado' });
  }

  try {
    // Verificar y decodificar el token
    const decodedToken = jwt.verify(token, 'secretKey');
    const { userId } = decodedToken;
    bcrypt.hash(req.body.passsword.toString(), salt, (err, hash) => {
      if (err) return res.json({ Error: "Error for hassing password" });
      req.getConnection((err, conn) => {
        conn.query("UPDATE users_access SET passsword = ? WHERE idAccess = ?", [hash, userId], (err, result) => {
          if (err) {
            return res.status(500).json({ error: "Error al actualizar la contraseña en la base de datos" });
          }
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "El usuario no existe" });
          }
          return res.status(200).json({ Status: "Success" });

        })
      })
    })
  } catch (error) {
    return res.status(401).json({ error: error });
  }

}

function dashboard(req, res) {
  res.render("dashboard")
}

module.exports = {
  // login,
  crear,
  registrar,
  auth,
  logout,
  olvido,
  recuperar,
  restablecer,
  restablecerContraseña,
  dashboard
};
