import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/theme_provider.dart';
import '../../clients/data/providers/clients_provider.dart';
import '../data/models/invoice_model.dart';
import '../data/providers/invoices_provider.dart';

class LineItemInput {
  final TextEditingController nameController;
  final TextEditingController descController;
  final TextEditingController qtyController;
  final TextEditingController priceController;
  bool isSubscription;
  String subscriptionFrequency;
  DateTime? subscriptionDate;

  LineItemInput({
    String name = '',
    String desc = '',
    String qty = '1',
    String price = '',
    this.isSubscription = false,
    this.subscriptionFrequency = 'MONTHLY',
    this.subscriptionDate,
  })  : nameController = TextEditingController(text: name),
        descController = TextEditingController(text: desc),
        qtyController = TextEditingController(text: qty),
        priceController = TextEditingController(text: price);

  int get quantity => int.tryParse(qtyController.text) ?? 0;
  double get unitPrice => double.tryParse(priceController.text) ?? 0.0;
  double get amount => quantity * unitPrice;

  void dispose() {
    nameController.dispose;
    descController.dispose;
    qtyController.dispose;
    priceController.dispose;
  }
}

class CreateInvoiceScreen extends ConsumerStatefulWidget {
  final InvoiceModel? invoiceToEdit;

  const CreateInvoiceScreen({super.key, this.invoiceToEdit});

  @override
  ConsumerState<CreateInvoiceScreen> createState() => _CreateInvoiceScreenState();
}

class _CreateInvoiceScreenState extends ConsumerState<CreateInvoiceScreen> {
  final _formKey = GlobalKey<FormState>();

  String? _selectedClientId;
  String _currency = 'NGN';
  final TextEditingController _taxRateController = TextEditingController(text: '7.5');
  DateTime? _dueDate;
  final List<LineItemInput> _items = [];
  bool _isSubmitting = false;

  final Map<String, String> _currencySymbols = {
    'NGN': '₦',
    'USD': '\$',
    'EUR': '€',
    'GBP': '£',
  };

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(clientsProvider.notifier).fetchClients());

    if (widget.invoiceToEdit != null) {
      final inv = widget.invoiceToEdit!;
      _selectedClientId = inv.clientId;
      _currency = inv.currency;
      _taxRateController.text = (inv.taxRate ?? 0).toString();
      _dueDate = inv.dueDate;

      if (inv.items.isNotEmpty) {
        for (final item in inv.items) {
          final descParts = (item.description ?? '').split('|||');
          final name = descParts.isNotEmpty ? descParts[0] : '';
          final desc = descParts.length > 1 ? descParts.sublist(1).join('|||') : '';
          _items.add(
            LineItemInput(
              name: name,
              desc: desc,
              qty: item.quantity.toString(),
              price: item.unitPrice?.toStringAsFixed(2) ?? '',
            ),
          );
        }
      } else {
        _items.add(LineItemInput());
      }
    } else {
      _dueDate = DateTime.now().add(const Duration(days: 14));
      _items.add(LineItemInput());
    }
  }

  @override
  void dispose() {
    _taxRateController.dispose();
    for (final item in _items) {
      item.dispose();
    }
    super.dispose();
  }

  void _addItem() {
    setState(() {
      _items.add(LineItemInput());
    });
  }

  void _removeItem(int index) {
    if (_items.length > 1) {
      setState(() {
        _items[index].dispose();
        _items.removeAt(index);
      });
    }
  }

  double get _subtotal {
    return _items.fold(0.0, (sum, item) => sum + item.amount);
  }

  double get _taxRate {
    return double.tryParse(_taxRateController.text) ?? 0.0;
  }

  double get _taxAmount {
    return _subtotal * (_taxRate / 100.0);
  }

  double get _total {
    return _subtotal + _taxAmount;
  }

  Future<void> _submitInvoice({bool isDraft = false}) async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedClientId == null || _selectedClientId!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a client')),
      );
      return;
    }

    if (_items.isEmpty || _items.any((i) => i.nameController.text.trim().isEmpty)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please provide an item name for all line items')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final formattedItems = _items.map((item) {
        final name = item.nameController.text.trim();
        final desc = item.descController.text.trim();
        final fullDescription = desc.isNotEmpty ? '$name|||$desc' : name;

        return InvoiceItemModel(
          id: '',
          invoiceId: widget.invoiceToEdit?.id ?? '',
          description: fullDescription,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        );
      }).toList();

      final invoiceModel = InvoiceModel(
        id: widget.invoiceToEdit?.id ?? '',
        clientId: _selectedClientId!,
        currency: _currency,
        taxRate: _taxRate,
        dueDate: _dueDate,
        status: isDraft ? 'DRAFT' : 'SENT',
        items: formattedItems,
      );

      bool success = false;
      if (widget.invoiceToEdit != null) {
        success = await ref.read(invoicesProvider.notifier).updateInvoice(
              widget.invoiceToEdit!.id,
              invoiceModel,
            );
      } else {
        success = await ref.read(invoicesProvider.notifier).createInvoice(invoiceModel);
      }

      if (mounted) {
        setState(() => _isSubmitting = false);
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                widget.invoiceToEdit != null
                    ? 'Invoice updated successfully'
                    : (isDraft ? 'Invoice saved as draft' : 'Invoice created successfully'),
              ),
              backgroundColor: const Color(0xFF6D9773),
            ),
          );
          Navigator.pop(context);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to save invoice. Please try again.'),
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

    final clientsAsync = ref.watch(clientsProvider);

    final bgColor = isDark ? AppTheme.trueBlack : const Color(0xFFF9FAFB);
    final cardBgColor = isDark ? AppTheme.darkBackground : Colors.white;
    final borderColor = isDark ? Colors.white10 : Colors.grey.shade200;
    final inputFillColor = isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF9FAFB);
    final currSymbol = _currencySymbols[_currency] ?? '₦';

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: Text(widget.invoiceToEdit != null ? 'Edit Invoice' : 'New Invoice'),
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
                      // --- Client & Currency Card ---
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
                              'Client Details',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 16),
                            // Client Selector
                            clientsAsync.when(
                              data: (clients) {
                                return DropdownButtonFormField<String>(
                                  value: _selectedClientId,
                                  isExpanded: true,
                                  dropdownColor: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                                  decoration: InputDecoration(
                                    labelText: 'Select Client *',
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
                                  items: clients.map((c) {
                                    return DropdownMenuItem<String>(
                                      value: c.id,
                                      child: Text(
                                        c.name,
                                        style: TextStyle(
                                          color: isDark ? Colors.white : Colors.black87,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    );
                                  }).toList(),
                                  onChanged: (val) {
                                    setState(() => _selectedClientId = val);
                                  },
                                  validator: (val) =>
                                      val == null || val.isEmpty ? 'Please select a client' : null,
                                );
                              },
                              loading: () => const LinearProgressIndicator(),
                              error: (e, _) => Text(
                                'Error loading clients: $e',
                                style: const TextStyle(color: Colors.red),
                              ),
                            ),
                            const SizedBox(height: 16),
                            // Currency & Tax Rate Row
                            Row(
                              children: [
                                Expanded(
                                  flex: 2,
                                  child: DropdownButtonFormField<String>(
                                    value: _currency,
                                    dropdownColor:
                                        isDark ? const Color(0xFF1E1E1E) : Colors.white,
                                    decoration: InputDecoration(
                                      labelText: 'Currency',
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
                                    items: [
                                      DropdownMenuItem(
                                        value: 'NGN',
                                        child: Text('NGN (₦)',
                                            style: TextStyle(
                                                color: isDark ? Colors.white : Colors.black87)),
                                      ),
                                      DropdownMenuItem(
                                        value: 'USD',
                                        child: Text('USD (\$)',
                                            style: TextStyle(
                                                color: isDark ? Colors.white : Colors.black87)),
                                      ),
                                      DropdownMenuItem(
                                        value: 'EUR',
                                        child: Text('EUR (€)',
                                            style: TextStyle(
                                                color: isDark ? Colors.white : Colors.black87)),
                                      ),
                                      DropdownMenuItem(
                                        value: 'GBP',
                                        child: Text('GBP (£)',
                                            style: TextStyle(
                                                color: isDark ? Colors.white : Colors.black87)),
                                      ),
                                    ],
                                    onChanged: (val) {
                                      if (val != null) setState(() => _currency = val);
                                    },
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  flex: 2,
                                  child: TextFormField(
                                    controller: _taxRateController,
                                    keyboardType:
                                        const TextInputType.numberWithOptions(decimal: true),
                                    decoration: InputDecoration(
                                      labelText: 'Tax Rate (%)',
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
                                    onChanged: (_) => setState(() {}),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            // Due Date Picker Field
                            InkWell(
                              onTap: () async {
                                final now = DateTime.now();
                                final picked = await showDatePicker(
                                  context: context,
                                  initialDate: _dueDate ?? now.add(const Duration(days: 14)),
                                  firstDate: now.subtract(const Duration(days: 365)),
                                  lastDate: now.add(const Duration(days: 3650)),
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
                                  setState(() => _dueDate = picked);
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
                                          'Due Date',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: isDark ? Colors.white54 : Colors.black45,
                                          ),
                                        ),
                                        Text(
                                          _dueDate != null
                                              ? DateFormat('yyyy-MM-dd').format(_dueDate!)
                                              : 'Select Due Date',
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
                      const SizedBox(height: 24),

                      // --- Line Items Header ---
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Line Items',
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          TextButton.icon(
                            onPressed: _addItem,
                            icon: const Icon(Icons.add, size: 18),
                            label: const Text('Add Item'),
                            style: TextButton.styleFrom(
                              foregroundColor: isDark ? const Color(0xFFFFBA00) : const Color(0xFF0C3B2E),
                              textStyle: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // --- Line Items List ---
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _items.length,
                        separatorBuilder: (context, index) => const SizedBox(height: 16),
                        itemBuilder: (context, index) {
                          final item = _items[index];
                          return Container(
                            padding: const EdgeInsets.all(16),
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
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Item #${index + 1}',
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                        color: isDark ? Colors.white70 : Colors.black54,
                                      ),
                                    ),
                                    if (_items.length > 1)
                                      IconButton(
                                        icon: const Icon(Icons.delete_outline,
                                            color: Colors.redAccent, size: 20),
                                        onPressed: () => _removeItem(index),
                                        padding: EdgeInsets.zero,
                                        constraints: const BoxConstraints(),
                                      ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                // Item Name
                                TextFormField(
                                  controller: item.nameController,
                                  decoration: InputDecoration(
                                    labelText: 'Item Name *',
                                    hintText: 'e.g. Web Development',
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
                                      vertical: 12,
                                    ),
                                  ),
                                  validator: (val) => val == null || val.trim().isEmpty
                                      ? 'Item name is required'
                                      : null,
                                ),
                                const SizedBox(height: 12),
                                // Item Description
                                TextFormField(
                                  controller: item.descController,
                                  maxLines: 2,
                                  decoration: InputDecoration(
                                    labelText: 'Description (Optional)',
                                    hintText: 'e.g. Delivered per requirements...',
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
                                      vertical: 12,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                // Qty, Unit Price & Amount
                                Row(
                                  children: [
                                    Expanded(
                                      flex: 2,
                                      child: TextFormField(
                                        controller: item.qtyController,
                                        keyboardType: TextInputType.number,
                                        decoration: InputDecoration(
                                          labelText: 'Qty',
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
                                            horizontal: 12,
                                            vertical: 12,
                                          ),
                                        ),
                                        onChanged: (_) => setState(() {}),
                                        validator: (val) =>
                                            int.tryParse(val ?? '') == null ? 'Invalid' : null,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      flex: 3,
                                      child: TextFormField(
                                        controller: item.priceController,
                                        keyboardType:
                                            const TextInputType.numberWithOptions(decimal: true),
                                        decoration: InputDecoration(
                                          labelText: 'Price',
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
                                            horizontal: 12,
                                            vertical: 12,
                                          ),
                                        ),
                                        onChanged: (_) => setState(() {}),
                                        validator: (val) =>
                                            double.tryParse(val ?? '') == null ? 'Invalid' : null,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      flex: 3,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12,
                                          vertical: 14,
                                        ),
                                        decoration: BoxDecoration(
                                          color: inputFillColor,
                                          borderRadius: BorderRadius.circular(12),
                                          border: Border.all(color: borderColor),
                                        ),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.end,
                                          children: [
                                            Text(
                                              'Amount',
                                              style: TextStyle(
                                                fontSize: 10,
                                                color: isDark ? Colors.white54 : Colors.black45,
                                              ),
                                            ),
                                            FittedBox(
                                              fit: BoxFit.scaleDown,
                                              child: Text(
                                                '$currSymbol${item.amount.toStringAsFixed(2)}',
                                                style: TextStyle(
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.bold,
                                                  color: isDark ? Colors.white : Colors.black87,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                // Subscription Toggle
                                InkWell(
                                  onTap: () {
                                    setState(() {
                                      item.isSubscription = !item.isSubscription;
                                    });
                                  },
                                  child: Row(
                                    children: [
                                      SizedBox(
                                        width: 24,
                                        height: 24,
                                        child: Checkbox(
                                          value: item.isSubscription,
                                          activeColor: const Color(0xFFFFBA00),
                                          checkColor: Colors.black,
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(4),
                                          ),
                                          onChanged: (val) {
                                            setState(() {
                                              item.isSubscription = val ?? false;
                                            });
                                          },
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Make this a Recurring Subscription',
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                          color: isDark ? Colors.white70 : Colors.black87,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                if (item.isSubscription) ...[
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: DropdownButtonFormField<String>(
                                          value: item.subscriptionFrequency,
                                          dropdownColor: isDark
                                              ? const Color(0xFF1E1E1E)
                                              : Colors.white,
                                          decoration: InputDecoration(
                                            labelText: 'Frequency',
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
                                              horizontal: 12,
                                              vertical: 10,
                                            ),
                                          ),
                                          items: const [
                                            DropdownMenuItem(
                                                value: 'WEEKLY', child: Text('Weekly')),
                                            DropdownMenuItem(
                                                value: 'MONTHLY', child: Text('Monthly')),
                                            DropdownMenuItem(
                                                value: 'YEARLY', child: Text('Yearly')),
                                          ],
                                          onChanged: (val) {
                                            if (val != null) {
                                              setState(() => item.subscriptionFrequency = val);
                                            }
                                          },
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ],
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 24),

                      // --- Totals Summary Card ---
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
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Subtotal',
                                  style: TextStyle(
                                    color: isDark ? Colors.white70 : Colors.black54,
                                    fontSize: 14,
                                  ),
                                ),
                                Text(
                                  '$currSymbol${_subtotal.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 14,
                                    color: isDark ? Colors.white : Colors.black87,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Tax (${_taxRate.toStringAsFixed(1)}%)',
                                  style: TextStyle(
                                    color: isDark ? Colors.white70 : Colors.black54,
                                    fontSize: 14,
                                  ),
                                ),
                                Text(
                                  '$currSymbol${_taxAmount.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 14,
                                    color: isDark ? Colors.white : Colors.black87,
                                  ),
                                ),
                              ],
                            ),
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 12),
                              child: Divider(height: 1),
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Total Amount',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                Text(
                                  '$currSymbol${_total.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 18,
                                    color: isDark ? const Color(0xFFFFBA00) : const Color(0xFF0C3B2E),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),

              // --- Bottom Action Bar ---
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
                        onPressed: _isSubmitting ? null : () => _submitInvoice(isDraft: true),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          side: BorderSide(color: borderColor),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          'Save Draft',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : () => _submitInvoice(isDraft: false),
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
                            : Text(
                                widget.invoiceToEdit != null ? 'Update Invoice' : 'Create Invoice',
                                style: const TextStyle(fontWeight: FontWeight.bold),
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
