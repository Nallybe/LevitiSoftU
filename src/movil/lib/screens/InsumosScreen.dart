import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'package:movil/screens/EditarInsumoScreen.dart';

class InsumosScreen extends StatefulWidget {
  const InsumosScreen({super.key, required this.nombreUsuario});
  static String id = 'InsumosScreen';
  final String nombreUsuario;

  @override
  _InsumosScreenState createState() => _InsumosScreenState();
}

class _InsumosScreenState extends State<InsumosScreen> {
  List<dynamic> insumos = [];
  List<dynamic> filteredInsumos = [];
  TextEditingController _searchController = TextEditingController();
  @override
  void initState() {
    super.initState();
    _fetchInsumos();
  }

  Future<void> _fetchInsumos() async {
    final response =
        await http.get(Uri.parse('http://10.0.2.2:8181/insumosAPI'));

    if (response.statusCode == 200) {
      final jsonResponse = json.decode(response.body);

      if (jsonResponse.containsKey("insumos") &&
          jsonResponse["insumos"] is List) {
        setState(() {
          insumos = jsonResponse["insumos"];
          filteredInsumos =
              insumos; // Inicialmente, muestramos todos los insumos sin filtrar
        });
      } else {
        throw Exception(
            'La respuesta de la API no contiene una lista de insumos válida');
      }
    } else {
      throw Exception('Error al cargar los insumos');
    }
  }

  void _filterInsumos(String query) {
    setState(() {
      filteredInsumos = insumos.where((insumo) {
        final nombre = insumo['nombre'].toLowerCase();
        final medida = insumo['medida'].toLowerCase();
        final estado = insumo['estado'].toLowerCase();
        final stock = insumo['stock'].toString().toLowerCase();

        // Verificar si algún campo contiene el texto de búsqueda
        return nombre.contains(query.toLowerCase()) ||
            medida.contains(query.toLowerCase()) ||
            estado.contains(query.toLowerCase()) ||
            stock.contains(query.toLowerCase());
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Column(children: [
      Padding(
        padding: const EdgeInsets.all(16.0),
        child: TextField(
          controller: _searchController,
          decoration: InputDecoration(
            labelText: 'Buscar insumo',
            suffixIcon: IconButton(
              icon: Icon(Icons.clear),
              onPressed: () {
                _searchController.clear();
                _filterInsumos('');
              },
            ),
          ),
          onChanged: (query) => _filterInsumos(query),
        ),
      ),
      Expanded(
        child: filteredInsumos.isEmpty
            ? CircularProgressIndicator()
            : ListView.builder(
                itemCount: filteredInsumos.length,
                itemBuilder: (BuildContext context, int index) {
                  final insumo = filteredInsumos[index];
                  final stock = insumo['stock'];

                  // Verificar si el stock es igual o menor a 5
                  final tieneStockBajo = stock <= 5;

                  return Card(
                    child: ListTile(
                      title: Text('Insumo: ${insumo['nombre']}'),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Medida: ${insumo['medida']}'),
                          Text('Stock: ${insumo['stock']}'),
                          Text('Estado: ${insumo['estado']}'),
                        ],
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: Icon(Icons.edit), // Icono de lápiz
                            onPressed: () async {
                              final idInsumo = insumo['idInsumo'];
                              print("Insumo: $idInsumo");
                              final response = await http.get(Uri.parse(
                                  'http://10.0.2.2:8181/EditarInsumoAPI/$idInsumo')); // Reemplaza $idInsumo con el ID del insumo que deseas editar

                              if (response.statusCode == 200) {
                                print("entra");
                                final jsonData = json.decode(response.body);
                                final insumoData = jsonData['insumos'];
                                print("Respuesta: $insumoData");
                                // Navega a la pantalla de edición y pasa los datos del insumo como argumentos
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (context) => EditarInsumoScreen(
                                      nombreUsuario: widget.nombreUsuario,
                                      insumosData: insumoData,
                                    ),
                                  ),
                                );
                              } else {
                                // Maneja el caso de error aquí
                                print('Error al obtener los datos del insumo');
                              }
                            },
                          ),

                          // Mostrar un punto rojo si el stock es igual o menor a 5
                          if (tieneStockBajo)
                            Icon(
                              Icons.circle,
                              color: Colors.red,
                              size: 12.0,
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
    ]));
  }
}
