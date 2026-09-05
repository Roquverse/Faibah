import 'package:flutter/material.dart';
import 'package:flutter_paystack/flutter_paystack.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final paystackServiceProvider = Provider<PaystackService>((ref) {
  return PaystackService();
});

class PaystackService {
  final PaystackPlugin _plugin = PaystackPlugin();

  // TODO: Move to .env
  final String _publicKey = 'pk_test_placeholder_key_here';

  Future<void> initialize() async {
    await _plugin.initialize(publicKey: _publicKey);
  }

  Future<CheckoutResponse?> chargeCard({
    required BuildContext context,
    required int amount, // in kobo
    required String email,
    required String reference,
  }) async {
    Charge charge = Charge()
      ..amount = amount
      ..reference = reference
      ..email = email;
      
    try {
      final response = await _plugin.checkout(
        context,
        method: CheckoutMethod.card, // or CheckoutMethod.selectable
        charge: charge,
      );
      
      return response;
    } catch (e) {
      debugPrint('Paystack error: $e');
      return null;
    }
  }
}
