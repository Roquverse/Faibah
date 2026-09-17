import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'chat_screen.dart';
import '../data/providers/channels_provider.dart';

class ChannelsScreen extends ConsumerStatefulWidget {
  const ChannelsScreen({super.key});

  @override
  ConsumerState<ChannelsScreen> createState() => _ChannelsScreenState();
}

class _ChannelsScreenState extends ConsumerState<ChannelsScreen> {
  final Set<String> _expandedProjects = {};
  bool _favoritesExpanded = true;
  bool _projectsExpanded = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(channelsProvider.notifier).fetchChannels();
    });
  }

  Map<String, List<Map<String, dynamic>>> _groupByProject(
      List<Map<String, dynamic>> channels) {
    final grouped = <String, List<Map<String, dynamic>>>{};
    for (final channel in channels) {
      final projectId = channel['projectId']?.toString() ??
          (channel['project'] as Map?)?['id']?.toString() ??
          '';
      if (projectId.isEmpty) continue;
      grouped.putIfAbsent(projectId, () => []).add(channel);
    }
    return grouped;
  }

  String _projectName(Map<String, dynamic> channel) {
    return (channel['project'] as Map?)?['name']?.toString() ??
        'Unnamed Project';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final channelsAsync = ref.watch(channelsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Channels'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
        ],
      ),
      body: channelsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (channelsList) {
          final grouped = _groupByProject(channelsList);
          final projectIds = grouped.keys.toList()
            ..sort((a, b) {
              final nameA = grouped[a]!.isNotEmpty
                  ? _projectName(grouped[a]!.first)
                  : '';
              final nameB = grouped[b]!.isNotEmpty
                  ? _projectName(grouped[b]!.first)
                  : '';
              return nameA.compareTo(nameB);
            });

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(channelsProvider);
            },
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(vertical: 16),
              children: [
                _buildSectionHeader(theme, 'FAVORITES', _favoritesExpanded, () {
                  setState(() => _favoritesExpanded = !_favoritesExpanded);
                }),
                if (_favoritesExpanded)
                  Padding(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                    child: Text(
                      'No favorite channels yet. Click ⭐ to pin a channel.',
                      style: theme.textTheme.bodySmall?.copyWith(
                        fontStyle: FontStyle.italic,
                        color: theme.colorScheme.onSurface.withOpacity(0.5),
                      ),
                    ),
                  ),
                const SizedBox(height: 24),
                _buildSectionHeader(theme, 'PROJECTS', _projectsExpanded, () {
                  setState(() => _projectsExpanded = !_projectsExpanded);
                }, showAdd: true),
                if (_projectsExpanded)
                  if (projectIds.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 24, vertical: 8),
                      child: Text(
                        'No channels found.',
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontStyle: FontStyle.italic,
                          color: theme.colorScheme.onSurface.withOpacity(0.5),
                        ),
                      ),
                    )
                  else
                    ...projectIds.map((projectId) {
                      final channels = grouped[projectId]!;
                      final projectName = _projectName(channels.first);
                      return _buildProjectGroup(
                          theme, projectId, projectName, channels);
                    }),
                const SizedBox(height: 100),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildSectionHeader(
      ThemeData theme, String title, bool isExpanded, VoidCallback onTap,
      {bool showAdd = false}) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: theme.colorScheme.onSurface.withOpacity(0.5),
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                ),
              ),
            ),
            if (showAdd)
              Icon(Icons.add,
                  size: 16,
                  color: theme.colorScheme.onSurface.withOpacity(0.5)),
          ],
        ),
      ),
    );
  }

  Widget _buildProjectGroup(
    ThemeData theme,
    String projectId,
    String projectName,
    List<Map<String, dynamic>> channels,
  ) {
    final isExpanded = _expandedProjects.contains(projectId);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        InkWell(
          onTap: () {
            setState(() {
              if (isExpanded) {
                _expandedProjects.remove(projectId);
              } else {
                _expandedProjects.add(projectId);
              }
            });
          },
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Icon(
                  isExpanded
                      ? Icons.keyboard_arrow_down
                      : Icons.keyboard_arrow_right,
                  size: 16,
                  color: theme.colorScheme.onSurface.withOpacity(0.6),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    projectName,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
        if (isExpanded)
          ...channels.map((c) => _buildChannelItem(theme, c)).toList(),
      ],
    );
  }

  Widget _buildChannelItem(ThemeData theme, Map<String, dynamic> channel) {
    final projectId = channel['projectId']?.toString() ??
        (channel['project'] as Map?)?['id']?.toString() ??
        '';
    final channelName = channel['name']?.toString() ?? 'general';

    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ChatScreen(
              channelId: projectId,
              channelName: channelName,
            ),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(left: 24, right: 16, top: 4, bottom: 4),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: theme.colorScheme.primary.withOpacity(0.15),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Row(
          children: [
            Icon(Icons.tag, size: 16, color: theme.colorScheme.onSurface),
            const SizedBox(width: 8),
            Text(
              channelName,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
