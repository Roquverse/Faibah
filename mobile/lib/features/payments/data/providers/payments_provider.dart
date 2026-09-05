import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/dio_provider.dart';
import '../models/payment_model.dart';


class PaymentsState {
  final double totalReceived;
  final double receivedThisMonth;
  final double pendingClearance;
  final List<PaymentOverviewModel> payments;

  PaymentsState({
    required this.totalReceived,
    required this.receivedThisMonth,
    required this.pendingClearance,
    required this.payments,
  });

  factory PaymentsState.fromJson(Map<String, dynamic> json) {
    return PaymentsState(
      totalReceived: (json['totalReceived'] as num?)?.toDouble() ?? 0.0,
      receivedThisMonth: (json['receivedThisMonth'] as num?)?.toDouble() ?? 0.0,
      pendingClearance: (json['pendingClearance'] as num?)?.toDouble() ?? 0.0,
      payments: (json['payments'] as List<dynamic>?)
              ?.map((e) => PaymentOverviewModel.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class PaymentsNotifier extends AsyncNotifier<PaymentsState> {
  @override
  Future<PaymentsState> build() async {
    return _fetchPayments();
  }

  Future<PaymentsState> _fetchPayments() async {
    final dioClient = ref.read(dioClientProvider);
    final response = await dioClient.dio.get('/payments');
    
    if (response.data is Map<String, dynamic>) {
      return PaymentsState.fromJson(response.data);
    }
    return PaymentsState(totalReceived: 0, receivedThisMonth: 0, pendingClearance: 0, payments: []);
  }

  Future<void> fetchPayments() async {
    state = const AsyncValue.loading();
    try {
      final payments = await _fetchPayments();
      state = AsyncValue.data(payments);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> createPayment(PaymentModel payment) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.post('/payments', data: payment.toJson());
      if (response.statusCode == 201 || response.statusCode == 200) {
        await fetchPayments();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to create payment: $e');
      return false;
    }
  }

  Future<bool> updatePayment(String id, PaymentModel payment) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.patch('/payments/$id', data: payment.toJson());
      if (response.statusCode == 200) {
        await fetchPayments();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to update payment: $e');
      return false;
    }
  }

  Future<bool> deletePayment(String id) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.delete('/payments/$id');
      if (response.statusCode == 200 || response.statusCode == 204) {
        await fetchPayments();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to delete payment: $e');
      return false;
    }
  }
}

final paymentsProvider = AsyncNotifierProvider<PaymentsNotifier, PaymentsState>(() {
  return PaymentsNotifier();
});
