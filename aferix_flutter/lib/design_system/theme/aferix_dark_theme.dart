import 'package:flutter/material.dart';
import '../tokens/tokens.dart';

class AferixDarkTheme {
  static ThemeData get theme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: Colors.transparent,
      primaryColor: Colors.transparent,
      colorScheme: const ColorScheme.dark(
        primary: Colors.transparent,
        secondary: Colors.transparent,
        surface: Colors.transparent,
        onSurface: Colors.transparent,
        // background and onBackground are deprecated; use surface and onSurface
        // background: Colors.transparent, // deprecated
        // onBackground: Colors.transparent, // deprecated
      ),
      textTheme: TextTheme(
        headlineLarge: AferixTypography.titleLarge,
        headlineMedium: AferixTypography.titleMedium,
        bodyMedium: AferixTypography.bodyMedium,
        labelSmall: AferixTypography.labelSmall,
      ),
      cardTheme: CardThemeData(
        color: Colors.transparent,
        elevation: AferixElevation.dp2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AferixRadius.m),
        ),
        margin: EdgeInsets.zero,
      ),
      buttonTheme: ButtonThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AferixRadius.s),
        ),
        buttonColor: Colors.transparent,
        padding: EdgeInsets.symmetric(
          horizontal: AferixSpacing.l,
          vertical: AferixSpacing.s,
        ),
      ),
    );
  }
}
