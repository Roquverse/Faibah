import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import '../data/models/invoice_model.dart';
import '../data/providers/company_profile_provider.dart';
import '../data/providers/invoices_provider.dart';

enum InvoiceVariant { classic, professional, enterprise }

// Standard A4 reference width in pts (matching Web 800px container)
const double _kA4Width = 800.0;

class InvoicePreviewScreen extends ConsumerStatefulWidget {
  final InvoiceModel invoice;
  const InvoicePreviewScreen({super.key, required this.invoice});

  @override
  ConsumerState<InvoicePreviewScreen> createState() =>
      _InvoicePreviewScreenState();
}

class _InvoicePreviewScreenState extends ConsumerState<InvoicePreviewScreen> {
  InvoiceVariant _selectedVariant = InvoiceVariant.classic;
  late InvoiceModel _currentInvoice;

  @override
  void initState() {
    super.initState();
    _currentInvoice = widget.invoice;
  }

  String _formatCurrency(double amt) {
    final cur = widget.invoice.currency;
    final sym = cur == 'USD'
        ? '\$'
        : cur == 'NGN'
            ? '₦'
            : (cur.isNotEmpty ? cur : '₦');
    final fmt = NumberFormat('#,##0.00', 'en_US');
    return '$sym${fmt.format(amt)}';
  }

  String _getShareText() {
    final clientName = widget.invoice.client?.name.split(' ').first ?? 'there';
    final ref = widget.invoice.invoiceRef ??
        (widget.invoice.id.length >= 8
            ? widget.invoice.id.substring(0, 8).toUpperCase()
            : widget.invoice.id);
    final publicUrl =
        'https://app.faibah.com/portal/invoices/${widget.invoice.id}';
    return 'Hi $clientName,\n\nHere is your invoice ($ref). '
        'You can view it securely using the link below:\n\n$publicUrl'
        '\n\nThank you for your business!';
  }

  String _publicUrl() =>
      'https://app.faibah.com/portal/invoices/${widget.invoice.id}';

  Future<void> _shareWhatsApp() async {
    final text = Uri.encodeComponent(_getShareText());
    final phone = widget.invoice.client?.whatsappNumber
            ?.replaceAll(RegExp(r'[^\d+]'), '') ??
        '';
    final url = phone.isNotEmpty
        ? 'https://wa.me/$phone?text=$text'
        : 'https://wa.me/?text=$text';
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('WhatsApp not available')));
    }
  }

  Future<void> _shareEmail() async {
    final ref = widget.invoice.invoiceRef ??
        (widget.invoice.id.length >= 8
            ? widget.invoice.id.substring(0, 8).toUpperCase()
            : widget.invoice.id);
    final subject = Uri.encodeComponent('Your Invoice ($ref)');
    final body = Uri.encodeComponent(_getShareText());
    final email = widget.invoice.client?.email ?? '';
    final url = email.isNotEmpty
        ? 'mailto:$email?subject=$subject&body=$body'
        : 'mailto:?subject=$subject&body=$body';
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No email app available')));
    }
  }

  Future<void> _copyLink() async {
    await Clipboard.setData(ClipboardData(text: _publicUrl()));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Row(children: [
          Icon(Icons.check_circle, color: Colors.green, size: 16),
          SizedBox(width: 8),
          Text('Public link copied!'),
        ]),
      ));
    }
  }

  Future<void> _downloadPdf() async {
    final uri = Uri.parse(_publicUrl());
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Row(
              children: [
                Icon(Icons.downloading, color: Colors.green, size: 16),
                SizedBox(width: 8),
                Text('Opening invoice in browser to download PDF...'),
              ],
            ),
          ),
        );
      }
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open browser to download PDF')));
    }
  }

  void _showShareMenu() {
    final theme = Theme.of(context);
    showModalBottomSheet(
      context: context,
      backgroundColor: theme.colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Text('Share Invoice',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.onSurface,
                    )),
              ),
              ListTile(
                tileColor: Colors.transparent,
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                      color: const Color(0xFF25D366).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.chat_outlined,
                      color: Color(0xFF25D366)),
                ),
                title: Text('Send via WhatsApp',
                    style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: theme.colorScheme.onSurface)),
                subtitle: Text(
                  widget.invoice.client?.whatsappNumber ??
                      'To client WhatsApp',
                  style: TextStyle(
                      color: theme.colorScheme.onSurface
                          .withValues(alpha: 0.6)),
                ),
                onTap: () {
                  Navigator.pop(ctx);
                  _shareWhatsApp();
                },
              ),
              ListTile(
                tileColor: Colors.transparent,
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                      color: Colors.blue.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.email_outlined, color: Colors.blue),
                ),
                title: Text('Send via Email',
                    style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: theme.colorScheme.onSurface)),
                subtitle: Text(
                  widget.invoice.client?.email ?? 'To client email',
                  style: TextStyle(
                      color: theme.colorScheme.onSurface
                          .withValues(alpha: 0.6)),
                ),
                onTap: () {
                  Navigator.pop(ctx);
                  _shareEmail();
                },
              ),
              ListTile(
                tileColor: Colors.transparent,
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                      color: Colors.purple.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.link, color: Colors.purple),
                ),
                title: Text('Copy Public Link',
                    style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: theme.colorScheme.onSurface)),
                subtitle: Text(
                  'Share anywhere',
                  style: TextStyle(
                      color: theme.colorScheme.onSurface
                          .withValues(alpha: 0.6)),
                ),
                onTap: () {
                  Navigator.pop(ctx);
                  _copyLink();
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showVariantPicker() {
    final theme = Theme.of(context);
    showModalBottomSheet(
      context: context,
      backgroundColor: theme.colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                child: Text('Choose Template Style',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.onSurface,
                    )),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _variantCard(
                      variant: InvoiceVariant.classic,
                      name: 'Classic',
                      subtitle: 'Clean & Minimal',
                      color: const Color(0xFF374151),
                      accent: const Color(0xFF111827),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _variantCard(
                      variant: InvoiceVariant.professional,
                      name: 'Professional',
                      subtitle: 'Modern Slate',
                      color: const Color(0xFF111827),
                      accent: const Color(0xFF0C3B2E),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _variantCard(
                      variant: InvoiceVariant.enterprise,
                      name: 'Enterprise',
                      subtitle: 'Emerald Gold',
                      color: const Color(0xFF0C3B2E),
                      accent: const Color(0xFFFFBA00),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _variantCard({
    required InvoiceVariant variant,
    required String name,
    required String subtitle,
    required Color color,
    required Color accent,
  }) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final isSelected = _selectedVariant == variant;

    return InkWell(
      onTap: () {
        setState(() => _selectedVariant = variant);
        Navigator.pop(context);
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark
                  ? accent.withValues(alpha: 0.15)
                  : color.withValues(alpha: 0.08))
              : (isDark ? const Color(0xFF252525) : const Color(0xFFF9FAFB)),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? (isDark
                    ? (accent == const Color(0xFF111827)
                        ? Colors.white
                        : accent)
                    : color)
                : (isDark
                    ? const Color(0xFF333333)
                    : const Color(0xFFE5E7EB)),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Container(
              height: 48,
              width: double.infinity,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Container(
                  width: 24,
                  height: 4,
                  decoration: BoxDecoration(
                    color: accent,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              name,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: isSelected
                    ? (isDark ? Colors.white : color)
                    : theme.colorScheme.onSurface,
              ),
            ),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 10,
                color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSegmentedToggle(ThemeData theme, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : const Color(0xFFE5E7EB),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isDark ? const Color(0xFF2E2E2E) : const Color(0xFFD1D5DB),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _segmentTab('Classic', InvoiceVariant.classic, isDark, theme),
          _segmentTab(
              'Professional', InvoiceVariant.professional, isDark, theme),
          _segmentTab('Enterprise', InvoiceVariant.enterprise, isDark, theme),
        ],
      ),
    );
  }

  Widget _segmentTab(
      String label, InvoiceVariant variant, bool isDark, ThemeData theme) {
    final isSelected = _selectedVariant == variant;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedVariant = variant),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected
                ? (isDark ? const Color(0xFF2C2C2C) : Colors.white)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black
                          .withValues(alpha: isDark ? 0.3 : 0.08),
                      blurRadius: 4,
                      offset: const Offset(0, 1),
                    )
                  ]
                : null,
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected
                    ? (isDark ? Colors.white : const Color(0xFF111827))
                    : (isDark
                        ? const Color(0xFF9CA3AF)
                        : const Color(0xFF4B5563)),
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final companyAsync = ref.watch(companyProfileProvider);
    final company = companyAsync.asData?.value ??
        const CompanyProfile(
          name: 'Avatec Interactives',
          workType: 'Freelancer',
          address: '4th Avenue, Olorunkemi Estate, Elebu, Oluyole',
          city: 'Ibadan',
          country: 'Nigeria',
          companyEmail: 'helpdesk@avatecinteractives.dev',
          companyPhone: '08035212521',
          taxRate: 7.5,
          bankName: 'Opay',
          accountName: 'Oluwadamilola Cole',
          accountNumber: '8035212521',
          routingNumber: 'Not specified',
          swiftCode: 'Not specified',
          website: 'www.faibah.com',
        );

    final refStr = widget.invoice.invoiceRef ??
        (widget.invoice.id.length >= 8
            ? widget.invoice.id.substring(0, 8).toUpperCase()
            : widget.invoice.id);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: theme.colorScheme.onSurface),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          refStr,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
            color: theme.colorScheme.onSurface,
          ),
        ),
        actions: [
          if (_currentInvoice.status.toUpperCase() != 'PAID')
            IconButton(
              icon: const Icon(Icons.check_circle_outline, color: Color(0xFF6D9773)),
              tooltip: 'Mark as Paid',
              onPressed: () async {
                final success = await ref
                    .read(invoicesProvider.notifier)
                    .updateInvoiceStatus(_currentInvoice.id, 'PAID');
                if (!context.mounted) return;
                if (success) {
                  setState(() {
                    _currentInvoice = _currentInvoice.copyWith(status: 'PAID');
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                          '${_currentInvoice.invoiceRef ?? "Invoice"} marked as paid'),
                      backgroundColor: const Color(0xFF6D9773),
                    ),
                  );
                }
              },
            ),
          IconButton(
            icon: Icon(Icons.download_outlined,
                color: theme.colorScheme.onSurface),
            tooltip: 'Download PDF',
            onPressed: _downloadPdf,
          ),
        ],
      ),
      body: Column(
        children: [
          // Segmented Tab Switcher
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: _buildSegmentedToggle(theme, isDark),
          ),

          // Authentic A4 Paper Canvas View (with pinch-to-zoom & smooth scaling)
          Expanded(
            child: LayoutBuilder(
              builder: (context, constraints) {
                final screenWidth = constraints.maxWidth - 20;

                return SingleChildScrollView(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                  child: Center(
                    child: InteractiveViewer(
                      minScale: 0.6,
                      maxScale: 3.0,
                      panEnabled: false,
                      child: Container(
                        width: screenWidth,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(4),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black
                                  .withValues(alpha: isDark ? 0.6 : 0.12),
                              blurRadius: 28,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: FittedBox(
                          fit: BoxFit.fitWidth,
                          alignment: Alignment.topCenter,
                          child: SizedBox(
                            width: _kA4Width,
                            child: _buildSelectedVariant(company),
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          border: Border(
            top: BorderSide(
              color: isDark
                  ? const Color(0xFF2C2C2C)
                  : const Color(0xFFE5E7EB),
            ),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.04),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: Row(
            children: [
              Expanded(
                child: Material(
                  color: isDark
                      ? const Color(0xFF252525)
                      : const Color(0xFFF3F4F6),
                  borderRadius: BorderRadius.circular(10),
                  child: InkWell(
                    onTap: _showVariantPicker,
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isDark
                              ? const Color(0xFF383838)
                              : const Color(0xFFE5E7EB),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.palette_outlined,
                              size: 16, color: theme.colorScheme.onSurface),
                          const SizedBox(width: 8),
                          Flexible(
                            child: Text(
                              _getVariantLabel(),
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                                color: theme.colorScheme.onSurface,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _showShareMenu,
                  icon: const Icon(Icons.share, size: 16, color: Colors.white),
                  label: const Text(
                    'Share Invoice',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: Colors.white,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0C3B2E),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getVariantLabel() {
    switch (_selectedVariant) {
      case InvoiceVariant.classic:
        return 'Classic';
      case InvoiceVariant.professional:
        return 'Professional';
      case InvoiceVariant.enterprise:
        return 'Enterprise';
    }
  }

  Widget _buildSelectedVariant(CompanyProfile company) {
    switch (_selectedVariant) {
      case InvoiceVariant.classic:
        return _ClassicDocumentView(
          invoice: _currentInvoice,
          company: company,
          formatCurrency: _formatCurrency,
        );
      case InvoiceVariant.professional:
        return _ProfessionalDocumentView(
          invoice: _currentInvoice,
          company: company,
          formatCurrency: _formatCurrency,
        );
      case InvoiceVariant.enterprise:
        return _EnterpriseDocumentView(
          invoice: _currentInvoice,
          company: company,
          formatCurrency: _formatCurrency,
        );
    }
  }
}

// ═════════════════════════════════════════════════════════════
// VARIANT 1: CLASSIC (SCREENSHOT 1)
// ═════════════════════════════════════════════════════════════
class _ClassicDocumentView extends StatelessWidget {
  final InvoiceModel invoice;
  final CompanyProfile company;
  final String Function(double) formatCurrency;

  const _ClassicDocumentView({
    required this.invoice,
    required this.company,
    required this.formatCurrency,
  });

  @override
  Widget build(BuildContext context) {
    final totalAmount = invoice.items.fold(0.0, (acc, i) => acc + i.amount);
    final taxRate = invoice.taxRate ?? company.taxRate ?? 7.5;
    final taxAmount = totalAmount * (taxRate / 100);
    final grandTotal = totalAmount + taxAmount;
    final isPaid = invoice.status.toUpperCase() == 'PAID';
    final refStr = invoice.invoiceRef ??
        (invoice.id.length >= 8
            ? invoice.id.substring(0, 8).toUpperCase()
            : invoice.id);
    final createdDateStr = invoice.createdAt != null
        ? DateFormat('dd/MM/yyyy').format(invoice.createdAt!)
        : '-';
    final dueDateStr = invoice.dueDate != null
        ? DateFormat('dd/MM/yyyy').format(invoice.dueDate!)
        : '-';

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 44, vertical: 48),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Section
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (company.logoUrl != null && company.logoUrl!.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Image.network(
                          company.logoUrl!,
                          height: 44,
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) =>
                              _companyLogoBadge(company.name),
                        ),
                      )
                    else
                      _companyLogoBadge(company.name),
                    const SizedBox(height: 8),
                    Text(
                      company.name.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.5,
                        color: Color(0xFF111827),
                      ),
                    ),
                    const SizedBox(height: 6),
                    if (company.address != null)
                      Text(company.address!,
                          style: const TextStyle(
                              fontSize: 13, color: Color(0xFF4B5563))),
                    if (company.city != null || company.country != null)
                      Text(
                        [company.city, company.country]
                            .where((e) => e != null && e.isNotEmpty)
                            .join(', '),
                        style: const TextStyle(
                            fontSize: 13, color: Color(0xFF4B5563)),
                      ),
                    if (company.companyEmail != null)
                      Text(company.companyEmail!,
                          style: const TextStyle(
                              fontSize: 13, color: Color(0xFF4B5563))),
                    if (company.companyPhone != null)
                      Text(company.companyPhone!,
                          style: const TextStyle(
                              fontSize: 13, color: Color(0xFF4B5563))),
                    if (taxRate > 0)
                      Text('VAT Reg No: ${taxRate.toStringAsFixed(1)}%',
                          style: const TextStyle(
                              fontSize: 12, color: Color(0xFF9CA3AF))),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text(
                    'INVOICE',
                    style: TextStyle(
                      fontSize: 40,
                      fontWeight: FontWeight.w300,
                      letterSpacing: 4,
                      color: Color(0xFF9CA3AF),
                    ),
                  ),
                  const SizedBox(height: 12),
                  _metaGridRow('Invoice No:', refStr),
                  _metaGridRow('Date:', createdDateStr),
                  _metaGridRow('Due Date:', dueDateStr),
                  _metaGridRow('Status:', invoice.status.toUpperCase()),
                ],
              ),
            ],
          ),

          const SizedBox(height: 28),
          const Divider(color: Color(0xFFE5E7EB), thickness: 1),
          const SizedBox(height: 20),

          // Billed To
          const Text(
            'BILLED TO',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
              color: Color(0xFF9CA3AF),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            invoice.client?.name ?? 'Unknown Client',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF111827),
            ),
          ),
          if (invoice.client?.address != null)
            Text(invoice.client!.address!,
                style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
          if (invoice.client?.city != null || invoice.client?.country != null)
            Text(
              [invoice.client?.city, invoice.client?.country]
                  .where((e) => e != null && e.isNotEmpty)
                  .join(', '),
              style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
            ),
          if (invoice.client?.email != null)
            Text(invoice.client!.email!,
                style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
          if (invoice.client?.whatsappNumber != null)
            Text(invoice.client!.whatsappNumber!,
                style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),

          const SizedBox(height: 32),

          // Minimal items table (Screenshot 1 design)
          _buildClassicItemsTable(invoice, formatCurrency),

          const SizedBox(height: 24),

          // Totals Section
          Align(
            alignment: Alignment.centerRight,
            child: SizedBox(
              width: 320,
              child: Column(
                children: [
                  _calcRow('Subtotal', formatCurrency(totalAmount)),
                  if (taxRate > 0)
                    _calcRow('VAT (${taxRate.toStringAsFixed(1)}%)',
                        formatCurrency(taxAmount)),
                  const Divider(height: 20, thickness: 2, color: Color(0xFF111827)),
                  _calcRow('TOTAL AMOUNT', formatCurrency(grandTotal),
                      isTotal: true, size: 16),
                  const SizedBox(height: 6),
                  _calcRow(
                      'Amount Paid',
                      isPaid
                          ? formatCurrency(grandTotal)
                          : formatCurrency(0)),
                  _calcRow(
                    'Amount Due',
                    isPaid ? formatCurrency(0) : formatCurrency(grandTotal),
                    isTotal: true,
                    size: 16,
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 48),
          const Divider(color: Color(0xFFE5E7EB), thickness: 1),
          const SizedBox(height: 20),

          // Bank Details Grid (Screenshot 1)
          _buildBankDetailsGrid(company),
        ],
      ),
    );
  }

  Widget _metaGridRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
            ),
          ),
          Text(
            val,
            style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: Color(0xFF111827)),
          ),
        ],
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════
// VARIANT 2: PROFESSIONAL (SCREENSHOT 2)
// ═════════════════════════════════════════════════════════════
class _ProfessionalDocumentView extends StatelessWidget {
  final InvoiceModel invoice;
  final CompanyProfile company;
  final String Function(double) formatCurrency;

  const _ProfessionalDocumentView({
    required this.invoice,
    required this.company,
    required this.formatCurrency,
  });

  @override
  Widget build(BuildContext context) {
    final totalAmount = invoice.items.fold(0.0, (acc, i) => acc + i.amount);
    final taxRate = invoice.taxRate ?? company.taxRate ?? 7.5;
    final taxAmount = totalAmount * (taxRate / 100);
    final grandTotal = totalAmount + taxAmount;
    final isPaid = invoice.status.toUpperCase() == 'PAID';
    final refStr = invoice.invoiceRef ??
        (invoice.id.length >= 8
            ? invoice.id.substring(0, 8).toUpperCase()
            : invoice.id);
    final createdDateStr = invoice.createdAt != null
        ? DateFormat('dd/MM/yyyy').format(invoice.createdAt!)
        : '-';
    final dueDateStr = invoice.dueDate != null
        ? DateFormat('dd/MM/yyyy').format(invoice.dueDate!)
        : '-';

    return Container(
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Top dark bar with angled polygon (Screenshot 2)
          Container(
            height: 100,
            color: const Color(0xFF111827),
            child: Stack(
              children: [
                // Angled green slash
                Positioned(
                  left: -30,
                  top: 0,
                  bottom: 0,
                  child: Transform(
                    alignment: Alignment.center,
                    transform: Matrix4.skewX(-0.5),
                    child: Container(
                      width: 320,
                      color: const Color(0xFF0C3B2E),
                    ),
                  ),
                ),
                // Contact info on right
                Positioned(
                  right: 36,
                  top: 0,
                  bottom: 0,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      if (company.companyPhone != null)
                        _bannerContactItem(Icons.phone, company.companyPhone!),
                      if (company.companyEmail != null)
                        _bannerContactItem(
                            Icons.email_outlined, company.companyEmail!),
                      _bannerContactItem(
                          Icons.language, company.website ?? 'www.faibah.com'),
                      if (company.address != null)
                        _bannerContactItem(Icons.location_on_outlined,
                            '${company.address!}${company.city != null ? ', ${company.city}' : ''}'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 36),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header Row
                Row(
                  children: [
                    if (company.logoUrl != null && company.logoUrl!.isNotEmpty)
                      Image.network(
                        company.logoUrl!,
                        height: 44,
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) =>
                            _companyLogoBadge(company.name),
                      )
                    else
                      _companyLogoBadge(company.name),
                    const SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          company.name,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 22,
                            color: Color(0xFF111827),
                          ),
                        ),
                        Text(
                          (company.workType ?? 'FREELANCER').toUpperCase(),
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF6B7280),
                            letterSpacing: 2,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Invoice & Metadata Row (Screenshot 2)
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'INVOICE',
                          style: TextStyle(
                            fontSize: 34,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF111827),
                          ),
                        ),
                        Text(
                          refStr,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF6B7280),
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 18, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF9FAFB),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE5E7EB)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.description_outlined,
                              size: 20, color: Color(0xFF0C3B2E)),
                          const SizedBox(width: 10),
                          _miniMeta('Invoice Date', createdDateStr),
                          const SizedBox(width: 20),
                          _miniMeta('Due Date', dueDateStr),
                          const SizedBox(width: 20),
                          _miniMetaBadge('Status', invoice.status, isPaid),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 32),

                // Bill to & From (Screenshot 2 icons style)
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _circleIconBadge(Icons.person_outline),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'BILL TO',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF9CA3AF),
                                    letterSpacing: 1.5,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  invoice.client?.name ?? 'Unknown Client',
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF111827),
                                  ),
                                ),
                                if (invoice.client?.address != null)
                                  Text(invoice.client!.address!,
                                      style: const TextStyle(
                                          fontSize: 13,
                                          color: Color(0xFF6B7280))),
                                if (invoice.client?.email != null)
                                  Text(invoice.client!.email!,
                                      style: const TextStyle(
                                          fontSize: 13,
                                          color: Color(0xFF6B7280))),
                                if (invoice.client?.whatsappNumber != null)
                                  Text(invoice.client!.whatsappNumber!,
                                      style: const TextStyle(
                                          fontSize: 13,
                                          color: Color(0xFF6B7280))),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _circleIconBadge(Icons.business_outlined),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'FROM',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF9CA3AF),
                                    letterSpacing: 1.5,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  company.name,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF111827),
                                  ),
                                ),
                                if (company.address != null)
                                  Text(company.address!,
                                      style: const TextStyle(
                                          fontSize: 13,
                                          color: Color(0xFF6B7280))),
                                if (company.companyEmail != null)
                                  Text(company.companyEmail!,
                                      style: const TextStyle(
                                          fontSize: 13,
                                          color: Color(0xFF6B7280))),
                                if (company.companyPhone != null)
                                  Text(company.companyPhone!,
                                      style: const TextStyle(
                                          fontSize: 13,
                                          color: Color(0xFF6B7280))),
                                if (taxRate > 0)
                                  Text(
                                      'VAT Reg No: ${taxRate.toStringAsFixed(1)}%',
                                      style: const TextStyle(
                                          fontSize: 12,
                                          color: Color(0xFF9CA3AF))),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 32),

                // Items Table (Screenshot 2 dark header)
                _buildBoxedItemsTable(
                  invoice,
                  formatCurrency,
                  headerColor: const Color(0xFF111827),
                  showCheckSquare: true,
                ),

                const SizedBox(height: 32),

                // Totals & Overview (Screenshot 2)
                LayoutBuilder(
                  builder: (context, constraints) {
                    final isNarrow = constraints.maxWidth < 580;
                    final totalsWidget = Column(
                      children: [
                        _calcRow('Subtotal', formatCurrency(totalAmount)),
                        if (taxRate > 0)
                          _calcRow('VAT (${taxRate.toStringAsFixed(1)}%)',
                              formatCurrency(taxAmount)),
                        const Divider(
                            height: 16,
                            thickness: 2,
                            color: Color(0xFF111827)),
                        _calcRow('Total', formatCurrency(grandTotal),
                            isTotal: true, size: 18),
                        const SizedBox(height: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Amount Paid',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF065F46),
                                ),
                              ),
                              Text(
                                isPaid
                                    ? formatCurrency(grandTotal)
                                    : formatCurrency(0),
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF065F46),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    );

                    if (isNarrow) {
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _buildPaymentOverviewCard(isPaid),
                          const SizedBox(height: 20),
                          totalsWidget,
                        ],
                      );
                    }

                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: _buildPaymentOverviewCard(isPaid),
                        ),
                        const SizedBox(width: 24),
                        SizedBox(
                          width: 280,
                          child: totalsWidget,
                        ),
                      ],
                    );
                  },
                ),

                const SizedBox(height: 36),

                // Bank Details Container (Screenshot 2)
                Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFF3F4F6)),
                  ),
                  child: _buildBankDetailsGrid(company),
                ),
              ],
            ),
          ),

          // Bottom footer banner
          Container(
            padding: const EdgeInsets.symmetric(vertical: 20),
            decoration: const BoxDecoration(
              color: Color(0xFF111827),
            ),
            child: Center(
              child: RichText(
                text: const TextSpan(
                  style: TextStyle(
                    fontFamily: 'serif',
                    fontSize: 20,
                    fontStyle: FontStyle.italic,
                    color: Color(0xFF9CA3AF),
                  ),
                  children: [
                    TextSpan(text: 'Thank you for your '),
                    TextSpan(
                      text: 'business!',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF34D399),
                        decoration: TextDecoration.underline,
                        decorationColor: Color(0xFFFFBA00),
                        decorationThickness: 2,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _bannerContactItem(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: const Color(0xFF9CA3AF), size: 12),
          const SizedBox(width: 6),
          Text(
            text,
            style: const TextStyle(color: Color(0xFFD1D5DB), fontSize: 11),
          ),
        ],
      ),
    );
  }

  Widget _circleIconBadge(IconData icon) {
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Center(
        child: Icon(icon, color: const Color(0xFF0C3B2E), size: 18),
      ),
    );
  }

  Widget _miniMeta(String label, String val) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(fontSize: 10, color: Color(0xFF9CA3AF))),
        const SizedBox(height: 2),
        Text(val,
            style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: Color(0xFF111827))),
      ],
    );
  }

  Widget _miniMetaBadge(String label, String status, bool isPaid) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(fontSize: 10, color: Color(0xFF9CA3AF))),
        const SizedBox(height: 2),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(
            color: isPaid ? const Color(0xFF0C3B2E) : const Color(0xFFE5E7EB),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            status.toUpperCase(),
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: isPaid ? Colors.white : const Color(0xFF374151),
            ),
          ),
        ),
      ],
    );
  }
}

// ═════════════════════════════════════════════════════════════
// VARIANT 3: ENTERPRISE (SCREENSHOT 3)
// ═════════════════════════════════════════════════════════════
class _EnterpriseDocumentView extends StatelessWidget {
  final InvoiceModel invoice;
  final CompanyProfile company;
  final String Function(double) formatCurrency;

  const _EnterpriseDocumentView({
    required this.invoice,
    required this.company,
    required this.formatCurrency,
  });

  @override
  Widget build(BuildContext context) {
    final totalAmount = invoice.items.fold(0.0, (acc, i) => acc + i.amount);
    final taxRate = invoice.taxRate ?? company.taxRate ?? 7.5;
    final taxAmount = totalAmount * (taxRate / 100);
    final grandTotal = totalAmount + taxAmount;
    final isPaid = invoice.status.toUpperCase() == 'PAID';
    final refStr = invoice.invoiceRef ??
        (invoice.id.length >= 8
            ? invoice.id.substring(0, 8).toUpperCase()
            : invoice.id);
    final createdDateStr = invoice.createdAt != null
        ? DateFormat('dd/MM/yyyy').format(invoice.createdAt!)
        : '-';
    final dueDateStr = invoice.dueDate != null
        ? DateFormat('dd/MM/yyyy').format(invoice.dueDate!)
        : '-';

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 44),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Row (Screenshot 3)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        if (company.logoUrl != null && company.logoUrl!.isNotEmpty)
                          Image.network(
                            company.logoUrl!,
                            height: 44,
                            fit: BoxFit.contain,
                            errorBuilder: (context, error, stackTrace) =>
                                _companyLogoBadge(company.name),
                          )
                        else
                          _companyLogoBadge(company.name),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              company.name,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 20,
                                color: Color(0xFF111827),
                              ),
                            ),
                            Text(
                              (company.workType ?? 'FREELANCER').toUpperCase(),
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF6B7280),
                                letterSpacing: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'INVOICE',
                      style: TextStyle(
                        fontSize: 42,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF111827),
                        letterSpacing: 1.5,
                      ),
                    ),
                    Text(
                      'Solutions that drive success.',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 20),
              // Emerald Info Card (Screenshot 3)
              Container(
                width: 220,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: const Color(0xFF0C3B2E),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _infoRowWhite('Invoice No.', refStr),
                    const SizedBox(height: 8),
                    _infoRowWhite('Invoice Date', createdDateStr),
                    const SizedBox(height: 8),
                    _infoRowWhite('Due Date', dueDateStr),
                    const Divider(color: Color(0xFF1A5A48), height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Payment Status',
                            style: TextStyle(
                                fontSize: 11.5, color: Color(0xFFA7F3D0))),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: isPaid
                                ? const Color(0xFF10B981)
                                : const Color(0xFFFFBA00),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            invoice.status.toUpperCase(),
                            style: TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.bold,
                              color: isPaid
                                  ? Colors.white
                                  : const Color(0xFF78350F),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 32),

          // Bill To & From side-by-side cards (Screenshot 3)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFF3F4F6)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0C3B2E).withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.person_outline,
                            color: Color(0xFF0C3B2E), size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'BILL TO',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF9CA3AF),
                                letterSpacing: 1.5,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              invoice.client?.name ?? 'Unknown Client',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF111827),
                              ),
                            ),
                            if (invoice.client?.address != null)
                              Text(invoice.client!.address!,
                                  style: const TextStyle(
                                      fontSize: 13,
                                      color: Color(0xFF6B7280))),
                            if (invoice.client?.email != null)
                              Text(invoice.client!.email!,
                                  style: const TextStyle(
                                      fontSize: 13,
                                      color: Color(0xFF6B7280))),
                            if (invoice.client?.whatsappNumber != null)
                              Text(invoice.client!.whatsappNumber!,
                                  style: const TextStyle(
                                      fontSize: 13,
                                      color: Color(0xFF6B7280))),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFF3F4F6)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0C3B2E).withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.business_outlined,
                            color: Color(0xFF0C3B2E), size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'FROM',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF9CA3AF),
                                letterSpacing: 1.5,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              company.name,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF111827),
                              ),
                            ),
                            if (company.address != null)
                              Text(company.address!,
                                  style: const TextStyle(
                                      fontSize: 13,
                                      color: Color(0xFF6B7280))),
                            if (company.companyEmail != null)
                              Text(company.companyEmail!,
                                  style: const TextStyle(
                                      fontSize: 13,
                                      color: Color(0xFF6B7280))),
                            if (company.companyPhone != null)
                              Text(company.companyPhone!,
                                  style: const TextStyle(
                                      fontSize: 13,
                                      color: Color(0xFF6B7280))),
                            if (taxRate > 0)
                              Text(
                                  'VAT Reg No: ${taxRate.toStringAsFixed(1)}%',
                                  style: const TextStyle(
                                      fontSize: 12,
                                      color: Color(0xFF9CA3AF))),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 32),

          // Items Table (Screenshot 3 numbered rows & emerald header)
          _buildBoxedItemsTable(
            invoice,
            formatCurrency,
            headerColor: const Color(0xFF0C3B2E),
            showItemIndex: true,
          ),

          const SizedBox(height: 32),

          // Overview & Totals (Screenshot 3)
          LayoutBuilder(
            builder: (context, constraints) {
              final isNarrow = constraints.maxWidth < 580;
              final totalsWidget = Column(
                children: [
                  _calcRow('Subtotal', formatCurrency(totalAmount)),
                  if (taxRate > 0)
                    _calcRow('VAT (${taxRate.toStringAsFixed(1)}%)',
                        formatCurrency(taxAmount)),
                  const SizedBox(height: 8),
                  _calcRow('Total Amount', formatCurrency(grandTotal),
                      isTotal: true, size: 18),
                  const SizedBox(height: 14),
                  // Large Dark Green Amount Due Button
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0C3B2E),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Amount Due',
                          style: TextStyle(
                            fontSize: 14,
                            color: Color(0xFFA7F3D0),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          isPaid
                              ? formatCurrency(0)
                              : formatCurrency(grandTotal),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              );

              if (isNarrow) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildPaymentOverviewCard(isPaid),
                    const SizedBox(height: 20),
                    totalsWidget,
                  ],
                );
              }

              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: _buildPaymentOverviewCard(isPaid),
                  ),
                  const SizedBox(width: 24),
                  SizedBox(
                    width: 280,
                    child: totalsWidget,
                  ),
                ],
              );
            },
          ),

          const SizedBox(height: 36),

          // Bank Details Grid (Screenshot 3)
          _buildBankDetailsGrid(company),
        ],
      ),
    );
  }

  Widget _infoRowWhite(String label, String val) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style: const TextStyle(fontSize: 12.5, color: Color(0xFFA7F3D0))),
        Flexible(
          child: Text(
            val,
            style: const TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.bold,
                color: Colors.white),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

// ═════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═════════════════════════════════════════════════════════════

Widget _companyLogoBadge(String name) {
  final initial = name.isNotEmpty ? name.substring(0, 1).toUpperCase() : 'F';
  return Container(
    width: 44,
    height: 44,
    decoration: BoxDecoration(
      color: const Color(0xFF0C3B2E),
      borderRadius: BorderRadius.circular(8),
    ),
    child: Center(
      child: Text(
        initial,
        style: const TextStyle(
          color: Color(0xFFFFBA00),
          fontWeight: FontWeight.bold,
          fontSize: 22,
        ),
      ),
    ),
  );
}

Widget _buildBankDetailsGrid(CompanyProfile company) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      const Text(
        'BANK DETAILS',
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.5,
          color: Color(0xFF111827),
        ),
      ),
      const SizedBox(height: 12),
      Row(
        children: [
          Expanded(
            child: _bankDetailItem('Bank Name', company.bankName ?? 'Opay'),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: _bankDetailItem('Account Name',
                company.accountName ?? 'Oluwadamilola Cole'),
          ),
        ],
      ),
      const SizedBox(height: 10),
      Row(
        children: [
          Expanded(
            child: _bankDetailItem(
                'Account Number', company.accountNumber ?? '8035212521'),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: _bankDetailItem('Routing / Sort Code',
                company.routingNumber ?? 'Not specified'),
          ),
        ],
      ),
      const SizedBox(height: 10),
      Row(
        children: [
          Expanded(
            child: _bankDetailItem(
                'SWIFT Code', company.swiftCode ?? 'Not specified'),
          ),
          const SizedBox(width: 20),
          const Expanded(child: SizedBox()),
        ],
      ),
    ],
  );
}

Widget _bankDetailItem(String label, String value) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        label,
        style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF)),
      ),
      const SizedBox(height: 2),
      Text(
        value,
        style: const TextStyle(
          fontSize: 13.5,
          fontWeight: FontWeight.bold,
          color: Color(0xFF111827),
        ),
      ),
    ],
  );
}

Widget _buildPaymentOverviewCard(bool isPaid) {
  return Container(
    padding: const EdgeInsets.all(18),
    decoration: BoxDecoration(
      color: const Color(0xFFF9FAFB),
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: const Color(0xFFF3F4F6)),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'PAYMENT OVERVIEW',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
            color: Color(0xFF9CA3AF),
          ),
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            // Circular Progress Indicator
            SizedBox(
              width: 68,
              height: 68,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  CircularProgressIndicator(
                    value: isPaid ? 1.0 : 0.0,
                    backgroundColor: const Color(0xFFE5E7EB),
                    valueColor: AlwaysStoppedAnimation<Color>(
                      isPaid
                          ? const Color(0xFF10B981)
                          : const Color(0xFF111827),
                    ),
                    strokeWidth: 6.5,
                  ),
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          isPaid ? '100%' : '0%',
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF111827),
                          ),
                        ),
                        Text(
                          isPaid ? 'Paid' : 'Pending',
                          style: const TextStyle(
                            fontSize: 10,
                            color: Color(0xFF9CA3AF),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            // Legend
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: Color(0xFF111827),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          isPaid ? 'Paid 100%' : 'Paid 0%',
                          style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF111827)),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: Color(0xFFD1D5DB),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          isPaid ? 'Pending 0%' : 'Pending 100%',
                          style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF6B7280)),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    ),
  );
}

// Minimal Classic Table (Screenshot 1)
Widget _buildClassicItemsTable(
  InvoiceModel invoice,
  String Function(double) formatCurrency,
) {
  return Column(
    children: [
      Container(
        padding: const EdgeInsets.only(bottom: 12),
        decoration: const BoxDecoration(
          border:
              Border(bottom: BorderSide(color: Color(0xFF111827), width: 2)),
        ),
        child: const Row(
          children: [
            Expanded(
              flex: 5,
              child: Text(
                'ITEM & DESCRIPTION',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF111827),
                ),
              ),
            ),
            SizedBox(
              width: 50,
              child: Text(
                'QTY',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF111827),
                ),
              ),
            ),
            Expanded(
              flex: 3,
              child: Text(
                'RATE',
                textAlign: TextAlign.right,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF111827),
                ),
              ),
            ),
            SizedBox(width: 12),
            Expanded(
              flex: 3,
              child: Text(
                'TOTAL',
                textAlign: TextAlign.right,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF111827),
                ),
              ),
            ),
          ],
        ),
      ),
      if (invoice.items.isEmpty)
        const Padding(
          padding: EdgeInsets.all(24),
          child: Center(
            child: Text(
              'No items on this invoice',
              style: TextStyle(fontSize: 14, color: Color(0xFF9CA3AF)),
            ),
          ),
        )
      else
        ...invoice.items.asMap().entries.map((entry) {
          final idx = entry.key;
          final item = entry.value;
          final parts = (item.description ?? 'Item').split('|||');
          final title = parts[0];
          final details = parts.length > 1
              ? parts.sublist(1).join(' ')
              : 'Professional service delivered as per project requirements.';

          return Container(
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: idx < invoice.items.length - 1
                      ? const Color(0xFFF3F4F6)
                      : const Color(0xFFE5E7EB),
                ),
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  flex: 5,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF111827),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          details,
                          style: const TextStyle(
                            fontSize: 12.5,
                            color: Color(0xFF6B7280),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(
                  width: 50,
                  child: Text(
                    '${item.quantity}',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF374151),
                    ),
                  ),
                ),
                Expanded(
                  flex: 3,
                  child: Text(
                    formatCurrency(item.unitPrice ?? 0.0),
                    textAlign: TextAlign.right,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF374151),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 3,
                  child: Text(
                    formatCurrency(item.amount),
                    textAlign: TextAlign.right,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF111827),
                    ),
                  ),
                ),
              ],
            ),
          );
        }),
    ],
  );
}

// Boxed Table for Professional & Enterprise (Screenshots 2 & 3)
Widget _buildBoxedItemsTable(
  InvoiceModel invoice,
  String Function(double) formatCurrency, {
  required Color headerColor,
  bool showCheckSquare = false,
  bool showItemIndex = false,
}) {
  return Container(
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(10),
      border: Border.all(color: const Color(0xFFE5E7EB)),
    ),
    clipBehavior: Clip.antiAlias,
    child: Column(
      children: [
        // Table Header
        Container(
          color: headerColor,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              if (showCheckSquare) ...[
                const Icon(Icons.check_box_outline_blank,
                    color: Color(0xFF9CA3AF), size: 16),
                const SizedBox(width: 8),
              ] else if (showItemIndex) ...[
                const SizedBox(
                  width: 28,
                  child: Text(
                    '#',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
              const Expanded(
                flex: 5,
                child: Text(
                  'Item & Description',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(
                width: 50,
                child: Text(
                  'Qty',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              const Expanded(
                flex: 3,
                child: Text(
                  'Rate',
                  textAlign: TextAlign.right,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                flex: 3,
                child: Text(
                  'Total',
                  textAlign: TextAlign.right,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),

        // Items
        if (invoice.items.isEmpty)
          const Padding(
            padding: EdgeInsets.all(24),
            child: Center(
              child: Text(
                'No items on this invoice',
                style: TextStyle(fontSize: 14, color: Color(0xFF9CA3AF)),
              ),
            ),
          )
        else
          ...invoice.items.asMap().entries.map((entry) {
            final idx = entry.key;
            final item = entry.value;
            final parts = (item.description ?? 'Item').split('|||');
            final title = parts[0];
            final details = parts.length > 1
                ? parts.sublist(1).join(' ')
                : 'Professional service delivered as per project requirements.';

            final indexStr = (idx + 1).toString().padLeft(2, '0');

            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                border: idx < invoice.items.length - 1
                    ? const Border(
                        bottom: BorderSide(color: Color(0xFFF3F4F6)))
                    : null,
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (showItemIndex) ...[
                    SizedBox(
                      width: 28,
                      child: Text(
                        indexStr,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF9CA3AF),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                  // Document Icon
                  Container(
                    width: 32,
                    height: 32,
                    margin: const EdgeInsets.only(right: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Center(
                      child: Icon(Icons.description_outlined,
                          size: 18, color: Color(0xFF0C3B2E)),
                    ),
                  ),
                  Expanded(
                    flex: 5,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF111827),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(
                            details,
                            style: const TextStyle(
                              fontSize: 12.5,
                              color: Color(0xFF6B7280),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(
                    width: 50,
                    child: Text(
                      '${item.quantity}',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF374151),
                      ),
                    ),
                  ),
                  Expanded(
                    flex: 3,
                    child: Text(
                      formatCurrency(item.unitPrice ?? 0.0),
                      textAlign: TextAlign.right,
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF374151),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 3,
                    child: Text(
                      formatCurrency(item.amount),
                      textAlign: TextAlign.right,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF111827),
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
      ],
    ),
  );
}

Widget _calcRow(String label, String value,
    {bool isTotal = false, double size = 14}) {
  return Padding(
    padding: const EdgeInsets.symmetric(vertical: 3),
    child: Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isTotal ? size : 13.5,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.w500,
            color: isTotal ? const Color(0xFF111827) : const Color(0xFF6B7280),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isTotal ? size + 1 : 14,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.w600,
            color: isTotal ? const Color(0xFF111827) : const Color(0xFF374151),
          ),
        ),
      ],
    ),
  );
}
