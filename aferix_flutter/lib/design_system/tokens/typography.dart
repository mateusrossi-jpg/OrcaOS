import 'package:flutter/material.dart';


class AferixTypography {
  static const TextStyle titleLarge = TextStyle(
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: Colors.transparent,
  );

  static const TextStyle titleMedium = TextStyle(
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: Colors.transparent,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: FontWeight.normal,
    color: Colors.transparent,
  );

  static const TextStyle labelSmall = TextStyle(
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: Colors.transparent,
  );
  // Additional styles to satisfy component expectations
  static const TextStyle subtitle1 = titleMedium;
  static const TextStyle body1 = bodyMedium;
  static const TextStyle caption = labelSmall;
  static const TextStyle button = labelSmall;
  static const TextStyle h1 = titleLarge;

}
