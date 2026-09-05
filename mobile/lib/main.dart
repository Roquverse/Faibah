import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_provider.dart';
import 'features/auth/presentation/auth_controller.dart';
import 'features/splash/presentation/splash_screen.dart';
import 'core/network/offline_queue_service.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);
  
  await Hive.initFlutter();
  final offlineQueue = OfflineQueueService();
  await offlineQueue.initialize();

  // Initialize Supabase
  await Supabase.initialize(
    url: 'https://thicwkcvepzaflhfjvwx.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoaWN3a2N2ZXB6YWZsaGZqdnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMzc0MDQsImV4cCI6MjEwMjgxMzQwNH0.Asl0_gM9yLh7O1I3OyZNkealjb_LeS5OuzVsyEqYIzk',
  );

  runApp(
    ProviderScope(
      overrides: [
        offlineQueueServiceProvider.overrideWithValue(offlineQueue),
      ],
      child: const FaibaApp(),
    ),
  );
}

class FaibaApp extends ConsumerWidget {
  const FaibaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Eagerly initialize auth check in the background
    ref.watch(authCheckProvider);
    
    final themeMode = ref.watch(themeModeProvider);

    return MaterialApp(
      title: 'Faiba',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      home: const AnimatedSplashScreen(),
    );
  }
}
