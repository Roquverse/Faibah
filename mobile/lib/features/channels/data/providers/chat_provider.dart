import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../../../../core/providers/dio_provider.dart';

class ChatNotifier extends StateNotifier<AsyncValue<List<Map<String, dynamic>>>> {
  final Ref ref;
  final String projectId;
  IO.Socket? _socket;

  ChatNotifier(this.ref, this.projectId) : super(const AsyncValue.loading()) {
    _init();
  }

  Future<void> _init() async {
    await fetchMessages();
    _connectSocket();
  }

  void _connectSocket() {
    // Hardcoded production URL as per dio_client.dart
    final String baseUrl = 'https://backend.faibah.com';

    _socket = IO.io(baseUrl, IO.OptionBuilder()
        .setTransports(['websocket'])
        .disableAutoConnect()
        .build());

    _socket?.connect();

    _socket?.onConnect((_) {
      print('Connected to Socket.IO for chat');
      _socket?.emit('joinProject', projectId);
    });

    _socket?.on('new_message', (data) {
      if (data != null && data is Map<String, dynamic>) {
        _handleIncomingMessage(data);
      }
    });

    _socket?.onDisconnect((_) => print('Disconnected from Socket.IO'));
  }

  void _handleIncomingMessage(Map<String, dynamic> data) {
    if (state is AsyncData) {
      final currentList = state.value!;
      // Prevent duplicates
      final exists = currentList.any((msg) => msg['id'] == data['id']);
      if (!exists) {
        state = AsyncValue.data([...currentList, data]);
      }
    }
  }

  Future<void> fetchMessages() async {
    try {
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
          
          state = AsyncValue.data(messages);
        } else {
          state = const AsyncValue.data([]);
        }
      } else {
        state = const AsyncValue.data([]);
      }
    } catch (e, st) {
      print('Fetch messages error: $e');
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) return;

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
      print('Failed to send message: $e');
    }
  }

  @override
  void dispose() {
    _socket?.emit('leaveProject', projectId);
    _socket?.disconnect();
    _socket?.dispose();
    super.dispose();
  }
}

final chatProviderFamily = StateNotifierProvider.family<ChatNotifier, AsyncValue<List<Map<String, dynamic>>>, String>((ref, projectId) {
  return ChatNotifier(ref, projectId);
});
