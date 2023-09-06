import 'package:flutter/material.dart';
import 'package:movil/components/components.dart';
import 'package:movil/screens/login_screen.dart';
import 'package:movil/screens/restablecerContra.dart';
import 'package:movil/screens/signup_screen.dart';


class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});
  static String id = 'home_screen';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color.fromARGB(255, 236, 236, 236),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(15),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const TopScreenImage(screenImageName: 'levitico.png'),
              Expanded(
                child: Padding(
                  padding:
                      const EdgeInsets.only(right: 15.0, left: 15, bottom: 1),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    
                    children: [
                      const ScreenTitle(title: 'Bienvenido!'),
                      
                      const SizedBox(
                        height: 25,
                      ),
                      Hero(
                        tag: 'login_btn',
                        child: CustomButton(
                          buttonText: 'Login',
                          onPressed: () {
                            Navigator.pushNamed(context, LoginPage.id);
                          },
                        ),
                      ),
                      const SizedBox(
                        height: 20,
                      ),
                      Hero(
                        tag: 'signup_btn',
                        child: CustomButton(
                          buttonText: 'Sign Up',
                          isOutlined: true,
                          onPressed: () {
                            Navigator.pushNamed(context, SignUpScreen.id);
                          },
                        ),
                      ),
                      const SizedBox(
                        height: 25,
                      ),
                      
                      
                    ],
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
