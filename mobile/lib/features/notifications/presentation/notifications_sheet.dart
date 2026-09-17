import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../data/models/notification_item.dart';
import '../data/providers/notifications_provider.dart';
import '../../channels/presentation/chat_screen.dart';

class NotificationsSheet extends ConsumerStatefulWidget {
  const NotificationsSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const NotificationsSheet(),
    );
  }

  @override
  ConsumerState<NotificationsSheet> createState() => _NotificationsSheetState();
}

class _NotificationsSheetState extends ConsumerState<NotificationsSheet> {
  final Set<String> _loadingIds = {};
  int _selectedFilterIndex = 0; // 0 = All, 1 = Unread

  String _formatHumanTime(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${months[dt.month - 1]} ${dt.day}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final notificationsAsync = ref.watch(notificationsProvider);
    final unreadCount = ref.watch(unreadNotificationsCountProvider);

    final bg = isDark ? const Color(0xFF141414) : Colors.white;
    final textPrimary = isDark ? Colors.white : const Color(0xFF101828);
    final textSecondary = isDark ? Colors.white60 : const Color(0xFF667085);
    final dividerColor = isDark ? Colors.white10 : const Color(0xFFEAECF0);

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
        minHeight: MediaQuery.of(context).size.height * 0.45,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          const SizedBox(height: 12),
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? Colors.white24 : const Color(0xFFD0D5DD),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                Text(
                  'Notifications',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.5,
                    color: textPrimary,
                  ),
                ),
                if (unreadCount > 0) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF2C2C2E) : const Color(0xFFF2F4F7),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isDark ? Colors.white10 : const Color(0xFFE4E7EC),
                      ),
                    ),
                    child: Text(
                      '$unreadCount',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: isDark ? Colors.white70 : const Color(0xFF344054),
                      ),
                    ),
                  ),
                ],
                const Spacer(),
                if (unreadCount > 0)
                  InkWell(
                    onTap: () {
                      ref.read(notificationsProvider.notifier).markAllAsRead();
                    },
                    borderRadius: BorderRadius.circular(8),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                      child: Row(
                        children: [
                          Icon(
                            Icons.done_all_rounded,
                            size: 16,
                            color: isDark ? Colors.white60 : const Color(0xFF475467),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Mark all read',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: isDark ? Colors.white60 : const Color(0xFF475467),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                const SizedBox(width: 4),
                IconButton(
                  icon: Icon(
                    Icons.close_rounded,
                    size: 20,
                    color: isDark ? Colors.white60 : const Color(0xFF667085),
                  ),
                  onPressed: () => Navigator.pop(context),
                  padding: const EdgeInsets.all(6),
                  constraints: const BoxConstraints(),
                  splashRadius: 18,
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Human Segmented Filter (All vs Unread)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Container(
              height: 36,
              padding: const EdgeInsets.all(3),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF2F4F7),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedFilterIndex = 0),
                      behavior: HitTestBehavior.opaque,
                      child: Container(
                        decoration: BoxDecoration(
                          color: _selectedFilterIndex == 0
                              ? (isDark ? const Color(0xFF2C2C2E) : Colors.white)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: _selectedFilterIndex == 0
                              ? [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.04),
                                    blurRadius: 4,
                                    offset: const Offset(0, 1),
                                  )
                                ]
                              : null,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          'All',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: _selectedFilterIndex == 0
                                ? FontWeight.w600
                                : FontWeight.w500,
                            color: _selectedFilterIndex == 0
                                ? textPrimary
                                : textSecondary,
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedFilterIndex = 1),
                      behavior: HitTestBehavior.opaque,
                      child: Container(
                        decoration: BoxDecoration(
                          color: _selectedFilterIndex == 1
                              ? (isDark ? const Color(0xFF2C2C2E) : Colors.white)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: _selectedFilterIndex == 1
                              ? [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.04),
                                    blurRadius: 4,
                                    offset: const Offset(0, 1),
                                  )
                                ]
                              : null,
                        ),
                        alignment: Alignment.center,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Unread',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: _selectedFilterIndex == 1
                                    ? FontWeight.w600
                                    : FontWeight.w500,
                                color: _selectedFilterIndex == 1
                                    ? textPrimary
                                    : textSecondary,
                              ),
                            ),
                            if (unreadCount > 0) ...[
                              const SizedBox(width: 6),
                              Container(
                                width: 6,
                                height: 6,
                                decoration: const BoxDecoration(
                                  color: Color(0xFF10B981),
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Divider(height: 1, color: dividerColor),

          // Notification List
          Expanded(
            child: notificationsAsync.when(
              loading: () => const Center(
                child: SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    color: Color(0xFF10B981),
                  ),
                ),
              ),
              error: (err, _) => Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.cloud_off_rounded, size: 36, color: textSecondary),
                    const SizedBox(height: 8),
                    Text(
                      'Couldn\'t load notifications',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: () =>
                          ref.read(notificationsProvider.notifier).refresh(),
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8)),
                      ),
                      child: const Text('Try again'),
                    ),
                  ],
                ),
              ),
              data: (allItems) {
                final items = _selectedFilterIndex == 1
                    ? allItems.where((n) => !n.isRead).toList()
                    : allItems;

                if (items.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 32),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 64,
                            height: 64,
                            decoration: BoxDecoration(
                              color: isDark
                                  ? Colors.white.withValues(alpha: 0.05)
                                  : const Color(0xFFF2F4F7),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.notifications_off_outlined,
                              size: 28,
                              color: isDark ? Colors.white38 : const Color(0xFF98A2B3),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _selectedFilterIndex == 1
                                ? 'No unread notifications'
                                : 'All caught up',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: textPrimary,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            _selectedFilterIndex == 1
                                ? 'You\'ve read all your notifications.'
                                : 'No new notifications right now. Check back later for updates.',
                            style: TextStyle(
                              fontSize: 13,
                              color: textSecondary,
                              height: 1.4,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  );
                }

                return RefreshIndicator(
                  color: const Color(0xFF10B981),
                  onRefresh: () =>
                      ref.read(notificationsProvider.notifier).refresh(),
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return _buildHumanNotificationCard(
                        context: context,
                        item: item,
                        textPrimary: textPrimary,
                        textSecondary: textSecondary,
                        isDark: isDark,
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHumanNotificationCard({
    required BuildContext context,
    required NotificationItem item,
    required Color textPrimary,
    required Color textSecondary,
    required bool isDark,
  }) {
    IconData iconData;
    Color iconColor;
    Color iconBg;
    String badgeLabel;

    switch (item.type) {
      case NotificationType.invitation:
        iconData = Icons.person_add_alt_1_rounded;
        iconColor = const Color(0xFF027A48);
        iconBg = isDark ? const Color(0xFF122E22) : const Color(0xFFECFDF3);
        badgeLabel = 'INVITATION';
        break;
      case NotificationType.reminder:
        iconData = Icons.notifications_active_outlined;
        iconColor = const Color(0xFFB54708);
        iconBg = isDark ? const Color(0xFF2E2413) : const Color(0xFFFEF0C7);
        badgeLabel = 'REMINDER';
        break;
      case NotificationType.channelActivity:
        iconData = Icons.tag_rounded;
        iconColor = const Color(0xFF175CD3);
        iconBg = isDark ? const Color(0xFF17283C) : const Color(0xFFEFF8FF);
        badgeLabel = item.data != null && item.data!['name'] != null
            ? '#${item.data!['name']}'
            : 'CHANNEL';
        break;
      case NotificationType.general:
        iconData = Icons.info_outline_rounded;
        iconColor = const Color(0xFF475467);
        iconBg = isDark ? const Color(0xFF262626) : const Color(0xFFF2F4F7);
        badgeLabel = 'UPDATE';
        break;
    }

    final isProcessing = _loadingIds.contains(item.id);

    // Card background: Clean card with subtle shadow and border, no loud borders
    final cardBg = !item.isRead
        ? (isDark ? const Color(0xFF1A1D21) : const Color(0xFFFBFBFB))
        : (isDark ? const Color(0xFF141414) : Colors.white);

    final cardBorder = !item.isRead
        ? (isDark ? Colors.white12 : const Color(0xFFE4E7EC))
        : (isDark ? Colors.white10 : const Color(0xFFF2F4F7));

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          ref.read(notificationsProvider.notifier).markAsRead(item.id);
          if (item.type == NotificationType.channelActivity && item.data != null) {
            Navigator.pop(context);
            final ch = item.data!;
            final projectId = ch['projectId']?.toString() ??
                (ch['project'] as Map?)?['id']?.toString() ??
                '';
            final channelName = ch['name']?.toString() ?? 'general';
            if (projectId.isNotEmpty) {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => ChatScreen(
                    channelId: projectId,
                    channelName: channelName,
                  ),
                ),
              );
            }
          }
        },
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: cardBorder, width: 1),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.02),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Icon Squircle
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: iconBg,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(iconData, size: 18, color: iconColor),
              ),
              const SizedBox(width: 12),

              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top row: Tag chip + Time ago
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: iconBg,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            badgeLabel,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: iconColor,
                              letterSpacing: 0.2,
                            ),
                          ),
                        ),
                        const Spacer(),
                        Text(
                          _formatHumanTime(item.createdAt),
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: textSecondary,
                          ),
                        ),
                        if (!item.isRead) ...[
                          const SizedBox(width: 6),
                          Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: Color(0xFF10B981),
                              shape: BoxShape.circle,
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Title
                    Text(
                      item.title,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: !item.isRead ? FontWeight.w600 : FontWeight.w500,
                        color: textPrimary,
                        letterSpacing: -0.2,
                      ),
                    ),
                    const SizedBox(height: 3),

                    // Description / Project context
                    Text(
                      item.description,
                      style: TextStyle(
                        fontSize: 12.5,
                        color: textSecondary,
                        height: 1.35,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),

                    // Actions for invitations
                    if (item.type == NotificationType.invitation &&
                        item.data != null) ...[
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          if (isProcessing)
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 16),
                              child: SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Color(0xFF10B981),
                                ),
                              ),
                            )
                          else ...[
                            TextButton(
                              onPressed: () async {
                                final memberId =
                                    item.data!['id']?.toString() ?? '';
                                setState(() => _loadingIds.add(item.id));
                                final success = await ref
                                    .read(notificationsProvider.notifier)
                                    .declineInvitation(memberId);
                                if (context.mounted) {
                                  setState(() => _loadingIds.remove(item.id));
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(success
                                          ? 'Invitation declined'
                                          : 'Failed to decline'),
                                    ),
                                  );
                                }
                              },
                              style: TextButton.styleFrom(
                                foregroundColor: textSecondary,
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 6),
                                visualDensity: VisualDensity.compact,
                              ),
                              child: const Text('Decline',
                                  style: TextStyle(fontSize: 12)),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton(
                              onPressed: () async {
                                final memberId =
                                    item.data!['id']?.toString() ?? '';
                                setState(() => _loadingIds.add(item.id));
                                final success = await ref
                                    .read(notificationsProvider.notifier)
                                    .acceptInvitation(memberId);
                                if (context.mounted) {
                                  setState(() => _loadingIds.remove(item.id));
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(success
                                          ? 'Invitation accepted'
                                          : 'Failed to accept'),
                                    ),
                                  );
                                }
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: isDark
                                    ? Colors.white
                                    : const Color(0xFF0C3B2E),
                                foregroundColor:
                                    isDark ? Colors.black : Colors.white,
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 14, vertical: 6),
                                visualDensity: VisualDensity.compact,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: const Text(
                                'Accept',
                                style: TextStyle(
                                    fontSize: 12, fontWeight: FontWeight.w600),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
