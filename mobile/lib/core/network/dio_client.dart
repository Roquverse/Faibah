import 'dart:io' show Platform;
import 'package:dio/dio.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class DioClient {
  final Dio _dio;
  final FlutterSecureStorage _secureStorage;

  static final String _devUrl = Platform.isAndroid ? 'http://10.0.2.2:3005' : 'http://127.0.0.1:3005';
  static const String _prodUrl = 'https://backend.faibah.com';
  
  static final String _baseUrl = kReleaseMode ? _prodUrl : _devUrl;

  DioClient(this._secureStorage)
      : _dio = Dio(
          BaseOptions(
            baseUrl: _baseUrl,
            connectTimeout: const Duration(seconds: 15),
            receiveTimeout: const Duration(seconds: 15),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          ),
        ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final supabase = Supabase.instance.client;
          final token = supabase.auth.currentSession?.accessToken;
          // Fallback to secure storage if needed, but prefer Supabase session
          final storedToken = token ?? await _secureStorage.read(key: 'jwt_token');
          
          if (storedToken != null) {
            options.headers['Authorization'] = 'Bearer $storedToken';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          if (e.response?.statusCode == 401) {
            // Handle token refresh or logout logic here
            // e.g., clear secure storage and navigate to login
            await _secureStorage.delete(key: 'jwt_token');
          }
          return handler.next(e);
        },
      ),
    );
  }

  Dio get dio => _dio;
}
