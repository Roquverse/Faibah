import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/providers/dio_provider.dart';

class ProposalListItem {
  final String id;
  final String projectId;
  final String title;
  final String clientName;
  final String status;
  final DateTime createdAt;
  final String amount;

  const ProposalListItem({
    required this.id,
    required this.projectId,
    required this.title,
    required this.clientName,
    required this.status,
    required this.createdAt,
    required this.amount,
  });
}

class ProposalsNotifier extends AsyncNotifier<List<ProposalListItem>> {
  @override
  Future<List<ProposalListItem>> build() async {
    return _fetchProposals();
  }

  Future<List<ProposalListItem>> _fetchProposals() async {
    final dioClient = ref.read(dioClientProvider);
    final response = await dioClient.dio.get('/projects');

    if (response.data is! List) return [];

    final proposals = <ProposalListItem>[];
    for (final project in response.data as List) {
      final projectMap = project as Map<String, dynamic>;
      final projectProposals = projectMap['proposals'] as List? ?? [];
      final projectName = projectMap['name']?.toString() ?? 'Unnamed Project';
      final clientName =
          (projectMap['client'] as Map?)?['name']?.toString() ?? 'Unknown Client';

      for (final raw in projectProposals) {
        final p = raw as Map<String, dynamic>;
        proposals.add(_mapProposal(p, projectMap['id']?.toString() ?? '', projectName, clientName));
      }
    }

    proposals.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return proposals;
  }

  ProposalListItem _mapProposal(
    Map<String, dynamic> proposal,
    String projectId,
    String projectName,
    String clientName,
  ) {
    final content = proposal['content']?.toString() ?? '';
    var title = projectName;
    var amount = '₦0';

    try {
      final parsed = jsonDecode(content);
      if (parsed is Map<String, dynamic>) {
        title = parsed['title']?.toString() ?? projectName;
        final items = parsed['items'];
        if (items is List) {
          final total = items.fold<num>(
            0,
            (sum, item) => sum + ((item as Map)['amount'] as num? ?? 0),
          );
          amount = '₦${NumberFormat('#,##0').format(total)}';
        }
      }
    } catch (_) {}

    final createdAt = DateTime.tryParse(proposal['createdAt']?.toString() ?? '') ??
        DateTime.fromMillisecondsSinceEpoch(0);

    return ProposalListItem(
      id: proposal['id']?.toString() ?? '',
      projectId: projectId,
      title: title,
      clientName: clientName,
      status: proposal['status']?.toString() ?? 'DRAFT',
      createdAt: createdAt,
      amount: amount,
    );
  }

  Future<void> fetchProposals() async {
    state = const AsyncValue.loading();
    try {
      final proposals = await _fetchProposals();
      state = AsyncValue.data(proposals);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final proposalsProvider =
    AsyncNotifierProvider<ProposalsNotifier, List<ProposalListItem>>(() {
  return ProposalsNotifier();
});
