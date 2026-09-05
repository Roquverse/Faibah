import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/overview_repository.dart';

final overviewProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final repository = ref.watch(overviewRepositoryProvider);
  return await repository.getOverview();
});
