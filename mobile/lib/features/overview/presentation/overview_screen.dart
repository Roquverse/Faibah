import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/theme_provider.dart';
import 'providers/overview_provider.dart';

class OverviewScreen extends ConsumerStatefulWidget {
  const OverviewScreen({super.key});

  @override
  ConsumerState<OverviewScreen> createState() => _OverviewScreenState();
}

class _OverviewScreenState extends ConsumerState<OverviewScreen> {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark || (themeMode == ThemeMode.system && MediaQuery.of(context).platformBrightness == Brightness.dark);
    final overviewAsync = ref.watch(overviewProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Overview'),
        actions: [
          IconButton(
            icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode),
            onPressed: () {
              ref.read(themeModeProvider.notifier).setTheme(isDark ? ThemeMode.light : ThemeMode.dark);
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: Color(0xFFBB8A52),
              child: Text(
                'CO',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          )
        ],
      ),
      body: overviewAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (data) {
          final activeProjects = data['activeProjects']?.toString() ?? '0';
          final pendingTasks = data['reminders']?.length.toString() ?? '0'; // Using reminders as proxy for tasks
          final unreadMessages = data['unreadMessages']?.toString() ?? '0'; // Not available in backend yet
          
          final revenue = (data['totalRevenue'] ?? 0) as num;
          final formatCurrency = NumberFormat.compactCurrency(symbol: '₦', decimalDigits: 0);
          final outstandingStr = formatCurrency.format(revenue);

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(overviewProvider);
            },
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Attention Strip
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary.withOpacity(0.1),
                      border: Border.all(color: theme.colorScheme.primary.withOpacity(0.3)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.info_outline, color: theme.colorScheme.primary),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Invoice INV-003 is overdue by 2 days.', // Keep hardcoded or map to real reminders
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: theme.colorScheme.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // KPI Snapshot Grid
                  Row(
                    children: [
                      Expanded(
                        child: _buildKPICard(
                          context,
                          'Active Projects',
                          activeProjects,
                          Icons.folder_outlined,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _buildKPICard(
                          context,
                          'Pending Tasks',
                          pendingTasks,
                          Icons.task_alt_outlined,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: _buildKPICard(
                          context,
                          'Unread Messages',
                          unreadMessages,
                          Icons.chat_bubble_outline,
                          color: theme.colorScheme.secondary,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _buildKPICard(
                          context,
                          'Outstanding',
                          outstandingStr,
                          Icons.account_balance_wallet_outlined,
                          color: theme.colorScheme.error,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Activity Feed
                  Text(
                    'Recent Activity',
                    style: theme.textTheme.titleLarge,
                  ),
                  const SizedBox(height: 16),
                  if (data['reminders'] != null && (data['reminders'] as List).isNotEmpty)
                    ...(data['reminders'] as List).map((reminder) {
                      return _buildActivityItem(
                        context,
                        reminder['title'] ?? 'New Reminder',
                        reminder['dueDate'] != null ? DateFormat.yMMMd().format(DateTime.parse(reminder['dueDate'])) : 'Pending',
                        Icons.notifications_active_outlined,
                        theme.colorScheme.primary,
                      );
                    }).toList()
                  else ...[
                    _buildActivityItem(
                      context,
                      'Client approved Proposal for "Website Redesign"',
                      '2 hours ago',
                      Icons.check_circle_outline,
                      theme.colorScheme.secondary,
                    ),
                    _buildActivityItem(
                      context,
                      'New message from Tizzle Studios',
                      '5 hours ago',
                      Icons.message_outlined,
                      theme.colorScheme.primary,
                    ),
                    _buildActivityItem(
                      context,
                      'Invoice INV-004 was paid',
                      'Yesterday',
                      Icons.payments_outlined,
                      theme.colorScheme.secondary,
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildKPICard(BuildContext context, String label, String value, IconData icon, {Color? color}) {
    final theme = Theme.of(context);
    final iconColor = color ?? theme.colorScheme.primary;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border.all(color: theme.colorScheme.surfaceContainerHighest, width: 1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: iconColor, size: 24),
          const SizedBox(height: 12),
          Text(
            value,
            style: theme.textTheme.displaySmall?.copyWith(fontSize: 24),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurface.withOpacity(0.6),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActivityItem(BuildContext context, String content, String time, IconData icon, Color color) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 16),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  content,
                  style: theme.textTheme.bodyMedium,
                ),
                const SizedBox(height: 4),
                Text(
                  time,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.5),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
