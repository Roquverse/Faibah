import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'dart:math';
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

  // Mock timeline events for UI
  final List<Map<String, dynamic>> _mockEvents = [
    {
      'startTime': '08:00 AM',
      'title': 'Running',
      'timeRange': '9.00 AM - 10.00 AM',
      'description': 'Running and meet with colleagues & discuss daily life.',
      'icon': Icons.directions_run,
      'color': const Color(0xFFE3F2FD),
      'hasTeam': true,
    },
    {
      'startTime': '10:50 AM',
      'title': 'Study english',
      'timeRange': '10.15 AM - 12.00 PM',
      'description': 'Running and meet with colleagues & discuss daily life.',
      'icon': Icons.menu_book,
      'color': const Color(0xFFFBE9E7),
      'hasTeam': true,
    },
    {
      'startTime': '02:40 PM',
      'title': 'Lunch Break',
      'timeRange': '02:40 PM',
      'description': null,
      'icon': Icons.lunch_dining,
      'color': const Color(0xFFF3E5F5),
      'hasTeam': false,
    },
    {
      'startTime': '04:00 PM',
      'title': 'Grocery Shoping',
      'timeRange': '04:00 PM',
      'description': null,
      'icon': Icons.shopping_basket,
      'color': const Color(0xFFFFF3E0),
      'hasTeam': false,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildScrollableCalendar(theme),
          Divider(height: 1, color: theme.colorScheme.onSurface.withOpacity(0.05)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Row(
              children: [
                Text(
                  'My Today Task',
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text('5', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              itemCount: _mockEvents.length,
              itemBuilder: (context, index) {
                return _buildTimelineEvent(theme, _mockEvents[index]);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScrollableCalendar(ThemeData theme) {
    final weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final startDate = _selectedDate.subtract(const Duration(days: 7));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Month/Year header with navigation
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${_monthName(_selectedDate.month)} ${_selectedDate.year}',
                style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () => setState(() {
                      _selectedDate = DateTime(
                        _selectedDate.month == 1 ? _selectedDate.year - 1 : _selectedDate.year,
                        _selectedDate.month == 1 ? 12 : _selectedDate.month - 1,
                        _selectedDate.day,
                      );
                    }),
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surface,
                        shape: BoxShape.circle,
                        border: Border.all(color: theme.colorScheme.onSurface.withOpacity(0.1)),
                      ),
                      child: Icon(Icons.chevron_left, size: 18, color: theme.colorScheme.onSurface),
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () => setState(() {
                      _selectedDate = DateTime(
                        _selectedDate.month == 12 ? _selectedDate.year + 1 : _selectedDate.year,
                        _selectedDate.month == 12 ? 1 : _selectedDate.month + 1,
                        _selectedDate.day,
                      );
                    }),
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surface,
                        shape: BoxShape.circle,
                        border: Border.all(color: theme.colorScheme.onSurface.withOpacity(0.1)),
                      ),
                      child: Icon(Icons.chevron_right, size: 18, color: theme.colorScheme.onSurface),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        // Scrollable day picker
        SizedBox(
          height: 80,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: 31,
            itemBuilder: (context, index) {
              final day = DateTime(_selectedDate.year, _selectedDate.month, 1)
                  .add(Duration(days: index));
              // Stop rendering past end of month
              if (day.month != _selectedDate.month) return const SizedBox.shrink();
              final isSelected = day.day == _selectedDate.day;

              return GestureDetector(
                onTap: () => setState(() => _selectedDate = day),
                child: Container(
                  width: 50,
                  margin: const EdgeInsets.only(right: 8),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        weekDays[day.weekday - 1],
                        style: theme.textTheme.labelMedium?.copyWith(
                          color: isSelected ? theme.colorScheme.primary : theme.colorScheme.onSurface.withOpacity(0.5),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        width: 40,
                        height: 40,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: isSelected ? theme.colorScheme.primary : Colors.transparent,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          '${day.day}',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: isSelected ? Colors.white : theme.colorScheme.onSurface,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  String _monthName(int month) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }

  Widget _buildTimelineEvent(ThemeData theme, Map<String, dynamic> event) {
    bool isDark = theme.brightness == Brightness.dark;
    Color baseTint = event['color'];
    Color cardColor = isDark ? Color.alphaBlend(baseTint.withOpacity(0.1), theme.colorScheme.surface) : baseTint;
    
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Time column
          SizedBox(
            width: 60,
            child: Column(
              children: [
                Text(
                  event['startTime'].split(' ')[0],
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w500),
                ),
                Text(
                  event['startTime'].split(' ')[1],
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.6),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          
          // Event Card
          Expanded(
            child: Container(
              margin: const EdgeInsets.only(bottom: 24),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface, // using surface to match dark theme
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: theme.colorScheme.onSurface.withOpacity(0.05)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Row(
                          children: [
                            Icon(event['icon'], color: theme.colorScheme.primary, size: 22),
                            const SizedBox(width: 10),
                            Flexible(
                              child: Text(
                                event['title'],
                                style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        event['timeRange'],
                        style: theme.textTheme.labelSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: theme.colorScheme.onSurface.withOpacity(0.6),
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                  if (event['description'] != null) ...[
                    const SizedBox(height: 16),
                    Text(
                      event['description'],
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.7),
                        height: 1.5,
                      ),
                    ),
                  ],
                  if (event['hasTeam'] == true) ...[
                    const SizedBox(height: 20),
                    SizedBox(
                      height: 36,
                      child: Stack(
                        children: [
                          for (int i = 0; i < 3; i++)
                            Positioned(
                              left: i * 24.0,
                              child: Container(
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(color: theme.colorScheme.surface, width: 2),
                                ),
                                child: CircleAvatar(
                                  radius: 16,
                                  backgroundColor: Colors.primaries[Random().nextInt(Colors.primaries.length)].withOpacity(0.5),
                                  child: const Icon(Icons.person, size: 16, color: Colors.white),
                                ),
                              ),
                            ),
                          Positioned(
                            left: 3 * 24.0,
                            child: Container(
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(color: theme.colorScheme.surface, width: 2),
                              ),
                              child: CircleAvatar(
                                radius: 16,
                                backgroundColor: theme.colorScheme.primary,
                                child: const Icon(Icons.add, size: 16, color: Colors.white),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ]
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
