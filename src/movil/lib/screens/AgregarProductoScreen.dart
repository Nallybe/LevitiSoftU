import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

class AgregarProductoPage extends StatefulWidget {
  const AgregarProductoPage({super.key, required});
  static String id = 'ProductosScreen';

  @override
  _AgregarProductoPageState createState() => _AgregarProductoPageState();
}

class _AgregarProductoPageState extends State<AgregarProductoPage> {
  File? selectedImage;
  final TextEditingController nombreController = TextEditingController();
  final TextEditingController precioController = TextEditingController();
  final TextEditingController stockController = TextEditingController();
  final TextEditingController descripcionController = TextEditingController();
  final TextEditingController categoriaController =
      TextEditingController(text: 'Accesorios');
  List<int> selectedInsumos = [];
  List<dynamic> insumos = [];
  void _printSelectedInsumos() {
    print("Selected Insumos: $selectedInsumos");
  }

  Future<void> Insumos() async {
    final response = await http
        .get(Uri.parse('http://10.0.2.2:8181/productos_registrarApi'));
    if (response.statusCode == 200) {
      final jsonData = json.decode(response.body);

      setState(() {
        insumos = jsonData['insumos']; // Asignar los datos de la API a la variable insumos
      });
  }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Color(0xFFDCB14A),
        title: Text('Agregar Producto'),
      ),
      backgroundColor: Color.fromARGB(255, 236, 236, 236),
      body: SingleChildScrollView(
        child: Container(
          padding: EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ... otros campos y elementos de la vista
              TextField(
                controller: nombreController,
                decoration: InputDecoration(
                  labelText: 'Nombre',
                ),
              ),
              SizedBox(height: 10),
              TextField(
                controller: precioController,
                decoration: InputDecoration(
                  labelText: 'Precio',
                ),
              ),
              SizedBox(height: 10),
              TextField(
                controller: stockController,
                decoration: InputDecoration(
                  labelText: 'Stock',
                ),
              ),
              SizedBox(height: 10),
              DropdownButtonFormField(
                value: categoriaController.text,
                items: [
                  DropdownMenuItem(
                      value: 'Accesorios', child: Text('Accesorios')),
                  DropdownMenuItem(
                      value: 'Billeteras', child: Text('Billeteras')),
                  DropdownMenuItem(value: 'Bolsos', child: Text('Bolsos')),
                  DropdownMenuItem(
                      value: 'Chaquetas', child: Text('Chaquetas')),
                  DropdownMenuItem(value: 'Morrales', child: Text('Morrales')),
                  DropdownMenuItem(value: 'Zapatos', child: Text('Zapatos')),
                ], // Agrega aquí los items de categoría
                onChanged: (value) {
                  categoriaController.text = value.toString();
                },
                decoration: InputDecoration(
                  labelText: 'Categoría',
                ),
              ),
              SizedBox(height: 10),
              TextField(
                controller: descripcionController,
                maxLines: null,
                decoration: InputDecoration(
                  labelText: 'Descripción',
                ),
              ),
              SizedBox(height: 10),
              ElevatedButton(
                onPressed: () async {
                  final imagePicker = ImagePicker();
                  final image =
                      await imagePicker.pickImage(source: ImageSource.gallery);

                  if (image != null) {
                    selectedImage = File(image.path);
                    setState(() {});
                  }
                },
                child: Text('Seleccionar Imagen'),
              ),

              // ... otros elementos de la vista
              SizedBox(height: 16.0),
              Center(
                child: ElevatedButton(
                  onPressed: () {
                    // _mostrarModal(context);
                  },
                  child: Text('Mostrar Modal'),
                ),
              ),
              Table(
                columnWidths: {
                  0: FlexColumnWidth(1),
                  1: FlexColumnWidth(2),
                  2: FlexColumnWidth(1),
                  3: FlexColumnWidth(2),
                  4: FlexColumnWidth(2),
                },
                children: [
                  TableRow(
                    children: [
                      TableCell(child: Text('Insumo')),
                      TableCell(child: Text('Cantidad')),
                      TableCell(child: Text('')),
                      TableCell(child: Text('')),
                    ],
                  ),
                  for (var insumo in insumos)
                    TableRow(
                      children: [
                        TableCell(child: Text(insumo['nombre'])),
                        TableCell(child: Text(insumo['stock'].toString())),
                        TableCell(
                          child: Checkbox(
                            value: selectedInsumos.contains(insumo['idInsumo']),
                            onChanged: (bool? newValue) {
                              if (newValue != null &&
                                  newValue !=
                                      selectedInsumos
                                          .contains(insumo['idInsumo'])) {
                                setState(() {
                                  if (newValue) {
                                    selectedInsumos.add(insumo['idInsumo']);
                                  } else {
                                    selectedInsumos.remove(insumo['idInsumo']);
                                  }
                                  _printSelectedInsumos();
                                });
                              }
                            },
                          ),
                        ),
                        TableCell(
                          child: TextField(
                            keyboardType: TextInputType.number,
                            onChanged: (text) {
                              // Puedes manejar el cambio en el valor del TextField aquí
                            },
                          ),
                        ),
                      ],
                    ),
                ],
              ),
              Center(
                child: ElevatedButton(
                  onPressed: () {
                    // Lógica para registrar el producto con la imagen seleccionada
                  },
                  child: Text('Registrar Producto'),
                ),
              ),

              SizedBox(height: 16.0),
            ],
          ),
        ),
      ),
    );
  }

  // void _mostrarModal(BuildContext context) async {
  //   final response = await http
  //       .get(Uri.parse('http://10.0.2.2:8181/productos_registrarApi'));
  //   if (response.statusCode == 200) {
  //     final jsonData = json.decode(response.body);

  //     final insumos = jsonData['insumos'];

  //     showDialog(
  //       context: context,
  //       builder: (BuildContext context) {
  //         return AlertDialog(
  //           title: Text('Insumos requeridos'),
  //           content: Column(
  //             crossAxisAlignment: CrossAxisAlignment.start,
  //             mainAxisSize: MainAxisSize.min,
  //             children: [
  //               Table(
  //                 columnWidths: {
  //                   0: FlexColumnWidth(1),
  //                   1: FlexColumnWidth(2),
  //                   2: FlexColumnWidth(1),
  //                   3: FlexColumnWidth(2),
  //                   4: FlexColumnWidth(2),
  //                 },
  //                 children: [
  //                   TableRow(
  //                     children: [
  //                       TableCell(child: Text('Insumo')),
  //                       TableCell(child: Text('Cantidad')),
  //                       TableCell(child: Text('')),
  //                       TableCell(child: Text('')),
  //                     ],
  //                   ),
  //                   for (var insumo in insumos)
  //                     TableRow(
  //                       children: [
  //                         TableCell(child: Text(insumo['nombre'])),
  //                         TableCell(child: Text(insumo['stock'].toString())),
  //                         TableCell(
  //                           child: Checkbox(
  //                             value: selectedInsumos
  //                                 .contains(insumo['idInsumo']),
  //                             onChanged: (bool? newValue) {
  //                               if (newValue != null &&
  //                                   newValue !=
  //                                       selectedInsumos
  //                                           .contains(insumo['idInsumo'])) {
  //                                 setState(() {
  //                                   if (newValue) {
  //                                     selectedInsumos.add(insumo['idInsumo']);
  //                                   } else {
  //                                     selectedInsumos
  //                                         .remove(insumo['idInsumo']);
  //                                   }
  //                                   _printSelectedInsumos();
  //                                 });
  //                               }
  //                             },
  //                           ),
  //                         ),
  //                         TableCell(
  //                           child: TextField(
  //                             keyboardType: TextInputType.number,
  //                             onChanged: (text) {
  //                               // Puedes manejar el cambio en el valor del TextField aquí
  //                             },
  //                           ),
  //                         ),
  //                       ],
  //                     ),
  //                 ],
  //               )

  //               // ... Paginación y otras partes
  //             ],
  //           ),
  //           actions: [
  //             TextButton(
  //               onPressed: () {
  //                 Navigator.of(context).pop();
  //               },
  //               child: Text('Cerrar'),
  //             ),
  //           ],
  //         );
  //       },
  //     );
  //   } else {
  //     // Manejo de error si la llamada a la API falla
  //   }
  // }
}
