import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/dio_provider.dart';

class ProjectsNotifier extends AsyncNotifier<List<Map<String, dynamic>>> {
  @override
  Future<List<Map<String, dynamic>>> build() async {
    return _fetchProjects();
  }

  Future<List<Map<String, dynamic>>> _fetchProjects() async {
    final dioClient = ref.read(dioClientProvider);
    final response = await dioClient.dio.get('/projects');
    
    if (response.data is List) {
      final List<dynamic> data = response.data;
      return data.map((json) => json as Map<String, dynamic>).toList();
    }
    return [];
  }

  Future<void> fetchProjects() async {
    state = const AsyncValue.loading();
    try {
      final projects = await _fetchProjects();
      state = AsyncValue.data(projects);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> createProject(Map<String, dynamic> data) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.post('/projects', data: data);
      if (response.statusCode == 201 || response.statusCode == 200) {
        await fetchProjects();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to create project: $e');
      return false;
    }
  }

  Future<bool> updateProjectStatus(String id, String status) async {
    // Map UI statuses to backend statuses
    String backendStatus = status;
    if (status == 'AWAITING PAYMENT') {
      backendStatus = 'AWAITING_PAYMENT';
    }

    // Optimistically update UI
    final currentState = state.value ?? [];
    final updatedList = currentState.map((project) {
      if (project['id'] == id) {
        return {...project, 'status': backendStatus};
      }
      return project;
    }).toList();
    state = AsyncValue.data(updatedList);

    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.patch('/projects/$id/status', data: {'status': backendStatus});
      if (response.statusCode == 200) {
        return true;
      }
      // Revert if failed
      await fetchProjects();
      return false;
    } catch (e) {
      print('Failed to update project status: $e');
      // Revert if failed
      await fetchProjects();
      return false;
    }
  }
}

final projectsProvider = AsyncNotifierProvider<ProjectsNotifier, List<Map<String, dynamic>>>(() {
  return ProjectsNotifier();
});
