import 'package:flutter/material.dart';
import 'package:movil/screens/Home.dart';
import 'package:movil/screens/InsumosScreen.dart';
import 'package:movil/screens/login_screen.dart'; 
import 'package:movil/screens/AgregarProductoScreen.dart';



void main() {
  runApp(MyApp());
  
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mi Aplicación',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: Colors.grey[200], // Establece el color de fondo gris claro
      ),
      home: HomeScreen(),
      routes: {
    LoginPage.id: (context) => LoginPage(),
    AgregarProductoPage.id: (context) => AgregarProductoPage(),

    // Otras rutas si las tienes
  }, // Usa la página de inicio de sesión como página principal
    );
  }
}









