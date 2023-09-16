function listar(req, res) {
  req.getConnection((err, conn) => {
    conn.query('SELECT ROW_NUMBER() OVER (ORDER BY stock ASC) AS cont, tbl_insumos. * FROM tbl_insumos;', (err, insumos) => {
      if (err) {
        res.json(err);
      }
      // Reemplazar los valores 'A' por 'Activo' y 'I' por 'Inactivo' en los resultados
      insumos.forEach(insumo => {
        insumo.estado = insumo.estado === 'A' ? 'Activo' : 'Inactivo';
      });

     /* var ins;
      if(req.params.ins){
        ins = req.params.ins;
      }*/

      res.render('insumos/insumos', { insumos });
    });

  });
}

function listarAPI(req, res) {
  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión: ', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }

    conn.query('SELECT ROW_NUMBER() OVER (ORDER BY stock ASC) AS cont, tbl_insumos.* FROM tbl_insumos;', (err, insumos) => {
      if (err) {
        console.error('Error al obtener los insumos: ', err);
        return res.status(500).json({ error: 'Error al obtener los insumos' });
      }
      //console.log("Insumos: ",insumos)
      // Reemplazar los valores 'A' por 'Activo' y 'I' por 'Inactivo' en los resultados
      insumos.forEach(insumo => {
        insumo.estado = insumo.estado === 'A' ? 'Activo' : 'Inactivo';
      });

      res.json({ insumos });
    });
  });
}

// function crear(req, res) {
//   req.getConnection((err, conn) => {
//     conn.query("SELECT * FROM tbl_insumos", (err, insumos) => {
//       if (err) {
//         res.json(err);
//       } else {
//         res.render("insumos/AgregarInsumo", { insumos });
//       }
//     })
//   });
// }

// function crearAPI(req, res) {
//   req.getConnection((err, conn) => {
//     if (err) {
//       console.error('Error de conexión: ', err);
//       return res.status(500).json({ error: 'Error de conexión' });
//     }

//     conn.query('SELECT * FROM tbl_insumos', (err, insumos) => {
//       if (err) {
//         console.error('Error al obtener los insumos: ', err);
//         return res.status(500).json({ error: 'Error al obtener los insumos' });
//       }

//       res.status(200).json({ insumos });
//     });
//   });
// }

function registrar(req, res) {
  const data = req.body;
  //console.log(data)
  const RegistroInsumo = {
    nombre: data.nombreInsumo,
    medida: data.medidaInsumo,
    stock: data.stockInsumo,
    estado: 'A',
  };
  req.getConnection((err, conn) => {
    conn.query(
      "INSERT INTO tbl_insumos SET ?",
      [RegistroInsumo],
      (error, result) => {
        if (error) {
          console.log(error);
          return;
        } else {
          console.log("Insumo guardado");
        }
        res.redirect("/insumos");
      }
    );
  });
}

function registrarAPI(req, res) {
  const data = req.body;
  const RegistroInsumo = {
    nombre: data.nombreInsumo,
    medida: data.medidaInsumo,
    stock: data.stockInsumo,
    estado: 'A',
  };

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión: ', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }

    conn.query('INSERT INTO tbl_insumos SET ?', [RegistroInsumo], (error, result) => {
      if (error) {
        console.error('Error al guardar el insumo: ', error);
        return res.status(500).json({ error: 'Error al guardar el insumo' });
      } else {
        console.log("Insumo guardado");
        res.status(201).json({ message: 'Insumo guardado con éxito' });
      }
    });
  });
}

function editar(req, res) {
  const idInsumo = req.params.idInsumo;

  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM tbl_insumos WHERE idInsumo = ?', [idInsumo], (err, insumos) => {
      if (err) {
        res.json(err);
      }
      res.render('insumos/EditarInsumo', { insumos });
    });
  });
}

function editarAPI(req, res) {
  const idInsumo = req.params.idInsumo;
  
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM tbl_insumos WHERE idInsumo = ?', [idInsumo], (err, insumos) => {
      if (err) {
        res.json(err);
      }
      console.log("Insumos respuesta: ", insumos)
      res.status(200).json({ insumos });
    });
  });
}

function actualizar(req, res) {
  const idInsumo = req.params.idInsumo;
  const data = req.body;

  //console.log(data);

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión: ', err);
      return;
    }
    conn.query(
      'UPDATE tbl_insumos SET ? WHERE idInsumo = ?',
      [data, idInsumo],
      (err, rows) => {
        if (err) {
          console.error('Error al actualizar los datos: ', err);
          return;
        }
        res.redirect("/insumos");

      }
    );
  });
}

function actualizarAPI(req, res) {
  const idInsumo = req.params.idInsumo;
  const data = req.body;
  //console.log("data: ", data)
  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión: ', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }

    conn.query('UPDATE tbl_insumos SET ? WHERE idInsumo = ?', [data, idInsumo], (err, rows) => {
      if (err) {
        console.error('Error al actualizar los datos: ', err);
        return res.status(500).json({ error: 'Error al actualizar los datos' });
      }

      res.status(200).json({ message: 'Datos actualizados con éxito' });
    });
  });
}




module.exports = {
  listar: listar,
  listarAPI:listarAPI,
  // crear: crear,
  // crearAPI:crearAPI,
  registrar: registrar,
  registrarAPI:registrarAPI,
  editar: editar,
  editarAPI:editarAPI,
  actualizar: actualizar,
  actualizarAPI:actualizarAPI
}