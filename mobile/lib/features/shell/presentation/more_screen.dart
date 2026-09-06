import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../clients/presentation/clients_screen.dart';
import '../../invoices/presentation/invoices_screen.dart';
import '../../schedule/presentation/schedule_screen.dart';
import '../../subscriptions/presentation/subscriptions_screen.dart';
import '../../receipts/presentation/receipts_screen.dart';
import '../../team/presentation/team_screen.dart';
import '../../tasks/presentation/tasks_screen.dart';
import '../../proposals/presentation/proposals_screen.dart';
import '../../channels/presentation/channels_screen.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../auth/presentation/login_screen.dart';

class MoreScreen extends ConsumerWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    final items = [
      _GridItem(icon: Icons.description_outlined, label: 'Proposals', color: const Color(0xFF6C63FF), onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ProposalsScreen()))),
      _GridItem(icon: Icons.check_circle_outline, label: 'Tasks', color: const Color(0xFFE53935), onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TasksScreen()))),
      _GridItem(icon: Icons.calendar_month_outlined, label: 'Schedule', color: const Color(0xFFFF6D00), onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ScheduleScreen()))),
      _GridItem(icon: Icons.people_outline, label: 'Team', color: const Color(0xFFFFC107), onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TeamScreen()))),
      _GridItem(icon: Icons.person_outline, label: 'Clients', color: const Color(0xFF00BCD4), onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ClientsScreen()))),
      _GridItem(icon: Icons.receipt_long_outlined, label: 'Invoices', color: const Color(0xFF43A047), onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const InvoicesScreen()))),
      _GridItem(icon: Icons.description_outlined, label: 'Receipts', color: const Color(0xFF8E24AA), onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ReceiptsScreen()))),
      _GridItem(icon: Icons.sync, label: 'Subscriptions', color: const Color(0xFF1E88E5), onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SubscriptionsScreen()))),
      _GridItem(icon: Icons.chat_bubble_outline, label: 'Channels', color: const Color(0xFF039BE5), onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ChannelsScreen()))),
      _GridItem(
        icon: Icons.logout,
        label: 'Logout',
        color: theme.colorScheme.error,
        onTap: () async {
          await ref.read(authStateProvider.notifier).logout();
          if (context.mounted) {
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(builder: (context) => const LoginScreen()),
              (route) => false,
            );
          }
        },
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('More'),
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(20),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: 16,
          mainAxisSpacing: 20,
          childAspectRatio: 0.9,
        ),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final item = items[index];
          return _buildGridItem(context, theme, item);
        },
      ),
    );
  }

  Widget _buildGridItem(BuildContext context, ThemeData theme, _GridItem item) {
    return GestureDetector(
      onTap: item.onTap,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: item.color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: item.color.withOpacity(0.15)),
            ),
            child: Icon(item.icon, color: item.color, size: 28),
          ),
          const SizedBox(height: 10),
          Text(
            item.label,
            style: theme.textTheme.labelMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.onSurface,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _GridItem {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  _GridItem({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });
}
