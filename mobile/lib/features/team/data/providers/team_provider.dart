import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/dio_provider.dart';

class TeamNotifier extends AsyncNotifier<List<Map<String, dynamic>>> {
  @override
  Future<List<Map<String, dynamic>>> build() async {
    return _fetchTeam();
  }

  Future<List<Map<String, dynamic>>> _fetchTeam() async {
    final dioClient = ref.read(dioClientProvider);
    final response = await dioClient.dio.get('/company/team');

    if (response.data is List) {
      return (response.data as List)
          .map((json) => json as Map<String, dynamic>)
          .toList();
    }
    return [];
  }

  Future<void> fetchTeam() async {
    state = const AsyncValue.loading();
    try {
      final team = await _fetchTeam();
      state = AsyncValue.data(team);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> inviteMember({
    required String email,
    required String role,
  }) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.post(
        '/company/team/invite',
        data: {'email': email, 'role': role},
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        await fetchTeam();
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }
}

final teamProvider =
    AsyncNotifierProvider<TeamNotifier, List<Map<String, dynamic>>>(() {
  return TeamNotifier();
});
