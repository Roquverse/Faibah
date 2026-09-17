import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:math' as math;
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/theme_provider.dart';
import 'providers/overview_provider.dart';
import '../../settings/presentation/settings_screen.dart';
import '../../clients/presentation/clients_screen.dart';
import '../../notifications/data/providers/notifications_provider.dart';
import '../../notifications/presentation/notifications_sheet.dart';
import '../../projects/data/providers/projects_provider.dart';
import '../../projects/presentation/widgets/project_quick_panel.dart';
import '../../projects/presentation/create_project_screen.dart';
import '../../clients/data/providers/clients_provider.dart';
import '../../clients/presentation/client_details_screen.dart';
import '../../clients/presentation/create_edit_client_screen.dart';
import '../../tasks/data/providers/tasks_provider.dart';
import '../../tasks/presentation/tasks_screen.dart';
import '../../tasks/presentation/create_task_screen.dart';
import '../../invoices/data/providers/invoices_provider.dart';
import '../../invoices/presentation/invoice_preview_screen.dart';
import '../../invoices/presentation/create_invoice_screen.dart';
import '../../schedule/presentation/schedule_screen.dart';
import '../../channels/presentation/channels_screen.dart';

class OverviewScreen extends ConsumerStatefulWidget {
  const OverviewScreen({super.key});

  @override
  ConsumerState<OverviewScreen> createState() => _OverviewScreenState();
}

class _OverviewScreenState extends ConsumerState<OverviewScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _selectedCategory = 'All';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark || (themeMode == ThemeMode.system && MediaQuery.of(context).platformBrightness == Brightness.dark);
    final overviewAsync = ref.watch(overviewProvider);

    return Scaffold(
      backgroundColor: isDark ? theme.scaffoldBackgroundColor : Colors.white,
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
                    isDark ? 'assets/images/logo.png' : 'assets/images/logo-dark.png',
                    width: 100,
                    height: 40,
                    fit: BoxFit.contain,
                  ),
                  const Spacer(),
                  Consumer(
                    builder: (context, ref, _) {
                      final unreadCount = ref.watch(unreadNotificationsCountProvider);
                      return Stack(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.notifications_none, size: 28),
                            onPressed: () => NotificationsSheet.show(context),
                          ),
                          if (unreadCount > 0)
                            Positioned(
                              right: 8,
                              top: 8,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFEF4444),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: isDark ? theme.scaffoldBackgroundColor : Colors.white,
                                    width: 1.5,
                                  ),
                                ),
                                constraints: const BoxConstraints(
                                  minWidth: 16,
                                  minHeight: 16,
                                ),
                                child: Text(
                                  unreadCount > 99 ? '99+' : '$unreadCount',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ),
                        ],
                      );
                    },
                  ),
                  const SizedBox(width: 4),
                  IconButton(
                    icon: const Icon(Icons.settings_outlined, size: 26),
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const SettingsScreen()),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Consumer(
                    builder: (context, ref, child) {
                      final user = Supabase.instance.client.auth.currentUser;
                      final metadata = user?.userMetadata ?? {};
                      final avatarUrl = metadata['avatar_url']?.toString();
                      final fullName = metadata['full_name']?.toString() ?? user?.email ?? 'User';
                      final fallbackAvatar = 'https://ui-avatars.com/api/?name=${Uri.encodeComponent(fullName)}&background=random&format=png';
                      
                      return CircleAvatar(
                        radius: 18,
                        backgroundColor: Colors.blue.shade100,
                        backgroundImage: NetworkImage(avatarUrl != null && avatarUrl.isNotEmpty ? avatarUrl : fallbackAvatar),
                      );
                    }
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
                              controller: _searchController,
                              onChanged: (val) {
                                setState(() {
                                  _searchQuery = val.trim();
                                });
                              },
                              style: TextStyle(
                                color: isDark ? Colors.white : Colors.black87,
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                              ),
                              decoration: InputDecoration(
                                hintText: 'Search projects, clients, tasks...',
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
                          if (_searchQuery.isNotEmpty)
                            IconButton(
                              icon: Icon(Icons.clear, size: 18, color: Colors.grey.shade500),
                              onPressed: () {
                                _searchController.clear();
                                setState(() {
                                  _searchQuery = '';
                                });
                              },
                            ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: () => _showFilterSheet(context, isDark),
                    child: Container(
                      height: 48,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: _selectedCategory != 'All'
                            ? AppTheme.yellow.withOpacity(0.2)
                            : (isDark ? const Color(0xFF050505) : Colors.white),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: _selectedCategory != 'All'
                              ? AppTheme.yellow
                              : Colors.grey.withOpacity(0.15),
                        ),
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
                          Icon(
                            Icons.filter_list,
                            size: 20,
                            color: _selectedCategory != 'All' ? AppTheme.yellow : Colors.grey.shade700,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _selectedCategory == 'All' ? 'Filter' : _selectedCategory,
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: _selectedCategory != 'All'
                                  ? (isDark ? AppTheme.yellow : Colors.black87)
                                  : Colors.grey.shade700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Scrollable Content matching Web App or Search Results
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.trueBlack : Colors.grey.shade50,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
                ),
                child: _searchQuery.isNotEmpty || _selectedCategory != 'All'
                    ? _buildSearchResultsView(isDark, theme)
                    : overviewAsync.when(
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (err, stack) => Center(
                    child: Text('Error loading overview: $err', style: const TextStyle(color: Colors.red)),
                  ),
                  data: (data) => RefreshIndicator(
                    onRefresh: () async {
                      ref.invalidate(overviewProvider);
                    },
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
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
                              _buildMetricCard('Active Clients', '${data['activeClients'] ?? 0}', Icons.people_outline, isDark),
                              const SizedBox(width: 12),
                              _buildMetricCard('Total Revenue', '₦${((data['totalRevenue'] ?? 0) / 1000).toStringAsFixed(1)}K', Icons.attach_money, isDark, iconBg: const Color(0xFFFFC107).withOpacity(0.1), iconColor: const Color(0xFFFFB300)),
                              const SizedBox(width: 12),
                              _buildMetricCard('Active Projects', '${data['activeProjects'] ?? 0}', Icons.folder_open, isDark),
                              const SizedBox(width: 12),
                              _buildMetricCard('Total Closed', '${data['totalClosed'] ?? 0}', Icons.check_circle_outline, isDark),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),

                        // 2. Productivity KPIs Chart
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: _buildKPICard(isDark, data),
                        ),
                        const SizedBox(height: 24),

                        // 3. Subscriptions & Reminders Row
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(child: _buildEmptyStateCard('Subscriptions', (data['subscriptions'] as List?)?.isEmpty ?? true ? 'No active subscriptions' : '${(data['subscriptions'] as List).length} active', isDark, action: 'View All')),
                              const SizedBox(width: 16),
                              Expanded(child: _buildEmptyStateCard('Reminders', (data['reminders'] as List?)?.isEmpty ?? true ? 'No reminders' : '${(data['reminders'] as List).length} reminders', isDark, hasArrow: true)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),

                        // 5. Top Clients
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: _buildTopClientsCard(context, isDark, data['topClients'] as List? ?? []),
                        ),
                        const SizedBox(height: 24),

                        // 6. Today Task List
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: _buildTodayTaskSection(isDark, data),
                        ),
                      ],
                    ),
                  ),
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
    final bgColor = isDark ? AppTheme.darkBackground : Colors.white;
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

  Widget _buildKPICard(bool isDark, Map<String, dynamic> data) {
    final bgColor = isDark ? AppTheme.darkBackground : Colors.white;
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
                  painter: DonutChartPainter(data),
                ),
              ),
              const SizedBox(width: 24),
              // Legend
              Expanded(
                child: Column(
                  children: [
                    _buildLegendItem('Draft', '${data['draftProjects'] ?? 0}', const Color(0xFFFF6B6B)),
                    const SizedBox(height: 12),
                    _buildLegendItem('Ongoing', '${data['ongoingProjects'] ?? 0}', const Color(0xFFFFD93D)),
                    const SizedBox(height: 12),
                    _buildLegendItem('Awaiting payment', '${data['awaitingPaymentProjects'] ?? 0}', const Color(0xFF6BCB77)),
                    const SizedBox(height: 12),
                    _buildLegendItem('Completed', '${data['totalClosed'] ?? 0}', const Color(0xFF4D96FF)),
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
    final bgColor = isDark ? AppTheme.darkBackground : Colors.white;
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
    final bgColor = isDark ? AppTheme.darkBackground : Colors.white;
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

  Widget _buildTopClientsCard(BuildContext context, bool isDark, List<dynamic> clients) {
    final bgColor = isDark ? AppTheme.darkBackground : Colors.white;
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
              const Text('Latest Clients', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              GestureDetector(
                onTap: () {
                  Navigator.push(context, MaterialPageRoute(builder: (context) => const ClientsScreen()));
                },
                child: Icon(Icons.arrow_outward, size: 16, color: Colors.grey.shade400),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (clients.isEmpty)
             Center(child: Text('No clients found', style: TextStyle(color: Colors.grey.shade500))),
          ...clients.map((client) => Padding(
            padding: const EdgeInsets.only(bottom: 12.0),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: Colors.blue.shade100,
                  backgroundImage: NetworkImage(
                    (client['img'] != null && client['img'].toString().contains('ui-avatars.com') && !client['img'].toString().contains('format=png'))
                        ? '${client['img']}&format=png'
                        : client['img'] ?? ''
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(client['name'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      const SizedBox(height: 2),
                      Text(client['company'] ?? 'Individual', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                    ],
                  ),
                ),
                Icon(Icons.phone_outlined, color: Colors.grey.shade400, size: 20),
              ],
            ),
          )).toList(),
        ],
      ),
    );
  }

  Widget _buildTodayTaskSection(bool isDark, Map<String, dynamic> data) {
    final tasks = data['tasks'] as List? ?? [];
    
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
        if (tasks.isEmpty)
           Center(
             child: Padding(
               padding: const EdgeInsets.symmetric(vertical: 32.0),
               child: Text('No tasks for today', style: TextStyle(color: Colors.grey.shade500)),
             ),
           )
        else
          SizedBox(
            height: 220,
            child: ListView(
              scrollDirection: Axis.horizontal,
              clipBehavior: Clip.none,
              children: tasks.map((task) => Padding(
                padding: const EdgeInsets.only(right: 16.0),
                child: _buildTodayTaskCard(isDark, task['title'] ?? 'Task', task['progress'] ?? 0),
              )).toList(),
            ),
          ),
      ],
    );
  }

  Widget _buildTodayTaskCard(bool isDark, String title, int progressPercentage) {
    final bgColor = isDark ? AppTheme.darkBackground : Colors.white;
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

  void _showFilterSheet(BuildContext context, bool isDark) {
    final categories = ['All', 'Projects', 'Clients', 'Tasks', 'Invoices'];
    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? const Color(0xFF1E1E1E) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Filter by Category',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
                const SizedBox(height: 12),
                ...categories.map(
                  (cat) => ListTile(
                    tileColor: Colors.transparent,
                    leading: Icon(
                      cat == 'All'
                          ? Icons.apps
                          : cat == 'Projects'
                              ? Icons.folder_open
                              : cat == 'Clients'
                                  ? Icons.people_outline
                                  : cat == 'Tasks'
                                      ? Icons.check_circle_outline
                                      : Icons.receipt_long,
                      color: _selectedCategory == cat ? AppTheme.yellow : (isDark ? Colors.white70 : Colors.grey.shade700),
                    ),
                    title: Text(
                      cat,
                      style: TextStyle(
                        fontWeight: _selectedCategory == cat ? FontWeight.bold : FontWeight.normal,
                        color: _selectedCategory == cat ? AppTheme.yellow : (isDark ? Colors.white : Colors.black87),
                      ),
                    ),
                    trailing: _selectedCategory == cat
                        ? const Icon(Icons.check, color: AppTheme.yellow)
                        : null,
                    onTap: () {
                      setState(() => _selectedCategory = cat);
                      Navigator.pop(ctx);
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildSearchResultsView(bool isDark, ThemeData theme) {
    final query = _searchQuery.toLowerCase();
    final projects = ref.watch(projectsProvider).value ?? [];
    final clients = ref.watch(clientsProvider).value ?? [];
    final tasks = ref.watch(tasksProvider).value ?? [];
    final invoices = ref.watch(invoicesProvider).value ?? [];

    final matchedProjects = projects.where((p) {
      if (_selectedCategory != 'All' && _selectedCategory != 'Projects') return false;
      if (query.isEmpty) return true;
      final name = (p['name'] ?? '').toString().toLowerCase();
      final client = (p['client']?['name'] ?? '').toString().toLowerCase();
      final status = (p['status'] ?? '').toString().toLowerCase();
      return name.contains(query) || client.contains(query) || status.contains(query);
    }).toList();

    final matchedClients = clients.where((c) {
      if (_selectedCategory != 'All' && _selectedCategory != 'Clients') return false;
      if (query.isEmpty) return true;
      final name = c.name.toLowerCase();
      final type = (c.clientType ?? '').toLowerCase();
      final email = (c.email ?? '').toLowerCase();
      return name.contains(query) || type.contains(query) || email.contains(query);
    }).toList();

    final matchedTasks = tasks.where((t) {
      if (_selectedCategory != 'All' && _selectedCategory != 'Tasks') return false;
      if (query.isEmpty) return true;
      final title = (t['title'] ?? '').toString().toLowerCase();
      final desc = (t['description'] ?? '').toString().toLowerCase();
      final status = (t['status'] ?? '').toString().toLowerCase();
      return title.contains(query) || desc.contains(query) || status.contains(query);
    }).toList();

    final matchedInvoices = invoices.where((inv) {
      if (_selectedCategory != 'All' && _selectedCategory != 'Invoices') return false;
      if (query.isEmpty) return true;
      final num = (inv.invoiceRef ?? 'Invoice').toLowerCase();
      final client = (inv.client?.name ?? '').toLowerCase();
      final status = inv.status.toLowerCase();
      return num.contains(query) || client.contains(query) || status.contains(query);
    }).toList();

    final quickActions = [
      {'title': 'Create Project', 'icon': Icons.add_to_photos_outlined, 'action': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateProjectScreen()))},
      {'title': 'Create Task', 'icon': Icons.add_task_outlined, 'action': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateTaskScreen()))},
      {'title': 'Create Invoice', 'icon': Icons.receipt_long_outlined, 'action': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateInvoiceScreen()))},
      {'title': 'Add Client', 'icon': Icons.person_add_outlined, 'action': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateEditClientScreen()))},
      {'title': 'View Schedule', 'icon': Icons.calendar_today_outlined, 'action': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ScheduleScreen()))},
      {'title': 'Open Channels', 'icon': Icons.chat_bubble_outline, 'action': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ChannelsScreen()))},
      {'title': 'App Settings', 'icon': Icons.settings_outlined, 'action': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SettingsScreen()))},
    ].where((qa) {
      if (_selectedCategory != 'All') return false;
      if (query.isEmpty) return true;
      return (qa['title'] as String).toLowerCase().contains(query);
    }).toList();

    final totalCount = matchedProjects.length + matchedClients.length + matchedTasks.length + matchedInvoices.length + quickActions.length;
    final categories = ['All', 'Projects', 'Clients', 'Tasks', 'Invoices'];

    return Column(
      children: [
        // Category Filter Chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Row(
            children: categories.map((cat) {
              final isSelected = _selectedCategory == cat;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(cat),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      _selectedCategory = cat;
                    });
                  },
                  selectedColor: AppTheme.yellow,
                  backgroundColor: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.black : (isDark ? Colors.white70 : Colors.black87),
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    fontSize: 12,
                  ),
                  side: BorderSide(
                    color: isSelected ? AppTheme.yellow : (isDark ? Colors.white12 : Colors.grey.shade300),
                  ),
                ),
              );
            }).toList(),
          ),
        ),

        // Results
        Expanded(
          child: totalCount == 0
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.search_off, size: 48, color: Colors.grey.shade400),
                        const SizedBox(height: 12),
                        Text(
                          'No results found',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black87),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'No items matched "$_searchQuery".',
                          style: TextStyle(fontSize: 13, color: Colors.grey.shade500),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () {
                            _searchController.clear();
                            setState(() {
                              _searchQuery = '';
                              _selectedCategory = 'All';
                            });
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.yellow,
                            foregroundColor: Colors.black,
                          ),
                          child: const Text('Clear Search'),
                        ),
                      ],
                    ),
                  ),
                )
              : ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  children: [
                    if (quickActions.isNotEmpty) ...[
                      _buildSearchSectionHeader('Quick Actions', quickActions.length, isDark),
                      const SizedBox(height: 8),
                      ...quickActions.map((qa) => Card(
                            color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                            margin: const EdgeInsets.only(bottom: 8),
                            child: ListTile(
                              tileColor: Colors.transparent,
                              leading: CircleAvatar(
                                radius: 16,
                                backgroundColor: AppTheme.yellow.withOpacity(0.15),
                                child: Icon(qa['icon'] as IconData, size: 18, color: AppTheme.yellow),
                              ),
                              title: Text(qa['title'] as String, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                              trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                              onTap: qa['action'] as VoidCallback,
                            ),
                          )),
                      const SizedBox(height: 12),
                    ],

                    if (matchedProjects.isNotEmpty) ...[
                      _buildSearchSectionHeader('Projects', matchedProjects.length, isDark),
                      const SizedBox(height: 8),
                      ...matchedProjects.map((p) => Card(
                            color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                            margin: const EdgeInsets.only(bottom: 8),
                            child: ListTile(
                              tileColor: Colors.transparent,
                              leading: const CircleAvatar(
                                radius: 16,
                                backgroundColor: Color(0xFFE0F2FE),
                                child: Icon(Icons.folder_open, size: 18, color: Color(0xFF0284C7)),
                              ),
                              title: Text(p['name'] ?? 'Untitled Project', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                              subtitle: Text(p['client']?['name'] ?? p['status'] ?? '', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                              trailing: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppTheme.yellow.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  (p['status'] ?? '').toString().replaceAll('_', ' '),
                                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.yellow),
                                ),
                              ),
                              onTap: () {
                                showModalBottomSheet(
                                  context: context,
                                  isScrollControlled: true,
                                  backgroundColor: Colors.transparent,
                                  builder: (_) => ProjectQuickPanel(project: p),
                                );
                              },
                            ),
                          )),
                      const SizedBox(height: 12),
                    ],

                    if (matchedClients.isNotEmpty) ...[
                      _buildSearchSectionHeader('Clients', matchedClients.length, isDark),
                      const SizedBox(height: 8),
                      ...matchedClients.map((c) => Card(
                            color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                            margin: const EdgeInsets.only(bottom: 8),
                            child: ListTile(
                              tileColor: Colors.transparent,
                              leading: CircleAvatar(
                                radius: 16,
                                backgroundColor: Colors.purple.shade50,
                                child: Text(
                                  c.name.isNotEmpty ? c.name[0].toUpperCase() : 'C',
                                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.purple.shade700),
                                ),
                              ),
                              title: Text(c.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                              subtitle: Text(c.email ?? c.clientType ?? '', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                              trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => ClientDetailsScreen(client: c)),
                                );
                              },
                            ),
                          )),
                      const SizedBox(height: 12),
                    ],

                    if (matchedTasks.isNotEmpty) ...[
                      _buildSearchSectionHeader('Tasks', matchedTasks.length, isDark),
                      const SizedBox(height: 8),
                      ...matchedTasks.map((t) => Card(
                            color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                            margin: const EdgeInsets.only(bottom: 8),
                            child: ListTile(
                              tileColor: Colors.transparent,
                              leading: const CircleAvatar(
                                radius: 16,
                                backgroundColor: Color(0xFFFEF3C7),
                                child: Icon(Icons.check_circle_outline, size: 18, color: Color(0xFFD97706)),
                              ),
                              title: Text(t['title'] ?? 'Untitled Task', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                              subtitle: Text(t['status'] ?? '', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                              trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => const TasksScreen()),
                                );
                              },
                            ),
                          )),
                      const SizedBox(height: 12),
                    ],

                    if (matchedInvoices.isNotEmpty) ...[
                      _buildSearchSectionHeader('Invoices', matchedInvoices.length, isDark),
                      const SizedBox(height: 8),
                      ...matchedInvoices.map((inv) {
                        final invTotal = inv.items.fold<double>(0.0, (sum, it) => sum + it.amount);
                        return Card(
                            color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                            margin: const EdgeInsets.only(bottom: 8),
                            child: ListTile(
                              tileColor: Colors.transparent,
                              leading: const CircleAvatar(
                                radius: 16,
                                backgroundColor: Color(0xFFDCFCE7),
                                child: Icon(Icons.receipt_long, size: 18, color: Color(0xFF16A34A)),
                              ),
                              title: Text(inv.invoiceRef ?? 'Invoice', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                              subtitle: Text(inv.client?.name ?? '', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                              trailing: Text(
                                '₦${invTotal.toStringAsFixed(0)}',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => InvoicePreviewScreen(invoice: inv)),
                                );
                              },
                            ),
                          );
                      }),
                    ],
                  ],
                ),
        ),
      ],
    );
  }

  Widget _buildSearchSectionHeader(String title, int count, bool isDark) {
    return Row(
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white70 : Colors.grey.shade800,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(width: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
          decoration: BoxDecoration(
            color: isDark ? Colors.white10 : Colors.grey.shade200,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            '$count',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isDark ? Colors.white70 : Colors.grey.shade700),
          ),
        ),
      ],
    );
  }
}

class DonutChartPainter extends CustomPainter {
  final Map<String, dynamic> data;
  
  DonutChartPainter(this.data);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 8;
    
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 16
      ..strokeCap = StrokeCap.round;

    final draft = (data['draftProjects'] as num?)?.toInt() ?? 0;
    final ongoing = (data['ongoingProjects'] as num?)?.toInt() ?? 0;
    final awaiting = (data['awaitingPaymentProjects'] as num?)?.toInt() ?? 0;
    final completed = (data['totalClosed'] as num?)?.toInt() ?? 0;
    
    final total = draft + ongoing + awaiting + completed;
    
    if (total == 0) {
      paint.color = Colors.grey.withOpacity(0.2);
      canvas.drawCircle(center, radius, paint);
      return;
    }

    final gap = 0.2;
    final activeSegments = [draft, ongoing, awaiting, completed].where((c) => c > 0).length;
    final totalGaps = activeSegments > 1 ? activeSegments * gap : 0;
    final availableAngle = (2 * math.pi) - totalGaps;
    
    double startAngle = -math.pi / 2;

    void drawSegment(int count, Color color) {
      if (count > 0) {
        paint.color = color;
        final sweepAngle = (count / total) * availableAngle;
        canvas.drawArc(
          Rect.fromCircle(center: center, radius: radius),
          startAngle, sweepAngle, false, paint,
        );
        startAngle += sweepAngle + gap;
      }
    }

    drawSegment(draft, const Color(0xFFFF6B6B));
    drawSegment(ongoing, const Color(0xFFFFD93D));
    drawSegment(awaiting, const Color(0xFF6BCB77));
    drawSegment(completed, const Color(0xFF4D96FF));
  }

  @override
  bool shouldRepaint(covariant DonutChartPainter oldDelegate) => true;
}
