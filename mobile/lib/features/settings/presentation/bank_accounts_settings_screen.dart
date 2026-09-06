import 'package:flutter/material.dart';

class BankAccountsSettingsScreen extends StatelessWidget {
  const BankAccountsSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bank Accounts'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: ListTile(
              contentPadding: const EdgeInsets.all(16),
              leading: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primaryContainer,
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.account_balance, color: theme.colorScheme.onPrimaryContainer),
              ),
              title: const Text('Chase Checking', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Ending in •••• 1234'),
              trailing: PopupMenuButton<String>(
                onSelected: (value) {},
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'make_default',
                    child: Text('Make Default'),
                  ),
                  const PopupMenuItem(
                    value: 'remove',
                    child: Text('Remove Account', style: TextStyle(color: Colors.red)),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.add),
            label: const Text('Add Bank Account'),
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
}
