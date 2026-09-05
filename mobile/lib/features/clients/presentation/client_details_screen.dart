import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/models/client_model.dart';
import '../data/providers/clients_provider.dart';
import 'create_edit_client_screen.dart';

class ClientDetailsScreen extends ConsumerWidget {
  final ClientModel client;

  const ClientDetailsScreen({super.key, required this.client});

  void _confirmDelete(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Client?'),
        content: Text('Are you sure you want to delete ${client.name}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final success = await ref.read(clientsProvider.notifier).deleteClient(client.id);
              if (success && context.mounted) {
                Navigator.pop(context);
              } else if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Failed to delete client')),
                );
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    
    // We listen to the provider to get the updated client data if we return from Edit screen
    final clientsState = ref.watch(clientsProvider);
    final currentClient = clientsState.value?.firstWhere(
      (c) => c.id == client.id,
      orElse: () => client,
    ) ?? client;

    return Scaffold(
      appBar: AppBar(
        title: Text(currentClient.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => CreateEditClientScreen(client: currentClient),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
            onPressed: () => _confirmDelete(context, ref),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 16),
            CircleAvatar(
              radius: 48,
              backgroundColor: theme.colorScheme.primary.withOpacity(0.2),
              foregroundColor: theme.colorScheme.primary,
              child: Text(
                currentClient.name.substring(0, 1).toUpperCase(),
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 36),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              currentClient.name,
              style: theme.textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: theme.colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                currentClient.clientType ?? 'INDIVIDUAL',
                style: theme.textTheme.labelSmall,
              ),
            ),
            const SizedBox(height: 48),
            _buildDetailRow(theme, Icons.email_outlined, 'Email', currentClient.email),
            _buildDetailRow(theme, Icons.phone_outlined, 'WhatsApp', currentClient.whatsappNumber),
            _buildDetailRow(theme, Icons.public, 'Country', currentClient.country),
            _buildDetailRow(theme, Icons.location_city, 'City', currentClient.city),
            _buildDetailRow(theme, Icons.map_outlined, 'Address', currentClient.address),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(ThemeData theme, IconData icon, String label, String? value) {
    if (value == null || value.isEmpty) return const SizedBox.shrink();
    
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.5),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: theme.colorScheme.onSurface.withOpacity(0.7)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.5)),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: theme.textTheme.bodyLarge,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
