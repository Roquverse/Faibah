import 'package:flutter/material.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
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
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile settings coming soon')));
          }),
          _buildSettingsTile(Icons.lock_outline, 'Security', 'Password, 2FA, and sessions', theme, () {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Security settings coming soon')));
          }),
          _buildSettingsTile(Icons.business, 'Company Info', 'Business name, address, tax info', theme, () {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Company info coming soon')));
          }),
          
          const SizedBox(height: 24),
          _buildSectionHeader('Preferences', theme),
          _buildSettingsTile(Icons.palette_outlined, 'Appearance', 'Dark mode, true black', theme, () {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Appearance settings coming soon')));
          }),
          _buildSettingsTile(Icons.notifications_outlined, 'Notifications', 'Push and email alerts', theme, () {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Notifications settings coming soon')));
          }),
          
          const SizedBox(height: 24),
          _buildSectionHeader('Integrations', theme),
          _buildSettingsTile(Icons.account_balance, 'Bank Accounts', 'Manage payout accounts', theme, () {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Bank Accounts coming soon')));
          }),
          _buildSettingsTile(Icons.link, 'Connected Apps', 'Google Calendar, Stripe', theme, () {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Connected Apps coming soon')));
          }),
          
          const SizedBox(height: 32),
          ElevatedButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Sign out feature coming soon')));
            },
            icon: const Icon(Icons.logout),
            label: const Text('Sign Out'),
            style: ElevatedButton.styleFrom(
              backgroundColor: theme.colorScheme.errorContainer,
              foregroundColor: theme.colorScheme.onErrorContainer,
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
