import 'package:flutter/material.dart';

class TeamScreen extends StatelessWidget {
  const TeamScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final mockTeam = [
      {'name': 'Oluwadamilola Cole', 'role': 'Owner / Admin', 'email': 'cole@faibah.com'},
      {'name': 'John Doe', 'role': 'Contractor', 'email': 'john@example.com'},
      {'name': 'Jane Smith', 'role': 'Designer', 'email': 'jane@example.com'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Team'),
        actions: [
          IconButton(icon: const Icon(Icons.person_add), onPressed: () {}),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: mockTeam.length,
        itemBuilder: (context, index) {
          final member = mockTeam[index];

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: theme.colorScheme.onSurface.withOpacity(0.1)),
            ),
            color: theme.colorScheme.surface,
            child: ListTile(
              contentPadding: const EdgeInsets.all(16),
              leading: CircleAvatar(
                backgroundColor: theme.colorScheme.primary.withOpacity(0.2),
                foregroundColor: theme.colorScheme.primary,
                child: Text(
                  member['name']!.substring(0, 1),
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
              title: Text(member['name']!, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(member['email']!, style: TextStyle(color: theme.colorScheme.onSurface.withOpacity(0.6))),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        member['role']!,
                        style: TextStyle(
                          color: theme.colorScheme.onSurface,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              trailing: const Icon(Icons.more_vert),
            ),
          );
        },
      ),
    );
  }
}
