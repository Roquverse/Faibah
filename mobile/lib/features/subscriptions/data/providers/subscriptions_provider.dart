import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/dio_provider.dart';
import '../models/subscription_model.dart';


class SubscriptionsNotifier extends AsyncNotifier<List<SubscriptionModel>> {
  @override
  Future<List<SubscriptionModel>> build() async {
    return _fetchSubscriptions();
  }

  Future<List<SubscriptionModel>> _fetchSubscriptions() async {
    final dioClient = ref.read(dioClientProvider);
    final response = await dioClient.dio.get('/subscriptions');
    
    if (response.data is List) {
      final List<dynamic> data = response.data;
      return data.map((json) => SubscriptionModel.fromJson(json)).toList();
    }
    return [];
  }

  Future<void> fetchSubscriptions() async {
    state = const AsyncValue.loading();
    try {
      final subscriptions = await _fetchSubscriptions();
      state = AsyncValue.data(subscriptions);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> createSubscription(SubscriptionModel subscription) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.post('/subscriptions', data: subscription.toJson());
      if (response.statusCode == 201 || response.statusCode == 200) {
        await fetchSubscriptions();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to create subscription: $e');
      return false;
    }
  }

  Future<bool> updateSubscription(String id, SubscriptionModel subscription) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.patch('/subscriptions/$id', data: subscription.toJson());
      if (response.statusCode == 200) {
        await fetchSubscriptions();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to update subscription: $e');
      return false;
    }
  }

  Future<bool> deleteSubscription(String id) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.delete('/subscriptions/$id');
      if (response.statusCode == 200 || response.statusCode == 204) {
        await fetchSubscriptions();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to delete subscription: $e');
      return false;
    }
  }
}

final subscriptionsProvider = AsyncNotifierProvider<SubscriptionsNotifier, List<SubscriptionModel>>(() {
  return SubscriptionsNotifier();
});
