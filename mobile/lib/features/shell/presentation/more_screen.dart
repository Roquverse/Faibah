import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../clients/presentation/clients_screen.dart';
import '../../invoices/presentation/invoices_screen.dart';
import '../../schedule/presentation/schedule_screen.dart';
import '../../subscriptions/presentation/subscriptions_screen.dart';
import '../../receipts/presentation/receipts_screen.dart';
import '../../payments/presentation/payments_screen.dart';
import '../../settings/presentation/settings_screen.dart';

import '../../auth/presentation/auth_controller.dart';
import '../../auth/presentation/login_screen.dart';

class MoreScreen extends ConsumerWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('More'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildMenuSection(
            context,
            'Business',
            [
              _MenuOption(
                icon: Icons.people_outline,
                title: 'Clients',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ClientsScreen())),
              ),
              _MenuOption(
                icon: Icons.calendar_today_outlined,
                title: 'Schedule',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ScheduleScreen())),
              ),
              _MenuOption(
                icon: Icons.sync,
                title: 'Subscriptions',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SubscriptionsScreen())),
              ),
              _MenuOption(
                icon: Icons.receipt_long_outlined,
                title: 'Invoices',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const InvoicesScreen())),
              ),
              _MenuOption(
                icon: Icons.description_outlined,
                title: 'Receipts',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ReceiptsScreen())),
              ),
              _MenuOption(
                icon: Icons.payment_outlined,
                title: 'Payments',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PaymentsScreen())),
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildMenuSection(
            context,
            'Preferences',
            [
              _MenuOption(
                icon: Icons.settings_outlined,
                title: 'Settings',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SettingsScreen())),
              ),
              _MenuOption(
                icon: Icons.logout,
                title: 'Logout',
                iconColor: theme.colorScheme.error,
                textColor: theme.colorScheme.error,
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
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMenuSection(BuildContext context, String title, List<_MenuOption> options) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text(
            title,
            style: theme.textTheme.titleSmall?.copyWith(
              color: theme.colorScheme.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        Card(
          child: Column(
            children: options.asMap().entries.map((entry) {
              final index = entry.key;
              final option = entry.value;
              return Column(
                children: [
                  ListTile(
                    leading: Icon(option.icon, color: option.iconColor ?? theme.colorScheme.onSurface),
                    title: Text(
                      option.title,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: option.textColor ?? theme.colorScheme.onSurface,
                      ),
                    ),
                    subtitle: option.subtitle != null
                        ? Text(
                            option.subtitle!,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurface.withOpacity(0.5),
                            ),
                          )
                        : null,
                    trailing: const Icon(Icons.chevron_right, size: 20),
                    onTap: option.onTap,
                  ),
                  if (index < options.length - 1)
                    Divider(height: 1, indent: 56, color: theme.colorScheme.surfaceContainerHighest),
                ],
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _MenuOption {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Color? iconColor;
  final Color? textColor;
  final VoidCallback onTap;

  _MenuOption({
    required this.icon,
    required this.title,
    this.subtitle,
    this.iconColor,
    this.textColor,
    required this.onTap,
  });
}
