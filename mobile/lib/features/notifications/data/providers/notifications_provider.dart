import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/dio_provider.dart';
import '../../../projects/data/providers/projects_provider.dart';
import '../models/notification_item.dart';

class NotificationsNotifier extends AsyncNotifier<List<NotificationItem>> {
  final Set<String> _readIds = {};

  @override
  Future<List<NotificationItem>> build() async {
    return _fetchAllNotifications();
  }

  Future<List<NotificationItem>> _fetchAllNotifications() async {
    final dioClient = ref.read(dioClientProvider);
    final List<NotificationItem> items = [];

    // 1. Fetch pending invitations
    try {
      final invResponse = await dioClient.dio.get('/projects/invitations/pending');
      if (invResponse.data is List) {
        for (final inv in invResponse.data) {
          final project = inv['project'] as Map<String, dynamic>?;
          final projectName = project?['name'] ?? 'Project';
          final client = project?['client'] as Map<String, dynamic>?;
          final clientName = client?['name'];

          final id = 'inv-${inv['id']}';
          items.add(
            NotificationItem(
              id: id,
              title: 'Team invitation',
              description: clientName != null
                  ? '$clientName invited you to join "$projectName".'
                  : 'You have been invited to collaborate on "$projectName".',
              type: NotificationType.invitation,
              createdAt: DateTime.tryParse(inv['createdAt']?.toString() ?? '') ?? DateTime.now(),
              isRead: _readIds.contains(id),
              data: inv is Map<String, dynamic> ? inv : null,
            ),
          );
        }
      }
    } catch (_) {}

    // 2. Fetch reminders from company overview
    try {
      final overviewResponse = await dioClient.dio.get('/company/overview');
      if (overviewResponse.data is Map<String, dynamic>) {
        final reminders = overviewResponse.data['reminders'] as List?;
        if (reminders != null) {
          for (final rem in reminders) {
            final id = 'rem-${rem['id']}';
            items.add(
              NotificationItem(
                id: id,
                title: rem['title']?.toString() ?? 'Reminder',
                description: rem['description']?.toString() ?? 'Upcoming schedule reminder',
                type: NotificationType.reminder,
                createdAt: DateTime.tryParse(rem['createdAt']?.toString() ?? '') ?? DateTime.now(),
                isRead: _readIds.contains(id),
                data: rem is Map<String, dynamic> ? rem : null,
              ),
            );
          }
        }
      }
    } catch (_) {}

    // 3. Fetch channel activities
    try {
      final channelsResponse = await dioClient.dio.get('/channels');
      if (channelsResponse.data is List) {
        for (final ch in channelsResponse.data.take(5)) {
          final count = ch['_count']?['messages'];
          if (count != null && count > 0) {
            final id = 'ch-${ch['id']}';
            final name = ch['name'] ?? 'general';
            final projectName = ch['project']?['name'] ?? 'Project';
            items.add(
              NotificationItem(
                id: id,
                title: 'New messages in #$name',
                description: projectName,
                type: NotificationType.channelActivity,
                createdAt: DateTime.tryParse(ch['updatedAt']?.toString() ?? ch['createdAt']?.toString() ?? '') ?? DateTime.now(),
                isRead: _readIds.contains(id),
                data: ch is Map<String, dynamic> ? ch : null,
              ),
            );
          }
        }
      }
    } catch (_) {}

    // Sort descending by created date
    items.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return items;
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    try {
      final items = await _fetchAllNotifications();
      state = AsyncValue.data(items);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void markAsRead(String id) {
    _readIds.add(id);
    final current = state.value ?? [];
    state = AsyncValue.data(
      current.map((item) => item.id == id ? item.copyWith(isRead: true) : item).toList(),
    );
  }

  void markAllAsRead() {
    final current = state.value ?? [];
    for (final item in current) {
      _readIds.add(item.id);
    }
    state = AsyncValue.data(
      current.map((item) => item.copyWith(isRead: true)).toList(),
    );
  }

  Future<bool> acceptInvitation(String memberId) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.patch('/projects/invitations/$memberId/accept');
      if (response.statusCode == 200) {
        _readIds.add('inv-$memberId');
        // Invalidate projects list to reflect new membership
        ref.invalidate(projectsProvider);
        await refresh();
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  Future<bool> declineInvitation(String memberId) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.delete('/projects/invitations/$memberId/decline');
      if (response.statusCode == 200) {
        await refresh();
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }
}

final notificationsProvider =
    AsyncNotifierProvider<NotificationsNotifier, List<NotificationItem>>(() {
  return NotificationsNotifier();
});

final unreadNotificationsCountProvider = Provider<int>((ref) {
  final notifs = ref.watch(notificationsProvider).value ?? [];
  return notifs.where((n) => !n.isRead).length;
});
