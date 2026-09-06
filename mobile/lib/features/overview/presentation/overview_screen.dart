import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:math' as math;
import '../../../core/theme/theme_provider.dart';
import 'providers/overview_provider.dart';

class OverviewScreen extends ConsumerStatefulWidget {
  const OverviewScreen({super.key});

  @override
  ConsumerState<OverviewScreen> createState() => _OverviewScreenState();
}

class _OverviewScreenState extends ConsumerState<OverviewScreen> {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark || (themeMode == ThemeMode.system && MediaQuery.of(context).platformBrightness == Brightness.dark);
    final overviewAsync = ref.watch(overviewProvider);

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF050505) : Colors.white,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Custom Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
              child: Row(
                children: [
                  Image.asset(
                    'assets/images/logo.png',
                    width: 100,
                    height: 40,
                    fit: BoxFit.contain,
                  ),
                  const Spacer(),
                  Stack(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.notifications_none, size: 28),
                        onPressed: () {},
                      ),
                      Positioned(
                        right: 8,
                        top: 8,
                        child: Container(
                          padding: const EdgeInsets.all(2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFC107), // Faibah Yellow
                            borderRadius: BorderRadius.circular(10),
                          ),
                          constraints: const BoxConstraints(
                            minWidth: 16,
                            minHeight: 16,
                          ),
                          child: const Text(
                            '09',
                            style: TextStyle(
                              color: Colors.black,
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      )
                    ],
                  ),
                  const SizedBox(width: 8),
                  const CircleAvatar(
                    radius: 18,
                    backgroundImage: NetworkImage('https://i.pravatar.cc/150?img=11'),
                  ),
                ],
              ),
            ),

            // Search and Filter
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 48,
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF050505) : const Color(0xFFF9FAFB),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.grey.withOpacity(0.15)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.01),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          const SizedBox(width: 16),
                          Icon(Icons.search, color: Colors.grey.shade400, size: 22),
                          const SizedBox(width: 8),
                          Expanded(
                            child: TextField(
                              decoration: InputDecoration(
                                hintText: 'Search...',
                                hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14, fontWeight: FontWeight.w500),
                                border: InputBorder.none,
                                enabledBorder: InputBorder.none,
                                focusedBorder: InputBorder.none,
                                filled: false,
                                isDense: true,
                                contentPadding: const EdgeInsets.symmetric(vertical: 14),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    height: 48,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF050505) : Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.grey.withOpacity(0.15)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.01),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.filter_list, size: 20, color: Colors.grey.shade700),
                        const SizedBox(width: 6),
                        Text('Filter', style: TextStyle(fontWeight: FontWeight.w600, color: Colors.grey.shade700)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Scrollable Content matching Web App
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: isDark ? Colors.black : Colors.grey.shade50,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
                ),
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.only(top: 24, bottom: 120),
                  child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. Metric Cards (Horizontal scroll to fit mobile)
                    SizedBox(
                      height: 110,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        children: [
                          _buildMetricCard('Active Clients', '1', Icons.people_outline, isDark),
                          const SizedBox(width: 12),
                          _buildMetricCard('Total Revenue', '₦0.0K', Icons.attach_money, isDark, iconBg: const Color(0xFFFFC107).withOpacity(0.1), iconColor: const Color(0xFFFFB300)),
                          const SizedBox(width: 12),
                          _buildMetricCard('Active Projects', '1', Icons.folder_open, isDark),
                          const SizedBox(width: 12),
                          _buildMetricCard('Total Closed', '0', Icons.check_circle_outline, isDark),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // 2. Productivity KPIs Chart
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: _buildKPICard(isDark),
                    ),
                    const SizedBox(height: 24),

                    // 3. Subscriptions & Reminders Row
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(child: _buildEmptyStateCard('Subscriptions', 'No active subscriptions', isDark, action: 'View All')),
                          const SizedBox(width: 16),
                          Expanded(child: _buildEmptyStateCard('Reminders', 'No reminders', isDark, hasArrow: true)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // 4. Calendar Widget
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: _buildCalendarCard(isDark),
                    ),
                    const SizedBox(height: 24),

                    // 5. Top Clients
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: _buildTopClientsCard(isDark),
                    ),
                    const SizedBox(height: 24),

                    // 6. Today Task List
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: _buildTodayTaskSection(isDark),
                    ),
                  ],
                ),
              ),
            ),
          ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(String title, String value, IconData icon, bool isDark, {Color? iconBg, Color? iconColor}) {
    final bgColor = isDark ? const Color(0xFF050505) : Colors.white;
    final borderColor = isDark ? Colors.white10 : Colors.grey.shade200;

    return Container(
      width: 150,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600, fontWeight: FontWeight.w500),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Icon(icon, size: 16, color: iconColor ?? Colors.grey.shade400),
            ],
          ),
          Text(
            value,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildKPICard(bool isDark) {
    final bgColor = isDark ? const Color(0xFF050505) : Colors.white;
    final borderColor = isDark ? Colors.white10 : Colors.grey.shade200;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Projects', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white10 : Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: const [
                    Text('Weekly', style: TextStyle(fontSize: 12)),
                    SizedBox(width: 4),
                    Icon(Icons.keyboard_arrow_down, size: 14),
                  ],
                ),
              )
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              // Chart Area
              SizedBox(
                width: 120,
                height: 120,
                child: CustomPaint(
                  painter: DonutChartPainter(),
                ),
              ),
              const SizedBox(width: 24),
              // Legend
              Expanded(
                child: Column(
                  children: [
                    _buildLegendItem('Draft', '02', const Color(0xFFFF6B6B)),
                    const SizedBox(height: 12),
                    _buildLegendItem('Ongoing', '3', const Color(0xFFFFD93D)),
                    const SizedBox(height: 12),
                    _buildLegendItem('Awaiting payment', '3', const Color(0xFF6BCB77)),
                    const SizedBox(height: 12),
                    _buildLegendItem('Completed', '3', const Color(0xFF4D96FF)),
                  ],
                ),
              )
            ],
          )
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, String value, Color color) {
    return Row(
      children: [
        Container(width: 12, height: 12, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4))),
        const SizedBox(width: 8),
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
        const SizedBox(width: 4),
        Text('($value)', style: const TextStyle(fontSize: 13, color: Colors.grey)),
      ],
    );
  }

  Widget _buildLegendDot(Color color, String text) {
    return Row(
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(text, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }

  Widget _buildChartGridLine(String label) {
    return Row(
      children: [
        SizedBox(width: 40, child: Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey))),
        Expanded(
          child: Container(
            height: 1,
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: Colors.grey.shade200, style: BorderStyle.solid)), // Use dashed in a real implementation
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyStateCard(String title, String message, bool isDark, {String? action, bool hasArrow = false}) {
    final bgColor = isDark ? const Color(0xFF050505) : Colors.white;
    final borderColor = isDark ? Colors.white10 : Colors.grey.shade200;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            if (action != null)
              Text(action, style: const TextStyle(fontSize: 10, color: Colors.grey)),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          height: 100,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: borderColor),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 4)),
            ],
          ),
          child: Stack(
            children: [
              if (hasArrow)
                Positioned(top: 0, right: 0, child: Icon(Icons.arrow_outward, size: 16, color: Colors.grey.shade400)),
              Center(
                child: Text(message, style: TextStyle(fontSize: 12, color: Colors.grey.shade400), textAlign: TextAlign.center),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCalendarCard(bool isDark) {
    final bgColor = isDark ? const Color(0xFF050505) : Colors.white;
    final borderColor = isDark ? Colors.white10 : Colors.grey.shade200;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('September 2026', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              Row(
                children: const [
                  Icon(Icons.chevron_left, size: 20),
                  SizedBox(width: 8),
                  Icon(Icons.chevron_right, size: 20),
                ],
              )
            ],
          ),
          const SizedBox(height: 24),
          // Simplified Calendar Mock for Visuals
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((day) {
              return Text(day, style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.w600));
            }).toList(),
          ),
          const SizedBox(height: 16),
          // Just showing 1 week row for the mockup to save space, but matches the web visually
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildCalendarDay('30', isMuted: true),
              _buildCalendarDay('31', isMuted: true),
              _buildCalendarDay('1'),
              _buildCalendarDay('2'),
              _buildCalendarDay('3'),
              _buildCalendarDay('4'),
              _buildCalendarDay('5', isSelected: true),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildCalendarDay('6'),
              _buildCalendarDay('7', hasDot: true),
              _buildCalendarDay('8'),
              _buildCalendarDay('9', hasDot: true),
              _buildCalendarDay('10'),
              _buildCalendarDay('11'),
              _buildCalendarDay('12'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCalendarDay(String day, {bool isMuted = false, bool isSelected = false, bool hasDot = false}) {
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF0C3B2E) : Colors.transparent, // Very dark green/black
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              day,
              style: TextStyle(
                fontSize: 14,
                color: isSelected ? Colors.white : (isMuted ? Colors.grey.shade400 : Colors.black87),
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ),
        ),
        if (hasDot)
          Container(
            margin: const EdgeInsets.only(top: 4),
            width: 4,
            height: 4,
            decoration: const BoxDecoration(color: Color(0xFFFFC107), shape: BoxShape.circle),
          )
      ],
    );
  }

  Widget _buildTopClientsCard(bool isDark) {
    final bgColor = isDark ? const Color(0xFF050505) : Colors.white;
    final borderColor = isDark ? Colors.white10 : Colors.grey.shade200;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Top Clients', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              Icon(Icons.arrow_outward, size: 16, color: Colors.grey.shade400),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: Colors.blue.shade100,
                child: Text('JO', style: TextStyle(color: Colors.blue.shade700, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Johnson', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    const SizedBox(height: 2),
                    Text('Individual', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                  ],
                ),
              ),
              Icon(Icons.phone_outlined, color: Colors.grey.shade400, size: 20),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildTodayTaskSection(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Today Task', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            Text('See all', style: TextStyle(color: const Color(0xFF6D9773), fontWeight: FontWeight.w600)),
          ],
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 220,
          child: ListView(
            scrollDirection: Axis.horizontal,
            clipBehavior: Clip.none,
            children: [
              _buildTodayTaskCard(isDark, 'Create mood boards and visual references mobile apps.', 26),
              const SizedBox(width: 16),
              _buildTodayTaskCard(isDark, 'Review wireframes for client portal and web app.', 60),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTodayTaskCard(bool isDark, String title, int progressPercentage) {
    final bgColor = isDark ? const Color(0xFF050505) : Colors.white;
    final borderColor = isDark ? Colors.white10 : Colors.grey.shade200;

    return Container(
      width: 280,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(Icons.calendar_today_outlined, size: 14, color: Colors.grey.shade500),
                  const SizedBox(width: 4),
                  Text('12/06/2024', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                ],
              ),
              Row(
                children: [
                  Icon(Icons.access_time_outlined, size: 14, color: Colors.grey.shade500),
                  const SizedBox(width: 4),
                  Text('09 hrs', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            height: 6,
            width: double.infinity,
            decoration: BoxDecoration(
              color: isDark ? Colors.white10 : Colors.grey.shade200,
              borderRadius: BorderRadius.circular(3),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: progressPercentage / 100,
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFFFC107),
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('On Progress', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
              Text('$progressPercentage%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
            ],
          ),
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  _buildIconWithCount(Icons.check_box_outlined, '02'),
                  const SizedBox(width: 8),
                  _buildIconWithCount(Icons.format_list_bulleted, '12'),
                  const SizedBox(width: 8),
                  _buildIconWithCount(Icons.chat_bubble_outline, '02'),
                  const SizedBox(width: 8),
                  _buildIconWithCount(Icons.attach_file, '12'),
                ],
              ),
              // Overlapping avatars
              SizedBox(
                width: 60,
                height: 24,
                child: Stack(
                  children: [
                    Positioned(
                      right: 0,
                      child: CircleAvatar(
                        radius: 12,
                        backgroundColor: const Color(0xFFE8EAF6),
                        child: Text('10+', style: TextStyle(fontSize: 10, color: Colors.indigo.shade400, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    Positioned(
                      right: 16,
                      child: CircleAvatar(
                        radius: 12,
                        backgroundColor: bgColor,
                        child: const CircleAvatar(
                          radius: 11,
                          backgroundImage: NetworkImage('https://i.pravatar.cc/100?img=11'),
                        ),
                      ),
                    ),
                    Positioned(
                      right: 32,
                      child: CircleAvatar(
                        radius: 12,
                        backgroundColor: bgColor,
                        child: const CircleAvatar(
                          radius: 11,
                          backgroundImage: NetworkImage('https://i.pravatar.cc/100?img=12'),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildIconWithCount(IconData icon, String count) {
    return Row(
      children: [
        Icon(icon, size: 12, color: Colors.grey.shade500),
        const SizedBox(width: 2),
        Text(count, style: TextStyle(fontSize: 10, color: Colors.grey.shade500)),
      ],
    );
  }
}

class DonutChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 8;
    
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 16
      ..strokeCap = StrokeCap.round;

    // Draw the segments
    // Red (Stuck)
    paint.color = const Color(0xFFFF6B6B);
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      2.5, 1.2, false, paint,
    );
    
    // Yellow (In Progress)
    paint.color = const Color(0xFFFFD93D);
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      3.9, 1.0, false, paint,
    );
    
    // Blue (In Review)
    paint.color = const Color(0xFF4D96FF);
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      5.1, 1.3, false, paint,
    );
    
    // Green (Done)
    paint.color = const Color(0xFF6BCB77);
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      0.3, 2.0, false, paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
