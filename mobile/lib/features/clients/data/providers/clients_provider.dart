import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/dio_provider.dart';
import '../models/client_model.dart';


class ClientsNotifier extends AsyncNotifier<List<ClientModel>> {
  @override
  Future<List<ClientModel>> build() async {
    return _fetchClients();
  }

  Future<List<ClientModel>> _fetchClients() async {
    final dioClient = ref.read(dioClientProvider);
    final response = await dioClient.dio.get('/clients');
    
    if (response.data is List) {
      final List<dynamic> data = response.data;
      return data.map((json) => ClientModel.fromJson(json)).toList();
    }
    return [];
  }

  Future<void> fetchClients() async {
    state = const AsyncValue.loading();
    try {
      final clients = await _fetchClients();
      state = AsyncValue.data(clients);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> createClient(ClientModel client) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.post('/clients', data: client.toJson());
      if (response.statusCode == 201 || response.statusCode == 200) {
        await fetchClients();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to create client: $e');
      return false;
    }
  }

  Future<bool> updateClient(String id, ClientModel client) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.patch('/clients/$id', data: client.toJson());
      if (response.statusCode == 200) {
        await fetchClients();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to update client: $e');
      return false;
    }
  }

  Future<bool> deleteClient(String id) async {
    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.dio.delete('/clients/$id');
      if (response.statusCode == 200 || response.statusCode == 204) {
        await fetchClients();
        return true;
      }
      return false;
    } catch (e) {
      print('Failed to delete client: $e');
      return false;
    }
  }
}

final clientsProvider = AsyncNotifierProvider<ClientsNotifier, List<ClientModel>>(() {
  return ClientsNotifier();
});
