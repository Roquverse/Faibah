import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/theme_provider.dart';
import '../../invoices/data/models/invoice_model.dart';
import '../../invoices/data/providers/invoices_provider.dart';
import '../data/models/receipt_model.dart';
import '../data/providers/receipts_provider.dart';

class CreateReceiptScreen extends ConsumerStatefulWidget {
  final InvoiceModel? preselectedInvoice;

  const CreateReceiptScreen({super.key, this.preselectedInvoice});

  @override
  ConsumerState<CreateReceiptScreen> createState() => _CreateReceiptScreenState();
}

class _CreateReceiptScreenState extends ConsumerState<CreateReceiptScreen> {
  final _formKey = GlobalKey<FormState>();

  String? _selectedInvoiceId;
  InvoiceModel? _selectedInvoice;
  final TextEditingController _amountController = TextEditingController();
  String _paymentMethod = 'Bank Transfer';
  DateTime _paymentDate = DateTime.now();
  bool _isSubmitting = false;

  final List<String> _paymentMethods = [
    'Bank Transfer',
    'Credit Card',
    'Cash',
    'PayPal',
    'Other',
  ];

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(invoicesProvider.notifier).fetchInvoices());

    if (widget.preselectedInvoice != null) {
      _selectedInvoice = widget.preselectedInvoice;
      _selectedInvoiceId = widget.preselectedInvoice!.id;
      final total = _selectedInvoice!.items.fold(0.0, (sum, i) => sum + i.amount);
      final taxRate = _selectedInvoice!.taxRate ?? 0.0;
      final totalWithTax = total + (total * (taxRate / 100.0));
      _amountController.text = totalWithTax > 0 ? totalWithTax.toStringAsFixed(2) : total.toStringAsFixed(2);
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  void _onInvoiceSelected(InvoiceModel invoice) {
    setState(() {
      _selectedInvoice = invoice;
      _selectedInvoiceId = invoice.id;
      final total = invoice.items.fold(0.0, (sum, i) => sum + i.amount);
      final taxRate = invoice.taxRate ?? 0.0;
      final totalWithTax = total + (total * (taxRate / 100.0));
      _amountController.text = totalWithTax > 0 ? totalWithTax.toStringAsFixed(2) : total.toStringAsFixed(2);
    });
  }

  Future<void> _submitReceipt() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedInvoiceId == null || _selectedInvoiceId!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select an invoice')),
      );
      return;
    }

    final amountPaid = double.tryParse(_amountController.text) ?? 0.0;
    if (amountPaid <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Amount paid must be greater than 0')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final receipt = ReceiptModel(
        id: '',
        invoiceId: _selectedInvoiceId!,
        amountPaid: amountPaid,
        paymentMethod: _paymentMethod,
        paymentDate: _paymentDate,
      );

      final success = await ref.read(receiptsProvider.notifier).createReceipt(receipt);

      if (mounted) {
        setState(() => _isSubmitting = false);
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Receipt generated successfully'),
              backgroundColor: Color(0xFF6D9773),
            ),
          );
          Navigator.pop(context);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to generate receipt. Please try again.'),
              backgroundColor: Colors.redAccent,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark ||
        (themeMode == ThemeMode.system &&
            MediaQuery.of(context).platformBrightness == Brightness.dark);

    final invoicesAsync = ref.watch(invoicesProvider);

    final bgColor = isDark ? AppTheme.trueBlack : const Color(0xFFF9FAFB);
    final cardBgColor = isDark ? AppTheme.darkBackground : Colors.white;
    final borderColor = isDark ? Colors.white10 : Colors.grey.shade200;
    final inputFillColor = isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF9FAFB);

    final currSymbol = _selectedInvoice?.currency == 'USD'
        ? '\$'
        : _selectedInvoice?.currency == 'EUR'
            ? '€'
            : _selectedInvoice?.currency == 'GBP'
                ? '£'
                : '₦';

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: const Text('Generate Receipt'),
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  physics: const BouncingScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // --- Invoice Selection Card ---
                      Container(
                        padding: const EdgeInsets.all(20),
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
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Invoice Selection',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 16),
                            invoicesAsync.when(
                              data: (invoices) {
                                if (invoices.isEmpty) {
                                  return Text(
                                    'No invoices available to generate a receipt for.',
                                    style: TextStyle(color: Colors.grey.shade500),
                                  );
                                }

                                return DropdownButtonFormField<String>(
                                  value: _selectedInvoiceId,
                                  isExpanded: true,
                                  dropdownColor: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                                  decoration: InputDecoration(
                                    labelText: 'Select Invoice *',
                                    filled: true,
                                    fillColor: inputFillColor,
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(color: borderColor),
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(color: borderColor),
                                    ),
                                    contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: 14,
                                    ),
                                  ),
                                  items: invoices.map((inv) {
                                    final total = inv.items.fold(0.0, (sum, i) => sum + i.amount);
                                    return DropdownMenuItem<String>(
                                      value: inv.id,
                                      child: Text(
                                        '${inv.invoiceRef ?? 'INV'} - ${inv.client?.name ?? 'Client'} (₦${total.toStringAsFixed(0)})',
                                        style: TextStyle(
                                          color: isDark ? Colors.white : Colors.black87,
                                          fontWeight: FontWeight.w500,
                                          fontSize: 14,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    );
                                  }).toList(),
                                  onChanged: (val) {
                                    if (val != null) {
                                      final matched = invoices.firstWhere((i) => i.id == val);
                                      _onInvoiceSelected(matched);
                                    }
                                  },
                                  validator: (val) =>
                                      val == null || val.isEmpty ? 'Please select an invoice' : null,
                                );
                              },
                              loading: () => const LinearProgressIndicator(),
                              error: (e, _) => Text(
                                'Error loading invoices: $e',
                                style: const TextStyle(color: Colors.red),
                              ),
                            ),
                            if (_selectedInvoice != null) ...[
                              const SizedBox(height: 16),
                              Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: inputFillColor,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: borderColor),
                                ),
                                child: Column(
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          'Client',
                                          style: TextStyle(
                                            color: isDark ? Colors.white60 : Colors.black54,
                                            fontSize: 13,
                                          ),
                                        ),
                                        Text(
                                          _selectedInvoice?.client?.name ?? 'Unknown',
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          'Invoice Status',
                                          style: TextStyle(
                                            color: isDark ? Colors.white60 : Colors.black54,
                                            fontSize: 13,
                                          ),
                                        ),
                                        Text(
                                          _selectedInvoice?.status ?? 'DRAFT',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 13,
                                            color: _selectedInvoice?.status == 'PAID'
                                                ? const Color(0xFF6D9773)
                                                : const Color(0xFFFFBA00),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const Padding(
                                      padding: EdgeInsets.symmetric(vertical: 8),
                                      child: Divider(height: 1),
                                    ),
                                    AnimatedBuilder(
                                      animation: _amountController,
                                      builder: (context, _) {
                                        final subtotal = _selectedInvoice!.items.fold(0.0, (sum, i) => sum + i.amount);
                                        final taxRate = _selectedInvoice!.taxRate ?? 0.0;
                                        final totalWithTax = subtotal + (subtotal * (taxRate / 100.0));
                                        final enteredAmt = double.tryParse(_amountController.text) ?? 0.0;
                                        final balanceRem = (totalWithTax - enteredAmt).clamp(0.0, double.infinity);

                                        return Column(
                                          children: [
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Text(
                                                  'Total Amount',
                                                  style: TextStyle(
                                                    color: isDark ? Colors.white60 : Colors.black54,
                                                    fontSize: 13,
                                                  ),
                                                ),
                                                Text(
                                                  '$currSymbol${totalWithTax.toStringAsFixed(2)}',
                                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 8),
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Text(
                                                  'Amount Paid',
                                                  style: TextStyle(
                                                    color: isDark ? Colors.white60 : Colors.black54,
                                                    fontSize: 13,
                                                  ),
                                                ),
                                                Text(
                                                  '$currSymbol${enteredAmt.toStringAsFixed(2)}',
                                                  style: const TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 13,
                                                    color: Color(0xFF6D9773),
                                                  ),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 8),
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Text(
                                                  'Balance Remaining',
                                                  style: TextStyle(
                                                    color: isDark ? Colors.white60 : Colors.black54,
                                                    fontSize: 13,
                                                  ),
                                                ),
                                                Text(
                                                  '$currSymbol${balanceRem.toStringAsFixed(2)}',
                                                  style: TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 13,
                                                    color: balanceRem > 0 ? Colors.redAccent : const Color(0xFF6D9773),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        );
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // --- Payment Details Card ---
                      Container(
                        padding: const EdgeInsets.all(20),
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
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Payment Information',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 16),
                            // Amount Paid
                            TextFormField(
                              controller: _amountController,
                              keyboardType: const TextInputType.numberWithOptions(decimal: true),
                              decoration: InputDecoration(
                                labelText: 'Amount Paid *',
                                prefixText: '$currSymbol ',
                                filled: true,
                                fillColor: inputFillColor,
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: BorderSide(color: borderColor),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: BorderSide(color: borderColor),
                                ),
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 14,
                                ),
                              ),
                              validator: (val) {
                                if (val == null || val.trim().isEmpty) {
                                  return 'Amount is required';
                                }
                                final num = double.tryParse(val);
                                if (num == null || num <= 0) {
                                  return 'Enter a valid amount';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 16),
                            // Payment Method Dropdown
                            DropdownButtonFormField<String>(
                              value: _paymentMethod,
                              dropdownColor: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                              decoration: InputDecoration(
                                labelText: 'Payment Method',
                                filled: true,
                                fillColor: inputFillColor,
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: BorderSide(color: borderColor),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: BorderSide(color: borderColor),
                                ),
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 14,
                                ),
                              ),
                              items: _paymentMethods.map((method) {
                                return DropdownMenuItem<String>(
                                  value: method,
                                  child: Text(
                                    method,
                                    style: TextStyle(
                                      color: isDark ? Colors.white : Colors.black87,
                                    ),
                                  ),
                                );
                              }).toList(),
                              onChanged: (val) {
                                if (val != null) setState(() => _paymentMethod = val);
                              },
                            ),
                            const SizedBox(height: 16),
                            // Payment Date
                            InkWell(
                              onTap: () async {
                                final picked = await showDatePicker(
                                  context: context,
                                  initialDate: _paymentDate,
                                  firstDate: DateTime(2020),
                                  lastDate: DateTime.now().add(const Duration(days: 365)),
                                  builder: (context, child) {
                                    return Theme(
                                      data: theme.copyWith(
                                        colorScheme: isDark
                                            ? const ColorScheme.dark(
                                                primary: AppTheme.primaryGreen,
                                                surface: Color(0xFF1E1E1E),
                                              )
                                            : const ColorScheme.light(
                                                primary: Color(0xFF111827),
                                              ),
                                      ),
                                      child: child!,
                                    );
                                  },
                                );
                                if (picked != null) {
                                  setState(() => _paymentDate = picked);
                                }
                              },
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 14,
                                ),
                                decoration: BoxDecoration(
                                  color: inputFillColor,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: borderColor),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      Icons.calendar_today_outlined,
                                      size: 18,
                                      color: isDark ? Colors.white60 : Colors.black54,
                                    ),
                                    const SizedBox(width: 12),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Payment Date',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: isDark ? Colors.white54 : Colors.black45,
                                          ),
                                        ),
                                        Text(
                                          DateFormat('yyyy-MM-dd').format(_paymentDate),
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600,
                                            color: isDark ? Colors.white : Colors.black87,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const Spacer(),
                                    Icon(
                                      Icons.arrow_drop_down,
                                      color: isDark ? Colors.white60 : Colors.black54,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),

              // --- Bottom Submit Button ---
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: cardBgColor,
                  border: Border(top: BorderSide(color: borderColor)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _isSubmitting ? null : () => Navigator.pop(context),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          side: BorderSide(color: borderColor),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          'Cancel',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : _submitReceipt,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFFFBA00),
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: _isSubmitting
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.black),
                                ),
                              )
                            : const Text(
                                'Generate Receipt',
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
