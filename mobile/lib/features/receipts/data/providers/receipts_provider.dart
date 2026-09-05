import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/dio_provider.dart';
import '../models/receipt_model.dart';


class ReceiptsNotifier extends AsyncNotifier<List<ReceiptModel>> {
  @override
  Future<List<ReceiptModel>> build() async {
    return _fetchReceipts();
  }

  Future<List<ReceiptModel>> _fetchReceipts() async {
    final dioClient = ref.read(dioClientProvider);
    final response = await dioClient.dio.get('/receipts');
    
    if (response.data is List) {
      final List<dynamic> data = response.data;
      return data.map((json) => ReceiptModel.fromJson(json)).toList();
    }
    return [];
  }

  Future<void> fetchReceipts() async {
    state = const AsyncValue.loading();
    try {
      final receipts = await _fetchReceipts();
      state = AsyncValue.data(receipts);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> createReceipt(ReceiptModel receipt) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.post('/receipts', data: receipt.toJson());
      if (response.statusCode == 201 || response.statusCode == 200) {
        await fetchReceipts();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to create receipt: $e');
      return false;
    }
  }

  Future<bool> updateReceipt(String id, ReceiptModel receipt) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.patch('/receipts/$id', data: receipt.toJson());
      if (response.statusCode == 200) {
        await fetchReceipts();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to update receipt: $e');
      return false;
    }
  }

  Future<bool> deleteReceipt(String id) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.delete('/receipts/$id');
      if (response.statusCode == 200 || response.statusCode == 204) {
        await fetchReceipts();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to delete receipt: $e');
      return false;
    }
  }
}

final receiptsProvider = AsyncNotifierProvider<ReceiptsNotifier, List<ReceiptModel>>(() {
  return ReceiptsNotifier();
});
