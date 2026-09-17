import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/theme_provider.dart';
import '../data/providers/receipts_provider.dart';
import '../data/models/receipt_model.dart';
import 'create_receipt_screen.dart';

class ReceiptsScreen extends ConsumerStatefulWidget {
  const ReceiptsScreen({super.key});

  @override
  ConsumerState<ReceiptsScreen> createState() => _ReceiptsScreenState();
}

class _ReceiptsScreenState extends ConsumerState<ReceiptsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(receiptsProvider.notifier).fetchReceipts());
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark ||
        (themeMode == ThemeMode.system &&
            MediaQuery.of(context).platformBrightness == Brightness.dark);
    final state = ref.watch(receiptsProvider);

    return Scaffold(
      backgroundColor: isDark ? AppTheme.trueBlack : const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text('Receipts'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: 'Generate Receipt',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const CreateReceiptScreen()),
              );
            },
          ),
        ],
      ),
      body: state.when(
        data: (receipts) {
          if (receipts.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.receipt_long, size: 64, color: isDark ? Colors.white38 : Colors.black26),
                  const SizedBox(height: 16),
                  Text(
                    'No Receipts Yet',
                    style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Text(
                      'Receipts for your paid invoices will appear here.',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: isDark ? Colors.white60 : Colors.black54,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const CreateReceiptScreen()),
                      );
                    },
                    icon: const Icon(Icons.add),
                    label: const Text('Generate Receipt'),
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
              await ref.read(receiptsProvider.notifier).fetchReceipts();
            },
            child: _buildList(receipts, theme, isDark),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildList(List<ReceiptModel> items, ThemeData theme, bool isDark) {
    final cardBgColor = isDark ? AppTheme.darkBackground : Colors.white;
    final borderColor = isDark ? Colors.white10 : Colors.grey.shade200;

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        final clientName = item.invoice?.client?.name ?? 'Client';
        final invoiceRef = item.invoice?.invoiceRef ?? (item.invoiceId.length > 8 ? item.invoiceId.substring(0, 8).toUpperCase() : item.invoiceId);
        final currencySymbol = item.invoice?.currency == 'USD'
            ? '\$'
            : item.invoice?.currency == 'EUR'
                ? '€'
                : item.invoice?.currency == 'GBP'
                    ? '£'
                    : '₦';

        return Container(
          margin: const EdgeInsets.only(bottom: 14),
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
          child: Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(16),
            child: InkWell(
              onTap: () => _showReceiptDetail(context, item, theme, isDark),
              borderRadius: BorderRadius.circular(16),
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          item.receiptRef ?? 'RCP-000',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          '$currencySymbol${item.amountPaid.toStringAsFixed(0)}',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF6D9773),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          clientName,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: isDark ? Colors.white70 : Colors.black54,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF6D9773).withOpacity(0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'PAID',
                            style: TextStyle(
                              color: Color(0xFF6D9773),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Invoice: $invoiceRef',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: isDark ? Colors.white38 : Colors.black38,
                          ),
                        ),
                        Text(
                          item.paymentDate != null
                              ? item.paymentDate!.toLocal().toString().split(' ')[0]
                              : 'N/A',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: isDark ? Colors.white38 : Colors.black38,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  void _showReceiptDetail(BuildContext context, ReceiptModel item, ThemeData theme, bool isDark) {
    final invoiceRef = item.invoice?.invoiceRef ?? (item.invoiceId.length > 8 ? item.invoiceId.substring(0, 8).toUpperCase() : item.invoiceId);
    final currencySymbol = item.invoice?.currency == 'USD'
        ? '\$'
        : item.invoice?.currency == 'EUR'
            ? '€'
            : item.invoice?.currency == 'GBP'
                ? '£'
                : '₦';

    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? AppTheme.darkBackground : Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white24 : Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                item.receiptRef ?? 'Receipt',
                style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              _detailRow(theme, isDark, 'Amount Paid', '$currencySymbol${item.amountPaid.toStringAsFixed(2)}'),
              _detailRow(theme, isDark, 'Invoice', invoiceRef),
              _detailRow(theme, isDark, 'Client', item.invoice?.client?.name ?? 'Client'),
              _detailRow(theme, isDark, 'Payment Method', item.paymentMethod ?? 'Bank Transfer'),
              _detailRow(
                theme,
                isDark,
                'Payment Date',
                item.paymentDate != null
                    ? item.paymentDate!.toLocal().toString().split(' ')[0]
                    : 'N/A',
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Receipt ${item.receiptRef ?? ''} shared')),
                    );
                  },
                  icon: const Icon(Icons.share_outlined),
                  label: const Text('Share Receipt'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFFBA00),
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }

  Widget _detailRow(ThemeData theme, bool isDark, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: isDark ? Colors.white60 : Colors.black54,
            ),
          ),
          Text(
            value,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
        ],
      ),
    );
  }
}
