import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/theme_provider.dart';
import '../data/providers/invoices_provider.dart';
import '../data/models/invoice_model.dart';
import 'invoice_preview_screen.dart';
import 'create_invoice_screen.dart';
import '../../receipts/presentation/create_receipt_screen.dart';

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
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark ||
        (themeMode == ThemeMode.system &&
            MediaQuery.of(context).platformBrightness == Brightness.dark);
    final invoicesState = ref.watch(invoicesProvider);

    return Scaffold(
      backgroundColor: isDark ? AppTheme.trueBlack : const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text('Invoices'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const CreateInvoiceScreen()),
              );
            },
          ),
        ],
      ),
      body: invoicesState.when(
        data: (invoices) {
          if (invoices.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.receipt_outlined, size: 64, color: Colors.grey.shade400),
                  const SizedBox(height: 16),
                  Text(
                    'No invoices found',
                    style: TextStyle(fontSize: 16, color: Colors.grey.shade500),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const CreateInvoiceScreen()),
                      );
                    },
                    icon: const Icon(Icons.add),
                    label: const Text('Create First Invoice'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFFBA00),
                      foregroundColor: Colors.black,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () async {
              await ref.read(invoicesProvider.notifier).fetchInvoices();
            },
            child: _buildList(invoices, theme, isDark),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildList(List<InvoiceModel> items, ThemeData theme, bool isDark) {
    final cardBgColor = isDark ? AppTheme.darkBackground : Colors.white;
    final borderColor = isDark ? Colors.white10 : Colors.grey.shade200;

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        final totalAmount = item.items.fold(0.0, (sum, i) => sum + i.amount);
        final currencySymbol = item.currency == 'USD'
            ? '\$'
            : item.currency == 'EUR'
                ? '€'
                : item.currency == 'GBP'
                    ? '£'
                    : '₦';

        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: cardBgColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: borderColor),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.02),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      item.invoiceRef ?? 'INV-000',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                    Text(
                      '$currencySymbol${totalAmount.toStringAsFixed(0)}',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        item.client?.name ?? 'Unknown Client',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: isDark ? Colors.white70 : Colors.black54,
                          fontWeight: FontWeight.w500,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: _getStatusColor(item.status, isDark).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        item.status.toUpperCase(),
                        style: TextStyle(
                          color: _getStatusColor(item.status, isDark),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ],
                ),
                if (item.dueDate != null) ...[
                  const SizedBox(height: 6),
                  Text(
                    'Due: ${item.dueDate!.toLocal().toString().split(' ')[0]}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: isDark ? Colors.white38 : Colors.black38,
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                Divider(height: 1, color: borderColor),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _buildActionButton(Icons.remove_red_eye_outlined, 'View', isDark, () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => InvoicePreviewScreen(invoice: item),
                        ),
                      );
                    }),
                    const SizedBox(width: 10),
                    _buildActionButton(Icons.receipt_long_outlined, 'Receipt', isDark, () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => CreateReceiptScreen(preselectedInvoice: item),
                        ),
                      );
                    }),
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.more_horiz),
                      onPressed: () => _showMoreMenu(context, item, isDark),
                      color: isDark ? Colors.white60 : Colors.black54,
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildActionButton(IconData icon, String label, bool isDark, VoidCallback onTap) {
    final btnBgColor = isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF3F4F6);
    final borderColor = isDark ? Colors.white10 : Colors.grey.shade200;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: btnBgColor,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: borderColor),
        ),
        child: Row(
          children: [
            Icon(icon, size: 16, color: isDark ? Colors.white : Colors.black87),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: isDark ? Colors.white : Colors.black87,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showMoreMenu(BuildContext context, InvoiceModel item, bool isDark) {
    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? AppTheme.darkBackground : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? Colors.white24 : Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 12),
            ListTile(
              tileColor: Colors.transparent,
              leading: const Icon(Icons.edit_outlined),
              title: const Text('Edit Invoice'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => CreateInvoiceScreen(invoiceToEdit: item),
                  ),
                );
              },
            ),
            if (item.status.toUpperCase() != 'PAID')
              ListTile(
                tileColor: Colors.transparent,
                leading: const Icon(Icons.check_circle_outline, color: Color(0xFF6D9773)),
                title: const Text('Mark as Paid'),
                onTap: () async {
                  Navigator.pop(context);
                  final success = await ref
                      .read(invoicesProvider.notifier)
                      .updateInvoiceStatus(item.id, 'PAID');
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(success
                            ? '${item.invoiceRef ?? "Invoice"} marked as paid'
                            : 'Failed to update invoice'),
                        backgroundColor:
                            success ? const Color(0xFF6D9773) : Colors.redAccent,
                      ),
                    );
                  }
                },
              )
            else
              ListTile(
                tileColor: Colors.transparent,
                leading: const Icon(Icons.replay_outlined),
                title: const Text('Mark as Unpaid'),
                onTap: () async {
                  Navigator.pop(context);
                  final success = await ref
                      .read(invoicesProvider.notifier)
                      .updateInvoiceStatus(item.id, 'SENT');
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(success
                            ? '${item.invoiceRef ?? "Invoice"} marked as unpaid'
                            : 'Failed to update invoice'),
                      ),
                    );
                  }
                },
              ),
            ListTile(
              tileColor: Colors.transparent,
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
              tileColor: Colors.transparent,
              leading: const Icon(Icons.delete_outline, color: Colors.redAccent),
              title: const Text('Delete Invoice', style: TextStyle(color: Colors.redAccent)),
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

  Color _getStatusColor(String status, bool isDark) {
    switch (status.toUpperCase()) {
      case 'PAID':
        return const Color(0xFF6D9773);
      case 'SENT':
        return const Color(0xFF4D96FF);
      case 'OVERDUE':
        return const Color(0xFFFF6B6B);
      case 'DRAFT':
      default:
        return isDark ? const Color(0xFFAAAAAA) : const Color(0xFF6B7280);
    }
  }
}
