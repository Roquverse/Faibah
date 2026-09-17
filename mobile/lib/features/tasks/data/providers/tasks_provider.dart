import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/dio_provider.dart';
import '../../../schedule/data/providers/schedule_provider.dart';

class TasksNotifier extends AsyncNotifier<List<Map<String, dynamic>>> {
  @override
  Future<List<Map<String, dynamic>>> build() async {
    return _fetchTasks();
  }

  Future<List<Map<String, dynamic>>> _fetchTasks({String? assignedTo}) async {
    final dioClient = ref.read(dioClientProvider);
    final response = await dioClient.dio.get(
      '/tasks/project/all',
      queryParameters: assignedTo != null ? {'assignedTo': assignedTo} : null,
    );

    if (response.data is List) {
      return (response.data as List)
          .map((json) => json as Map<String, dynamic>)
          .toList();
    }
    return [];
  }

  Future<void> fetchTasks({String? assignedTo}) async {
    state = const AsyncValue.loading();
    try {
      final tasks = await _fetchTasks(assignedTo: assignedTo);
      state = AsyncValue.data(tasks);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<Map<String, dynamic>?> createTask(Map<String, dynamic> data) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.post('/tasks', data: data);
      if (response.statusCode == 201 || response.statusCode == 200) {
        final task = response.data as Map<String, dynamic>?;
        await fetchTasks();
        await ref.read(scheduleProvider.notifier).fetchEvents();
        return task;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<bool> updateTaskStatus(String id, String status) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.patch(
        '/tasks/$id/status',
        data: {'status': status},
      );
      if (response.statusCode == 200) {
        await fetchTasks();
        await ref.read(scheduleProvider.notifier).fetchEvents();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> assignMember(String taskId, String projectMemberId) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.post(
        '/tasks/$taskId/assign',
        data: {'projectMemberId': projectMemberId},
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  Future<List<Map<String, dynamic>>> fetchProjectMembers(
      String projectId) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.get('/projects/$projectId/members');
      if (response.data is List) {
        return (response.data as List).cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    return [];
  }

  Future<Map<String, dynamic>?> createScheduleEvent({
    required String projectId,
    required String title,
    String? description,
    required DateTime startTime,
    DateTime? endTime,
    String? linkedTaskId,
    String type = 'MEETING',
  }) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.post('/schedule-events', data: {
        'projectId': projectId,
        'title': title,
        if (description != null) 'description': description,
        'startTime': startTime.toIso8601String(),
        if (endTime != null) 'endTime': endTime.toIso8601String(),
        if (linkedTaskId != null) 'linkedTaskId': linkedTaskId,
        'type': type,
      });
      if (response.statusCode == 201 || response.statusCode == 200) {
        ref.invalidate(scheduleProvider);
        return response.data as Map<String, dynamic>?;
      }
    } catch (_) {}
    return null;
  }
}

final tasksProvider =
    AsyncNotifierProvider<TasksNotifier, List<Map<String, dynamic>>>(() {
  return TasksNotifier();
});
