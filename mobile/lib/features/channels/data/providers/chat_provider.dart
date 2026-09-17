import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/providers/dio_provider.dart';

class ChatNotifier extends AsyncNotifier<List<Map<String, dynamic>>> {
  IO.Socket? _socket;
  String? _currentProjectId;
  String? _currentChannelName;
  Map<String, dynamic>? _channelData;
  List<Map<String, dynamic>> _members = [];

  Map<String, dynamic>? get channelData => _channelData;
  List<Map<String, dynamic>> get members => _members;
  String? get currentProjectId => _currentProjectId;
  String? get currentChannelName => _currentChannelName;

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

  Future<void> initChannel(String projectId,
      {String channelName = 'general'}) async {
    if (_currentProjectId == projectId &&
        _currentChannelName == channelName &&
        _socket?.connected == true &&
        state.hasValue) {
      return;
    }

    _disconnectSocket();
    _currentProjectId = projectId;
    _currentChannelName = channelName;
    state = const AsyncValue.loading();

    try {
      final result = await _fetchChannel(projectId, channelName);
      _channelData = result['channel'] as Map<String, dynamic>?;
      _members = (result['members'] as List?)
              ?.map((m) => m as Map<String, dynamic>)
              .toList() ??
          [];
      state = AsyncValue.data(
          (result['messages'] as List?)?.cast<Map<String, dynamic>>() ?? []);
      _connectSocket(projectId);
    } on DioException catch (e, st) {
      final responseData = e.response?.data;
      final errorMsg = responseData is Map && responseData['message'] != null
          ? responseData['message']
          : e.toString();
      state = AsyncValue.error('Backend Error: $errorMsg', st);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void _connectSocket(String projectId) {
    const baseUrl = 'https://backend.faibah.com';

    _socket = IO.io(
        baseUrl,
        IO.OptionBuilder()
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
      final exists = currentList.any((msg) => msg['id'] == data['id']);
      if (!exists) {
        state = AsyncValue.data([...currentList, data]);
      }
    }
  }

  Future<Map<String, dynamic>> _fetchChannel(
      String projectId, String channelName) async {
    final dioClient = ref.read(dioClientProvider);

    final channelRes = await dioClient.dio.get(
      '/projects/$projectId/channel',
      queryParameters: {'channel': channelName},
    );

    List<Map<String, dynamic>> messages = [];
    Map<String, dynamic>? channel;

    if (channelRes.data != null) {
      channel = channelRes.data as Map<String, dynamic>;
      if (channel['messages'] is List) {
        messages = (channel['messages'] as List)
            .map((m) => m as Map<String, dynamic>)
            .toList();
        messages.sort((a, b) {
          final aTime = DateTime.tryParse(a['createdAt']?.toString() ?? '') ??
              DateTime.fromMillisecondsSinceEpoch(0);
          final bTime = DateTime.tryParse(b['createdAt']?.toString() ?? '') ??
              DateTime.fromMillisecondsSinceEpoch(0);
          return aTime.compareTo(bTime);
        });
      }
    }

    List<Map<String, dynamic>> members = [];
    try {
      final membersRes = await dioClient.dio.get('/projects/$projectId/members');
      if (membersRes.data is List) {
        members = (membersRes.data as List)
            .map((m) => m as Map<String, dynamic>)
            .toList();
      }
    } catch (_) {}

    return {
      'channel': channel ?? {},
      'messages': messages,
      'members': members,
    };
  }

  String resolveSenderName(Map<String, dynamic> message) {
    final senderId = message['senderId']?.toString();
    if (senderId != null) {
      for (final member in _members) {
        final user = member['user'] as Map<String, dynamic>?;
        if (user?['id']?.toString() == senderId) {
          final first = user?['firstName']?.toString() ?? '';
          final last = user?['lastName']?.toString() ?? '';
          final name = '$first $last'.trim();
          if (name.isNotEmpty) return name;
        }
        final contact = member['clientContact'] as Map<String, dynamic>?;
        if (contact?['id']?.toString() == senderId ||
            contact?['email']?.toString() == senderId) {
          return contact?['name']?.toString() ?? 'Client';
        }
      }
    }
    return message['senderType'] == 'TEAM' ? 'Team Member' : 'Client';
  }

  /// Returns the avatar URL for the sender of a message, or null if not found.
  String? resolveSenderAvatar(Map<String, dynamic> message) {
    final senderId = message['senderId']?.toString();
    if (senderId == null) return null;
    for (final member in _members) {
      final user = member['user'] as Map<String, dynamic>?;
      if (user?['id']?.toString() == senderId) {
        return user?['avatarUrl']?.toString();
      }
    }
    return null;
  }

  Future<void> sendMessage(String text,
      {String? attachmentUrl, String? messageType}) async {
    final hasText = text.trim().isNotEmpty;
    final hasAttachment = attachmentUrl != null && attachmentUrl.isNotEmpty;
    if ((!hasText && !hasAttachment) || _currentProjectId == null) return;

    final projectId = _currentProjectId!;
    try {
      final currentUserId = Supabase.instance.client.auth.currentUser?.id;
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.post(
        '/projects/$projectId/channel/messages',
        data: {
          'content': hasText ? text : 'Shared an attachment',
          'channelName': _currentChannelName ?? 'general',
          'senderId': currentUserId ?? 'SYS',
          'senderType': 'TEAM',
          if (attachmentUrl != null) 'attachmentUrl': attachmentUrl,
          if (messageType != null) 'messageType': messageType,
        },
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final newMessage = response.data;
        if (newMessage != null) {
          _handleIncomingMessage(newMessage as Map<String, dynamic>);
        }
      }
    } catch (_) {}
  }
}

final chatProvider =
    AsyncNotifierProvider<ChatNotifier, List<Map<String, dynamic>>>(() {
  return ChatNotifier();
});

typedef ChannelDetailParams = ({String projectId, String channelName});

final channelDetailProvider = FutureProvider.autoDispose
    .family<Map<String, dynamic>, ChannelDetailParams>((ref, params) async {
  final dioClient = ref.read(dioClientProvider);

  final results = await Future.wait([
    dioClient.dio.get(
      '/projects/${params.projectId}/channel',
      queryParameters: {'channel': params.channelName},
    ),
    dioClient.dio.get('/projects/${params.projectId}/members'),
    dioClient.dio.get('/projects/${params.projectId}'),
  ]);

  final channelData = results[0].data as Map<String, dynamic>? ?? {};
  final members = results[1].data is List
      ? (results[1].data as List).cast<Map<String, dynamic>>()
      : <Map<String, dynamic>>[];
  final projectData = results[2].data as Map<String, dynamic>? ?? {};

  final messages = channelData['messages'] is List
      ? (channelData['messages'] as List).cast<Map<String, dynamic>>()
      : <Map<String, dynamic>>[];

  return {
    'channel': channelData,
    'members': members,
    'project': projectData,
    'messages': messages,
  };
});

class ChannelPinsStorage {
  static const _boxName = 'channel_prefs';

  static Future<List<String>> getPinnedIds(String channelId) async {
    final box = await Hive.openBox(_boxName);
    return List<String>.from(box.get('pinned_$channelId', defaultValue: []));
  }

  static Future<void> savePinnedIds(
      String channelId, List<String> ids) async {
    final box = await Hive.openBox(_boxName);
    await box.put('pinned_$channelId', ids);
  }
}
