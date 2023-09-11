import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:movil/screens/ProductosScreen.dart';
import 'package:loading_overlay/loading_overlay.dart';
import 'package:movil/components/components.dart';
import 'package:movil/constants.dart';
import 'dart:convert';

class LoginPage extends StatefulWidget {
  const LoginPage({Key? key}) : super(key: key);
  static String id = 'login_screen';

  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  late String _correo;
  late String _passsword;
  bool _saving = false;
  String nombreUsuario = "";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Color(0xFFDCB14A),
        // Agrega un botón de retroceso en la parte superior izquierda
        leading: IconButton(
          icon: Icon(Icons.arrow_back),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: Text(
          "LevitiSoft",
          // Puedes personalizar el estilo del texto según tus necesidades
          style: TextStyle(
            color: Colors.white, // Cambia el color del texto si es necesario
            fontSize: 20, // Cambia el tamaño de fuente si es necesario
          ),
        ),
      ),
      body: LoadingOverlay(
        isLoading: _saving,
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              children: [
                Expanded(
                  flex: 2,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const ScreenTitle(title: 'Iniciar sesión'),
                      SizedBox(
                        height: 20,
                      ),
                      CustomTextField(
                        textField: TextField(
                          onChanged: (value) {
                            _correo = value;
                          },
                          style: const TextStyle(
                            fontSize: 17,
                          ),
                          decoration: kTextInputDecoration.copyWith(
                            hintText: 'Correo Electrónico',
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 20,
                      ),
                      CustomTextField(
                        textField: TextField(
                          obscureText: true,
                          onChanged: (value) {
                            _passsword = value;
                          },
                          style: const TextStyle(
                            fontSize: 17,
                          ),
                          decoration: kTextInputDecoration.copyWith(
                            hintText: 'Contraseña',
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 20,
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Hero(
                            tag: 'login_btn',
                            child: CustomButton(
                              buttonText: 'Iniciar sesión',
                              onPressed: () async {
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
                                  final jsonData = json.decode(response.body);
                                  final nombreUsuario = jsonData['nombre'];
                                  // Autenticación exitosa, redirigir a HomePage
                                  Navigator.pushReplacement(
                                    currentContext,
                                    MaterialPageRoute(
                                      builder: (context) => ProductosScreen(
                                          nombreUsuario: nombreUsuario),
                                    ),
                                  );
                                } else {
                                  final errorMessage =
                                      "Error"; // Obtén el mensaje de error del JSON de respuesta
                                  showDialog(
                                    context: currentContext,
                                    builder: (context) {
                                      return AlertDialog(
                                        title: const Text(
                                            'Error de inicio de sesión'),
                                        content: Text(errorMessage),
                                        actions: [
                                          ElevatedButton(
                                            onPressed: () =>
                                                Navigator.pop(context),
                                            child: const Text('Aceptar'),
                                          ),
                                        ],
                                      );
                                    },
                                  );
                                }
                              },
                            ),
                          ),
                          SizedBox(
                            height: 20,
                          ),
                          
                        ],
                      )
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
