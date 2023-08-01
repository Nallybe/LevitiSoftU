//Listar
function compras_listar(req, res) {
  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM tbl_compras WHERE estado = 'A' ORDER BY fechaRegistro DESC", (err, compras) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        conn.query("SELECT * FROM tbl_compras_detalles", (err, detallescompra) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            var cont = 1;
            for (index in compras) {
              compras[index].cont = cont;
              cont++;
              compras[index].fechaRecibo = compras[index].fechaRecibo.toLocaleDateString();
              compras[index].fechaRegistro = compras[index].fechaRegistro.toLocaleString();
              compras[index].total = 0;
              compras[index].monto = 0;
              compras[index].iva = 0;
              for (i in detallescompra) {
                if (detallescompra[i].idCompra == compras[index].idCompra) {
                  var monto = detallescompra[i].precio * detallescompra[i].cantidad;
                  var iva = (monto * detallescompra[i].porcentajeIva) / 100;
                  var total = iva + monto;
                  compras[index].monto += monto;
                  compras[index].iva += iva;
                  compras[index].total += total;
                }
              }
              compras[index].monto = "$ " + compras[index].monto.toLocaleString('es-CO');
              compras[index].iva = "$ " + compras[index].iva.toLocaleString('es-CO');
              compras[index].total = "$ " + compras[index].total.toLocaleString('es-CO');
            }

            let numC = compras.length;
            res.status(200).render("compras/listar", { compras, numC });
          }
        });
      }
    });
  });
}
//End Listar


//Listar anulaciones
function compras_listar_anulaciones(req, res) {
  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM tbl_compras_anulaciones WHERE tipoAnulacion = 'General' ", (err, anulaciones) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        for (index in anulaciones) {
          //Fecha Anulación
          let day = anulaciones[index].fechaAnulacion.getDate();
          let month = anulaciones[index].fechaAnulacion.getMonth() + 1;
          let year = anulaciones[index].fechaAnulacion.getFullYear();
          //Fecha Actual 
          let fecha_actual = new Date()
          let day_a = fecha_actual.getDate();
          let month_a = fecha_actual.getMonth() + 1;
          let year_a = fecha_actual.getFullYear();
          if (day == day_a && month_a == month && year_a == year) {
            anulaciones[index].recuperar = true;
          }
          anulaciones[index].fechaAnulacion = anulaciones[index].fechaAnulacion.toLocaleString();//.toLocaleString();
        }
        let numAC = anulaciones.length;
        res.render("compras/listar_anulaciones", { anulaciones, numAC });
      }
    });
  });
}

//Detallar 
function compras_detallar(req, res) {
  const idCompra = req.params.idCompra;
  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM tbl_compras WHERE idCompra = ?", [idCompra], (err, compra) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        for (index in compra) {
          compra[index].fechaRecibo = compra[index].fechaRecibo.toLocaleDateString();
          compra[index].fechaRegistro = compra[index].fechaRegistro.toLocaleString();
        }

        conn.query("SELECT * FROM tbl_compras_detalles WHERE idCompra = ?", [idCompra], (err, detallescompra) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            conn.query("SELECT * FROM tbl_insumos", (err, insumos) => {
              if (err) {
                return res.status(500).json(err);
              } else {
                for (index in detallescompra) {
                  detallescompra[index].nombreI;
                  detallescompra[index].medidaI;
                  detallescompra[index].cantidadI;
                  detallescompra[index].estadoI;
                  for (i in insumos) {
                    if (insumos[i].idInsumo == detallescompra[index].idInsumo) {
                      detallescompra[index].nombreI = insumos[i].nombre;
                      detallescompra[index].medidaI = insumos[i].medida;
                      detallescompra[index].cantidadI = insumos[i].stock;
                      detallescompra[index].estadoI = insumos[i].estado;
                    }
                  }
                }

                //Calcular monto y total
                for (index in compra) {
                  compra[index].total = 0;
                  compra[index].monto = 0;
                  compra[index].iva = 0;
                  cont = 1;
                  for (i in detallescompra) {
                    var monto = detallescompra[i].precio * detallescompra[i].cantidad;
                    detallescompra[i].monto = monto;

                    var iva = (monto * detallescompra[i].porcentajeIva) / 100;

                    var total = iva + monto;

                    detallescompra[i].total = "$ " + total.toLocaleString('es-CO');
                    detallescompra[i].monto = "$ " + monto.toLocaleString('es-CO');
                    detallescompra[i].iva = "$ " + iva.toLocaleString('es-CO');
                    detallescompra[i].precio = "$ " + detallescompra[i].precio.toLocaleString('es-CO');
                    detallescompra[i].porcentajeIva = detallescompra[i].porcentajeIva + "%";

                    detallescompra[i].cont = cont;

                    cont++;
                    compra[index].monto = compra[index].monto + monto;
                    compra[index].iva = compra[index].iva + iva;
                    compra[index].total = compra[index].total + total;
                  }
                  compra[index].monto = "$ " + compra[index].monto.toLocaleString('es-CO');
                  compra[index].iva = "$ " + compra[index].iva.toLocaleString('es-CO');
                  compra[index].total = "$ " + compra[index].total.toLocaleString('es-CO');
                }
                //End Calcular monto y total

                numDC = detallescompra.length
                res.render("compras/detallar", { detallescompra, compra, numDC });
              }
            });
          }
        });
      }
    });
  });
}
//End Detallar


//Crear (Función para redireccionar al hbs donde se encuentra el formulario) 
function compras_crear(req, res) {
  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM tbl_insumos WHERE estado ='A'", (err, insumos) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        conn.query("SELECT * FROM tbl_compras", (err, compras) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            const proveedoresSet = new Set();
            for (const compra of compras) {
              proveedoresSet.add(compra.proveedor);
            }
            // Convertir el conjunto de proveedores nuevamente en un array
            const proveedores = Array.from(proveedoresSet);
            //console.log(proveedores);

            // console.log(insumos);
            res.render("compras/registrar", { insumos, compras, proveedores });
          }
        });
      }
    });
  });
}
//End Crear


//Registrar Compra
function compras_registrar(req, res) {
  var data = req.body;

  const RegistroCompra = {
    proveedor: data.proveedor,
    recibo: data.recibo,
    fechaRecibo: data.fechaRecibo
  };

  //Registrar Compra
  req.getConnection((err, conn) => {
    conn.query("INSERT INTO tbl_compras SET ?", [RegistroCompra], (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        console.log("Compra Registrada");
        //End Registrar compra 

        //Captura idCompra
        const idCompra = result.insertId;

        //Reconocer si se manda 1 o más detalles
        if (data.precio[0].length > 1) {
          //Más de un detalle

          //Capturar idsInsumos
          conn.query("SELECT * FROM tbl_insumos", (err, insumos) => {
            if (err) {
              return res.status(500).json(err);
            } else {
              for (index in data.idInsumo) {
                for (i in insumos) {
                  if (data.idInsumo[index] == insumos[i].nombre) {
                    data.idInsumo[index] = insumos[i].idInsumo;
                    //console.log("Insumo encontrado")
                  }
                }
              }
              //End Capturar idsInsumos

              //Registrar Detalles
              for (index in data.idInsumo) {
                conn.query(`INSERT INTO tbl_compras_detalles(idCompra,idInsumo,precio,cantidad,porcentajeIva) VALUES (?,?,?,?,?)`,
                  [
                    idCompra,
                    data.idInsumo[index],
                    data.precio[index],
                    data.cantidad[index],
                    data.porcentajeIva[index],
                  ],
                  (err) => {
                    if (err) {
                      return res.status(500).json(err);
                    } else {
                      console.log("Detalle Registrado");
                    }
                  }
                );
              }
              //End Registrar Detalles

              //Actualizar Insumos
              for (const key in data.idInsumo) {
                conn.query(`Update tbl_insumos set stock=stock+ ? where idInsumo= ?`, [data.cantidad[key], data.idInsumo[key]],
                  (err) => {
                    if (err) {
                      return res.status(500).json(err);
                    } else {
                      console.log("Insumo Actualizado");
                    }
                  }
                );
              }
              //End Actualizar Insumos
            }
          });

        } else {
          //Un detalle

          //Capturar idInsumo
          conn.query("SELECT * FROM tbl_insumos", (err, insumos) => {
            if (err) {
              return res.status(500).json(err);
            } else {
              for (i in insumos) {
                if (data.idInsumo == insumos[i].nombre) {
                  data.idInsumo = insumos[i].idInsumo;
                  //console.log("Insumo encontrado")
                }
              }
              //End Capturar idInsumo

              //Registrar Detalle
              conn.query(`INSERT INTO tbl_compras_detalles(idCompra,idInsumo,precio,cantidad,porcentajeIva) VALUES (?,?,?,?,?)`,
                [
                  idCompra,
                  data.idInsumo,
                  data.precio,
                  data.cantidad,
                  data.porcentajeIva,
                ],
                (err) => {
                  if (err) {
                    return res.status(500).json(err);
                  } else {
                    console.log("Detalle Registrado");
                  }
                }
              );
              //End Registrar Detalle

              //Actualizar Insumos
              conn.query(`Update tbl_insumos set stock=stock+ ? where idInsumo= ?`, [data.cantidad, data.idInsumo],
                (err) => {
                  if (err) {
                    return res.status(500).json(err);
                  } else {
                    console.log("Insumo Actualizado");
                  }
                }
              );
              //End Actualizar Insumos
            }
          });
        }
        //Redireccionar
        res.redirect("/compras");
      }
    });
  });
}
//End Registrar Compra


//Anular Compra
function compras_anular(req, res) {
  const data = req.body;
  req.getConnection((err, conn) => {
    //Capturar Detalles 
    conn.query("SELECT * FROM tbl_compras_detalles WHERE idCompra=?", [data.idCompra], (err, d_compras) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        if (!d_compras) {
          console.log('Detalles no encontrados');
          res.redirect("/compras");
        }

        conn.query("SELECT * FROM tbl_insumos", (err, insumos) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            if (!insumos) {
              console.log('Detalles no encontrados');
              res.redirect("/compras");
            }

            var status = true;
            for (index in d_compras) {
              for (i in insumos) {
                if (d_compras[index].idInsumo == insumos[i].idInsumo) {
                  if (d_compras[index].cantidad > insumos[i].stock) {
                    status = false;
                  }
                }
              }
            }

            if (status == false) {
              console.log("Insumos insuficientes");
              console.log("No se puede anular la compra");
              res.redirect("/compras");
            } else {
              //Registrar Anulación
              conn.query("INSERT INTO tbl_compras_anulaciones SET ?", [data], (err, result) => {
                if (err) {
                  return res.status(500).json(err);
                } else {
                  console.log("Anulación Registrada");
                  //End Registrar Anulación 

                  for (index in d_compras) {
                    //Actualizar Insumos
                    conn.query(`Update tbl_insumos set stock=stock- ? where idInsumo= ?`, [d_compras[index].cantidad, d_compras[index].idInsumo],
                      (err) => {
                        if (err) {
                          return res.status(500).json(err);
                        } else {
                          console.log("Insumo Actualizado");
                        }
                      }
                    );
                    //End Actualizar Insumos
                  }

                  //Actualizar Compra
                  conn.query(`Update tbl_compras set estado='I' where idCompra= ?`, [data.idCompra],
                    (err) => {
                      if (err) {
                        return res.status(500).json(err);
                      } else {

                        //Actualizar Usuario
                        conn.query("SELECT * FROM tbl_compras WHERE idCompra=?", [data.idCompra], (err, compra) => {
                          if (err) {
                            return res.status(500).json(err);
                          } else {
                            console.log("Compra Anulada");
                            res.redirect("/compras");
                          }
                        });
                      }
                    }
                  );
                  //End Actualizar Compra
                }
              });
            }
          }
        });
      }
    });
  })
}
//End Anular Compra


module.exports = {
  compras_listar: compras_listar,
  compras_detallar: compras_detallar,
  compras_listar_anulaciones: compras_listar_anulaciones,
  compras_crear: compras_crear,
  compras_registrar: compras_registrar,
  compras_anular: compras_anular
};
