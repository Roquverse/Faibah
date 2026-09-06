import 'package:flutter/material.dart';

class ChannelInfoScreen extends StatelessWidget {
  final String channelName;

  const ChannelInfoScreen({super.key, required this.channelName});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: Text('#$channelName'),
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
        body: TabBarView(
          children: [
            _buildInfoTab(theme),
            _buildPinsTab(theme),
            _buildMediaTab(theme),
            _buildLinksTab(theme),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTab(ThemeData theme) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Text('Main info', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 24),
        _buildInfoRow(theme, Icons.person_outline, 'Creator', 'Oluwadamilola Cole'),
        const SizedBox(height: 16),
        _buildInfoRow(theme, Icons.calendar_today, 'Created', '24/08/2026'),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(Icons.bolt, size: 20, color: theme.colorScheme.onSurface.withOpacity(0.6)),
                const SizedBox(width: 16),
                Text('Status', style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.6))),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.2),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'ACTIVE',
                style: theme.textTheme.labelSmall?.copyWith(color: Colors.green, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        const SizedBox(height: 48),
        Text('Linked threads', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
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
            Text('Members 3', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            Row(
              children: [
                Icon(Icons.add, size: 20, color: theme.colorScheme.onSurface.withOpacity(0.6)),
                const SizedBox(width: 8),
                Icon(Icons.more_vert, size: 20, color: theme.colorScheme.onSurface.withOpacity(0.6)),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),
        _buildMemberRow(theme, 'Arakunrin Cole', 'CONTRACTOR'),
        _buildMemberRow(theme, 'Oluwadamilola Cole (You)', 'OWNER'),
        _buildMemberRow(theme, 'Arakunrin Cole', 'PRIMARY_CONTACT'),
      ],
    );
  }

  Widget _buildInfoRow(ThemeData theme, IconData icon, String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Icon(icon, size: 20, color: theme.colorScheme.onSurface.withOpacity(0.6)),
            const SizedBox(width: 16),
            Text(label, style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.6))),
          ],
        ),
        Text(value, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
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
              name.substring(0, 1).toUpperCase(),
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
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
                ),
              ],
            ),
          ),
          Icon(Icons.delete_outline, size: 20, color: theme.colorScheme.onSurface.withOpacity(0.4)),
        ],
      ),
    );
  }

  Widget _buildPinsTab(ThemeData theme) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildPinItem(theme, 'Important Project Update', 'Please review the latest design files before Friday.'),
        _buildPinItem(theme, 'Meeting Notes', 'Kickoff meeting notes attached here with the timeline.'),
      ],
    );
  }

  Widget _buildPinItem(ThemeData theme, String title, String subtitle) {
    return Card(
      color: const Color(0xFF1A1A1A),
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: const Icon(Icons.push_pin, color: Colors.blueAccent),
        title: Text(title, style: theme.textTheme.titleSmall?.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle, style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey)),
      ),
    );
  }

  Widget _buildMediaTab(ThemeData theme) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: 15,
      itemBuilder: (context, index) {
        return Container(
          decoration: BoxDecoration(
            color: const Color(0xFF1A1A1A),
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Center(
            child: Icon(Icons.image_outlined, color: Colors.grey, size: 32),
          ),
        );
      },
    );
  }

  Widget _buildLinksTab(ThemeData theme) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildLinkItem(theme, 'Figma Design', 'https://figma.com/file/123abc456...'),
        _buildLinkItem(theme, 'Project Brief', 'https://docs.google.com/document/d/...'),
        _buildLinkItem(theme, 'Github Repo', 'https://github.com/project/mobile-app'),
      ],
    );
  }

  Widget _buildLinkItem(ThemeData theme, String title, String url) {
    return Card(
      color: const Color(0xFF1A1A1A),
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: const Icon(Icons.link, color: Colors.greenAccent),
        title: Text(title, style: theme.textTheme.titleSmall?.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
        subtitle: Text(url, style: theme.textTheme.bodySmall?.copyWith(color: Colors.blueAccent)),
        trailing: const Icon(Icons.open_in_new, color: Colors.grey, size: 16),
      ),
    );
  }
}
