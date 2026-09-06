import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../data/models/invoice_model.dart';
import 'package:intl/intl.dart';

const double _kDocWidth = 900.0;

class InvoicePreviewScreen extends StatelessWidget {
  final InvoiceModel invoice;
  const InvoicePreviewScreen({super.key, required this.invoice});

  String _getShareText() {
    final clientName = invoice.client?.name.split(' ').first ?? 'there';
    final ref = invoice.invoiceRef ?? invoice.id.substring(0, 8).toUpperCase();
    final publicUrl = 'https://app.faibah.com/portal/invoices/${invoice.id}';
    return 'Hi $clientName,\n\nHere is your invoice ($ref). '
        'You can view it securely using the link below:\n\n$publicUrl'
        '\n\nThank you for your business!';
  }

  String _publicUrl() => 'https://app.faibah.com/portal/invoices/${invoice.id}';

  Future<void> _shareWhatsApp(BuildContext context) async {
    final text = Uri.encodeComponent(_getShareText());
    final phone = invoice.client?.whatsappNumber?.replaceAll(RegExp(r'[^\d+]'), '') ?? '';
    final url = phone.isNotEmpty ? 'https://wa.me/$phone?text=$text' : 'https://wa.me/?text=$text';
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('WhatsApp not available')));
      }
    }
  }

  Future<void> _shareEmail(BuildContext context) async {
    final ref = invoice.invoiceRef ?? invoice.id.substring(0, 8).toUpperCase();
    final subject = Uri.encodeComponent('Your Invoice ($ref)');
    final body = Uri.encodeComponent(_getShareText());
    final email = invoice.client?.email ?? '';
    final url = email.isNotEmpty ? 'mailto:$email?subject=$subject&body=$body' : 'mailto:?subject=$subject&body=$body';
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('No email app available')));
      }
    }
  }

  Future<void> _copyLink(BuildContext context) async {
    await Clipboard.setData(ClipboardData(text: _publicUrl()));
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green, size: 16),
            SizedBox(width: 8),
            Text('Public link copied!'),
          ],
        ),
      ));
    }
  }

  Future<void> _downloadPdf(BuildContext context) async {
    final uri = Uri.parse(_publicUrl());
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not open browser')));
      }
    }
  }

  void _showShareMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40, height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(color: const Color(0xFFE5E7EB), borderRadius: BorderRadius.circular(2)),
              ),
              ListTile(
                leading: const CircleAvatar(backgroundColor: Color(0xFFDCFCE7), child: Icon(Icons.chat_bubble, color: Color(0xFF16A34A), size: 20)),
                title: const Text('Send via WhatsApp', style: TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(invoice.client?.whatsappNumber ?? 'No number on file', style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
                onTap: () { Navigator.pop(context); _shareWhatsApp(context); },
              ),
              ListTile(
                leading: const CircleAvatar(backgroundColor: Color(0xFFDBEAFE), child: Icon(Icons.email_outlined, color: Color(0xFF2563EB), size: 20)),
                title: const Text('Send via Email', style: TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(invoice.client?.email ?? 'No email on file', style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
                onTap: () { Navigator.pop(context); _shareEmail(context); },
              ),
              const Divider(indent: 16, endIndent: 16),
              ListTile(
                leading: const CircleAvatar(backgroundColor: Color(0xFFF3F4F6), child: Icon(Icons.link, color: Color(0xFF374151), size: 20)),
                title: const Text('Copy Public Link', style: TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(_publicUrl(), style: const TextStyle(fontSize: 11, color: Color(0xFF6B7280)), overflow: TextOverflow.ellipsis),
                onTap: () { Navigator.pop(context); _copyLink(context); },
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
        scrollDirection: Axis.vertical,
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
          child: _VariantTwoDocument(invoice: invoice),
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      titleSpacing: 0,
      leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.pop(context)),
      title: Text(
        invoice.invoiceRef != null ? 'Preview · ${invoice.invoiceRef}' : 'Preview Invoice',
        overflow: TextOverflow.ellipsis,
      ),
      actions: [
        IconButton(onPressed: () => _downloadPdf(context), icon: const Icon(Icons.download_outlined), tooltip: 'Download PDF'),
        Padding(
          padding: const EdgeInsets.only(right: 10, top: 8, bottom: 8),
          child: ElevatedButton.icon(
            onPressed: () => _showShareMenu(context),
            icon: const Icon(Icons.share, size: 15),
            label: const Text('Share', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF59E0B),
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ),
      ],
    );
  }
}

class _VariantTwoDocument extends StatelessWidget {
  final InvoiceModel invoice;
  const _VariantTwoDocument({required this.invoice});

  String _formatCurrency(double amt) {
    final sym = invoice.currency == 'NGN' ? '₦' : invoice.currency == 'USD' ? '\$' : invoice.currency;
    final fmt = NumberFormat('#,##0.00', 'en_US');
    return '$sym${fmt.format(amt)}';
  }

  @override
  Widget build(BuildContext context) {
    final totalAmount = invoice.items.fold(0.0, (acc, i) => acc + i.amount);
    final taxRate = invoice.taxRate ?? 0.0;
    final taxAmount = totalAmount * (taxRate / 100);
    final formattedTotal = totalAmount + taxAmount;
    final isPaid = invoice.status.toUpperCase() == 'PAID';
    final progressPercent = isPaid ? 100 : invoice.status.toUpperCase() == 'SENT' ? 25 : 0;

    return Container(
      width: _kDocWidth,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFF3F4F6)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildTopBanner(),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 48),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildHeader(),
                const SizedBox(height: 64),
                _buildAddresses(),
                const SizedBox(height: 48),
                _buildItemsTable(),
                const SizedBox(height: 40),
                _buildFooter(totalAmount, taxAmount, formattedTotal, isPaid, progressPercent),
              ],
            ),
          ),
          _buildBankDetails(),
          _buildThanksBanner(),
        ],
      ),
    );
  }

  Widget _buildTopBanner() {
    return Container(
      height: 128,
      decoration: const BoxDecoration(
        color: Color(0xFF111827),
        borderRadius: BorderRadius.only(topLeft: Radius.circular(8), topRight: Radius.circular(8)),
      ),
      child: Stack(
        children: [
          Positioned(
            left: -40,
            top: 0,
            bottom: 0,
            child: Transform(
              alignment: Alignment.center,
              transform: Matrix4.skewX(-0.523599), // -30 degrees in radians
              child: Container(
                width: 400,
                color: const Color(0xFF0C3B2E),
              ),
            ),
          ),
          Positioned(
            right: 40,
            top: 0,
            bottom: 0,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                _contactRow(Icons.language, 'www.faibah.com'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _contactRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: const Color(0xFF9CA3AF), size: 14),
          const SizedBox(width: 12),
          Text(text, style: const TextStyle(color: Color(0xFFD1D5DB), fontSize: 12, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(color: const Color(0xFF0C3B2E), borderRadius: BorderRadius.circular(12)),
                  child: const Center(child: Text('F', style: TextStyle(color: Color(0xFFFFBA00), fontWeight: FontWeight.bold, fontSize: 24))),
                ),
                const SizedBox(width: 12),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Faibah Agency', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 24, color: Color(0xFF111827), height: 1)),
                    Text('DIGITAL AGENCY', style: TextStyle(fontSize: 12, color: Color(0xFF6B7280), fontWeight: FontWeight.w500, letterSpacing: 2)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),
            const Text('INVOICE', style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Color(0xFF111827), letterSpacing: 2, height: 1)),
            const SizedBox(height: 4),
            Text(invoice.invoiceRef ?? invoice.id.substring(0, 8).toUpperCase(), style: const TextStyle(color: Color(0xFF6B7280), fontWeight: FontWeight.w500, fontSize: 18, letterSpacing: 1)),
          ],
        ),
        Container(
          margin: const EdgeInsets.only(top: 64),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          decoration: BoxDecoration(color: const Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFF3F4F6))),
          child: Row(
            children: [
              _headerMetaItem(Icons.description, 'Invoice Date', invoice.createdAt != null ? DateFormat('dd/MM/yyyy').format(invoice.createdAt!) : '-'),
              const SizedBox(width: 24),
              _headerMetaItem(null, 'Due Date', invoice.dueDate != null ? DateFormat('dd/MM/yyyy').format(invoice.dueDate!) : '-'),
              const SizedBox(width: 24),
              Column(
                children: [
                  const Text('Status', style: TextStyle(color: Color(0xFF6B7280), fontSize: 14, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    decoration: BoxDecoration(
                      color: invoice.status.toUpperCase() == 'PAID' ? const Color(0xFF0C3B2E) : const Color(0xFFE5E7EB),
                      borderRadius: BorderRadius.circular(9999),
                    ),
                    child: Text(
                      invoice.status,
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: invoice.status.toUpperCase() == 'PAID' ? Colors.white : const Color(0xFF374151)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _headerMetaItem(IconData? icon, String label, String value) {
    return Row(
      children: [
        if (icon != null) ...[
          Icon(icon, color: const Color(0xFF0C3B2E), size: 24),
          const SizedBox(width: 16),
        ],
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: Color(0xFF6B7280), fontSize: 14, fontWeight: FontWeight.w500)),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(color: Color(0xFF111827), fontSize: 14, fontWeight: FontWeight.bold)),
          ],
        ),
      ],
    );
  }

  Widget _buildAddresses() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(child: _addressBlock(Icons.person, 'BILL TO', invoice.client?.name ?? 'Unknown Client', invoice.client?.address, invoice.client?.city, invoice.client?.country, invoice.client?.email, invoice.client?.whatsappNumber)),
        Expanded(child: _addressBlock(Icons.business, 'FROM', 'Faibah Agency', 'Nigeria', null, null, 'support@faibah.com', null)),
      ],
    );
  }

  Widget _addressBlock(IconData icon, String label, String name, String? address, String? city, String? country, String? email, String? phone) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 40, height: 40,
          decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: const Color(0xFFE5E7EB))),
          child: Icon(icon, color: const Color(0xFF0C3B2E), size: 18),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF9CA3AF), letterSpacing: 1)),
              const SizedBox(height: 8),
              Text(name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF111827))),
              const SizedBox(height: 4),
              if (address != null && address.isNotEmpty) Text(address, style: const TextStyle(fontSize: 14, color: Color(0xFF4B5563))),
              if (city != null || country != null) Text([city, country].where((e) => e != null && e.isNotEmpty).join(', '), style: const TextStyle(fontSize: 14, color: Color(0xFF4B5563))),
              if (email != null && email.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 8), child: Text(email, style: const TextStyle(fontSize: 14, color: Color(0xFF1F2937)))),
              if (phone != null && phone.isNotEmpty) Text(phone, style: const TextStyle(fontSize: 14, color: Color(0xFF1F2937))),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildItemsTable() {
    return Container(
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFE5E7EB))),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            decoration: const BoxDecoration(color: Color(0xFF111827), borderRadius: BorderRadius.vertical(top: Radius.circular(8))),
            child: Row(
              children: [
                const SizedBox(width: 64, child: Center(child: Icon(Icons.square, color: Colors.grey, size: 16))),
                Expanded(child: Text('ITEM & DESCRIPTION', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white))),
                SizedBox(width: 80, child: Text('QTY', textAlign: TextAlign.center, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white))),
                SizedBox(width: 120, child: Text('RATE', textAlign: TextAlign.right, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white))),
                SizedBox(width: 120, child: Text('TOTAL', textAlign: TextAlign.right, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white))),
              ],
            ),
          ),
          if (invoice.items.isEmpty)
            const Padding(padding: EdgeInsets.all(32), child: Center(child: Text('No items found', style: TextStyle(color: Color(0xFF9CA3AF)))))
          else
            ...invoice.items.asMap().entries.map((entry) {
              final idx = entry.key;
              final item = entry.value;
              final parts = (item.description ?? 'Unknown Item').split('|||');
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: idx < invoice.items.length - 1 ? const Border(bottom: BorderSide(color: Color(0xFFF3F4F6))) : null,
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(width: 64, child: Center(child: Container(width: 32, height: 32, decoration: BoxDecoration(color: const Color(0xFFF9FAFB), border: Border.all(color: const Color(0xFFF3F4F6)), borderRadius: BorderRadius.circular(4)), child: const Icon(Icons.description, color: Color(0xFF0C3B2E), size: 16)))),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(parts[0], style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF111827), fontSize: 14)),
                          if (parts.length > 1 && parts[1].isNotEmpty) Padding(padding: const EdgeInsets.only(top: 4), child: Text(parts.sublist(1).join('|||'), style: const TextStyle(color: Color(0xFF6B7280), fontSize: 12))),
                        ],
                      ),
                    ),
                    SizedBox(width: 80, child: Text('${item.quantity}', textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF374151), fontWeight: FontWeight.w500, fontSize: 14))),
                    SizedBox(width: 120, child: Text(item.unitPrice != null ? _formatCurrency(item.unitPrice!) : _formatCurrency(item.amount), textAlign: TextAlign.right, style: const TextStyle(color: Color(0xFF374151), fontWeight: FontWeight.w500, fontSize: 14))),
                    SizedBox(width: 120, child: Text(_formatCurrency(item.amount), textAlign: TextAlign.right, style: const TextStyle(color: Color(0xFF111827), fontWeight: FontWeight.bold, fontSize: 14))),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _buildFooter(double totalAmount, double taxAmount, double formattedTotal, bool isPaid, int progressPercent) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(
          child: Container(
            margin: const EdgeInsets.only(right: 32),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: const Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFF3F4F6))),
            child: Stack(
              children: [
                const Positioned(top: 0, left: 0, child: Text('PAYMENT OVERVIEW', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF6B7280), letterSpacing: 1))),
                Padding(
                  padding: const EdgeInsets.only(top: 24),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 80, height: 80,
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            CircularProgressIndicator(value: progressPercent / 100, strokeWidth: 10, backgroundColor: const Color(0xFFE5E7EB), color: const Color(0xFF111827)),
                            Center(child: Column(mainAxisSize: MainAxisSize.min, children: [Text('$progressPercent%', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF111827))), Text(isPaid ? 'Paid' : 'Pending', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: Color(0xFF6B7280)))])),
                          ],
                        ),
                      ),
                      const SizedBox(width: 24),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(children: [Container(width: 10, height: 10, decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFF111827))), const SizedBox(width: 8), const SizedBox(width: 48, child: Text('Paid', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF4B5563)))), Text(isPaid ? '100%' : '0%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF111827)))]),
                          const SizedBox(height: 8),
                          Row(children: [Container(width: 10, height: 10, decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFFD1D5DB))), const SizedBox(width: 8), const SizedBox(width: 48, child: Text('Pending', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF4B5563)))), Text(isPaid ? '0%' : '100%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF111827)))]),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        SizedBox(
          width: 340,
          child: Column(
            children: [
              _totalsRow('Subtotal', _formatCurrency(totalAmount)),
              const SizedBox(height: 16),
              _totalsRow('VAT (${invoice.taxRate ?? 0}%)', _formatCurrency(taxAmount)),
              const SizedBox(height: 16),
              const Divider(color: Color(0xFF111827), thickness: 2),
              const SizedBox(height: 16),
              _totalsRow('Total', _formatCurrency(formattedTotal), bold: true, size: 20),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: const Color(0xFFF0FDF4), borderRadius: BorderRadius.circular(8)),
                child: _totalsRow('Amount Paid', isPaid ? _formatCurrency(formattedTotal) : _formatCurrency(0), bold: true, size: 20, color: const Color(0xFF0C3B2E)),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _totalsRow(String label, String value, {bool bold = false, double size = 16, Color? color}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(fontSize: size == 16 ? 16 : 14, fontWeight: bold ? FontWeight.bold : FontWeight.w500, color: color ?? (bold ? const Color(0xFF111827) : const Color(0xFF4B5563)))),
        Text(value, style: TextStyle(fontSize: size, fontWeight: bold ? FontWeight.bold : FontWeight.w600, color: color ?? const Color(0xFF111827))),
      ],
    );
  }

  Widget _buildBankDetails() {
    return Padding(
      padding: const EdgeInsets.only(left: 40, right: 40, bottom: 32),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(color: const Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFF3F4F6))),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('BANK DETAILS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF111827), letterSpacing: 1)),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _bankItem('Bank Name', 'Not specified')),
                Expanded(child: _bankItem('Account Name', 'Not specified')),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _bankItem('Account Number', 'Not specified')),
                Expanded(child: _bankItem('Routing / Sort Code', 'Not specified')),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _bankItem('SWIFT Code', 'Not specified')),
                Expanded(child: Container()),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _bankItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF9CA3AF))),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF111827))),
      ],
    );
  }

  Widget _buildThanksBanner() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24),
      decoration: const BoxDecoration(color: Color(0xFF111827), borderRadius: BorderRadius.only(bottomLeft: Radius.circular(8), bottomRight: Radius.circular(8))),
      child: Center(
        child: RichText(
          text: const TextSpan(
            style: TextStyle(fontFamily: 'serif', fontSize: 24, fontStyle: FontStyle.italic, color: Color(0xFF0C3B2E)),
            children: [
              TextSpan(text: 'Thank you for your '),
              TextSpan(text: 'business!', style: TextStyle(fontWeight: FontWeight.bold, decoration: TextDecoration.underline, decorationColor: Color(0xFFFFBA00), decorationThickness: 2)),
            ],
          ),
        ),
      ),
    );
  }
}
