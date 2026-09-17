import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/providers/dio_provider.dart';
import '../data/providers/schedule_provider.dart';
import '../data/models/schedule_event_model.dart';
import '../../projects/data/providers/projects_provider.dart';
import '../../tasks/data/providers/tasks_provider.dart';

class CreateEditScheduleScreen extends ConsumerStatefulWidget {
  const CreateEditScheduleScreen({super.key});

  @override
  ConsumerState<CreateEditScheduleScreen> createState() =>
      _CreateEditScheduleScreenState();
}

class _CreateEditScheduleScreenState
    extends ConsumerState<CreateEditScheduleScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();

  String? _selectedProjectId;
  String? _linkedTaskId;
  DateTime? _selectedDate = DateTime.now();
  TimeOfDay _startTime = const TimeOfDay(hour: 10, minute: 0);
  TimeOfDay _endTime = const TimeOfDay(hour: 11, minute: 0);
  String _selectedType = 'MEETING';
  bool _isLoading = false;
  List<Map<String, dynamic>> _projectTasks = [];

  final List<String> _types = ['MEETING', 'CALL', 'DEADLINE', 'DELIVERABLE'];

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  DateTime _combine(DateTime date, TimeOfDay time) {
    return DateTime(date.year, date.month, date.day, time.hour, time.minute);
  }

  Future<void> _loadTasks(String projectId) async {
    final dioClient = ref.read(dioClientProvider);
    final response =
        await dioClient.dio.get('/tasks/project/$projectId');
    if (mounted && response.data is List) {
      setState(() {
        _projectTasks = (response.data as List).cast<Map<String, dynamic>>();
        _linkedTaskId = null;
      });
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
      initialTime: _startTime,
    );
    if (time != null) setState(() => _startTime = time);
  }

  Future<void> _pickEndTime() async {
    final time = await showTimePicker(
      context: context,
      initialTime: _endTime,
    );
    if (time != null) setState(() => _endTime = time);
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedDate == null || _selectedProjectId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a project and date')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final start = _combine(_selectedDate!, _startTime);
    final end = _combine(_selectedDate!, _endTime);

    final event = ScheduleEventModel(
      id: '',
      projectId: _selectedProjectId!,
      title: _titleController.text.trim(),
      description: _descriptionController.text.trim(),
      type: _selectedType,
      startTime: start,
      endTime: end,
      linkedTaskId: _linkedTaskId,
    );

    final success =
        await ref.read(scheduleProvider.notifier).createEvent(event);

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        ref.invalidate(tasksProvider);
        Navigator.pop(context, true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to save event')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final projectsAsync = ref.watch(projectsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('New Event'),
        actions: [
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Center(
                  child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2))),
            )
          else
            TextButton(onPressed: _save, child: const Text('Save')),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Project', style: theme.textTheme.titleSmall),
              const SizedBox(height: 8),
              projectsAsync.when(
                loading: () => const LinearProgressIndicator(),
                error: (_, __) => const Text('Failed to load projects'),
                data: (projects) {
                  if (_selectedProjectId == null && projects.isNotEmpty) {
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      final id = projects.first['id']?.toString();
                      if (id != null && mounted) {
                        setState(() => _selectedProjectId = id);
                        _loadTasks(id);
                      }
                    });
                  }
                  return DropdownButtonFormField<String>(
                    value: projects.any(
                            (p) => p['id']?.toString() == _selectedProjectId)
                        ? _selectedProjectId
                        : null,
                    decoration:
                        const InputDecoration(border: OutlineInputBorder()),
                    hint: const Text('Select project'),
                    items: projects
                        .map((p) => DropdownMenuItem(
                              value: p['id']?.toString(),
                              child: Text(
                                  p['name']?.toString() ?? 'Unnamed Project'),
                            ))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _selectedProjectId = val);
                        _loadTasks(val);
                      }
                    },
                    validator: (v) => v == null ? 'Required' : null,
                  );
                },
              ),
              const SizedBox(height: 16),
              Text('Event Type', style: theme.textTheme.titleSmall),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedType,
                decoration:
                    const InputDecoration(border: OutlineInputBorder()),
                items: _types
                    .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                    .toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedType = val);
                },
              ),
              const SizedBox(height: 16),
              Text('Title', style: theme.textTheme.titleSmall),
              const SizedBox(height: 8),
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                    border: OutlineInputBorder(), hintText: 'Event title'),
                validator: (val) =>
                    val == null || val.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              Text('Description (Optional)',
                  style: theme.textTheme.titleSmall),
              const SizedBox(height: 8),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                    border: OutlineInputBorder(), hintText: 'Notes or details'),
                maxLines: 3,
              ),
              const SizedBox(height: 16),
              if (_projectTasks.isNotEmpty) ...[
                Text('Link to Task (Optional)',
                    style: theme.textTheme.titleSmall),
                const SizedBox(height: 8),
                DropdownButtonFormField<String?>(
                  value: _linkedTaskId,
                  decoration:
                      const InputDecoration(border: OutlineInputBorder()),
                  hint: const Text('None'),
                  items: [
                    const DropdownMenuItem<String?>(
                        value: null, child: Text('None')),
                    ..._projectTasks.map((t) => DropdownMenuItem<String?>(
                          value: t['id']?.toString(),
                          child: Text(t['title']?.toString() ?? 'Task'),
                        )),
                  ],
                  onChanged: (val) => setState(() => _linkedTaskId = val),
                ),
                const SizedBox(height: 16),
              ],
              Text('Date', style: theme.textTheme.titleSmall),
              const SizedBox(height: 8),
              InkWell(
                onTap: _pickDate,
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border.all(color: theme.dividerColor),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(_selectedDate == null
                          ? 'Select Date'
                          : DateFormat('MMM dd, yyyy')
                              .format(_selectedDate!)),
                      const Icon(Icons.calendar_today, size: 20),
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
                        Text('Start Time', style: theme.textTheme.titleSmall),
                        const SizedBox(height: 8),
                        InkWell(
                          onTap: _pickStartTime,
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              border: Border.all(color: theme.dividerColor),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Row(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              children: [
                                Text(_startTime.format(context)),
                                const Icon(Icons.access_time, size: 20),
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
                        Text('End Time', style: theme.textTheme.titleSmall),
                        const SizedBox(height: 8),
                        InkWell(
                          onTap: _pickEndTime,
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              border: Border.all(color: theme.dividerColor),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Row(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              children: [
                                Text(_endTime.format(context)),
                                const Icon(Icons.access_time, size: 20),
                              ],
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
      ),
    );
  }
}
