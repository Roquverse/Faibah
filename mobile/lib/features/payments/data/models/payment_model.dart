class PaymentModel {
  final String id;
  final String invoiceId;
  final double amount;
  final String provider;
  final DateTime? createdAt;

  PaymentModel({
    required this.id,
    required this.invoiceId,
    required this.amount,
    this.provider = 'manual',
    this.createdAt,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(
      id: json['id'] ?? '',
      invoiceId: json['invoiceId'] ?? '',
      amount: json['amount'] != null ? (json['amount'] as num).toDouble() : 0.0,
      provider: json['provider'] ?? 'manual',
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'invoiceId': invoiceId,
      'amount': amount,
      'provider': provider,
    };
  }
}

class PaymentOverviewModel {
  final String id;
  final String rawId;
  final String date;
  final String client;
  final String invoice;
  final String amount;
  final double numericAmount;
  final String method;

  PaymentOverviewModel({
    required this.id,
    required this.rawId,
    required this.date,
    required this.client,
    required this.invoice,
    required this.amount,
    required this.numericAmount,
    required this.method,
  });

  factory PaymentOverviewModel.fromJson(Map<String, dynamic> json) {
    return PaymentOverviewModel(
      id: json['id'] ?? '',
      rawId: json['rawId'] ?? '',
      date: json['date'] ?? '',
      client: json['client'] ?? '',
      invoice: json['invoice'] ?? '',
      amount: json['amount'] ?? '',
      numericAmount: json['numericAmount'] != null ? (json['numericAmount'] as num).toDouble() : 0.0,
      method: json['method'] ?? '',
    );
  }
}
