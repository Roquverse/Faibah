import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/dio_provider.dart';
import '../models/invoice_model.dart';


class InvoicesNotifier extends AsyncNotifier<List<InvoiceModel>> {
  @override
  Future<List<InvoiceModel>> build() async {
    return _fetchInvoices();
  }

  Future<List<InvoiceModel>> _fetchInvoices() async {
    final dioClient = ref.read(dioClientProvider);
    final response = await dioClient.dio.get('/invoices');
    
    if (response.data is List) {
      final List<dynamic> data = response.data;
      return data.map((json) => InvoiceModel.fromJson(json)).toList();
    }
    return [];
  }

  Future<void> fetchInvoices() async {
    state = const AsyncValue.loading();
    try {
      final invoices = await _fetchInvoices();
      state = AsyncValue.data(invoices);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> createInvoice(InvoiceModel invoice) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.post('/invoices', data: invoice.toJson());
      if (response.statusCode == 201 || response.statusCode == 200) {
        await fetchInvoices();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to create invoice: $e');
      return false;
    }
  }

  Future<bool> updateInvoice(String id, InvoiceModel invoice) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.patch('/invoices/$id', data: invoice.toJson());
      if (response.statusCode == 200) {
        await fetchInvoices();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to update invoice: $e');
      return false;
    }
  }

  Future<bool> deleteInvoice(String id) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.delete('/invoices/$id');
      if (response.statusCode == 200 || response.statusCode == 204) {
        await fetchInvoices();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to delete invoice: $e');
      return false;
    }
  }
}

final invoicesProvider = AsyncNotifierProvider<InvoicesNotifier, List<InvoiceModel>>(() {
  return InvoicesNotifier();
});
