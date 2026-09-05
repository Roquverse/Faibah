import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/providers/invoices_provider.dart';
import '../data/models/invoice_model.dart';
import 'invoice_preview_screen.dart';

class InvoicesScreen extends ConsumerStatefulWidget {
  const InvoicesScreen({super.key});

  @override
  ConsumerState<InvoicesScreen> createState() => _InvoicesScreenState();
}

class _InvoicesScreenState extends ConsumerState<InvoicesScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(invoicesProvider.notifier).fetchInvoices());
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final invoicesState = ref.watch(invoicesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Invoices'),
      ),
      body: invoicesState.when(
        data: (invoices) {
          if (invoices.isEmpty) {
            return const Center(child: Text('No invoices found.'));
          }
          return _buildList(invoices, theme);
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Create Invoice – coming soon')),
          );
        },
        backgroundColor: theme.colorScheme.primary,
        foregroundColor: theme.colorScheme.onPrimary,
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildList(List<InvoiceModel> items, ThemeData theme) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        final totalAmount = item.items.fold(0.0, (sum, i) => sum + i.amount);
        
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.3),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      item.invoiceRef ?? 'INV-000',
                      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '₦${totalAmount.toStringAsFixed(0)}',
                      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      item.client?.name ?? 'Unknown Client',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.7),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: _getStatusColor(item.status, theme).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        item.status,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: _getStatusColor(item.status, theme),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                if (item.dueDate != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Due: ${item.dueDate!.toLocal().toString().split(' ')[0]}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.5),
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                const Divider(height: 1),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _buildActionButton(Icons.remove_red_eye_outlined, 'View', theme, () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => InvoicePreviewScreen(invoice: item),
                        ),
                      );
                    }),
                    const SizedBox(width: 12),
                    _buildActionButton(Icons.receipt_long_outlined, 'Receipt', theme, () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Receipt for ${item.invoiceRef ?? 'Invoice'} – coming soon')),
                      );
                    }),
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.more_horiz),
                      onPressed: () => _showMoreMenu(context, item),
                      color: theme.colorScheme.onSurface.withOpacity(0.7),
                    ),
                  ],
                )
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildActionButton(IconData icon, String label, ThemeData theme, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: theme.colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(icon, size: 16, color: theme.colorScheme.onSurface),
            const SizedBox(width: 8),
            Text(
              label,
              style: theme.textTheme.labelLarge?.copyWith(
                color: theme.colorScheme.onSurface,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showInvoiceDetail(BuildContext context, InvoiceModel item, ThemeData theme) {
    final totalAmount = item.items.fold(0.0, (sum, i) => sum + i.amount);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.55,
        builder: (_, controller) => ListView(
          controller: controller,
          padding: const EdgeInsets.all(24),
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(
                  color: theme.colorScheme.onSurface.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(item.invoiceRef ?? 'Invoice', style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Client: ${item.client?.name ?? 'Unknown'}', style: theme.textTheme.bodyLarge),
            const SizedBox(height: 4),
            Text('Status: ${item.status}', style: theme.textTheme.bodyLarge),
            if (item.dueDate != null) ...[const SizedBox(height: 4), Text('Due: ${item.dueDate!.toLocal().toString().split(' ')[0]}')],
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 8),
            ...item.items.map((li) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(child: Text(li.description ?? 'Item')),
                  Text('₦${li.amount.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
            )),
            const Divider(),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                Text('₦${totalAmount.toStringAsFixed(0)}', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showMoreMenu(BuildContext context, InvoiceModel item) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            ListTile(
              leading: const Icon(Icons.check_circle_outline),
              title: const Text('Mark as Paid'),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('${item.invoiceRef} marked as paid – coming soon')),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.send_outlined),
              title: const Text('Send to Client'),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Send ${item.invoiceRef} – coming soon')),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.delete_outline, color: Colors.red),
              title: const Text('Delete Invoice', style: TextStyle(color: Colors.red)),
              onTap: () {
                Navigator.pop(context);
                ref.read(invoicesProvider.notifier).deleteInvoice(item.id);
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status, ThemeData theme) {
    switch (status.toUpperCase()) {
      case 'PAID':
        return theme.colorScheme.secondary;
      case 'SENT':
        return theme.colorScheme.primary;
      case 'DRAFT':
        return theme.colorScheme.onSurface.withOpacity(0.5);
      default:
        return theme.colorScheme.onSurface;
    }
  }
}
