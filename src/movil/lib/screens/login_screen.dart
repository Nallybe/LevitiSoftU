import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:movil/screens/ProductosScreen.dart';
import 'package:movil/screens/restablecerContra.dart';
import 'package:loading_overlay/loading_overlay.dart';
import 'package:movil/components/components.dart';
import 'package:movil/constants.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({Key? key}) : super(key: key);
  static String id = 'login_screen';

  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  late String _email;
  late String _passsword;
  bool _saving = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
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
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const ScreenTitle(title: 'Login'),
                      CustomTextField(
                        textField: TextField(
                            onChanged: (value) {
                              _email = value;
                            },
                            style: const TextStyle(
                              fontSize: 17,
                            ),
                            decoration: kTextInputDecoration.copyWith(
                                hintText: 'Correo Electrónico')),
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
                              hintText: 'Contraseña'),
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Hero(
                            tag: 'login_btn',
                            child: ElevatedButton(
                              onPressed: () async {
                                FocusManager.instance.primaryFocus?.unfocus();
                                setState(() {
                                  _saving = true;
                                });
                                try {
                                  // Tu lógica de autenticación aquí

                                  if (context.mounted) {
                                    setState(() {
                                      _saving = false;
                                      Navigator.pushNamed(
                                          context, ProductosScreen.id);
                                    });
                                  }
                                } catch (e) {
                                  // Manejar errores de autenticación
                                }
                              },
                              style: ElevatedButton.styleFrom(
                                primary: Color(
                                    0xFFDCB14A), // Cambia el color del botón
                              ),
                              child: Text(
                                'Iniciar Sesión',
                                style: TextStyle(
                                    color: Colors
                                        .white), // Cambia el color del texto
                              ),
                            ),
                          ),
                          SizedBox(
                              height:
                                  20), // Añade espacio entre el botón y el texto
                          GestureDetector(
                            onTap: () {
                              Navigator.pushNamed(context, Restablecimiento.id);
                            },
                            child: Text(
                              '¿Olvidaste tu contraseña?',
                              style: TextStyle(
                                color: Colors
                                    .blue, // Cambia el color según tu diseño
                                decoration: TextDecoration.underline,
                              ),
                            ),
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
