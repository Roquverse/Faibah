import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
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
    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.backgroundColor,
        elevation: 0,
        title: Text(
          'Settings',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: context.textPrimary,
          ),
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new,
              size: 20, color: context.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionHeader('Account', context),
          _buildSettingsTile(
              context, Icons.person_outline, 'Profile', 'Update your personal details', () {
            Navigator.push(context,
                MaterialPageRoute(builder: (_) => const ProfileSettingsScreen()));
          }),
          _buildSettingsTile(context, Icons.lock_outline, 'Security',
              'Password, 2FA, and sessions', () {
            Navigator.push(context,
                MaterialPageRoute(builder: (_) => const SecuritySettingsScreen()));
          }),
          _buildSettingsTile(context, Icons.business, 'Company Info',
              'Business name, address, brand logo', () {
            Navigator.push(context,
                MaterialPageRoute(builder: (_) => const CompanyInfoSettingsScreen()));
          }),
          const SizedBox(height: 24),
          _buildSectionHeader('Preferences', context),
          _buildSettingsTile(context, Icons.palette_outlined, 'Appearance',
              'Light mode, dark mode, system default', () {
            Navigator.push(context,
                MaterialPageRoute(builder: (_) => const AppearanceSettingsScreen()));
          }),
          _buildSettingsTile(context, Icons.notifications_outlined,
              'Notifications', 'Push and email alerts', () {
            Navigator.push(context,
                MaterialPageRoute(builder: (_) => const NotificationsSettingsScreen()));
          }),
          const SizedBox(height: 24),
          _buildSectionHeader('Integrations', context),
          _buildSettingsTile(context, Icons.account_balance, 'Bank Accounts',
              'Manage payout accounts', () {
            Navigator.push(context,
                MaterialPageRoute(builder: (_) => const BankAccountsSettingsScreen()));
          }),
          _buildSettingsTile(context, Icons.link, 'Connected Apps',
              'Google Calendar, Paystack, Stripe', () {
            Navigator.push(context,
                MaterialPageRoute(builder: (_) => const ConnectedAppsSettingsScreen()));
          }),
          const SizedBox(height: 24),
          _buildSectionHeader('Financial', context),
          _buildSettingsTile(context, Icons.payment_outlined, 'Payments',
              'View and record payments', () {
            Navigator.push(context,
                MaterialPageRoute(builder: (_) => const PaymentsScreen()));
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
              backgroundColor: AppTheme.yellow,
              foregroundColor: Colors.black,
              padding: const EdgeInsets.symmetric(vertical: 16),
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 4),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          color: context.textSecondary,
          fontWeight: FontWeight.bold,
          fontSize: 12,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildSettingsTile(BuildContext context, IconData icon, String title,
      String subtitle, VoidCallback onTap) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: context.borderColor),
      ),
      child: Material(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(14),
        clipBehavior: Clip.antiAlias,
        child: ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          leading: Icon(icon, color: AppTheme.yellow),
          title: Text(
            title,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: context.textPrimary,
            ),
          ),
          subtitle: Text(
            subtitle,
            style: TextStyle(color: context.textSecondary, fontSize: 13),
          ),
          trailing: Icon(Icons.chevron_right, size: 20, color: context.textSecondary),
          onTap: onTap,
        ),
      ),
    );
  }
}
