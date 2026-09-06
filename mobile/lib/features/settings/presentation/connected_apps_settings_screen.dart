import 'package:flutter/material.dart';

class ConnectedAppsSettingsScreen extends StatefulWidget {
  const ConnectedAppsSettingsScreen({super.key});

  @override
  State<ConnectedAppsSettingsScreen> createState() => _ConnectedAppsSettingsScreenState();
}

class _ConnectedAppsSettingsScreenState extends State<ConnectedAppsSettingsScreen> {
  bool _googleCalendarConnected = true;
  bool _stripeConnected = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Connected Apps'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Column(
              children: [
                ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: const Icon(Icons.calendar_month, size: 40, color: Colors.blue),
                  title: const Text('Google Calendar', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('Sync meetings and proposals'),
                  trailing: ElevatedButton(
                    onPressed: () {
                      setState(() => _googleCalendarConnected = !_googleCalendarConnected);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _googleCalendarConnected ? Colors.grey[200] : Colors.amber,
                      foregroundColor: _googleCalendarConnected ? Colors.black87 : Colors.black,
                      elevation: _googleCalendarConnected ? 0 : null,
                    ),
                    child: Text(_googleCalendarConnected ? 'Disconnect' : 'Connect'),
                  ),
                ),
                const Divider(height: 1),
                ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: const Icon(Icons.payment, size: 40, color: Colors.deepPurple),
                  title: const Text('Stripe', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('Process payments and invoices'),
                  trailing: ElevatedButton(
                    onPressed: () {
                      setState(() => _stripeConnected = !_stripeConnected);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _stripeConnected ? Colors.grey[200] : Colors.amber,
                      foregroundColor: _stripeConnected ? Colors.black87 : Colors.black,
                      elevation: _stripeConnected ? 0 : null,
                    ),
                    child: Text(_stripeConnected ? 'Disconnect' : 'Connect'),
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
