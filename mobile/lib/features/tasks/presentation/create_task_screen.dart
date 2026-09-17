import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../data/providers/tasks_provider.dart';
import '../../projects/data/providers/projects_provider.dart';

class CreateTaskScreen extends ConsumerStatefulWidget {
  const CreateTaskScreen({super.key});

  @override
  ConsumerState<CreateTaskScreen> createState() => _CreateTaskScreenState();
}

class _CreateTaskScreenState extends ConsumerState<CreateTaskScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();

  String? _selectedProjectId;
  DateTime? _selectedDate = DateTime.now();
  TimeOfDay? _startTime = const TimeOfDay(hour: 9, minute: 0);
  TimeOfDay? _endTime = const TimeOfDay(hour: 10, minute: 0);
  bool _isRepeat = false;
  int _selectedDayIndex = 0;
  String _priority = 'MEDIUM';
  String _status = 'TODO';
  bool _isSaving = false;

  List<Map<String, dynamic>> _projectMembers = [];
  final Set<String> _selectedMemberIds = {};

  final List<String> _days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  Future<void> _loadMembers(String projectId) async {
    final members =
        await ref.read(tasksProvider.notifier).fetchProjectMembers(projectId);
    if (mounted) {
      setState(() {
        _projectMembers = members;
        _selectedMemberIds.clear();
      });
    }
  }

  DateTime _combineDateAndTime(DateTime date, TimeOfDay time) {
    return DateTime(date.year, date.month, date.day, time.hour, time.minute);
  }

  Future<void> _saveTask() async {
    final title = _titleController.text.trim();
    if (title.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a task title')),
      );
      return;
    }
    if (_selectedProjectId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a project')),
      );
      return;
    }

    setState(() => _isSaving = true);

    DateTime? dueDate;
    DateTime? startDateTime;
    DateTime? endDateTime;
    final scheduleDate = _selectedDate ?? DateTime.now();
    if (_endTime != null) {
      endDateTime = _combineDateAndTime(scheduleDate, _endTime!);
      dueDate = endDateTime;
    } else {
      dueDate = scheduleDate;
    }
    if (_startTime != null) {
      startDateTime = _combineDateAndTime(scheduleDate, _startTime!);
    }

    var scheduleDescription = _descriptionController.text.trim();
    if (_locationController.text.trim().isNotEmpty) {
      scheduleDescription = scheduleDescription.isEmpty
          ? 'Location: ${_locationController.text.trim()}'
          : '$scheduleDescription\nLocation: ${_locationController.text.trim()}';
    }
    if (_isRepeat) {
      scheduleDescription = scheduleDescription.isEmpty
          ? 'Repeats weekly on ${_days[_selectedDayIndex]}'
          : '$scheduleDescription\nRepeats weekly on ${_days[_selectedDayIndex]}';
    }

    final task = await ref.read(tasksProvider.notifier).createTask({
      'projectId': _selectedProjectId,
      'title': title,
      'description': _descriptionController.text.trim(),
      'status': _status,
      'priority': _priority,
      if (dueDate != null) 'dueDate': dueDate.toIso8601String(),
      if (startDateTime != null) 'startTime': startDateTime.toIso8601String(),
      if (endDateTime != null) 'endTime': endDateTime.toIso8601String(),
      if (scheduleDescription.isNotEmpty) 'scheduleDescription': scheduleDescription,
      'scheduleType': startDateTime != null ? 'MEETING' : 'DEADLINE',
    });

    if (task == null) {
      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to create task')),
        );
      }
      return;
    }

    final taskId = task['id']?.toString() ?? '';
    for (final memberId in _selectedMemberIds) {
      await ref.read(tasksProvider.notifier).assignMember(taskId, memberId);
    }

    if (mounted) {
      setState(() => _isSaving = false);
      Navigator.pop(context, true);
    }
  }

  Future<void> _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    if (date != null) setState(() => _selectedDate = date);
  }

  Future<void> _pickStartTime() async {
    final time = await showTimePicker(
      context: context,
      initialTime: _startTime ?? TimeOfDay.now(),
    );
    if (time != null) setState(() => _startTime = time);
  }

  Future<void> _pickEndTime() async {
    final time = await showTimePicker(
      context: context,
      initialTime: _endTime ?? TimeOfDay.now(),
    );
    if (time != null) setState(() => _endTime = time);
  }

  void _showMemberPicker() {
    if (_selectedProjectId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Select a project first')),
      );
      return;
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;
    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? const Color(0xFF1E1E1E) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Padding(
                padding: EdgeInsets.all(16),
                child: Text('Assign team members',
                    style:
                        TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ),
              if (_projectMembers.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(24),
                  child: Text('No members found for this project'),
                )
              else
                Flexible(
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: _projectMembers.length,
                    itemBuilder: (context, index) {
                      final member = _projectMembers[index];
                      final memberId = member['id']?.toString() ?? '';
                      final user = member['user'] as Map<String, dynamic>?;
                      final contact =
                          member['clientContact'] as Map<String, dynamic>?;
                      final name = user != null
                          ? '${user['firstName'] ?? ''} ${user['lastName'] ?? ''}'
                              .trim()
                          : contact?['name']?.toString() ?? 'Member';
                      final isSelected =
                          _selectedMemberIds.contains(memberId);

                      return ListTile(
                        tileColor: Colors.transparent,
                        leading: CircleAvatar(
                          child: Text(
                              name.isNotEmpty ? name[0].toUpperCase() : '?'),
                        ),
                        title: Text(name),
                        subtitle: Text(member['role']?.toString() ?? ''),
                        trailing: Icon(
                          isSelected
                              ? Icons.check_circle
                              : Icons.circle_outlined,
                          color: isSelected ? Colors.green : Colors.grey,
                        ),
                        onTap: () {
                          setState(() {
                            if (isSelected) {
                              _selectedMemberIds.remove(memberId);
                            } else {
                              _selectedMemberIds.add(memberId);
                            }
                          });
                          Navigator.pop(context);
                          setState(() {});
                        },
                      );
                    },
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  String _memberName(Map<String, dynamic> member) {
    final user = member['user'] as Map<String, dynamic>?;
    if (user != null) {
      final name =
          '${user['firstName'] ?? ''} ${user['lastName'] ?? ''}'.trim();
      if (name.isNotEmpty) return name;
    }
    return member['clientContact']?['name']?.toString() ?? 'Member';
  }

  Widget _buildTextField(
    String label,
    TextEditingController controller,
    String hint, {
    int maxLines = 1,
    Widget? prefixIcon,
  }) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: theme.textTheme.labelMedium?.copyWith(
            color: theme.colorScheme.onSurface.withOpacity(0.6),
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
                color: theme.colorScheme.onSurface.withOpacity(0.1)),
          ),
          child: TextFormField(
            controller: controller,
            maxLines: maxLines,
            decoration: InputDecoration(
              border: InputBorder.none,
              hintText: hint,
              hintStyle: TextStyle(
                  color: theme.colorScheme.onSurface.withOpacity(0.3)),
              prefixIcon: prefixIcon,
              prefixIconConstraints:
                  const BoxConstraints(minWidth: 40, minHeight: 40),
            ),
            style: theme.textTheme.bodyMedium
                ?.copyWith(fontWeight: FontWeight.w500),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final projectsAsync = ref.watch(projectsProvider);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('New Task'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          GestureDetector(
            onTap: _isSaving ? null : _saveTask,
            child: Container(
              height: 36,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: _isSaving
                    ? theme.colorScheme.primary.withOpacity(0.5)
                    : theme.colorScheme.primary,
                borderRadius: BorderRadius.circular(18),
              ),
              alignment: Alignment.center,
              child: Text(
                _isSaving ? 'Saving...' : 'Save',
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            projectsAsync.when(
              loading: () => const LinearProgressIndicator(),
              error: (_, __) => const SizedBox.shrink(),
              data: (projects) {
                if (_selectedProjectId == null && projects.isNotEmpty) {
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    final id = projects.first['id']?.toString();
                    if (id != null && mounted) {
                      setState(() => _selectedProjectId = id);
                      _loadMembers(id);
                    }
                  });
                }
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Project',
                      style: theme.textTheme.labelMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.6),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color:
                                theme.colorScheme.onSurface.withOpacity(0.1)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          isExpanded: true,
                          value: projects.any(
                                  (p) => p['id']?.toString() == _selectedProjectId)
                              ? _selectedProjectId
                              : null,
                          hint: const Text('Select project...'),
                          items: projects
                              .map((p) => DropdownMenuItem<String>(
                                    value: p['id']?.toString(),
                                    child: Text(p['name']?.toString() ??
                                        'Unnamed Project'),
                                  ))
                              .toList(),
                          onChanged: (value) {
                            if (value != null) {
                              setState(() => _selectedProjectId = value);
                              _loadMembers(value);
                            }
                          },
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.task_alt,
                          size: 28, color: theme.colorScheme.primary),
                    ),
                  ],
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildTextField(
                      'Title', _titleController, 'Meet With Client'),
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildTextField('Description', _descriptionController,
                'Discuss project updates and strategies with client',
                maxLines: 3),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Priority',
                          style: theme.textTheme.labelMedium?.copyWith(
                            color:
                                theme.colorScheme.onSurface.withOpacity(0.6),
                            fontWeight: FontWeight.w600,
                          )),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                              color: theme.colorScheme.onSurface
                                  .withOpacity(0.1)),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            isExpanded: true,
                            value: _priority,
                            items: const [
                              DropdownMenuItem(
                                  value: 'LOW', child: Text('Low')),
                              DropdownMenuItem(
                                  value: 'MEDIUM', child: Text('Medium')),
                              DropdownMenuItem(
                                  value: 'HIGH', child: Text('High')),
                              DropdownMenuItem(
                                  value: 'URGENT', child: Text('Urgent')),
                            ],
                            onChanged: (v) =>
                                setState(() => _priority = v ?? 'MEDIUM'),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Status',
                          style: theme.textTheme.labelMedium?.copyWith(
                            color:
                                theme.colorScheme.onSurface.withOpacity(0.6),
                            fontWeight: FontWeight.w600,
                          )),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                              color: theme.colorScheme.onSurface
                                  .withOpacity(0.1)),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            isExpanded: true,
                            value: _status,
                            items: const [
                              DropdownMenuItem(
                                  value: 'TODO', child: Text('To-do')),
                              DropdownMenuItem(
                                  value: 'IN_PROGRESS',
                                  child: Text('In Progress')),
                              DropdownMenuItem(
                                  value: 'IN_REVISION',
                                  child: Text('In Revision')),
                              DropdownMenuItem(
                                  value: 'DONE', child: Text('Done')),
                            ],
                            onChanged: (v) =>
                                setState(() => _status = v ?? 'TODO'),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              'Team Members',
              style: theme.textTheme.labelMedium?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.6),
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                ..._selectedMemberIds.map((id) {
                  final member = _projectMembers.firstWhere(
                    (m) => m['id']?.toString() == id,
                    orElse: () => {},
                  );
                  if (member.isEmpty) return const SizedBox.shrink();
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: CircleAvatar(
                      radius: 20,
                      backgroundColor:
                          theme.colorScheme.primary.withOpacity(0.3),
                      child: Text(
                        _memberName(member).substring(0, 1).toUpperCase(),
                        style: const TextStyle(
                            color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                  );
                }),
                GestureDetector(
                  onTap: _showMemberPicker,
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.add, color: Colors.white),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              'Date and Time',
              style: theme.textTheme.labelMedium?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.6),
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            InkWell(
              onTap: _pickDate,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                      color: theme.colorScheme.onSurface.withOpacity(0.1)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.calendar_today,
                        size: 20,
                        color: theme.colorScheme.onSurface.withOpacity(0.6)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _selectedDate == null
                            ? 'Select Date'
                            : DateFormat('dd MMMM yyyy')
                                .format(_selectedDate!),
                        style: theme.textTheme.bodyMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ),
                    Icon(Icons.keyboard_arrow_down,
                        color: theme.colorScheme.onSurface.withOpacity(0.6)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('From',
                          style: theme.textTheme.labelMedium?.copyWith(
                            color:
                                theme.colorScheme.onSurface.withOpacity(0.6),
                            fontWeight: FontWeight.w600,
                          )),
                      const SizedBox(height: 8),
                      InkWell(
                        onTap: _pickStartTime,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 16),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                                color: theme.colorScheme.onSurface
                                    .withOpacity(0.1)),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.access_time,
                                  size: 20,
                                  color: theme.colorScheme.onSurface
                                      .withOpacity(0.6)),
                              const SizedBox(width: 12),
                              Text(
                                _startTime?.format(context) ?? 'Time',
                                style: theme.textTheme.bodyMedium
                                    ?.copyWith(fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('To',
                          style: theme.textTheme.labelMedium?.copyWith(
                            color:
                                theme.colorScheme.onSurface.withOpacity(0.6),
                            fontWeight: FontWeight.w600,
                          )),
                      const SizedBox(height: 8),
                      InkWell(
                        onTap: _pickEndTime,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 16),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                                color: theme.colorScheme.onSurface
                                    .withOpacity(0.1)),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.access_time,
                                  size: 20,
                                  color: theme.colorScheme.onSurface
                                      .withOpacity(0.6)),
                              const SizedBox(width: 12),
                              Text(
                                _endTime?.format(context) ?? 'Time',
                                style: theme.textTheme.bodyMedium
                                    ?.copyWith(fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Repeat',
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.6),
                      fontWeight: FontWeight.w600,
                    )),
                Switch(
                  value: _isRepeat,
                  onChanged: (val) => setState(() => _isRepeat = val),
                  activeThumbColor: theme.colorScheme.primary,
                ),
              ],
            ),
            if (_isRepeat) ...[
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(_days.length, (index) {
                  final isSelected = _selectedDayIndex == index;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedDayIndex = index),
                    child: Container(
                      width: 40,
                      height: 40,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: isSelected
                            ? theme.colorScheme.primary
                            : theme.colorScheme.surface,
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: isSelected
                                ? Colors.transparent
                                : theme.colorScheme.onSurface
                                    .withOpacity(0.1)),
                      ),
                      child: Text(
                        _days[index],
                        style: TextStyle(
                          color: isSelected
                              ? Colors.white
                              : theme.colorScheme.onSurface.withOpacity(0.6),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ],
            const SizedBox(height: 24),
            _buildTextField(
              'Location',
              _locationController,
              'https://meet.google.com/...',
              prefixIcon: const Icon(Icons.videocam, color: Colors.blue),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
