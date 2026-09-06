import 'package:flutter/material.dart';

class NotificationsSettingsScreen extends StatefulWidget {
  const NotificationsSettingsScreen({super.key});

  @override
  State<NotificationsSettingsScreen> createState() => _NotificationsSettingsScreenState();
}

class _NotificationsSettingsScreenState extends State<NotificationsSettingsScreen> {
  bool _pushEnabled = true;
  bool _emailEnabled = true;
  bool _marketingEnabled = false;
  bool _newMessagesEnabled = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Push Notifications', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('Receive alerts on your device'),
                  value: _pushEnabled,
                  onChanged: (val) => setState(() => _pushEnabled = val),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('Email Alerts', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('Receive important updates via email'),
                  value: _emailEnabled,
                  onChanged: (val) => setState(() => _emailEnabled = val),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('New Messages', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('Alert when you receive a new chat or proposal message'),
                  value: _newMessagesEnabled,
                  onChanged: (val) => setState(() => _newMessagesEnabled = val),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('Marketing Communications', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('News, feature updates, and offers'),
                  value: _marketingEnabled,
                  onChanged: (val) => setState(() => _marketingEnabled = val),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
