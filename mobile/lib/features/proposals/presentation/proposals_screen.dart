import 'package:flutter/material.dart';
import 'create_proposal_screen.dart';

class ProposalsScreen extends StatelessWidget {
  const ProposalsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final mockProposals = [
      {'title': 'Website Redesign Proposal', 'client': 'Acme Corp', 'status': 'Pending', 'date': 'Oct 12, 2026', 'amount': '₦850,000'},
      {'title': 'Mobile App MVP Development', 'client': 'Stark Industries', 'status': 'Approved', 'date': 'Oct 05, 2026', 'amount': '₦2,400,000'},
      {'title': 'SEO Optimization Strategy', 'client': 'Wayne Enterprises', 'status': 'Rejected', 'date': 'Sep 28, 2026', 'amount': '₦320,000'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Proposals'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateProposalScreen())),
          ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: mockProposals.length,
        itemBuilder: (context, index) {
          final prop = mockProposals[index];
          return _buildCard(context, theme, prop);
        },
      ),
    );
  }

  Widget _buildCard(BuildContext context, ThemeData theme, Map<String, String> prop) {
    final status = prop['status']!;
    Color statusColor = status == 'Approved' ? Colors.green : status == 'Rejected' ? Colors.red : Colors.orange;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.colorScheme.onSurface.withOpacity(0.08)),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        prop['title']!,
                        style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(prop['amount']!, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(prop['client']!, style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.7))),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: statusColor.withOpacity(0.3)),
                      ),
                      child: Text(status.toUpperCase(), style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(prop['date']!, style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.4))),
              ],
            ),
          ),
          Divider(height: 1, color: theme.colorScheme.onSurface.withOpacity(0.08)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: [
                _actionBtn(theme, Icons.visibility_outlined, 'View', () {}),
                const SizedBox(width: 8),
                _actionBtn(theme, Icons.edit_outlined, 'Edit', () {}),
                const Spacer(),
                IconButton(
                  icon: Icon(Icons.more_horiz, color: theme.colorScheme.onSurface.withOpacity(0.5)),
                  onPressed: () {},
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionBtn(ThemeData theme, IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: theme.colorScheme.onSurface.withOpacity(0.06),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 15, color: theme.colorScheme.onSurface),
            const SizedBox(width: 6),
            Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface)),
          ],
        ),
      ),
    );
  }
}
