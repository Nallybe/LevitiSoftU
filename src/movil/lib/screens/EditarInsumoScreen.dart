import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:movil/screens/inicio_screen.dart';
import 'package:snack/snack.dart';
import 'package:movil/screens/InsumosScreen.dart';

class EditarInsumoScreen extends StatefulWidget {
  const EditarInsumoScreen(
      {super.key, required this.nombreUsuario, required this.insumosData});
  static String id = 'EditarInsumoScreen';
  final String nombreUsuario;
  final List<dynamic> insumosData;
  @override
  _EditarInsumoScreenState createState() => _EditarInsumoScreenState();
}

@override
Future<void> _showExitConfirmationDialog(BuildContext context) async {
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        title: Text('¿Desea salir?'),
        content: Text('¿Está seguro de que desea salir?'),
        actions: <Widget>[
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(false); // Cancelar
            },
            child: Text('Cancelar'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(true); // Aceptar
            },
            child: Text('Aceptar'),
          ),
        ],
      );
    },
  );

  if (confirmed == true) {
    Navigator.pop(context); // Cierra la pantalla actual
  }
}

Future<void> actualizarInsumo(
  int idInsumo,
  String nombre,
  String medida,
  String stock,
  BuildContext context,
  String nombreUsuario,
) async {
  try {
    final response = await http.post(
      Uri.parse('http://10.0.2.2:8181/EditarInsumoAPI/$idInsumo'),
      body: {
        'nombre': nombre,
        'medida': medida,
        'stock': stock,
      },
    );

    if (response.statusCode == 200) {
      // Éxito: Mostrar la alerta de éxito
      mostrarNotificacion(context);

      // Recargar la página después de un breve retraso
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (context) {
            // Navega a InicioScreen
            return InicioScreen(nombreUsuario: nombreUsuario);
          },
        ),
      ).then((_) {
        // Después de que se complete la navegación a InicioScreen,
        // selecciona InsumosScreen dentro de InicioScreen
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (context) {
              return InsumosScreen(nombreUsuario: nombreUsuario);
            },
          ),
        );
      });
    } else {
      // Error en la solicitud HTTP
      print('Error al actualizar el insumo: ${response.statusCode}');
    }
  } catch (error) {
    // Error en la solicitud HTTP
    print('Error al actualizar el insumo: $error');
  }
}

// Función para mostrar una alerta de éxito
void mostrarNotificacion(BuildContext context) {
  SnackBar(
    content: Text('El insumo se ha actualizado con éxito'),
    duration: Duration(seconds: 4), // Duración de la notificación
    action: SnackBarAction(
      label: 'Cerrar',
      onPressed: () {
        // Acción al presionar el botón "Cerrar"
      },
    ),
  ).show(context);
}




class _EditarInsumoScreenState extends State<EditarInsumoScreen> {
  String selectedMedida = 'Unidad'; // Valor predeterminado
  TextEditingController medidaController = TextEditingController();
  @override
  void initState() {
    super.initState();
    String medidaInicial =
        widget.insumosData[0]['medida']; // Valor inicial desde insumo
    if (medidaInicial == 'Unidad' || medidaInicial == 'Metro') {
      // Si el valor inicial es válido, lo establecemos
      selectedMedida = medidaInicial;
      medidaController.text = medidaInicial;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: Color(0xFFDCB14A), // Color de la AppBar
        title: Text(
          "Editar insumo",
          style: TextStyle(
            color: Colors.white, // Color del texto
            fontSize: 20, // Tamaño de fuente del texto
          ),
        ),
        actions: [
          Row(
            children: [
              Text(
                '${widget.nombreUsuario}', // Reemplaza esto con el nombre real del usuario
                style: TextStyle(
                  color: Colors.white, // Color del texto
                  fontSize: 16, // Tamaño de fuente del texto
                ),
              ),
              IconButton(
                icon: Icon(Icons.exit_to_app),
                onPressed: () {
                  _showExitConfirmationDialog(context);
                },
              ),
            ],
          ),
        ],
      ),
      body: ListView.builder(
        itemCount: widget.insumosData.length,
        itemBuilder: (context, index) {
          final insumo = widget.insumosData[index];
          final idInsumo = insumo['idInsumo'];
          var nombreController = TextEditingController(text: insumo['nombre']);
          //var medidaController = TextEditingController(text: insumo['medida']);
          var stockController =
              TextEditingController(text: insumo['stock'].toString());
          // var estadoController = TextEditingController(text: insumo['estado']);
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: EdgeInsets.all(16.0), // Agregar relleno
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextField(
                      controller: nombreController,
                      decoration: InputDecoration(
                        labelText: 'Nombre',
                      ),
                    ),
                    SizedBox(height: 16.0),
                    DropdownButtonFormField<String>(
                      value: selectedMedida,
                      onChanged: (newValue) {
                        setState(() {
                          selectedMedida = newValue!;
                        });
                      },
                      items: ['Unidad', 'Metro'].map((medida) {
                        return DropdownMenuItem<String>(
                          value: medida,
                          child: Text(medida),
                        );
                      }).toList(),
                      decoration: InputDecoration(
                        labelText: 'Medida',
                      ),
                    ),
                    SizedBox(height: 16.0),
                    TextField(
                      controller: stockController,
                      decoration: InputDecoration(
                        labelText: 'Stock',
                      ),
                    ),
                    SizedBox(height: 16.0),
                    Row(
                      children: [
                        ElevatedButton(
                          onPressed: () {
                            // Acción para el botón "Actualizar" (verde)
                            actualizarInsumo(
                                idInsumo,
                                nombreController.text,
                                selectedMedida,
                                stockController.text,
                                context,
                                widget.nombreUsuario);
                          },
                          style:
                              ElevatedButton.styleFrom(primary: Colors.green),
                          child: Text('Actualizar'),
                        ),
                        SizedBox(width: 20), // Espacio entre botones
                        ElevatedButton(
                          onPressed: () {
                            // Acción para el botón "Cancelar" (rojo)
                            Navigator.pop(
                                context); // Regresar a la vista anterior (InsumosScreen)
                          },
                          style: ElevatedButton.styleFrom(primary: Colors.red),
                          child: Text('Cancelar'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              SizedBox(height: 16.0),
            ],
          );
        },
      ),
    );
  }
}
