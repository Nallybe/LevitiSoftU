import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';

class Producto {
  final String imagen;
  final String nombre;
  final String descripcion;
  final String idCategoria;
  final int stock;
  final String precio;

  Producto(
      {required this.imagen,
      required this.nombre,
      required this.descripcion,
      required this.idCategoria,
      required this.stock,
      required this.precio});
}


class ProductosScreen extends StatefulWidget {
  const ProductosScreen({super.key, required this.nombreUsuario});
  static String id = 'ProductosScreen';
  final String nombreUsuario;
  
  @override
  _ProductosScreenState createState() => _ProductosScreenState();
}

class _ProductosScreenState extends State<ProductosScreen> {
  List<Producto> productos = [];
  List<Producto> productosFiltrados = [];
  
  

  TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    fetchProductos();
  }

  Future<void> fetchProductos() async {
    final response =
        await http.get(Uri.parse('http://10.0.2.2:8181/productosApi'));
    if (response.statusCode == 200) {
      final jsonData = json.decode(response.body);
      List<Producto> fetchedProductos = [];
      for (var item in jsonData['productos']) {
        final precioStr =
            item['precio']; // Obtener el valor de precio como cadena
        
        fetchedProductos.add(Producto(
          imagen: item['imagen'],
          nombre: item['nombre'],
          descripcion: item['descripcion'],
          idCategoria: item['idCategoria'],
          stock: item['stock'],
          precio: precioStr,
        ));
      }
      setState(() {
        productos = fetchedProductos;
        productosFiltrados = fetchedProductos;
      });
    } else {
      // Manejar el caso de error
      print('Error al cargar los productos');
    }
  }

  void _filterProductos(String query) {
  setState(() {
    productosFiltrados = productos
        .where((producto) =>
            producto.nombre.toLowerCase().contains(query.toLowerCase()) ||
            producto.precio.toString().contains(query))
        .toList();
  });
}


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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        
        backgroundColor: Color.fromARGB(255, 236, 236, 236),
        body: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  labelText: 'Buscar por nombre',
                  suffixIcon: IconButton(
                    icon: Icon(Icons.clear),
                    onPressed: () {
                      _searchController.clear();
                      _filterProductos('');
                    },
                  ),
                ),
                onChanged: (query) => _filterProductos(query),
              ),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: productosFiltrados.length,
                itemBuilder: (context, index) {
                  final producto = productosFiltrados[index];

                  return Card(
                    margin: EdgeInsets.all(16.0),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Columna de la izquierda (imagen)
                        Container(
                          width: 150, // Ancho fijo para la imagen
                          child: Image.network(
                            'http://10.0.2.2:8181/assets/img/Productos/${producto.imagen}',
                            height: 150,
                            fit: BoxFit.cover,
                          ),
                        ),
                        SizedBox(width: 16), // Espacio entre las columnas
                        // Columna de la derecha (información)
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                producto.nombre,
                                style: TextStyle(
                                    fontSize: 18, fontWeight: FontWeight.bold),
                              ),
                              SizedBox(height: 8),
                              Text(producto.descripcion),
                              SizedBox(height: 8),
                              Text('Categoría: ${producto.idCategoria}'),
                              SizedBox(height: 8),
                              Text('Stock: ${producto.stock} unidades'),
                              SizedBox(height: 8),
                              Text('${producto.precio}',
                                  style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
        // floatingActionButton: FloatingActionButton(
        //   onPressed: () {
        //     Navigator.pushNamed(
        //         context, AgregarProductoPage.id); // Reemplaza con la ruta correcta
        //   },
        //   backgroundColor: Colors.green,
        //   child: Icon(Icons.add),
        
        // )
        );
  }
}
