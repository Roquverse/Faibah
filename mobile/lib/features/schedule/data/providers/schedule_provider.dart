import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../models/schedule_event_model.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final secureStorageProvider = Provider((ref) => const FlutterSecureStorage());

final dioClientProvider = Provider((ref) {
  final storage = ref.watch(secureStorageProvider);
  return DioClient(storage);
});

class ScheduleNotifier extends AsyncNotifier<List<ScheduleEventModel>> {
  @override
  Future<List<ScheduleEventModel>> build() async {
    return _fetchEvents();
  }

  Future<List<ScheduleEventModel>> _fetchEvents() async {
    final dioClient = ref.read(dioClientProvider);
    final response = await dioClient.dio.get('/appointments');
    
    if (response.data is List) {
      final List<dynamic> data = response.data;
      return data.map((json) => ScheduleEventModel.fromJson(json)).toList();
    }
    return [];
  }

  Future<void> fetchEvents() async {
    state = const AsyncValue.loading();
    try {
      final events = await _fetchEvents();
      state = AsyncValue.data(events);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> createAppointment(ScheduleEventModel event) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.post('/appointments', data: event.toJson());
      if (response.statusCode == 201 || response.statusCode == 200) {
        await fetchEvents();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to create appointment: $e');
      return false;
    }
  }

  Future<bool> updateAppointment(String id, ScheduleEventModel event) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.patch('/appointments/$id', data: event.toJson());
      if (response.statusCode == 200) {
        await fetchEvents();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to update appointment: $e');
      return false;
    }
  }

  Future<bool> deleteAppointment(String id) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.delete('/appointments/$id');
      if (response.statusCode == 200 || response.statusCode == 204) {
        await fetchEvents();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to delete appointment: $e');
      return false;
    }
  }
}

final scheduleProvider = AsyncNotifierProvider<ScheduleNotifier, List<ScheduleEventModel>>(() {
  return ScheduleNotifier();
});
