import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../auth/data/auth_repository.dart';

final overviewRepositoryProvider = Provider((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return OverviewRepository(dioClient.dio);
});

class OverviewRepository {
  final Dio _dio;

  OverviewRepository(this._dio);

  Future<Map<String, dynamic>> getOverview() async {
    try {
      final response = await _dio.get('/company/overview');
      return response.data as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Failed to fetch overview: $e');
    }
  }
}
