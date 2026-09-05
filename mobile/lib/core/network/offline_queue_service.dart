import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

final offlineQueueServiceProvider = Provider<OfflineQueueService>((ref) {
  return OfflineQueueService();
});

class OfflineQueueService {
  static const String _queueBoxName = 'offline_queue';
  Box? _queueBox;

  Future<void> initialize() async {
    await Hive.initFlutter();
    _queueBox = await Hive.openBox(_queueBoxName);
  }

  /// Adds a failed request to the queue for later retry
  Future<void> enqueueRequest(String method, String endpoint, Map<String, dynamic> data) async {
    if (_queueBox == null) return;
    
    final request = {
      'method': method,
      'endpoint': endpoint,
      'data': data,
      'timestamp': DateTime.now().toIso8601String(),
    };

    await _queueBox!.add(request);
    debugPrint('Queued offline request: $method $endpoint');
  }

  /// Attempts to replay all queued requests when back online
  Future<void> syncQueue(Future<bool> Function(Map<dynamic, dynamic>) replayCallback) async {
    if (_queueBox == null || _queueBox!.isEmpty) return;

    debugPrint('Starting offline queue sync (${_queueBox!.length} items)...');
    
    // Create a copy of keys to avoid concurrent modification issues during iteration
    final keys = _queueBox!.keys.toList();
    
    for (var key in keys) {
      final request = _queueBox!.get(key);
      if (request != null) {
        final success = await replayCallback(request as Map<dynamic, dynamic>);
        if (success) {
          await _queueBox!.delete(key);
          debugPrint('Successfully synced and removed request: ${request['endpoint']}');
        } else {
          debugPrint('Failed to sync request, keeping in queue: ${request['endpoint']}');
        }
      }
    }
  }

  /// Clears the entire offline queue (e.g., on logout)
  Future<void> clearQueue() async {
    await _queueBox?.clear();
  }
}
