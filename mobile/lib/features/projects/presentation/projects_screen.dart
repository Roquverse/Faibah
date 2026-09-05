import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'widgets/project_quick_panel.dart';
import 'create_project_screen.dart';

class ProjectsScreen extends ConsumerStatefulWidget {
  const ProjectsScreen({super.key});

  @override
  ConsumerState<ProjectsScreen> createState() => _ProjectsScreenState();
}

class _ProjectsScreenState extends ConsumerState<ProjectsScreen> {
  // Dummy data mapped to Kanban statuses
  final List<Map<String, dynamic>> _projects = [
    {
      'id': '1',
      'title': 'Comprehensive Plumbing Infrastructure Proposal',
      'client': 'Arakunrin Cole deliverables and planning',
      'status': 'DRAFT',
      'progress': 10,
      'budget': '₦800,000',
    },
    {
      'id': '2',
      'title': 'Web Development Proposal for Premium Cleaning Agency',
      'client': 'Arakunrin Cole deliverables and planning',
      'status': 'ONGOING',
      'progress': 65,
      'budget': '₦1,200,000',
    },
    {
      'id': '4',
      'title': 'Comprehensive Web Platform & E-Commerce',
      'client': 'Tizzle Studios deliverables and planning',
      'status': 'ONGOING',
      'progress': 40,
      'budget': '₦500,000',
    },
    {
      'id': '3',
      'title': 'SEO Optimization',
      'client': 'Arakunrin Cole deliverables and planning',
      'status': 'COMPLETED',
      'progress': 100,
      'budget': '₦150,000',
    },
  ];

  final List<String> _statuses = ['DRAFT', 'ONGOING', 'AWAITING PAYMENT', 'COMPLETED'];
  final PageController _pageController = PageController(viewportFraction: 0.85);

  void _showQuickPanel(BuildContext context, Map<String, dynamic> project) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => ProjectQuickPanel(project: project),
    );
  }

  void _navigateToCreateProject() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const CreateProjectScreen()),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'DRAFT': return Colors.grey;
      case 'ONGOING': return Colors.amber;
      case 'AWAITING PAYMENT': return Colors.orange;
      case 'COMPLETED': return Colors.green;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Projects', style: TextStyle(fontWeight: FontWeight.bold)),
            Text(
              'Manage your ongoing work and client deliverables.',
              style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.5)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _navigateToCreateProject,
          ),
        ],
      ),
      body: PageView.builder(
        controller: _pageController,
        itemCount: _statuses.length,
        itemBuilder: (context, index) {
          final status = _statuses[index];
          final columnProjects = _projects.where((p) => p['status'] == status).toList();
          
          return Padding(
            padding: const EdgeInsets.only(right: 16.0, top: 16.0, bottom: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Column Header
                Row(
                  children: [
                    CircleAvatar(radius: 4, backgroundColor: _getStatusColor(status)),
                    const SizedBox(width: 8),
                    Text(
                      status,
                      style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '${columnProjects.length}',
                        style: theme.textTheme.bodySmall?.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ),
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.add, size: 20),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      onPressed: _navigateToCreateProject,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                
                // Column List (Drop Target)
                Expanded(
                  child: DragTarget<Map<String, dynamic>>(
                    onWillAcceptWithDetails: (details) {
                      // Only accept if the status is different
                      return details.data['status'] != status;
                    },
                    onAcceptWithDetails: (details) {
                      final project = details.data;
                      setState(() {
                        project['status'] = status;
                      });
                    },
                    builder: (context, candidateData, rejectedData) {
                      return Container(
                        decoration: BoxDecoration(
                          color: candidateData.isNotEmpty
                              ? theme.colorScheme.primary.withOpacity(0.05)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: columnProjects.isEmpty
                            ? Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(24),
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: theme.colorScheme.onSurface.withOpacity(0.1),
                                    style: BorderStyle.solid,
                                  ),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  'Drop projects here',
                                  textAlign: TextAlign.center,
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: theme.colorScheme.onSurface.withOpacity(0.4),
                                  ),
                                ),
                              )
                            : ListView.builder(
                                itemCount: columnProjects.length,
                                itemBuilder: (context, pIndex) {
                                  final project = columnProjects[pIndex];
                                  return _buildProjectCard(project, theme);
                                },
                              ),
                      );
                    },
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildProjectCard(Map<String, dynamic> project, ThemeData theme) {
    final card = Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: theme.colorScheme.onSurface.withOpacity(0.1)),
      ),
      elevation: 0,
      color: theme.colorScheme.surface,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => _showQuickPanel(context, project),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                project['title'],
                style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                project['client'],
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withOpacity(0.6),
                ),
              ),
              const SizedBox(height: 12),
              
              // Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const CircleAvatar(radius: 3, backgroundColor: Colors.green),
                    const SizedBox(width: 4),
                    Text(
                      'Internal',
                      style: theme.textTheme.bodySmall?.copyWith(color: Colors.green, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              
              // Progress / Due Date row
              Row(
                children: [
                  Icon(Icons.calendar_today, size: 14, color: theme.colorScheme.onSurface.withOpacity(0.5)),
                  const SizedBox(width: 4),
                  Text(
                    'Due Date 11 Jan 2025', // Mocked as per image
                    style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.5)),
                  ),
                  const Spacer(),
                  Icon(Icons.format_list_bulleted, size: 14, color: theme.colorScheme.onSurface.withOpacity(0.5)),
                  const SizedBox(width: 4),
                  Text(
                    '2/2',
                    style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.5)),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              
              // Bottom Avatars / Actions row
              Row(
                children: [
                  // Mock avatars
                  CircleAvatar(radius: 12, backgroundColor: Colors.blue.withOpacity(0.5), child: const Text('AC', style: TextStyle(fontSize: 10, color: Colors.white))),
                  Transform.translate(
                    offset: const Offset(-8, 0),
                    child: CircleAvatar(radius: 12, backgroundColor: Colors.black, child: const Text('90', style: TextStyle(fontSize: 10, color: Colors.white))),
                  ),
                  const Spacer(),
                  Icon(Icons.attach_file, size: 16, color: theme.colorScheme.onSurface.withOpacity(0.5)),
                  const SizedBox(width: 2),
                  Text('2', style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.5))),
                  const SizedBox(width: 12),
                  Icon(Icons.chat_bubble_outline, size: 16, color: theme.colorScheme.onSurface.withOpacity(0.5)),
                  const SizedBox(width: 2),
                  Text('3', style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.5))),
                ],
              ),
            ],
          ),
        ),
      ),
    );

    return LongPressDraggable<Map<String, dynamic>>(
      data: project,
      delay: const Duration(milliseconds: 250),
      feedback: SizedBox(
        width: MediaQuery.of(context).size.width * 0.85 - 32, // Match column width minus padding
        child: Opacity(
          opacity: 0.8,
          child: card,
        ),
      ),
      childWhenDragging: Opacity(
        opacity: 0.3,
        child: card,
      ),
      child: card,
    );
  }
}
