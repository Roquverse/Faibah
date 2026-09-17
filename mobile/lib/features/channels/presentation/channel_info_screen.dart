import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../data/providers/chat_provider.dart';

class ChannelInfoScreen extends ConsumerStatefulWidget {
  final String projectId;
  final String channelName;

  const ChannelInfoScreen({
    super.key,
    required this.projectId,
    required this.channelName,
  });

  @override
  ConsumerState<ChannelInfoScreen> createState() => _ChannelInfoScreenState();
}

class _ChannelInfoScreenState extends ConsumerState<ChannelInfoScreen> {
  List<String> _pinnedMessageIds = [];

  @override
  void initState() {
    super.initState();
    _loadPinnedIds();
  }

  Future<void> _loadPinnedIds() async {
    final detail = await ref.read(channelDetailProvider((
      projectId: widget.projectId,
      channelName: widget.channelName,
    )).future);
    final channelId = detail['channel']?['id']?.toString();
    if (channelId != null) {
      final ids = await ChannelPinsStorage.getPinnedIds(channelId);
      if (mounted) setState(() => _pinnedMessageIds = ids);
    }
  }

  String _memberName(Map<String, dynamic> member) {
    final user = member['user'] as Map<String, dynamic>?;
    if (user != null) {
      final first = user['firstName']?.toString() ?? '';
      final last = user['lastName']?.toString() ?? '';
      final name = '$first $last'.trim();
      if (name.isNotEmpty) return name;
    }
    final contact = member['clientContact'] as Map<String, dynamic>?;
    if (contact?['name'] != null) return contact!['name'].toString();
    return 'Member';
  }

  String _creatorName(List<dynamic> members, Map<String, dynamic>? project) {
    for (final raw in members) {
      final member = raw as Map<String, dynamic>;
      final role = member['role']?.toString() ?? '';
      if (role == 'OWNER' ||
          role == 'PRIMARY_CONTACT' ||
          role == 'ADMIN') {
        return _memberName(member);
      }
    }
    for (final raw in members) {
      final member = raw as Map<String, dynamic>;
      if (member['user'] != null) return _memberName(member);
    }
    return (project?['client'] as Map?)?['name']?.toString() ??
        'Project Owner';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final detailAsync = ref.watch(channelDetailProvider((
      projectId: widget.projectId,
      channelName: widget.channelName,
    )));

    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: Text('#${widget.channelName}'),
          bottom: const TabBar(
            isScrollable: true,
            tabs: [
              Tab(text: 'Info'),
              Tab(text: 'Pins'),
              Tab(text: 'Media'),
              Tab(text: 'Links'),
            ],
          ),
        ),
        body: detailAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, _) => Center(child: Text('Error: $err')),
          data: (detail) {
            final channel = detail['channel'] as Map<String, dynamic>? ?? {};
            final members =
                detail['members'] as List<dynamic>? ?? [];
            final project =
                detail['project'] as Map<String, dynamic>? ?? {};
            final messages =
                detail['messages'] as List<dynamic>? ?? [];

            return TabBarView(
              children: [
                _buildInfoTab(theme, channel, members, project),
                _buildPinsTab(theme, messages),
                _buildMediaTab(theme, messages),
                _buildLinksTab(theme, messages, project),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildInfoTab(
    ThemeData theme,
    Map<String, dynamic> channel,
    List<dynamic> members,
    Map<String, dynamic> project,
  ) {
    final createdAt = DateTime.tryParse(channel['createdAt']?.toString() ?? '');
    final formattedDate = createdAt != null
        ? DateFormat('dd/MM/yyyy').format(createdAt)
        : '—';
    final currentUserId = Supabase.instance.client.auth.currentUser?.id;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Text('Main info',
            style: theme.textTheme.titleMedium
                ?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 24),
        _buildInfoRow(theme, Icons.person_outline, 'Creator',
            _creatorName(members, project)),
        const SizedBox(height: 16),
        _buildInfoRow(
            theme, Icons.calendar_today, 'Created', formattedDate),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(Icons.bolt,
                    size: 20,
                    color: theme.colorScheme.onSurface.withOpacity(0.6)),
                const SizedBox(width: 16),
                Text('Status',
                    style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.6))),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.2),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                (project['status']?.toString() ?? 'ACTIVE').toUpperCase(),
                style: theme.textTheme.labelSmall?.copyWith(
                    color: Colors.green, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        const SizedBox(height: 48),
        Text('Linked threads',
            style: theme.textTheme.titleMedium
                ?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        Text(
          'No linked threads yet.',
          style: theme.textTheme.bodySmall?.copyWith(
            fontStyle: FontStyle.italic,
            color: theme.colorScheme.onSurface.withOpacity(0.5),
          ),
        ),
        const SizedBox(height: 48),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Members ${members.length}',
                style: theme.textTheme.titleMedium
                    ?.copyWith(fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 16),
        if (members.isEmpty)
          Text(
            'No members found.',
            style: theme.textTheme.bodySmall?.copyWith(
              fontStyle: FontStyle.italic,
              color: theme.colorScheme.onSurface.withOpacity(0.5),
            ),
          )
        else
          ...members.map((raw) {
            final member = raw as Map<String, dynamic>;
            final name = _memberName(member);
            final isMe = member['user']?['id']?.toString() == currentUserId;
            return _buildMemberRow(
              theme,
              isMe ? '$name (You)' : name,
              member['role']?.toString() ?? 'MEMBER',
            );
          }),
      ],
    );
  }

  Widget _buildInfoRow(
      ThemeData theme, IconData icon, String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Icon(icon,
                size: 20,
                color: theme.colorScheme.onSurface.withOpacity(0.6)),
            const SizedBox(width: 16),
            Text(label,
                style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.6))),
          ],
        ),
        Flexible(
          child: Text(value,
              textAlign: TextAlign.right,
              style: theme.textTheme.bodyMedium
                  ?.copyWith(fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  Widget _buildMemberRow(ThemeData theme, String name, String role) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: theme.colorScheme.primary.withOpacity(0.2),
            foregroundColor: theme.colorScheme.primary,
            child: Text(
              name.isNotEmpty ? name.substring(0, 1).toUpperCase() : '?',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name,
                    style: theme.textTheme.bodyMedium
                        ?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    role,
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.primary,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPinsTab(ThemeData theme, List<dynamic> messages) {
    final pinned = messages
        .where((m) =>
            _pinnedMessageIds.contains((m as Map<String, dynamic>)['id']))
        .cast<Map<String, dynamic>>()
        .toList();

    if (pinned.isEmpty) {
      return Center(
        child: Text(
          'No pinned messages in this channel.',
          style: theme.textTheme.bodySmall?.copyWith(
            fontStyle: FontStyle.italic,
            color: theme.colorScheme.onSurface.withOpacity(0.5),
          ),
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: pinned.map((msg) {
        final content = msg['content']?.toString() ?? '';
        final createdAt =
            DateTime.tryParse(msg['createdAt']?.toString() ?? '');
        final timeLabel = createdAt != null
            ? DateFormat('MMM d, h:mm a').format(createdAt.toLocal())
            : '';
        return Card(
          color: const Color(0xFF1A1A1A),
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: const Icon(Icons.push_pin, color: Colors.blueAccent),
            title: Text(
              content.length > 60 ? '${content.substring(0, 60)}...' : content,
              style: theme.textTheme.titleSmall?.copyWith(
                  color: Colors.white, fontWeight: FontWeight.bold),
            ),
            subtitle: Text(timeLabel,
                style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey)),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildMediaTab(ThemeData theme, List<dynamic> messages) {
    final mediaMessages = messages
        .where((m) =>
            (m as Map<String, dynamic>)['attachmentUrl'] != null &&
            (m['attachmentUrl'] as String).isNotEmpty)
        .cast<Map<String, dynamic>>()
        .toList();

    if (mediaMessages.isEmpty) {
      return Center(
        child: Text(
          'No media has been shared yet.',
          style: theme.textTheme.bodySmall?.copyWith(
            fontStyle: FontStyle.italic,
            color: theme.colorScheme.onSurface.withOpacity(0.5),
          ),
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: mediaMessages.length,
      itemBuilder: (context, index) {
        final url = mediaMessages[index]['attachmentUrl']?.toString() ?? '';
        return ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.network(
            url,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              color: const Color(0xFF1A1A1A),
              child: const Icon(Icons.broken_image, color: Colors.grey),
            ),
          ),
        );
      },
    );
  }

  Widget _buildLinksTab(
    ThemeData theme,
    List<dynamic> messages,
    Map<String, dynamic> project,
  ) {
    final linkRegex = RegExp(r'(https?:\/\/[^\s]+)');
    final projectUrls = project['urls'] as List? ?? [];
    final messageLinks = <Map<String, String>>[];

    for (final raw in messages) {
      final msg = raw as Map<String, dynamic>;
      final content = msg['content']?.toString() ?? '';
      for (final match in linkRegex.allMatches(content)) {
        messageLinks.add({
          'title': match.group(0) ?? '',
          'url': match.group(0) ?? '',
        });
      }
    }

    final hasLinks = projectUrls.isNotEmpty || messageLinks.isNotEmpty;

    if (!hasLinks) {
      return Center(
        child: Text(
          'No links have been shared yet.',
          style: theme.textTheme.bodySmall?.copyWith(
            fontStyle: FontStyle.italic,
            color: theme.colorScheme.onSurface.withOpacity(0.5),
          ),
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ...projectUrls.map((raw) {
          final link = raw as Map<String, dynamic>;
          return _buildLinkItem(
            theme,
            link['label']?.toString() ?? 'Link',
            link['url']?.toString() ?? '',
          );
        }),
        ...messageLinks.map((link) => _buildLinkItem(
              theme,
              link['title']!,
              link['url']!,
            )),
      ],
    );
  }

  Widget _buildLinkItem(ThemeData theme, String title, String url) {
    return Card(
      color: const Color(0xFF1A1A1A),
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: const Icon(Icons.link, color: Colors.greenAccent),
        title: Text(title,
            style: theme.textTheme.titleSmall?.copyWith(
                color: Colors.white, fontWeight: FontWeight.bold),
            maxLines: 1,
            overflow: TextOverflow.ellipsis),
        subtitle: Text(url,
            style: theme.textTheme.bodySmall?.copyWith(color: Colors.blueAccent),
            maxLines: 1,
            overflow: TextOverflow.ellipsis),
        trailing:
            const Icon(Icons.open_in_new, color: Colors.grey, size: 16),
        onTap: () async {
          final uri = Uri.tryParse(url);
          if (uri != null) await launchUrl(uri);
        },
      ),
    );
  }
}
