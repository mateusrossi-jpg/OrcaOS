import 'package:flutter/material.dart';

class EmptyHomeSection extends StatelessWidget {
  const EmptyHomeSection({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text('No data available', style: TextStyle(fontSize: 18)),
    );
  }
}
