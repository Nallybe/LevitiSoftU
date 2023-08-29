import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mi Aplicación de Inicio de Sesión',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => LoginPage(),
        '/agregar_producto': (context) => AgregarProductoPage(),
      },
    );
  }
}

class Producto {
  final String imagen;
  final String nombre;
  final String descripcion;
  final String idCategoria;
  final int stock;
  final double precio;

  Producto(
      {required this.imagen,
      required this.nombre,
      required this.descripcion,
      required this.idCategoria,
      required this.stock,
      required this.precio});
}

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
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
            item['precio'] ?? ''; // Obtener el valor de precio como cadena
        final cleanedPrecioStr = precioStr.replaceAll(
            RegExp(r'[^0-9.]'), ''); // Eliminar caracteres no numéricos
        final precio = double.tryParse(cleanedPrecioStr) ??
            0.0; // Intentar convertir a double, si no es válido usar 0.0
        fetchedProductos.add(Producto(
          imagen: item['imagen'],
          nombre: item['nombre'],
          descripcion: item['descripcion'],
          idCategoria: item['idCategoria'],
          stock: item['stock'],
          precio: precio,
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
              producto.nombre.toLowerCase().contains(query.toLowerCase()))
          .toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text('Productos'),
        ),
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
                              Text('\$${producto.precio.toStringAsFixed(2)}',
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
        floatingActionButton: FloatingActionButton(
          onPressed: () {
            Navigator.pushNamed(
                context, '/agregar_producto'); // Reemplaza con la ruta correcta
          },
          backgroundColor: Colors.green,
          child: Icon(Icons.add),
        ));
  }
}

class LoginPage extends StatelessWidget {
  final _formKey = GlobalKey<FormState>();
  String? _correo =
      ''; // Añade el signo de interrogación para indicar que puede ser nulo
  String? _passsword =
      ''; // Añade el signo de interrogación para indicar que puede ser nulo

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Inicio de Sesión'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                keyboardType: TextInputType.emailAddress,
                decoration:
                    const InputDecoration(labelText: 'Correo Electrónico'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    // Asegúrate de manejar el caso cuando value sea nulo
                    return 'Por favor ingresa un correo electrónico';
                  }
                  return null;
                },
                onSaved: (value) {
                  _correo = value;
                },
              ),
              TextFormField(
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Contraseña'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    // Asegúrate de manejar el caso cuando value sea nulo
                    return 'Por favor ingresa una contraseña';
                  }
                  return null;
                },
                onSaved: (value) {
                  _passsword = value;
                },
              ),
              const SizedBox(height: 16.0),
              ElevatedButton(
                onPressed: () async {
                  if (_formKey.currentState?.validate() == true) {
                    _formKey.currentState?.save();

                    // Captura el contexto en una variable local
                    final currentContext = context;

                    // Utiliza Future.delayed para esperar un ciclo de actualización de widgets
                    await Future.delayed(Duration.zero);

                    final response = await http.post(
                      Uri.parse('http://10.0.2.2:8181/loginApi'),
                      body: {
                        'correo': _correo,
                        'passsword': _passsword,
                      },
                    );

                    if (response.statusCode == 200) {
                      // Autenticación exitosa, redirigir a HomePage
                      Navigator.pushReplacement(
                        currentContext,
                        MaterialPageRoute(builder: (context) => HomePage()),
                      );
                    } else {
                      final errorMessage =
                          "Error"; // Obtén el mensaje de error del JSON de respuesta
                      showDialog(
                        context: currentContext,
                        builder: (context) {
                          return AlertDialog(
                            title: const Text('Error de inicio de sesión'),
                            content: Text(errorMessage),
                            actions: [
                              ElevatedButton(
                                onPressed: () => Navigator.pop(context),
                                child: const Text('Aceptar'),
                              ),
                            ],
                          );
                        },
                      );
                    }
                  }
                },
                child: const Text('Iniciar Sesión'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class AgregarProductoPage extends StatefulWidget {
  @override
  _AgregarProductoPageState createState() => _AgregarProductoPageState();
}

class _AgregarProductoPageState extends State<AgregarProductoPage> {
  late File? selectedImage;

  Future<void> _pickImage() async {
    final imagePicker = ImagePicker();
    final image = await imagePicker.pickImage(source: ImageSource.gallery);

    if (image != null) {
      selectedImage = File(image.path); // Convertir XFile a File
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Agregar Producto'),
      ),
      body: SingleChildScrollView(
        child: Container(
          padding: EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ... otros campos y elementos de la vista
              Center(
                child: Column(
                  children: [
                    Image.file(
                      selectedImage,
                      height: 100,
                    ),
                    Container(),
                    SizedBox(height: 8.0),
                    ElevatedButton(
                      onPressed: _pickImage,
                      child: Text('Seleccionar Imagen'),
                    ),
                  ],
                ),
              ),
              // ... otros elementos de la vista
              SizedBox(height: 16.0),
              Center(
                child: ElevatedButton(
                  onPressed: () {
                    // Lógica para registrar el producto con la imagen seleccionada
                  },
                  child: Text('Registrar Producto'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
