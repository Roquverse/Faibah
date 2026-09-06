import 'package:flutter/material.dart';

class AppearanceSettingsScreen extends StatefulWidget {
  const AppearanceSettingsScreen({super.key});

  @override
  State<AppearanceSettingsScreen> createState() => _AppearanceSettingsScreenState();
}

class _AppearanceSettingsScreenState extends State<AppearanceSettingsScreen> {
  String _themeMode = 'system';
  bool _trueBlack = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Appearance'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Column(
              children: [
                const ListTile(
                  title: Text('Theme Mode', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
                const Divider(height: 1),
                RadioListTile<String>(
                  title: const Text('System Default'),
                  value: 'system',
                  groupValue: _themeMode,
                  onChanged: (val) => setState(() => _themeMode = val!),
                ),
                RadioListTile<String>(
                  title: const Text('Light Mode'),
                  value: 'light',
                  groupValue: _themeMode,
                  onChanged: (val) => setState(() => _themeMode = val!),
                ),
                RadioListTile<String>(
                  title: const Text('Dark Mode'),
                  value: 'dark',
                  groupValue: _themeMode,
                  onChanged: (val) => setState(() => _themeMode = val!),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          Card(
            child: SwitchListTile(
              title: const Text('True Black', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Use pitch black background for OLED screens in dark mode'),
              value: _trueBlack,
              onChanged: (val) => setState(() => _trueBlack = val),
            ),
          ),
        ],
      ),
    );
  }
}
