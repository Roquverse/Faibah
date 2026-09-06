import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'chat_screen.dart';

class ChannelsScreen extends ConsumerStatefulWidget {
  const ChannelsScreen({super.key});

  @override
  ConsumerState<ChannelsScreen> createState() => _ChannelsScreenState();
}

class _ChannelsScreenState extends ConsumerState<ChannelsScreen> {
  final List<Map<String, dynamic>> _projects = [
    {
      'id': 'p1',
      'name': 'Comprehensive Plumbing...',
      'channels': [],
    },
    {
      'id': 'p2',
      'name': 'Web Development Propos...',
      'channels': [
        {'id': 'c1', 'name': 'project-dev'},
      ],
    },
    {
      'id': 'p3',
      'name': 'Comprehensive Web Platf...',
      'channels': [],
    },
  ];

  final Set<String> _expandedProjects = {'p2'};
  bool _favoritesExpanded = true;
  bool _projectsExpanded = true;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

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
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 16),
        children: [
          _buildSectionHeader(theme, 'FAVORITES', _favoritesExpanded, () {
            setState(() => _favoritesExpanded = !_favoritesExpanded);
          }),
          if (_favoritesExpanded)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
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
            ..._projects.map((p) => _buildProjectGroup(theme, p)).toList(),
            
          const SizedBox(height: 100), // padding for scrolling past bottom nav
        ],
      ),
    );
  }

  Widget _buildSectionHeader(ThemeData theme, String title, bool isExpanded, VoidCallback onTap, {bool showAdd = false}) {
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
              Icon(Icons.add, size: 16, color: theme.colorScheme.onSurface.withOpacity(0.5)),
          ],
        ),
      ),
    );
  }

  Widget _buildProjectGroup(ThemeData theme, Map<String, dynamic> project) {
    final isExpanded = _expandedProjects.contains(project['id']);
    final channels = project['channels'] as List<dynamic>;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        InkWell(
          onTap: () {
            setState(() {
              if (isExpanded) {
                _expandedProjects.remove(project['id']);
              } else {
                _expandedProjects.add(project['id']);
              }
            });
          },
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Icon(
                  isExpanded ? Icons.keyboard_arrow_down : Icons.keyboard_arrow_right,
                  size: 16,
                  color: theme.colorScheme.onSurface.withOpacity(0.6),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    project['name'],
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
          if (channels.isEmpty)
            Padding(
              padding: const EdgeInsets.only(left: 48, top: 4, bottom: 12),
              child: Text(
                'No channels',
                style: theme.textTheme.bodySmall?.copyWith(
                  fontStyle: FontStyle.italic,
                  color: theme.colorScheme.onSurface.withOpacity(0.5),
                ),
              ),
            )
          else
            ...channels.map((c) => _buildChannelItem(theme, c)).toList(),
      ],
    );
  }

  Widget _buildChannelItem(ThemeData theme, dynamic channel) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ChatScreen(
              channelId: channel['id'],
              channelName: channel['name'],
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
              channel['name'],
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
