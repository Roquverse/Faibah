import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/dio_provider.dart';
import '../models/schedule_event_model.dart';
import '../../../tasks/data/providers/tasks_provider.dart';

class ScheduleNotifier extends AsyncNotifier<List<ScheduleEventModel>> {
  @override
  Future<List<ScheduleEventModel>> build() async {
    return _fetchEvents();
  }

  Future<List<ScheduleEventModel>> _fetchEvents({String? projectId}) async {
    final dioClient = ref.read(dioClientProvider);
    final response = await dioClient.dio.get(
      '/schedule-events',
      queryParameters: projectId != null ? {'projectId': projectId} : null,
    );

    if (response.data is List) {
      return (response.data as List)
          .map((json) =>
              ScheduleEventModel.fromJson(json as Map<String, dynamic>))
          .toList();
    }
    return [];
  }

  Future<void> fetchEvents({String? projectId}) async {
    state = const AsyncValue.loading();
    try {
      final events = await _fetchEvents(projectId: projectId);
      state = AsyncValue.data(events);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> createEvent(ScheduleEventModel event) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.post(
        '/schedule-events',
        data: event.toCreateJson(),
      );
      if (response.statusCode == 201 || response.statusCode == 200) {
        await fetchEvents();
        ref.invalidate(tasksProvider);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> updateEvent(String id, ScheduleEventModel event) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.patch(
        '/schedule-events/$id',
        data: event.toUpdateJson(),
      );
      if (response.statusCode == 200) {
        await fetchEvents();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteEvent(String id) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.delete('/schedule-events/$id');
      if (response.statusCode == 200 || response.statusCode == 204) {
        await fetchEvents();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}

final scheduleProvider =
    AsyncNotifierProvider<ScheduleNotifier, List<ScheduleEventModel>>(() {
  return ScheduleNotifier();
});
