import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../../../../core/providers/dio_provider.dart';

class ChatNotifier extends AsyncNotifier<List<Map<String, dynamic>>> {
  IO.Socket? _socket;
  String? _currentProjectId;

  @override
  Future<List<Map<String, dynamic>>> build() async {
    ref.onDispose(() {
      _disconnectSocket();
    });
    return [];
  }

  void _disconnectSocket() {
    if (_currentProjectId != null) {
      _socket?.emit('leaveProject', _currentProjectId);
    }
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }

  Future<void> initChannel(String projectId) async {
    if (_currentProjectId == projectId && _socket?.connected == true) {
      return; // Already initialized for this project
    }

    _disconnectSocket();
    _currentProjectId = projectId;
    state = const AsyncValue.loading();

    try {
      final messages = await _fetchMessages(projectId);
      state = AsyncValue.data(messages);
      _connectSocket(projectId);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void _connectSocket(String projectId) {
    // Hardcoded production URL as per dio_client.dart
    final String baseUrl = 'https://backend.faibah.com';

    _socket = IO.io(baseUrl, IO.OptionBuilder()
        .setTransports(['websocket'])
        .disableAutoConnect()
        .build());

    _socket?.connect();

    _socket?.onConnect((_) {
      _socket?.emit('joinProject', projectId);
    });

    _socket?.on('new_message', (data) {
      if (data != null && data is Map<String, dynamic>) {
        _handleIncomingMessage(data);
      }
    });
  }

  void _handleIncomingMessage(Map<String, dynamic> data) {
    if (state is AsyncData) {
      final currentList = state.value ?? [];
      // Prevent duplicates
      final exists = currentList.any((msg) => msg['id'] == data['id']);
      if (!exists) {
        state = AsyncValue.data([...currentList, data]);
      }
    }
  }

  Future<List<Map<String, dynamic>>> _fetchMessages(String projectId) async {
    final dioClient = ref.read(dioClientProvider);
    final response = await dioClient.dio.get('/projects/$projectId/channel');
    
    if (response.statusCode == 200 && response.data != null) {
      final data = response.data;
      if (data['messages'] is List) {
        final List<dynamic> rawMessages = data['messages'];
        final messages = rawMessages.map((m) => m as Map<String, dynamic>).toList();
        
        // Sort messages by createdAt if present
        messages.sort((a, b) {
          final aTime = DateTime.tryParse(a['createdAt'] ?? '') ?? DateTime.fromMillisecondsSinceEpoch(0);
          final bTime = DateTime.tryParse(b['createdAt'] ?? '') ?? DateTime.fromMillisecondsSinceEpoch(0);
          return aTime.compareTo(bTime);
        });
        
        return messages;
      }
    }
    return [];
  }

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty || _currentProjectId == null) return;

    final projectId = _currentProjectId!;
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.post(
        '/projects/$projectId/channel/messages',
        data: {
          'content': text,
        },
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final newMessage = response.data;
        if (newMessage != null) {
          _handleIncomingMessage(newMessage as Map<String, dynamic>);
        }
      }
    } catch (e) {
      // Handle error implicitly
    }
  }
}

final chatProvider = AsyncNotifierProvider<ChatNotifier, List<Map<String, dynamic>>>(() {
  return ChatNotifier();
});
