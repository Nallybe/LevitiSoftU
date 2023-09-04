import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({Key? key}) : super(key: key);
  static String id = 'signup_screen';
  
  @override
  _SignUpScreenState createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  TextEditingController documentoController = TextEditingController();
  TextEditingController nombreController = TextEditingController();
  TextEditingController telefonoController = TextEditingController();
  TextEditingController correoController = TextEditingController();
  TextEditingController passswordController = TextEditingController();

  void _submitForm() async {
    if (_formKey.currentState!.validate()) {
      // Si la validación del formulario es exitosa, envía la solicitud HTTP POST
      final response = await http.post(Uri.parse('http://10.0.2.2:8181/registerApi'), body: {
        'documento': documentoController.text,
        'nombre': nombreController.text,
        'telefono': telefonoController.text,
        'correo': correoController.text,
        'passsword': passswordController.text,
      });

      if (response.statusCode == 200) {
        // Manejar la respuesta exitosa aquí
        print('Registro exitoso');
      } else {
        // Manejar errores de la solicitud aquí
        print('Error en el registro: ${response.statusCode}');
      }
    }
  }
  TextStyle style = TextStyle(color: Colors.green);
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Registro de Usuario'),
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              TextFormField(
                controller: documentoController,
                decoration: InputDecoration(labelText: 'Documento'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Por favor, ingresa tu documento';
                  }
                  return null;
                },
              ),
              TextFormField(
                controller: nombreController,
                decoration: InputDecoration(labelText: 'Nombre Completo'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Por favor, ingresa tu nombre completo';
                  }
                  return null;
                },
              ),
              TextFormField(
                controller: telefonoController,
                decoration: InputDecoration(labelText: 'Teléfono'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Por favor, ingresa tu teléfono';
                  }
                  return null;
                },
              ),
              TextFormField(
                controller: correoController,
                decoration: InputDecoration(labelText: 'Correo'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Por favor, ingresa tu correo';
                  }
                  return null;
                },
              ),
              TextFormField(
                controller: passswordController,
                decoration: InputDecoration(labelText: 'Contraseña'),
                // Elimina la validación de la contraseña
              ),
              Text(
                'Su contraseña es su documento de identidad',
                style: TextStyle(color: Colors.green),
              ),
              SizedBox(height: 20.0),
              ElevatedButton(
                onPressed: _submitForm,
                child: Text('Registrarse'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}