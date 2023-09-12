import 'package:flutter/material.dart';
import 'package:movil/screens/InsumosScreen.dart';
import 'package:movil/screens/ProductosScreen.dart';

class InicioScreen extends StatefulWidget {
  const InicioScreen({super.key, required this.nombreUsuario});
  static String id = 'InicioScreen';
  final String nombreUsuario;

  @override
  _InicioScreenState createState() => _InicioScreenState();
}

class _InicioScreenState extends State<InicioScreen> {
  int _selectedIndex = 0;

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: Color(0xFFDCB14A), // Color de la AppBar
        title: Text(
          "Inicio",
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
      backgroundColor: Color.fromARGB(255, 236, 236, 236),
      body:
          _buildBody(), // Utiliza una función para construir el cuerpo según el índice seleccionado.
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart),
            label: 'Productos',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.storage),
            label: 'Insumos',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.blue,
        onTap: _onItemTapped,
      ),
    );
  }

  Widget _buildBody() {
    switch (_selectedIndex) {
      case 0:
        return ProductosScreen(nombreUsuario: widget.nombreUsuario);
      case 1:
        return InsumosScreen(nombreUsuario: widget.nombreUsuario);
      default:
        return Container(); // Puedes devolver una vista por defecto si es necesario.
    }
  }
}
