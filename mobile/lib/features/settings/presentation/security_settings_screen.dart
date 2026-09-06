import 'package:flutter/material.dart';

class SecuritySettingsScreen extends StatefulWidget {
  const SecuritySettingsScreen({super.key});

  @override
  State<SecuritySettingsScreen> createState() => _SecuritySettingsScreenState();
}

class _SecuritySettingsScreenState extends State<SecuritySettingsScreen> {
  bool _twoFactorEnabled = true;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Security'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionHeader('Change Password', theme),
          Card(
            margin: const EdgeInsets.only(bottom: 24),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  TextFormField(
                    decoration: const InputDecoration(
                      labelText: 'Current Password',
                      border: OutlineInputBorder(),
                    ),
                    obscureText: true,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    decoration: const InputDecoration(
                      labelText: 'New Password',
                      border: OutlineInputBorder(),
                    ),
                    obscureText: true,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    decoration: const InputDecoration(
                      labelText: 'Confirm New Password',
                      border: OutlineInputBorder(),
                    ),
                    obscureText: true,
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                         ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Password changed successfully')));
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.amber,
                        foregroundColor: Colors.black,
                      ),
                      child: const Text('Update Password'),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          _buildSectionHeader('Two-Factor Authentication', theme),
          Card(
            margin: const EdgeInsets.only(bottom: 24),
            child: SwitchListTile(
              title: const Text('Enable 2FA'),
              subtitle: const Text('Add an extra layer of security to your account'),
              value: _twoFactorEnabled,
              onChanged: (val) {
                setState(() => _twoFactorEnabled = val);
              },
            ),
          ),
          
          _buildSectionHeader('Active Sessions', theme),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.phone_iphone),
                  title: const Text('iPhone 13 Pro'),
                  subtitle: const Text('Active now • San Francisco, CA'),
                  trailing: TextButton(
                    onPressed: () {},
                    child: const Text('Sign Out'),
                  ),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.laptop_mac),
                  title: const Text('MacBook Pro'),
                  subtitle: const Text('Last active 2 hours ago • San Francisco, CA'),
                  trailing: TextButton(
                    onPressed: () {},
                    child: const Text('Sign Out'),
                  ),
                ),
              ],
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
}
