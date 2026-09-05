import '../../../invoices/data/models/invoice_model.dart';

class ReceiptModel {
  final String id;
  final String? receiptRef;
  final String invoiceId;
  final InvoiceModel? invoice;
  final double amountPaid;
  final String? paymentMethod;
  final DateTime? paymentDate;

  ReceiptModel({
    required this.id,
    this.receiptRef,
    required this.invoiceId,
    this.invoice,
    required this.amountPaid,
    this.paymentMethod,
    this.paymentDate,
  });

  factory ReceiptModel.fromJson(Map<String, dynamic> json) {
    return ReceiptModel(
      id: json['id'] ?? '',
      receiptRef: json['receiptRef'],
      invoiceId: json['invoiceId'] ?? '',
      invoice: json['invoice'] != null ? InvoiceModel.fromJson(json['invoice']) : null,
      amountPaid: json['amountPaid'] != null ? (json['amountPaid'] as num).toDouble() : 0.0,
      paymentMethod: json['paymentMethod'],
      paymentDate: json['paymentDate'] != null ? DateTime.tryParse(json['paymentDate']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'invoiceId': invoiceId,
      'amountPaid': amountPaid,
      'paymentMethod': paymentMethod,
      'paymentDate': paymentDate?.toIso8601String(),
    };
  }
}
