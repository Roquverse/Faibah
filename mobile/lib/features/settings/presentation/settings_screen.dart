import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../auth/presentation/login_screen.dart';
import '../../payments/presentation/payments_screen.dart';
import 'profile_settings_screen.dart';
import 'security_settings_screen.dart';
import 'company_info_settings_screen.dart';
import 'appearance_settings_screen.dart';
import 'notifications_settings_screen.dart';
import 'bank_accounts_settings_screen.dart';
import 'connected_apps_settings_screen.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionHeader('Account', theme),
          _buildSettingsTile(Icons.person_outline, 'Profile', 'Update your personal details', theme, () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileSettingsScreen()));
          }),
          _buildSettingsTile(Icons.lock_outline, 'Security', 'Password, 2FA, and sessions', theme, () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const SecuritySettingsScreen()));
          }),
          _buildSettingsTile(Icons.business, 'Company Info', 'Business name, address, tax info', theme, () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const CompanyInfoSettingsScreen()));
          }),
          
          const SizedBox(height: 24),
          _buildSectionHeader('Preferences', theme),
          _buildSettingsTile(Icons.palette_outlined, 'Appearance', 'Dark mode, true black', theme, () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const AppearanceSettingsScreen()));
          }),
          _buildSettingsTile(Icons.notifications_outlined, 'Notifications', 'Push and email alerts', theme, () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsSettingsScreen()));
          }),
          
          const SizedBox(height: 24),
          _buildSectionHeader('Integrations', theme),
          _buildSettingsTile(Icons.account_balance, 'Bank Accounts', 'Manage payout accounts', theme, () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const BankAccountsSettingsScreen()));
          }),
          _buildSettingsTile(Icons.link, 'Connected Apps', 'Google Calendar, Stripe', theme, () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const ConnectedAppsSettingsScreen()));
          }),
          
          const SizedBox(height: 24),
          _buildSectionHeader('Financial', theme),
          _buildSettingsTile(Icons.payment_outlined, 'Payments', 'View and manage payments', theme, () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const PaymentsScreen()));
          }),
          
          const SizedBox(height: 32),
          ElevatedButton.icon(
            onPressed: () async {
              await ref.read(authStateProvider.notifier).logout();
              if (context.mounted) {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
            icon: const Icon(Icons.logout),
            label: const Text('Sign Out'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber,
              foregroundColor: Colors.black,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 4),
      child: Text(
        title.toUpperCase(),
        style: theme.textTheme.labelMedium?.copyWith(
          color: theme.colorScheme.primary,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildSettingsTile(IconData icon, String title, String subtitle, ThemeData theme, VoidCallback onTap) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.3),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Icon(icon, color: theme.colorScheme.onSurface),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(
          subtitle,
          style: TextStyle(color: theme.colorScheme.onSurface.withOpacity(0.6)),
        ),
        trailing: const Icon(Icons.chevron_right, size: 20),
        onTap: onTap,
      ),
    );
  }
}
