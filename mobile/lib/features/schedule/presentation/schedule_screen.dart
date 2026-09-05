import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../data/providers/schedule_provider.dart';
import '../data/models/schedule_event_model.dart';
import 'create_edit_schedule_screen.dart';

class ScheduleScreen extends ConsumerStatefulWidget {
  const ScheduleScreen({super.key});

  @override
  ConsumerState<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends ConsumerState<ScheduleScreen> {
  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(scheduleProvider.notifier).fetchEvents();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final eventsState = ref.watch(scheduleProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Schedule'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const CreateEditScheduleScreen()),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          _buildWeekCalendar(theme),
          Divider(height: 1, color: theme.colorScheme.surfaceContainerHighest),
          Expanded(
            child: eventsState.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, st) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, color: Colors.red, size: 48),
                    const SizedBox(height: 16),
                    Text('Failed to load schedule', style: theme.textTheme.titleMedium),
                    TextButton(
                      onPressed: () => ref.read(scheduleProvider.notifier).fetchEvents(),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
              data: (events) {
                // Filter events by selected date
                final filteredEvents = events.where((e) {
                  if (e.date == null) return false;
                  return e.date!.year == _selectedDate.year &&
                         e.date!.month == _selectedDate.month &&
                         e.date!.day == _selectedDate.day;
                }).toList();

                if (filteredEvents.isEmpty) {
                  return Center(
                    child: Text(
                      'No events for this day',
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.5),
                      ),
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: filteredEvents.length,
                  itemBuilder: (context, index) {
                    final event = filteredEvents[index];
                    return _buildEventCard(event, theme);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEventCard(ScheduleEventModel event, ThemeData theme) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 80,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    event.startTime ?? '',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  if (event.endTime != null)
                    Text(
                      event.endTime!,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.5),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Container(
              width: 4,
              height: 50,
              decoration: BoxDecoration(
                color: _getEventColor(event.type, theme),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    event.title,
                    style: theme.textTheme.titleMedium,
                  ),
                  const SizedBox(height: 4),
                  if (event.description != null)
                    Text(
                      event.description!,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.6),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWeekCalendar(ThemeData theme) {
    final weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Find Monday of the current selected week
    final currentDayOfWeek = _selectedDate.weekday;
    final monday = _selectedDate.subtract(Duration(days: currentDayOfWeek - 1));

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      color: theme.colorScheme.surface,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: List.generate(7, (index) {
          final day = monday.add(Duration(days: index));
          final isSelected = day.year == _selectedDate.year &&
                             day.month == _selectedDate.month &&
                             day.day == _selectedDate.day;
          
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedDate = day;
              });
            },
            child: Column(
              children: [
                Text(
                  weekDays[index],
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: isSelected ? theme.colorScheme.primary : theme.colorScheme.onSurface.withOpacity(0.5),
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  width: 36,
                  height: 36,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: isSelected ? theme.colorScheme.primary.withOpacity(0.2) : Colors.transparent,
                    shape: BoxShape.circle,
                    border: isSelected ? Border.all(color: theme.colorScheme.primary, width: 1.5) : null,
                  ),
                  child: Text(
                    '${day.day}',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: isSelected ? theme.colorScheme.primary : theme.colorScheme.onSurface,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }

  Color _getEventColor(String type, ThemeData theme) {
    switch (type.toUpperCase()) {
      case 'MEETING':
      case 'CALL':
        return theme.colorScheme.primary;
      case 'MILESTONE':
      case 'DEADLINE':
        return Colors.orange;
      case 'INVOICE':
        return Colors.green;
      default:
        return theme.colorScheme.secondary;
    }
  }
}
