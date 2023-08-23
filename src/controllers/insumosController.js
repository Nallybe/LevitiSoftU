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
      res.render('insumos/insumos', { insumos });
    });
    
  });
}

function crear(req, res) {
  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM tbl_insumos", (err, insumos) => {
      if (err) {
        res.json(err);
      } else {
        res.render("insumos/AgregarInsumo", { insumos });
      }
    })
  });
}

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

function actualizar(req, res) {
  const idInsumo = req.params.idInsumo;
  const data = req.body;

  console.log(data);

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





module.exports = {
  listar: listar,
  crear: crear,
  registrar: registrar,
  editar: editar,
  actualizar: actualizar,

}