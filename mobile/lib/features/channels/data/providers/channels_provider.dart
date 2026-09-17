import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/dio_provider.dart';

class ChannelsNotifier extends AsyncNotifier<List<Map<String, dynamic>>> {
  @override
  Future<List<Map<String, dynamic>>> build() async {
    return _fetchChannels();
  }

  Future<List<Map<String, dynamic>>> _fetchChannels() async {
    final dioClient = ref.read(dioClientProvider);
    final response = await dioClient.dio.get('/channels');

    if (response.data is List) {
      return (response.data as List)
          .map((json) => json as Map<String, dynamic>)
          .toList();
    }
    return [];
  }

  Future<void> fetchChannels() async {
    state = const AsyncValue.loading();
    try {
      final channels = await _fetchChannels();
      state = AsyncValue.data(channels);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final channelsProvider =
    AsyncNotifierProvider<ChannelsNotifier, List<Map<String, dynamic>>>(() {
  return ChannelsNotifier();
});
