import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import '../data/models/invoice_model.dart';
import 'package:intl/intl.dart';

/// Fixed document width — same as web (800px).
/// FittedBox scales it to fit any screen.
const double _kDocWidth = 800.0;

class InvoicePreviewScreen extends StatelessWidget {
  final InvoiceModel invoice;
  const InvoicePreviewScreen({super.key, required this.invoice});

  // ── Mirrors ShareDropdown.tsx: getMessageText() ──────────────
  String _getShareText() {
    final clientName = invoice.client?.name?.split(' ').first ?? 'there';
    final ref = invoice.invoiceRef ?? invoice.id.substring(0, 8).toUpperCase();
    final publicUrl = 'https://app.faibah.com/portal/invoices/${invoice.id}';
    return 'Hi $clientName,\n\nHere is your invoice ($ref). '
        'You can view it securely using the link below:\n\n$publicUrl'
        '\n\nThank you for your business!';
  }

  String _publicUrl() =>
      'https://app.faibah.com/portal/invoices/${invoice.id}';

  // ── Mirrors handleWhatsApp() ──────────────────────────────────
  Future<void> _shareWhatsApp(BuildContext context) async {
    final text = Uri.encodeComponent(_getShareText());
    final phone = invoice.client?.whatsappNumber
        ?.replaceAll(RegExp(r'[^\d+]'), '') ??
        '';
    final url = phone.isNotEmpty
        ? 'https://wa.me/$phone?text=$text'
        : 'https://wa.me/?text=$text';
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('WhatsApp not available on this device')),
        );
      }
    }
  }

  // ── Mirrors handleEmail() ─────────────────────────────────────
  Future<void> _shareEmail(BuildContext context) async {
    final ref = invoice.invoiceRef ?? invoice.id.substring(0, 8).toUpperCase();
    final subject = Uri.encodeComponent('Your Invoice ($ref)');
    final body = Uri.encodeComponent(_getShareText());
    final email = invoice.client?.email ?? '';
    final url = email.isNotEmpty
        ? 'mailto:$email?subject=$subject&body=$body'
        : 'mailto:?subject=$subject&body=$body';
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No email app available')),
        );
      }
    }
  }

  // ── Mirrors handleCopy() ──────────────────────────────────────
  Future<void> _copyLink(BuildContext context) async {
    await Clipboard.setData(ClipboardData(text: _publicUrl()));
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Row(
            children: [
              Icon(Icons.check_circle, color: Colors.green, size: 16),
              SizedBox(width: 8),
              Text('Public link copied!'),
            ],
          ),
        ),
      );
    }
  }

  // ── Download PDF: use Share sheet with text (mobile equiv of window.print()) ──
  Future<void> _downloadPdf(BuildContext context) async {
    // On mobile the closest equivalent to window.print() is sharing the public URL
    // so the user can open it in a browser and print/save as PDF.
    final ref = invoice.invoiceRef ?? invoice.id.substring(0, 8).toUpperCase();
    await SharePlus.instance.share(
      ShareParams(
        text: 'Invoice $ref\n${_publicUrl()}',
        subject: 'Invoice $ref',
      ),
    );
  }

  // ── Share dropdown ────────────────────────────────────────────
  void _showShareMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40, height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFFE5E7EB),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              ListTile(
                leading: const CircleAvatar(
                  backgroundColor: Color(0xFFDCFCE7),
                  child: Icon(Icons.chat_bubble, color: Color(0xFF16A34A), size: 20),
                ),
                title: const Text('Send via WhatsApp',
                    style: TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(
                  invoice.client?.whatsappNumber ?? 'No number on file',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
                ),
                onTap: () {
                  Navigator.pop(context);
                  _shareWhatsApp(context);
                },
              ),
              ListTile(
                leading: const CircleAvatar(
                  backgroundColor: Color(0xFFDBEAFE),
                  child: Icon(Icons.email_outlined, color: Color(0xFF2563EB), size: 20),
                ),
                title: const Text('Send via Email',
                    style: TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(
                  invoice.client?.email ?? 'No email on file',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
                ),
                onTap: () {
                  Navigator.pop(context);
                  _shareEmail(context);
                },
              ),
              const Divider(indent: 16, endIndent: 16),
              ListTile(
                leading: const CircleAvatar(
                  backgroundColor: Color(0xFFF3F4F6),
                  child: Icon(Icons.link, color: Color(0xFF374151), size: 20),
                ),
                title: const Text('Copy Public Link',
                    style: TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(
                  _publicUrl(),
                  style: const TextStyle(fontSize: 11, color: Color(0xFF6B7280)),
                  overflow: TextOverflow.ellipsis,
                ),
                onTap: () {
                  Navigator.pop(context);
                  _copyLink(context);
                },
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: _buildAppBar(context),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 24),
        child: FittedBox(
          fit: BoxFit.fitWidth,
          alignment: Alignment.topCenter,
          child: _VariantThreeDocument(invoice: invoice),
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      scrolledUnderElevation: 1,
      titleSpacing: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Color(0xFF111827), size: 20),
        onPressed: () => Navigator.pop(context),
      ),
      title: Text(
        invoice.invoiceRef != null
            ? 'Preview Invoice · ${invoice.invoiceRef}'
            : 'Preview Invoice',
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(
          color: Color(0xFF111827),
          fontWeight: FontWeight.w700,
          fontSize: 15,
        ),
      ),
      actions: [
        // Download PDF — matches web's window.print() button
        IconButton(
          onPressed: () => _downloadPdf(context),
          icon: const Icon(Icons.download_outlined, color: Color(0xFF374151)),
          tooltip: 'Download PDF',
        ),
        // Share — opens dropdown matching web's ShareDropdown.tsx
        Padding(
          padding: const EdgeInsets.only(right: 10, top: 8, bottom: 8),
          child: ElevatedButton.icon(
            onPressed: () => _showShareMenu(context),
            icon: const Icon(Icons.share, size: 15),
            label: const Text('Share',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF59E0B),
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────
// VariantThree — "Classic" template (mirrors VariantThree.tsx)
// Always rendered at _kDocWidth=800 then scaled by FittedBox
// ─────────────────────────────────────────────────────────────
class _VariantThreeDocument extends StatelessWidget {
  final InvoiceModel invoice;

  const _VariantThreeDocument({required this.invoice});

  String _formatCurrency(double amt) {
    final sym = invoice.currency == 'NGN'
        ? '₦'
        : invoice.currency == 'USD'
            ? '\$'
            : invoice.currency;
    final fmt = NumberFormat('#,##0.00', 'en_US');
    return '$sym${fmt.format(amt)}';
  }

  @override
  Widget build(BuildContext context) {
    final totalAmount =
        invoice.items.fold(0.0, (acc, i) => acc + i.amount);
    final taxRate = invoice.taxRate ?? 0.0;
    final taxAmount = totalAmount * (taxRate / 100);
    final formattedTotal = totalAmount + taxAmount;
    final isPaid = invoice.status.toUpperCase() == 'PAID';

    final dateStr = invoice.createdAt != null
        ? DateFormat('dd/MM/yyyy').format(invoice.createdAt!)
        : '-';
    final dueDateStr = invoice.dueDate != null
        ? DateFormat('dd/MM/yyyy').format(invoice.dueDate!)
        : '-';

    return Container(
      width: _kDocWidth,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFD1D5DB)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 24,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      padding: const EdgeInsets.all(80), // matches p-10 (40px × 2)
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // ══ HEADER ══
          _buildHeader(dateStr, dueDateStr),

          const SizedBox(height: 48),

          // ══ BILLED TO ══
          _buildBilledTo(),

          const SizedBox(height: 48),

          // ══ ITEMS TABLE ══
          _buildItemsTable(),

          const SizedBox(height: 40),

          // ══ TOTALS (right-aligned) ══
          Align(
            alignment: Alignment.centerRight,
            child: SizedBox(
              width: 340,
              child: _buildTotals(
                  totalAmount, taxAmount, formattedTotal, taxRate, isPaid),
            ),
          ),

          const SizedBox(height: 64),

          // ══ BANK DETAILS ══
          _buildBankDetails(),

          const SizedBox(height: 40),
        ],
      ),
    );
  }

  // ── Header ──────────────────────────────────────────────────
  Widget _buildHeader(String date, String dueDate) {
    final ref = invoice.invoiceRef ??
        invoice.id.substring(0, 8).toUpperCase();

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Left column: logo + company info
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Company name (bold, uppercase, large — mirrors font-bold text-2xl uppercase tracking-wider)
              const Text(
                'FAIBAH',
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 24,
                  letterSpacing: 1.5,
                  color: Color(0xFF111827),
                ),
              ),
              const SizedBox(height: 16),
              // Company details
              _companyDetail('Nigeria'),
              _companyDetail('support@faibah.com'),
            ],
          ),
        ),
        // Right column: "INVOICE" + meta grid
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            // "INVOICE" — matches text-4xl font-light tracking-widest text-gray-400
            const Text(
              'INVOICE',
              style: TextStyle(
                fontSize: 40,
                fontWeight: FontWeight.w300,
                letterSpacing: 6,
                color: Color(0xFFD1D5DB),
              ),
            ),
            const SizedBox(height: 24),
            // Meta grid: 2 columns
            _buildMetaGrid(ref, date, dueDate),
          ],
        ),
      ],
    );
  }

  Widget _buildMetaGrid(String ref, String date, String dueDate) {
    return Table(
      defaultVerticalAlignment: TableCellVerticalAlignment.top,
      columnWidths: const {
        0: IntrinsicColumnWidth(),
        1: IntrinsicColumnWidth(),
      },
      children: [
        _metaRow('Invoice No:', ref, boldValue: true),
        _metaRow('Date:', date),
        _metaRow('Due Date:', dueDate),
        _metaRow('Status:', invoice.status, boldValue: true),
      ],
    );
  }

  TableRow _metaRow(String label, String value, {bool boldValue = false}) {
    return TableRow(children: [
      Padding(
        padding: const EdgeInsets.only(bottom: 8, right: 32),
        child: Text(label,
            style: const TextStyle(fontSize: 14, color: Color(0xFF6B7280))),
      ),
      Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: boldValue ? FontWeight.w600 : FontWeight.w600,
            color: const Color(0xFF111827),
          ),
        ),
      ),
    ]);
  }

  // ── Billed To ────────────────────────────────────────────────
  Widget _buildBilledTo() {
    final c = invoice.client;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // "BILLED TO" label — text-xs font-bold text-gray-400 uppercase tracking-widest
        const Text(
          'BILLED TO',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            letterSpacing: 2,
            color: Color(0xFF9CA3AF),
          ),
        ),
        const SizedBox(height: 16),
        // Client name — font-bold text-lg
        Text(
          c?.name ?? 'Unknown Client',
          style: const TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 18,
            color: Color(0xFF111827),
          ),
        ),
        const SizedBox(height: 4),
        if (c?.address != null) _clientDetail(c!.address!),
        if (c?.city != null || c?.country != null)
          _clientDetail([c?.city, c?.country].whereType<String>().join(', ')),
        if (c?.email != null) _clientDetail(c!.email!),
        if (c?.whatsappNumber != null) _clientDetail(c!.whatsappNumber!),
      ],
    );
  }

  // ── Items Table ──────────────────────────────────────────────
  Widget _buildItemsTable() {
    return Column(
      children: [
        // Header row — border-b-2 border-gray-900
        Container(
          decoration: const BoxDecoration(
            border: Border(
              bottom: BorderSide(color: Color(0xFF111827), width: 2),
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                Expanded(
                  child: _tableHeader('ITEM & DESCRIPTION',
                      align: TextAlign.left),
                ),
                SizedBox(
                    width: 96,
                    child: _tableHeader('QTY', align: TextAlign.center)),
                SizedBox(
                    width: 128,
                    child: _tableHeader('RATE', align: TextAlign.right)),
                SizedBox(
                    width: 128,
                    child: _tableHeader('TOTAL', align: TextAlign.right)),
              ],
            ),
          ),
        ),

        // Item rows — divide-y divide-gray-200
        if (invoice.items.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 32),
            child: Center(
              child: Text('No items found for this invoice.',
                  style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 14)),
            ),
          )
        else
          ...invoice.items.map((item) {
            // Split description on '|||' just like the web component
            final parts = (item.description ?? 'Unknown Item').split('|||');
            final itemName = parts[0];
            final itemDetails = parts.length > 1 ? parts.sublist(1).join('|||') : '';

            return Container(
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: Color(0xFFE5E7EB), width: 1),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Description column
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            itemName,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                              color: Color(0xFF111827),
                            ),
                          ),
                          if (itemDetails.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              itemDetails,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF6B7280),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    // QTY
                    SizedBox(
                      width: 96,
                      child: Text(
                        '${item.quantity}',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                            fontSize: 14, color: Color(0xFF374151)),
                      ),
                    ),
                    // Rate
                    SizedBox(
                      width: 128,
                      child: Text(
                        item.unitPrice != null
                            ? _formatCurrency(item.unitPrice!)
                            : _formatCurrency(item.amount),
                        textAlign: TextAlign.right,
                        style: const TextStyle(
                            fontSize: 14, color: Color(0xFF374151)),
                      ),
                    ),
                    // Total
                    SizedBox(
                      width: 128,
                      child: Text(
                        _formatCurrency(item.amount),
                        textAlign: TextAlign.right,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF111827),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
      ],
    );
  }

  // ── Totals ───────────────────────────────────────────────────
  Widget _buildTotals(double subtotal, double taxAmount, double formattedTotal,
      double taxRate, bool isPaid) {
    return Column(
      children: [
        // Subtotal row
        _totalsRow('Subtotal', _formatCurrency(subtotal), light: true),
        const SizedBox(height: 12),
        // VAT row
        _totalsRow(
            'VAT (${taxRate.toStringAsFixed(0)}%)',
            _formatCurrency(taxAmount),
            light: true),
        const SizedBox(height: 16),

        // Divider — border-t-2 border-gray-900
        const Divider(color: Color(0xFF111827), thickness: 2),
        const SizedBox(height: 16),

        // TOTAL AMOUNT
        _totalsRow('TOTAL AMOUNT', _formatCurrency(formattedTotal),
            uppercase: true, large: true),
        const SizedBox(height: 8),

        // Amount Paid
        _totalsRow(
            'Amount Paid',
            isPaid
                ? _formatCurrency(formattedTotal)
                : _formatCurrency(0),
            light: true),
        const SizedBox(height: 4),

        // Amount Due
        _totalsRow(
            'Amount Due',
            isPaid
                ? _formatCurrency(0)
                : _formatCurrency(formattedTotal),
            bold: true,
            large: true),
      ],
    );
  }

  Widget _totalsRow(String label, String value,
      {bool light = false,
      bool large = false,
      bool bold = false,
      bool uppercase = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          uppercase ? label.toUpperCase() : label,
          style: TextStyle(
            fontSize: large ? 14 : 14,
            fontWeight: (bold || uppercase) ? FontWeight.w700 : FontWeight.w400,
            letterSpacing: uppercase ? 1.2 : 0,
            color: light ? const Color(0xFF6B7280) : const Color(0xFF111827),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: large ? 20 : 14,
            fontWeight: (bold || large) ? FontWeight.w700 : FontWeight.w600,
            color: const Color(0xFF111827),
          ),
        ),
      ],
    );
  }

  // ── Bank Details ─────────────────────────────────────────────
  Widget _buildBankDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // border-t border-gray-200
        const Divider(color: Color(0xFFE5E7EB), height: 1),
        const SizedBox(height: 32),
        // "BANK DETAILS" label
        const Text(
          'BANK DETAILS',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 12,
            letterSpacing: 2,
            color: Color(0xFF111827),
          ),
        ),
        const SizedBox(height: 16),
        // 2-column grid (matches grid-cols-2 gap-y-3 gap-x-12 max-w-[600px])
        SizedBox(
          width: 600,
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(child: _bankDetailPair('Bank Name', 'Not specified')),
                  const SizedBox(width: 48),
                  Expanded(
                      child: _bankDetailPair('Account Name', 'Not specified')),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                      child:
                          _bankDetailPair('Account Number', 'Not specified')),
                  const SizedBox(width: 48),
                  Expanded(
                      child:
                          _bankDetailPair('Routing Code', 'Not specified')),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                      child: _bankDetailPair('SWIFT Code', 'Not specified')),
                  const SizedBox(width: 48),
                  Expanded(child: Container()),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _bankDetailPair(String label, String value) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFF3F4F6))),
      ),
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF6B7280))),
          Text(value,
              style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF111827))),
        ],
      ),
    );
  }

  // ── Helpers ──────────────────────────────────────────────────
  Widget _companyDetail(String text) => Padding(
        padding: const EdgeInsets.only(top: 2),
        child: Text(text,
            style:
                const TextStyle(fontSize: 14, color: Color(0xFF4B5563))),
      );

  Widget _clientDetail(String text) => Padding(
        padding: const EdgeInsets.only(top: 4),
        child: Text(text,
            style:
                const TextStyle(fontSize: 14, color: Color(0xFF4B5563))),
      );

  Widget _tableHeader(String text, {required TextAlign align}) => Text(
        text,
        textAlign: align,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: Color(0xFF111827),
        ),
      );
}
