
const nodemailer = require('nodemailer')
const jwt = require("jsonwebtoken")
const salt = 10
const bcrypt = require('bcrypt');
const { use } = require('../routes/login');
const { ConsoleMessage } = require('puppeteer');

function login(req, res) {
  // Verificar si el usuario ha iniciado sesión
  if (req.session.loggedin !== true) {
    // Si no ha iniciado sesión, redirigir al formulario de inicio de sesión
    res.render('login');
  } else {

  }
}




function auth(req, res) {
  const data = req.body;
  //console.log(data)
  req.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error en la conexión a la base de datos' });
    }

    conn.query(
      `SELECT * FROM users_access WHERE correo = ? AND estado = 'A'`,
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
              var sesion = true

              // Obtener el nombre correspondiente al correo electrónico en users_info
              conn.query(
                'SELECT nombre, apellido FROM users_info WHERE idAccess = ?',
                [user.idAccess],
                (error, infoResults) => {
                  if (error) {
                    console.log(error);
                    return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
                  }
                  if (infoResults.length > 0) {
                    const nombre = infoResults[0].nombre;
                    const apellido = infoResults[0].apellido;
                    req.session.name = `${nombre} ${apellido}`;


                    // Obtener los roles correspondientes al correo electrónico en users_access
                    conn.query(
                      'SELECT r.nombreRoles FROM tbl_roles AS r JOIN users_access AS ua ON r.idRoles = ua.idRoles WHERE ua.correo = ?',
                      [data.correol],
                      (error, roleResults) => {
                        if (error) {
                          console.log(error);
                          return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
                        }
                        // Extraemos la propiedad nombreRoles del primer elemento del array (en este caso solo hay un elemento)
                        const nombreRoles = roleResults[0].nombreRoles;
                        // Buscamos la posición del primer espacio en la cadena
                        const posicionSeparador = nombreRoles.indexOf(' ');
                        // Extraemos la parte de la cadena que se encuentra después del espacio
                        const nombreroles = nombreRoles.substring(posicionSeparador + 1);
                        req.session.roles = nombreroles;
                        //console.log(req.session.roles)
                        //console.log(sesion)
                        if (nombreRoles === 'Cliente') {
                          res.redirect("/home")
                        } else {
                          conn.query(
                            `SELECT DISTINCT p.nombrePermisos 
                          FROM tbl_roles AS r 
                          JOIN tbl_asignacion AS a ON r.idRoles = a.idRoles 
                          JOIN tbl_permisos AS p ON a.idPermisos = p.idPermisos 
                          WHERE r.nombreRoles = ?
                          ORDER BY p.idPermisos ASC;
                          `, [nombreroles]
                            ,
                            (error, permissionResults) => {
                              if (error) {
                                console.log(error);
                                return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
                              }
                              const permisos = permissionResults.map((row) => row.nombrePermisos);
                              //console.log('Permisos: ', permissionResults)
                              req.session.asignacion = permisos;

                              // Redireccionar al primer permiso que coincida
                              var firstMatchingPermission = permisos.find((permiso) => true);

                              //console.log("Primer " + firstMatchingPermission)
                              if (firstMatchingPermission) {
                                res.redirect('/' + firstMatchingPermission);
                              } else {
                                // Si no hay permisos coincidentes, redireccionar a una página predeterminada
                                res.redirect('/dashboard');
                              }
                            }
                          );
                        }

                      }
                    );
                  }
                }
              );
            } else {
              sesion = false
              res.render('login', { errorl: 'Error, contraseña incorrecta' });
            }
          });
        } else {
          sesion = false
          res.render('login', { errorl: 'Error, el correo no existe, o el usuario está deshabilitado' });
        }
      }
    );
  });
}
////////////////////////////

function authAPI(req, res) {
  const data = req.body;
  console.log(data)
  req.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error en la conexión a la base de datos' });
    }

    conn.query(
      `SELECT users_access.*, users_info.nombre AS nombre, users_info.apellido AS apellido FROM users_access INNER JOIN users_info ON users_access.idAccess = users_info.idAccess INNER JOIN tbl_roles ON users_access.idRoles = tbl_roles.idRoles WHERE users_access.correo = ? AND tbl_roles.nombreRoles NOT IN ('cliente', 'contador');`,
      [data.correo],
      (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        }
        console.log("resultados: ", results)
        if (results.length > 0) {
          const user = results[0];
          console.log(user)
          bcrypt.compare(data.passsword.toString(), user.passsword, (err, isMatch) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ error: 'Error al comparar contraseñas' });
            }

            if (isMatch) {
              const nombre = results[0].nombre;
              const apellido = results[0].apellido;
              nombreCompleto = `${nombre} ${apellido}`;
              req.session.loggedin = true;
              res.status(200).json({ Exito: 'Éxito', nombre: nombreCompleto });
            } else {
              res.status(401).json({ error: 'Error, contraseña incorrecta' });
            }
          });

        } else {
          res.status(404).json({ error: 'Error, el correo no existe, o no tienes permisos para acceder' });
        }
      }
    );
  });
}




// function crear(req, res) {
//   if (req.session.loggedin !== true) {
//     req.getConnection((err, conn) => {
//       if (err) {
//         console.log(err);
//         return res.status(500).json({ error: 'Error en la conexión a la base de datos' });
//       }

//       conn.query("SELECT * FROM users_access", (err, users) => {
//         if (err) {
//           console.log(err);
//           return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
//         }
//         res.render("login", { users });
//       });
//     });
//   }
// }


function registrar(req, res) {
  const data = req.body;
  //console.log(data)
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


          return res.render('login', { error: 'Error, el correo ya existe' });

        } else {
          const salt = 10;
          bcrypt.hash(data.password, salt, (err, hash) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ error: 'Error en la encriptación de la contraseña' });
            }
            conn.query("SELECT idRoles FROM tbl_roles WHERE nombreRoles='Cliente'", (err, idRoles) => {
              if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error en la consulta a la base de datos' });
              }
              const registroUsuario = {
                idRoles: idRoles[0].idRoles,
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
                  req.session.name = data.nombre
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
                          //console.log(req.session.roles)
                          req.session.roles = roleResults[0].nombreRoles;

                          if (req.session.roles === "Cliente") {
                            res.redirect("/home")
                          } else {
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
                            );
                          }

                        }
                      );
                    }
                  )
                }
              );
            });
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

function logoutApi(req, res) {
  if (req.session.loggedin === true) {
    req.session.destroy(function (err) {
      if (err) {
        res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
      } else {
        res.status(200).json({ success: true, message: 'Sesión cerrada exitosamente' });
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'No hay una sesión activa' });
  }
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
        const htmlContentSuccess = `
        <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alerta de Confirmación</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .alert {
            background-color: #ffffff;
            border: 1px solid #ccc;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .button {
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="alert">
        <p>Correo enviado correctamente</p>
        <button class="button" onclick="redirigirALogin()">Aceptar</button>
    </div>

    <script>
        function redirigirALogin() {
            // Redirigir a la página "login" después de hacer clic en "Aceptar"
            window.location.href = 'login';
        }
    </script>
</body>
</html>

      `;

        let info = await transporter.sendMail({
          from: '"Restauracion de contraseña" <levitisoft2021@gmail.com>', // sender address
          to: correo, // list of receivers
          subject: "Hola ✔", // Subject line
          text: "Hello world?", // plain text body
          html: `<p>Hola, solicitaste un cambio de contraseña.</p><p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><a href="${resetPasswordLink}">${resetPasswordLink}</a>`, // html body
        });
        return res.send(htmlContentSuccess);
      } else {
        const htmlContentError = `
        <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alerta de Confirmación</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .alert {
            background-color: #ffffff;
            border: 1px solid #ccc;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .button {
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 2px;
            cursor: pointer;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="alert">
        <p>El correo no existe, te invitamos a crear una cuenta nueva</p>
        <button class="button" onclick="redirigirALogin()">Aceptar</button>
    </div>

    <script>
        function redirigirALogin() {
            // Redirigir a la página "login" después de hacer clic en "Aceptar"
            window.location.href = 'olvidar_contrase';
        }
    </script>
</body>
</html>

      `;
        return res.send(htmlContentError);

      }

    });
  })
}

function recuperarAPI(req, res) {
  const correo = req.body.correo;
  req.getConnection((err, conn) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }

    conn.query('SELECT * FROM users_access WHERE correo = ?', [correo], async (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
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

        const resetPasswordLink = `http://localhost:8181/restaurar-contrasena?token=${token}`;

        let info = await transporter.sendMail({
          from: '"Restauracion de contraseña" <levitisoft2021@gmail.com>',
          to: correo,
          subject: "Recuperación de Contraseña",
          text: `Solicitud de recuperación de contraseña para ${correo}`,
          html: `<p>Hola, solicitaste un cambio de contraseña.</p><p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><a href="${resetPasswordLink}">${resetPasswordLink}</a>`,
        });

        return res.status(200).json({ success: true, message: 'Correo enviado correctamente' });
      } else {
        return res.status(404).json({ success: false, message: 'El correo no existe, te invitamos a crear una cuenta nueva' });
      }
    });
  });
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
    const htmlContent = `
        <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alerta de Confirmación</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .alert {
            background-color: #ffffff;
            border: 1px solid #ccc;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .button {
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="alert">
        <p>Se restableció la contraseña correctamente</p>
        <button class="button" onclick="redirigirALogin()">Aceptar</button>
    </div>

    <script>
        function redirigirALogin() {
            // Redirigir a la página "login" después de hacer clic en "Aceptar"
            window.location.href = 'login';
        }
    </script>
</body>
</html>

      `;
    // Verificar y decodificar el token
    const decodedToken = jwt.verify(token, 'secretKey');
    const { userId } = decodedToken;
    bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
      if (err) return res.json({ Error: "Error for hassing password" });
      req.getConnection((err, conn) => {
        conn.query("UPDATE users_access SET passsword = ? WHERE idAccess = ?", [hash, userId], (err, result) => {
          if (err) {
            return res.status(500).json({ error: "Error al actualizar la contraseña en la base de datos" });
          }
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "El usuario no existe" });
          }
          return res.send(htmlContent);

        })
      })
    })
  } catch (error) {
    return res.status(401).json({ error: error });
  }

}

function restablecerContraseñaAPI(req, res) {
  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ error: 'Token no proporcionado' });
  }
  try {
    // Verificar y decodificar el token
    const decodedToken = jwt.verify(token, 'secretKey');
    const { userId } = decodedToken;

    // Hash de la nueva contraseña
    bcrypt.hash(req.body.password.toString(), salt, async (err, hash) => {
      if (err) return res.status(500).json({ error: "Error al hashear la contraseña" });

      // Actualizar la contraseña en la base de datos
      try {
        const conn = await req.getConnection();
        const result = await conn.query("UPDATE users_access SET password = ? WHERE idAccess = ?", [hash, userId]);

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "El usuario no existe" });
        }

        // Respuesta exitosa en formato JSON
        res.json({ success: true, message: "Se restableció la contraseña correctamente" });
      } catch (error) {
        return res.status(500).json({ error: "Error al actualizar la contraseña en la base de datos" });
      }
    });
  } catch (error) {
    return res.status(401).json({ error: error });
  }
}

function dashboard(req, res) {
  res.render("dashboard")
}



module.exports = {
  login,
  //crear,
  registrar,
  auth,
  logout,
  logoutApi,
  olvido,
  recuperar,
  recuperarAPI,
  restablecer,
  restablecerContraseña,
  restablecerContraseñaAPI,
  dashboard,
  // dashboard_pro
  authAPI
};
