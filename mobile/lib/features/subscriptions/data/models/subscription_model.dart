import '../../../../features/clients/data/models/client_model.dart';

class SubscriptionModel {
  final String id;
  final String name;
  final String? invoiceRef;
  final double amount;
  final String frequency;
  final DateTime nextBillingDate;
  final String status;
  final String clientId;
  final ClientModel? client;
  final String companyId;
  final DateTime? createdAt;

  SubscriptionModel({
    required this.id,
    required this.name,
    this.invoiceRef,
    required this.amount,
    required this.frequency,
    required this.nextBillingDate,
    this.status = 'ACTIVE',
    required this.clientId,
    this.client,
    required this.companyId,
    this.createdAt,
  });

  factory SubscriptionModel.fromJson(Map<String, dynamic> json) {
    return SubscriptionModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      invoiceRef: json['invoiceRef'],
      amount: json['amount'] != null ? (json['amount'] as num).toDouble() : 0.0,
      frequency: json['frequency'] ?? 'MONTHLY',
      nextBillingDate: DateTime.parse(json['nextBillingDate']),
      status: json['status'] ?? 'ACTIVE',
      clientId: json['clientId'] ?? '',
      client: json['client'] != null ? ClientModel.fromJson(json['client']) : null,
      companyId: json['companyId'] ?? '',
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'amount': amount,
      'frequency': frequency,
      'nextBillingDate': nextBillingDate.toIso8601String(),
      'status': status,
      'clientId': clientId,
    };
  }
}
