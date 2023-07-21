//Listar Con Registrador 
/*function compras_listar(req, res) {
  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM tbl_compras WHERE estado = 'A' ", (err, compras) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        conn.query("SELECT * FROM tbl_compras_detalles", (err, detallescompra) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            for (index in compras) {
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
            conn.query("SELECT * FROM tbl_users_access", (err, usersA) => {
              if (err) {
                return res.status(500).json(err);
              } else {
                conn.query("SELECT * FROM tbl_users_info", (err, usersI) => {
                  if (err) {
                    return res.status(500).json(err);
                  } else {
                    for (index in compras) {
                      compras[index].userName;
                      compras[index].userTell;
                      compras[index].userNumC;
                      compras[index].userEmail;
                      for (iA in usersA) {
                        for (iI in usersI) {
                          if (usersI[iI].idInfoUser == compras[index].idInfoUser && usersI[iI].idAccess == usersA[iA].idAccess) {
                            compras[index].userName = usersI[iI].nombre;
                            compras[index].userTell = usersI[iI].telefono;
                            compras[index].userNumC = usersI[iI].numCompras;
                            compras[index].userEmail = usersA[iA].correo;
                          }
                        }
                      }
                    }
                    let numC = compras.length;
                    res.status(200).render("compras/listar", { compras, numC });
                  }
                });
              }
            });
          }
        });
      }
    });
  });
}*/
//End Listar

//Listar Sin Registrador 
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
            var cont=1;
            for (index in compras) {
              compras[index].cont = cont;
              cont ++;
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



//Detallar _Con Registrador
/*function compras_detallar(req, res) {
  const idCompra = req.params.idCompra;
  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM tbl_compras WHERE idCompra = ?", [idCompra], (err, compra) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        conn.query("SELECT * FROM tbl_users_access", (err, usersA) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            conn.query("SELECT * FROM tbl_users_info", (err, usersI) => {
              if (err) {
                return res.status(500).json(err);
              } else {
                for (index in compra) {
                  compra[index].fechaRecibo = compra[index].fechaRecibo.toLocaleDateString();
                  compra[index].fechaRegistro = compra[index].fechaRegistro.toLocaleString();
                  compra[index].userName;
                  compra[index].userTell;
                  compra[index].userNumC;
                  compra[index].userEmail;
                  for (iA in usersA) {
                    for (iI in usersI) {
                      if (usersI[iI].idInfoUser == compra[index].idInfoUser && usersI[iI].idAccess == usersA[iA].idAccess) {
                        compra[index].userName = usersI[iI].nombre;
                        compra[index].userTell = usersI[iI].telefono;
                        compra[index].userNumC = usersI[iI].numCompras;
                        compra[index].userEmail = usersA[iA].correo;
                      }
                    }
                  }
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
                              detallescompra[index].cantidadI = insumos[i].cantidad;
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
          }
        });
      }
    });
  });
}*/
//End Detallar

//Detallar _Sin Registrador
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
                      detallescompra[index].nombreI = insumos[i].nombreInsumo;
                      detallescompra[index].medidaI = insumos[i].medida;
                      detallescompra[index].cantidadI = insumos[i].stockInsumo;
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
//Con Registrador
/*function compras_crear(req, res) {
  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM tbl_insumos WHERE estado ='A'", (err, insumos) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        conn.query("SELECT * FROM tbl_users_access WHERE estado ='A' AND idRol != 4", (err, usuarios) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            conn.query("SELECT * FROM tbl_compras", (err, compras) => {
              if (err) {
                return res.status(500).json(err);
              } else {
                // console.log(insumos);
                res.render("compras/registrar", { insumos, usuarios, compras });
              }
            });
          }
        });
      }
    });
  });
}*/

//SinRegistrador
function compras_crear(req, res) {
  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM tbl_insumos WHERE estado ='Disponible'", (err, insumos) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        conn.query("SELECT * FROM tbl_compras", (err, compras) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            // console.log(insumos);
            res.render("compras/registrar", { insumos, compras });
          }
        });
      }
    });
  });
}

//End Crear



//Registrar Compra
//Con Registrador
/*function compras_registrar(req, res) {
  var data = req.body;
  //Capturar y actualización Usuario
  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM tbl_users_access", (err, usersA) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        conn.query("SELECT * FROM tbl_users_info", (err, usersI) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            for (iI in usersI) {
              for (iA in usersA) {
                if (data.idInfoUser == usersA[iA].correo && usersI[iI].idAccess == usersA[iA].idAccess) {
                  data.idInfoUser = usersI[iI].idInfoUser;
                  //console.log("Usuario encontrado");
                }
              }
            }
            /*
            conn.query(`Update tbl_users_info set numCompras=numCompras+1 where idInfoUser= ?`, [data.idInfoUser],
              (err) => {
                if (err) {
                  return res.status(500).json(err);
                } else {
                  console.log("Usuario Actualizado +1Compra");
                }
              }
            );
            */
//End Captura y actualización Usuario
/*
            const RegistroCompra = {
              idInfoUser: data.idInfoUser,
              proveedor: data.proveedor,
              recibo: data.recibo,
              fechaRecibo: data.fechaRecibo
            };

            //Registrar Compra
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
                        conn.query(`Update tbl_insumos set cantidad=cantidad+ ? where idInsumo= ?`, [data.cantidad[key], data.idInsumo[key]],
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
                      conn.query(`Update tbl_insumos set cantidad=cantidad+ ? where idInsumo= ?`, [data.cantidad, data.idInsumo],
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
          }
        });
      }
    });
  });
}
*/

//Sin Registrador
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
                conn.query(`Update tbl_insumos set cantidad=cantidad+ ? where idInsumo= ?`, [data.cantidad[key], data.idInsumo[key]],
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
              conn.query(`Update tbl_insumos set cantidad=cantidad+ ? where idInsumo= ?`, [data.cantidad, data.idInsumo],
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
  //Registrar Anulación
  req.getConnection((err, conn) => {
    conn.query("INSERT INTO tbl_compras_anulaciones SET ?", [data], (err, result) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        console.log("Anulación Registrada");
        //End Registrar Anulación 

        //Capturar Detalles 
        conn.query("SELECT * FROM tbl_compras_detalles WHERE idCompra=?", [data.idCompra], (err, d_compras) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            for (index in d_compras) {
              //Actualizar Insumos
              conn.query(`Update tbl_insumos set cantidad=cantidad- ? where idInsumo= ?`, [d_compras[index].cantidad, d_compras[index].idInsumo],
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
    });
  });
}
//End Anular Compra


//Restaurar
function compras_restaurar(req, res) {
  const idCompra = req.body.idCompra;
  //Anulación General

  //Registrar Anulación
  req.getConnection((err, conn) => {
    conn.query("DELETE FROM tbl_compras_anulaciones WHERE idCompra = ?", [idCompra], (err, anulacion) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        console.log("Anulación Cancelada");
        //End Registrar Anulación 

        //Capturar Detalles 
        conn.query("SELECT * FROM tbl_compras_detalles WHERE idCompra=?", [idCompra], (err, d_compras) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            for (index in d_compras) {
              //Actualizar Insumos
              conn.query(`Update tbl_insumos set cantidad=cantidad+ ? where idInsumo= ?`, [d_compras[index].cantidad, d_compras[index].idInsumo],
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
            conn.query(`Update tbl_compras set estado='A' where idCompra= ?`, [idCompra],
              (err) => {
                if (err) {
                  return res.status(500).json(err);
                } else {
                  console.log("Compra Restaurada");
                  res.redirect("/compras");
                }
              });
          }
        });
      }
    });
  });
}
//End Restaurar


//Eliminar
function compras_eliminar(req, res) {
  const data = req.body;
  idCompra = req.body.idCompra;
  //Eliminar compra
  req.getConnection((err, conn) => {
    conn.query("DELETE FROM tbl_compras_detalles WHERE idCompra = ?", [idCompra], (err, detallescompra) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        console.log("Detalles Eliminados");

        conn.query("DELETE FROM tbl_compras_anulaciones WHERE idCompra = ?", [idCompra], (err, anulacion) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            console.log("Anulación Eliminada");

            conn.query("DELETE FROM tbl_compras WHERE idCompra = ?", [idCompra], (err, compra) => {
              if (err) {
                return res.status(500).json(err);
              } else {
                console.log("Compra Eliminada");
                res.redirect("/compras_anulaciones");
              }
            });
          }
        });
      }
    });
  });
}
//End Eliminar



//Falta anular compra parsial solo cierta cantidad de los insumos

module.exports = {
  compras_listar: compras_listar,
  compras_detallar: compras_detallar,
  compras_listar_anulaciones: compras_listar_anulaciones,
  compras_crear: compras_crear,
  compras_registrar: compras_registrar,
  compras_anular: compras_anular,
  compras_eliminar: compras_eliminar,
  compras_restaurar: compras_restaurar,
};
