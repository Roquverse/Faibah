import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'create_task_screen.dart';
import '../data/providers/tasks_provider.dart';

class TasksScreen extends ConsumerStatefulWidget {
  const TasksScreen({super.key});

  @override
  ConsumerState<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends ConsumerState<TasksScreen> {
  int _selectedTabIndex = 1;
  final List<String> _tabs = ['Recent', 'Today', 'Upcoming'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(tasksProvider.notifier).fetchTasks();
    });
  }

  List<Map<String, dynamic>> _filterTasks(List<Map<String, dynamic>> tasks) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    switch (_selectedTabIndex) {
      case 0:
        final sorted = [...tasks];
        sorted.sort((a, b) {
          final aDate = DateTime.tryParse(a['createdAt']?.toString() ?? '') ??
              DateTime.fromMillisecondsSinceEpoch(0);
          final bDate = DateTime.tryParse(b['createdAt']?.toString() ?? '') ??
              DateTime.fromMillisecondsSinceEpoch(0);
          return bDate.compareTo(aDate);
        });
        return sorted;
      case 1:
        return tasks.where((task) {
          final due = DateTime.tryParse(task['dueDate']?.toString() ?? '');
          if (due != null) {
            final dueDay = DateTime(due.year, due.month, due.day);
            return dueDay == today;
          }
          final created =
              DateTime.tryParse(task['createdAt']?.toString() ?? '');
          if (created != null) {
            final createdDay =
                DateTime(created.year, created.month, created.day);
            return createdDay == today;
          }
          return false;
        }).toList();
      case 2:
        return tasks.where((task) {
          final due = DateTime.tryParse(task['dueDate']?.toString() ?? '');
          if (due == null) return false;
          final dueDay = DateTime(due.year, due.month, due.day);
          return dueDay.isAfter(today);
        }).toList();
      default:
        return tasks;
    }
  }

  String _formatStatus(String? status) {
    switch (status) {
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'IN_REVISION':
        return 'In Revision';
      case 'DONE':
        return 'Completed';
      case 'TODO':
        return 'To Do';
      default:
        return status?.replaceAll('_', ' ') ?? 'To Do';
    }
  }

  Color _statusColor(String? status) {
    switch (status) {
      case 'DONE':
        return Colors.green;
      case 'IN_PROGRESS':
        return Colors.orange;
      case 'IN_REVISION':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  String _formatTaskTime(Map<String, dynamic> task) {
    final due = DateTime.tryParse(task['dueDate']?.toString() ?? '');
    if (due != null) {
      return DateFormat('h:mm a').format(due.toLocal());
    }
    final created = DateTime.tryParse(task['createdAt']?.toString() ?? '');
    if (created != null) {
      return DateFormat('h:mm a').format(created.toLocal());
    }
    return '';
  }

  String _formatPriority(String? priority) {
    switch (priority) {
      case 'URGENT':
        return 'Urgent';
      case 'HIGH':
        return 'High';
      case 'LOW':
        return 'Low';
      default:
        return 'Medium';
    }
  }

  Color _priorityColor(String? priority) {
    switch (priority) {
      case 'URGENT':
        return Colors.red;
      case 'HIGH':
        return Colors.orange;
      case 'LOW':
        return Colors.grey;
      default:
        return Colors.blue;
    }
  }

  List<Map<String, dynamic>> _taskAssignees(Map<String, dynamic> task) {
    final assignees = task['assignees'] as List? ?? [];
    return assignees.map((a) => a as Map<String, dynamic>).toList();
  }

  String _assigneeName(Map<String, dynamic> assignee) {
    final pm = assignee['projectMember'] as Map<String, dynamic>?;
    final user = pm?['user'] as Map<String, dynamic>?;
    if (user != null) {
      final name =
          '${user['firstName'] ?? ''} ${user['lastName'] ?? ''}'.trim();
      if (name.isNotEmpty) return name;
    }
    return pm?['clientContact']?['name']?.toString() ?? 'Member';
  }

  Future<void> _completeTask(Map<String, dynamic> task) async {
    final success = await ref
        .read(tasksProvider.notifier)
        .updateTaskStatus(task['id']?.toString() ?? '', 'DONE');
    if (mounted && !success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to update task')),
      );
    }
  }

  void _showTaskDetails(Map<String, dynamic> task) {
    final theme = Theme.of(context);
    showModalBottomSheet(
      context: context,
      backgroundColor: theme.colorScheme.surface,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        final project = task['project'] as Map<String, dynamic>?;
        final assignees = _taskAssignees(task);
        return Padding(
          padding: EdgeInsets.only(
            left: 24,
            right: 24,
            top: 24,
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _priorityColor(task['priority']?.toString())
                          .withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      _formatPriority(task['priority']?.toString()),
                      style: TextStyle(
                        color: _priorityColor(task['priority']?.toString()),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const Spacer(),
                  DropdownButton<String>(
                    value: task['status']?.toString() ?? 'TODO',
                    underline: const SizedBox.shrink(),
                    items: const [
                      DropdownMenuItem(value: 'TODO', child: Text('To-do')),
                      DropdownMenuItem(
                          value: 'IN_PROGRESS', child: Text('In Progress')),
                      DropdownMenuItem(
                          value: 'IN_REVISION', child: Text('In Revision')),
                      DropdownMenuItem(value: 'DONE', child: Text('Done')),
                    ],
                    onChanged: (status) async {
                      if (status == null) return;
                      Navigator.pop(context);
                      final success = await ref
                          .read(tasksProvider.notifier)
                          .updateTaskStatus(
                              task['id']?.toString() ?? '', status);
                      if (mounted && !success) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Failed to update status')),
                        );
                      }
                    },
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(task['title']?.toString() ?? 'Task',
                  style: theme.textTheme.titleLarge
                      ?.copyWith(fontWeight: FontWeight.bold)),
              if (project?['name'] != null) ...[
                const SizedBox(height: 8),
                Text(project!['name'].toString(),
                    style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.6))),
              ],
              const SizedBox(height: 16),
              Text(
                task['description']?.toString() ?? 'No description provided.',
                style: theme.textTheme.bodyMedium,
              ),
              if (task['dueDate'] != null) ...[
                const SizedBox(height: 16),
                Row(
                  children: [
                    Icon(Icons.calendar_today,
                        size: 16,
                        color: theme.colorScheme.onSurface.withOpacity(0.5)),
                    const SizedBox(width: 8),
                    Text(
                      DateFormat('MMM d, yyyy').format(DateTime.parse(
                          task['dueDate'].toString())),
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                ),
              ],
              if (assignees.isNotEmpty) ...[
                const SizedBox(height: 16),
                Text('Assignees',
                    style: theme.textTheme.labelLarge
                        ?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                ...assignees.map((a) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 14,
                            backgroundColor:
                                theme.colorScheme.primary.withOpacity(0.2),
                            child: Text(
                              _assigneeName(a).substring(0, 1).toUpperCase(),
                              style: TextStyle(
                                  fontSize: 12,
                                  color: theme.colorScheme.primary,
                                  fontWeight: FontWeight.bold),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(_assigneeName(a),
                              style: theme.textTheme.bodyMedium),
                        ],
                      ),
                    )),
              ],
              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final tasksAsync = ref.watch(tasksProvider);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Tasks'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () async {
              await Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const CreateTaskScreen()),
              );
              ref.invalidate(tasksProvider);
            },
          ),
        ],
      ),
      body: tasksAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text('Error loading tasks: $err',
                style: const TextStyle(color: Colors.red)),
          ),
        ),
        data: (allTasks) {
          final filtered = _filterTasks(allTasks);
          final doneCount =
              allTasks.where((t) => t['status'] == 'DONE').length;
          final totalCount = allTasks.length;
          final progress =
              totalCount > 0 ? doneCount / totalCount : 0.0;
          final activeCount =
              filtered.where((t) => t['status'] != 'DONE').length;

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(tasksProvider),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildProgressCard(
                      theme, doneCount, totalCount, progress),
                  const SizedBox(height: 32),
                  _buildTabs(theme),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Text(
                        'My Current Task',
                        style: theme.textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      if (activeCount > 0) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.red,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '$activeCount',
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (filtered.isEmpty)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 48),
                        child: Text(
                          'No tasks found',
                          style: theme.textTheme.bodyMedium?.copyWith(
                              color:
                                  theme.colorScheme.onSurface.withOpacity(0.5)),
                        ),
                      ),
                    )
                  else
                    ...filtered.map((task) => _buildTaskCard(theme, task)),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildProgressCard(
    ThemeData theme,
    int doneCount,
    int totalCount,
    double progress,
  ) {
    final percent = (progress * 100).round();
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: theme.colorScheme.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: theme.colorScheme.primary.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.rocket_launch,
                color: theme.colorScheme.primary, size: 24),
          ),
          const SizedBox(height: 24),
          Text(
            'Your progress now',
            style: theme.textTheme.titleLarge
                ?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: theme.colorScheme.primary.withOpacity(0.2),
              valueColor:
                  AlwaysStoppedAnimation<Color>(theme.colorScheme.primary),
              minHeight: 8,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '$doneCount/$totalCount Task Complete',
                style: theme.textTheme.bodyMedium
                    ?.copyWith(fontWeight: FontWeight.w500),
              ),
              Text(
                '$percent%',
                style: theme.textTheme.bodyMedium
                    ?.copyWith(fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTabs(ThemeData theme) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(_tabs.length, (index) {
        final isSelected = _selectedTabIndex == index;
        return GestureDetector(
          onTap: () => setState(() => _selectedTabIndex = index),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            decoration: BoxDecoration(
              color: isSelected
                  ? theme.colorScheme.primary.withOpacity(0.1)
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                  color: isSelected
                      ? theme.colorScheme.primary.withOpacity(0.2)
                      : theme.colorScheme.onSurface.withOpacity(0.1)),
            ),
            child: Text(
              _tabs[index],
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected
                    ? theme.colorScheme.primary
                    : theme.colorScheme.onSurface.withOpacity(0.6),
              ),
            ),
          ),
        );
      }),
    );
  }

  Widget _buildTaskCard(ThemeData theme, Map<String, dynamic> task) {
    final status = task['status']?.toString();
    final statusLabel = _formatStatus(status);
    final statusColor = _statusColor(status);
    final isDone = status == 'DONE';
    final project = task['project'] as Map<String, dynamic>?;
    final assignees = _taskAssignees(task);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.colorScheme.onSurface.withOpacity(0.08)),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (project?['name'] != null) ...[
                  Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      project!['name'].toString(),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                  ),
                ],
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        task['title']?.toString() ?? 'Untitled',
                        style: theme.textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _formatTaskTime(task),
                      style: theme.textTheme.labelMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.onSurface.withOpacity(0.6),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        task['description']?.toString() ?? '',
                        style: theme.textTheme.bodyMedium?.copyWith(
                            color:
                                theme.colorScheme.onSurface.withOpacity(0.6)),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                        border:
                            Border.all(color: statusColor.withOpacity(0.3)),
                      ),
                      child: Text(
                        statusLabel.toUpperCase(),
                        style: TextStyle(
                            color: statusColor,
                            fontSize: 10,
                            fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: _priorityColor(task['priority']?.toString())
                            .withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        _formatPriority(task['priority']?.toString()),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color:
                              _priorityColor(task['priority']?.toString()),
                        ),
                      ),
                    ),
                    const Spacer(),
                    if (assignees.isNotEmpty)
                      SizedBox(
                        height: 24,
                        width: assignees.length > 3 ? 72 : assignees.length * 20.0 + 4,
                        child: Stack(
                          children: [
                            for (int i = 0;
                                i < assignees.length.clamp(0, 3);
                                i++)
                              Positioned(
                                right: i * 16.0,
                                child: CircleAvatar(
                                  radius: 12,
                                  backgroundColor: theme.colorScheme.primary
                                      .withOpacity(0.2),
                                  child: Text(
                                    _assigneeName(assignees[i])
                                        .substring(0, 1)
                                        .toUpperCase(),
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: theme.colorScheme.primary,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
          Divider(
              height: 1,
              color: theme.colorScheme.onSurface.withOpacity(0.08)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: [
                _actionBtn(theme, Icons.visibility_outlined, 'View',
                    () => _showTaskDetails(task)),
                const SizedBox(width: 8),
                if (!isDone)
                  _actionBtn(theme, Icons.check_circle_outline, 'Complete',
                      () => _completeTask(task)),
                const Spacer(),
                IconButton(
                  icon: Icon(Icons.more_horiz,
                      color: theme.colorScheme.onSurface.withOpacity(0.5)),
                  onPressed: () => _showTaskDetails(task),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionBtn(
      ThemeData theme, IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: theme.colorScheme.onSurface.withOpacity(0.06),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 15, color: theme.colorScheme.onSurface),
            const SizedBox(width: 6),
            Text(label,
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onSurface)),
          ],
        ),
      ),
    );
  }
}
