import 'dart:ui';
import 'package:flutter/material.dart';
import '../../overview/presentation/overview_screen.dart';
import '../../projects/presentation/projects_screen.dart';
import '../../settings/presentation/settings_screen.dart';
import '../../channels/presentation/channels_screen.dart';
import '../../proposals/presentation/proposals_screen.dart';
import '../../tasks/presentation/tasks_screen.dart';
import '../../schedule/presentation/schedule_screen.dart';
import '../../team/presentation/team_screen.dart';
import '../../clients/presentation/clients_screen.dart';
import '../../invoices/presentation/invoices_screen.dart';
import '../../receipts/presentation/receipts_screen.dart';
import '../../payments/presentation/payments_screen.dart';
import '../../subscriptions/presentation/subscriptions_screen.dart';
import 'more_screen.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const OverviewScreen(),
    const ProjectsScreen(),
    const Center(child: Text('Create Action')), // FAB action screen or placeholder
    const ChannelsScreen(),
    const SettingsScreen(), // Using placeholder settings or More
  ];

  void _onItemTapped(int index) {
    if (index == 2) {
      _showCreateMenu(context);
      return;
    }
    if (index == 4) {
      _showMoreMenu(context);
      return;
    }
    setState(() {
      _selectedIndex = index;
    });
  }

  void _showMoreMenu(BuildContext context) {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Dismiss',
      barrierColor: Colors.black54,
      transitionDuration: const Duration(milliseconds: 200),
      pageBuilder: (context, animation, secondaryAnimation) {
        final List<Map<String, dynamic>> menuItems = [
          {'icon': Icons.description, 'title': 'Proposals', 'color': Colors.blueAccent, 'screen': const ProposalsScreen()},
          {'icon': Icons.task_alt, 'title': 'Tasks', 'color': Colors.redAccent, 'screen': const TasksScreen()},
          {'icon': Icons.calendar_today, 'title': 'Schedule', 'color': Colors.purpleAccent, 'screen': const ScheduleScreen()},
          {'icon': Icons.people, 'title': 'Team', 'color': Colors.orangeAccent, 'screen': const TeamScreen()},
          {'icon': Icons.business, 'title': 'Clients', 'color': Colors.pinkAccent, 'screen': const ClientsScreen()},
          {'icon': Icons.receipt_long, 'title': 'Invoices', 'color': Colors.tealAccent, 'screen': const InvoicesScreen()},
          {'icon': Icons.receipt, 'title': 'Receipts', 'color': Colors.indigoAccent, 'screen': const ReceiptsScreen()},
          {'icon': Icons.credit_card, 'title': 'Payments', 'color': Colors.deepOrangeAccent, 'screen': const PaymentsScreen()},
          {'icon': Icons.sync, 'title': 'Subscriptions', 'color': Colors.cyanAccent, 'screen': const SubscriptionsScreen()},
          {'icon': Icons.settings, 'title': 'Settings', 'color': Colors.grey, 'screen': const SettingsScreen()},
        ];

        return Align(
          alignment: Alignment.bottomLeft,
          child: Container(
            margin: const EdgeInsets.only(left: 20, right: 90, bottom: 90),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFF141414),
              borderRadius: BorderRadius.circular(32),
              border: Border.all(color: Colors.white.withOpacity(0.05)),
            ),
            child: Material(
              color: Colors.transparent,
              child: Wrap(
                spacing: 20,
                runSpacing: 24,
                alignment: WrapAlignment.center,
                children: menuItems.map((item) {
                  return GestureDetector(
                    onTap: () {
                      Navigator.pop(context); // Close the popup
                      if (item['screen'] != null) {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => item['screen'] as Widget),
                        );
                      }
                    },
                    child: SizedBox(
                      width: 72,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 64,
                            height: 64,
                            decoration: BoxDecoration(
                              color: const Color(0xFF242424),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Icon(item['icon'] as IconData, color: item['color'] as Color, size: 28),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            item['title'] as String,
                            style: const TextStyle(color: Colors.white70, fontSize: 12),
                            textAlign: TextAlign.center,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
        );
      },
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        return ScaleTransition(
          scale: CurvedAnimation(parent: animation, curve: Curves.easeOutBack),
          alignment: Alignment.bottomCenter,
          child: child,
        );
      },
    );
  }

  void _showCreateMenu(BuildContext context) {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Dismiss',
      barrierColor: Colors.black54,
      transitionDuration: const Duration(milliseconds: 200),
      pageBuilder: (context, animation, secondaryAnimation) {
        return Align(
          alignment: Alignment.bottomRight,
          child: Container(
            margin: const EdgeInsets.only(right: 20, bottom: 100),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1A1A1A),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Material(
              color: Colors.transparent,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  _buildCreateItem(context, Icons.folder_outlined, 'New Project'),
                  const SizedBox(height: 16),
                  _buildCreateItem(context, Icons.receipt_long, 'New Invoice'),
                  const SizedBox(height: 16),
                  _buildCreateItem(context, Icons.business, 'New Client'),
                  const SizedBox(height: 16),
                  _buildCreateItem(context, Icons.task_alt, 'New Task'),
                ],
              ),
            ),
          ),
        );
      },
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        return ScaleTransition(
          scale: CurvedAnimation(parent: animation, curve: Curves.easeOutBack),
          alignment: Alignment.bottomRight,
          child: child,
        );
      },
    );
  }

  Widget _buildCreateItem(BuildContext context, IconData icon, String title) {
    return GestureDetector(
      onTap: () => Navigator.pop(context),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(width: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF2A2A2A),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.white, size: 20),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF050505) : Colors.white,
      body: Stack(
        children: [
          IndexedStack(
            index: _selectedIndex,
            children: _screens,
          ),
          Positioned(
            left: 20,
            right: 20,
            bottom: MediaQuery.of(context).padding.bottom + 16,
            child: Row(
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(32),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                      child: Container(
                        height: 64,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          color: isDark ? Colors.white.withOpacity(0.04) : Colors.black.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(32),
                          border: Border.all(
                            color: isDark ? Colors.white.withOpacity(0.1) : Colors.black.withOpacity(0.1),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildNavItem(0, Icons.home_filled),
                            _buildNavItem(1, Icons.folder_outlined),
                            _buildNavItem(3, Icons.chat_bubble_outline),
                            _buildNavItem(4, Icons.grid_view_rounded),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                GestureDetector(
                  onTap: () => _onItemTapped(2),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(32),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                      child: Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          color: isDark ? Colors.white.withOpacity(0.04) : Colors.black.withOpacity(0.05),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isDark ? Colors.white.withOpacity(0.1) : Colors.black.withOpacity(0.1),
                          ),
                        ),
                        child: const Icon(Icons.add, color: Colors.white, size: 28),
                      ),
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

  Widget _buildNavItem(int index, IconData icon) {
    final isSelected = _selectedIndex == index;
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    final activeColor = const Color(0xFF6D9773); // App Green
    final inactiveColor = isDark ? Colors.white54 : Colors.black45;

    return GestureDetector(
      onTap: () => _onItemTapped(index),
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: isSelected ? activeColor.withOpacity(0.15) : Colors.transparent,
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          color: isSelected ? activeColor : inactiveColor,
          size: 24,
        ),
      ),
    );
  }
}
