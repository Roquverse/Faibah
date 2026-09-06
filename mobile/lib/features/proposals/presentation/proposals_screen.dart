import 'package:flutter/material.dart';

class ProposalsScreen extends StatelessWidget {
  const ProposalsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final mockProposals = [
      {'title': 'Website Redesign Proposal', 'client': 'Acme Corp', 'status': 'Pending', 'date': 'Oct 12, 2026'},
      {'title': 'Mobile App MVP Development', 'client': 'Stark Industries', 'status': 'Approved', 'date': 'Oct 05, 2026'},
      {'title': 'SEO Optimization Strategy', 'client': 'Wayne Enterprises', 'status': 'Rejected', 'date': 'Sep 28, 2026'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Proposals'),
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: () {}),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: mockProposals.length,
        itemBuilder: (context, index) {
          final prop = mockProposals[index];
          final isApproved = prop['status'] == 'Approved';
          final isRejected = prop['status'] == 'Rejected';

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
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.description_outlined, color: theme.colorScheme.primary),
              ),
              title: Text(prop['title']!, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Client: ${prop['client']}'),
                    const SizedBox(height: 4),
                    Text('Date: ${prop['date']}', style: TextStyle(color: theme.colorScheme.onSurface.withOpacity(0.5), fontSize: 12)),
                  ],
                ),
              ),
              trailing: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isApproved ? Colors.green.withOpacity(0.2) : isRejected ? Colors.red.withOpacity(0.2) : Colors.orange.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  prop['status']!,
                  style: TextStyle(
                    color: isApproved ? Colors.green : isRejected ? Colors.red : Colors.orange,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
