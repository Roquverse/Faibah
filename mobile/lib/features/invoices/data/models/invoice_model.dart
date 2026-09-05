import '../../../../features/clients/data/models/client_model.dart';

class InvoiceModel {
  final String id;
  final String? invoiceRef;
  final String status;
  final DateTime? dueDate;
  final String? projectId;
  final dynamic project;
  final String clientId;
  final ClientModel? client;
  final String currency;
  final double? taxRate;
  final DateTime? sentAt;
  final DateTime? createdAt;
  final List<InvoiceItemModel> items;

  InvoiceModel({
    required this.id,
    this.invoiceRef,
    this.status = 'DRAFT',
    this.dueDate,
    this.projectId,
    this.project,
    required this.clientId,
    this.client,
    this.currency = 'NGN',
    this.taxRate,
    this.sentAt,
    this.createdAt,
    this.items = const [],
  });

  factory InvoiceModel.fromJson(Map<String, dynamic> json) {
    return InvoiceModel(
      id: json['id'] ?? '',
      invoiceRef: json['invoiceRef'],
      status: json['status'] ?? 'DRAFT',
      dueDate: json['dueDate'] != null ? DateTime.tryParse(json['dueDate']) : null,
      projectId: json['projectId'],
      project: json['project'],
      clientId: json['clientId'] ?? '',
      client: json['client'] != null ? ClientModel.fromJson(json['client']) : null,
      currency: json['currency'] ?? 'NGN',
      taxRate: json['taxRate'] != null ? (json['taxRate'] as num).toDouble() : null,
      sentAt: json['sentAt'] != null ? DateTime.tryParse(json['sentAt']) : null,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
      items: (json['items'] as List<dynamic>?)
              ?.map((item) => InvoiceItemModel.fromJson(item))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'clientId': clientId,
      'projectId': projectId,
      'currency': currency,
      'taxRate': taxRate,
      'dueDate': dueDate?.toIso8601String(),
      'items': items.map((i) => i.toJson()).toList(),
    };
  }
}

class InvoiceItemModel {
  final String id;
  final String invoiceId;
  final String? description;
  final int quantity;
  final double? unitPrice;
  final double amount;

  InvoiceItemModel({
    required this.id,
    required this.invoiceId,
    this.description,
    this.quantity = 1,
    this.unitPrice,
    required this.amount,
  });

  factory InvoiceItemModel.fromJson(Map<String, dynamic> json) {
    return InvoiceItemModel(
      id: json['id'] ?? '',
      invoiceId: json['invoiceId'] ?? '',
      description: json['description'],
      quantity: json['quantity'] ?? 1,
      unitPrice: json['unitPrice'] != null ? (json['unitPrice'] as num).toDouble() : null,
      amount: (json['amount'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'description': description,
      'quantity': quantity,
      'unitPrice': unitPrice,
      'amount': amount,
    };
  }
}
