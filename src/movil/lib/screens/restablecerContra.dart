import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class Restablecimiento extends StatefulWidget {
  const Restablecimiento({Key? key}) : super(key: key);
  static String id = 'restablecerContra';

  @override
  State<Restablecimiento> createState() => _RestablecimientoState();
}

class _RestablecimientoState extends State<Restablecimiento> {
  final TextEditingController emailController = TextEditingController();

  Future<void> sendPasswordResetRequest() async {
    final String email = emailController.text;
    final String apiUrl = 'http://10.0.2.2:8181/olvidar_contraseapi'; // URL local

    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        body: {'email': email},
      );

      if (response.statusCode == 200) {
        // La solicitud fue exitosa, puedes manejar la respuesta aquí.
        print('Solicitud exitosa. Respuesta: ${response.body}');
      } else {
        // Manejar errores aquí si es necesario.
        print('Error al enviar la solicitud. Código de estado: ${response.statusCode}');
      }
    } catch (error) {
      // Manejar errores de conexión aquí.
      print('Error de conexión: $error');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Formulario de Restablecimiento de Contraseña'),
      ),
      backgroundColor: Color.fromARGB(255, 236, 236, 236),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            TextFormField(
              controller: emailController,
              decoration: InputDecoration(labelText: 'Correo electrónico'),
            ),
            SizedBox(height: 16.0),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                ElevatedButton(
                  onPressed: () {
                    // Acción a realizar al presionar el botón de cancelar (color rojo).
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(primary: Colors.red),
                  child: Text('Cancelar'),
                ),
                SizedBox(width: 16.0),
                ElevatedButton(
                  onPressed: () {
                    // Acción a realizar al presionar el botón de enviar (color verde).
                    sendPasswordResetRequest();
                  },
                  style: ElevatedButton.styleFrom(primary: Colors.green),
                  child: Text('Enviar'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    emailController.dispose();
    super.dispose();
  }
}