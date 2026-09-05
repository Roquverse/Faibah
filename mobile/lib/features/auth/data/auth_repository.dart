import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/network/dio_client.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

final secureStorageProvider = Provider((ref) => const FlutterSecureStorage());

final dioClientProvider = Provider((ref) {
  final storage = ref.watch(secureStorageProvider);
  return DioClient(storage);
});

final authRepositoryProvider = Provider((ref) {
  final dioClient = ref.watch(dioClientProvider);
  final storage = ref.watch(secureStorageProvider);
  return AuthRepository(dioClient.dio, storage);
});

class AuthRepository {
  final Dio _dio;
  final FlutterSecureStorage _storage;

  AuthRepository(this._dio, this._storage);

  Future<void> login(String email, String password) async {
    try {
      final response = await Supabase.instance.client.auth.signInWithPassword(
        email: email,
        password: password,
      );

      final token = response.session?.accessToken;
      if (token != null) {
        await _storage.write(key: 'jwt_token', value: token);
      }
    } catch (e) {
      throw Exception('Failed to login: $e');
    }
  }

  Future<void> signup(String name, String email, String password, String role) async {
    try {
      final response = await Supabase.instance.client.auth.signUp(
        email: email,
        password: password,
        data: {
          'full_name': name,
          'role': role,
        },
      );

      final token = response.session?.accessToken;
      if (token != null) {
        await _storage.write(key: 'jwt_token', value: token);
      }
    } catch (e) {
      throw Exception('Failed to sign up: $e');
    }
  }

  Future<void> logout() async {
    await Supabase.instance.client.auth.signOut();
    await _storage.delete(key: 'jwt_token');
  }

  Future<bool> isAuthenticated() async {
    final token = await _storage.read(key: 'jwt_token');
    return token != null;
  }
}
