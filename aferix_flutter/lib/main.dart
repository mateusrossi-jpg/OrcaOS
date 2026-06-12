import 'package:flutter/material.dart';
import 'package:aferix_flutter/features/home/presentation/views/home_page.dart';
import 'package:aferix_flutter/data/repositories/local_home_repository.dart';

void main() {
  runApp(const AferixApp());
}

class AferixApp extends StatelessWidget {
  const AferixApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Aferix Flutter',
      theme: ThemeData(
        brightness: Brightness.dark,
        primarySwatch: Colors.indigo,
        useMaterial3: true,
      ),
      home: HomePage(repository: LocalHomeRepository()),
    );
  }
}

