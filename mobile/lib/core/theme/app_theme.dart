import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // New Color Palette
  static const Color primaryGreen = Color(0xFF6D9773);
  static const Color trueBlack = Color(0xFF000000);
  static const Color gold = Color(0xFFBB8A52);
  static const Color yellow = Color(0xFFFFBA00);

  // Dark Mode Colors
  static const Color darkBackground = trueBlack;
  static const Color darkSurface01 = Color(0xFF111111);
  static const Color darkSurface02 = Color(0xFF1A1A1A);
  static const Color darkSurface03 = Color(0xFF242424);
  static const Color darkTextPrimary = Color(0xFFFFFFFF);
  static const Color darkTextSecondary = Color(0xFFAAAAAA);

  // Light Mode Colors
  static const Color lightBackground = Color(0xFFF9FAFB);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightBorder = Color(0xFFE5E7EB);
  static const Color lightTextPrimary = trueBlack; 
  static const Color lightTextSecondary = Color(0xFF6B7280);

  // Semantics
  static const Color success = primaryGreen;
  static const Color warning = yellow;
  static const Color danger = Color(0xFFEF4444);

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: lightBackground,
      primaryColor: trueBlack,
      colorScheme: const ColorScheme.light(
        primary: trueBlack,
        secondary: Color(0xFF111827), // Used for strong accents
        surface: lightSurface,
        error: danger,
        onPrimary: Color(0xFFFFFFFF),
        onSecondary: Color(0xFFFFFFFF),
        onSurface: lightTextPrimary,
        onError: Color(0xFFFFFFFF),
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.inter(color: lightTextPrimary, fontWeight: FontWeight.bold),
        displayMedium: GoogleFonts.inter(color: lightTextPrimary, fontWeight: FontWeight.bold),
        displaySmall: GoogleFonts.inter(color: lightTextPrimary, fontWeight: FontWeight.bold),
        headlineMedium: GoogleFonts.inter(color: lightTextPrimary, fontWeight: FontWeight.w700),
        titleLarge: GoogleFonts.inter(color: lightTextPrimary, fontWeight: FontWeight.w600),
        bodyLarge: GoogleFonts.inter(color: lightTextPrimary),
        bodyMedium: GoogleFonts.inter(color: lightTextPrimary),
        labelLarge: GoogleFonts.inter(color: lightTextPrimary, fontWeight: FontWeight.bold),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: lightSurface,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: lightTextPrimary),
        titleTextStyle: TextStyle(
            fontFamily: 'Inter',
            color: lightTextPrimary,
            fontSize: 20,
            fontWeight: FontWeight.w600),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: lightSurface,
        selectedItemColor: Color(0xFF111827),
        unselectedItemColor: lightTextSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      cardTheme: CardThemeData(
        color: lightSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: lightBorder, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF111827),
          foregroundColor: const Color(0xFFFFFFFF),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.bold),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: lightTextPrimary,
          side: const BorderSide(color: lightBorder),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.bold),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: lightSurface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: lightBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFF111827)),
        ),
        hintStyle: GoogleFonts.inter(color: lightTextSecondary),
      ),
      dividerTheme: const DividerThemeData(color: lightBorder, thickness: 1),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: darkBackground,
      primaryColor: primaryGreen, // Use web accent for consistency, or keep old orange
      colorScheme: const ColorScheme.dark(
        primary: primaryGreen,
        secondary: Color(0xFFFFFFFF),
        surface: darkSurface01,
        error: danger,
        onPrimary: darkBackground,
        onSecondary: darkBackground,
        onSurface: darkTextPrimary,
        onError: darkTextPrimary,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.inter(color: darkTextPrimary, fontWeight: FontWeight.bold),
        displayMedium: GoogleFonts.inter(color: darkTextPrimary, fontWeight: FontWeight.bold),
        displaySmall: GoogleFonts.inter(color: darkTextPrimary, fontWeight: FontWeight.bold),
        headlineMedium: GoogleFonts.inter(color: darkTextPrimary, fontWeight: FontWeight.w700),
        titleLarge: GoogleFonts.inter(color: darkTextPrimary, fontWeight: FontWeight.w600),
        bodyLarge: GoogleFonts.inter(color: darkTextPrimary),
        bodyMedium: GoogleFonts.inter(color: darkTextPrimary),
        labelLarge: GoogleFonts.inter(color: darkTextPrimary, fontWeight: FontWeight.bold),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: darkBackground,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: darkTextPrimary),
        titleTextStyle: TextStyle(
            fontFamily: 'Inter',
            color: darkTextPrimary,
            fontSize: 20,
            fontWeight: FontWeight.w600),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: darkSurface01,
        selectedItemColor: primaryGreen,
        unselectedItemColor: darkTextSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      cardTheme: CardThemeData(
        color: darkSurface02,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: darkSurface03, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryGreen,
          foregroundColor: darkBackground,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.bold),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: darkTextPrimary,
          side: const BorderSide(color: darkSurface03),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.bold),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: darkSurface02,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: darkSurface03),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: primaryGreen),
        ),
        hintStyle: GoogleFonts.inter(color: darkTextSecondary),
      ),
      dividerTheme: const DividerThemeData(color: darkSurface03, thickness: 1),
    );
  }
}
