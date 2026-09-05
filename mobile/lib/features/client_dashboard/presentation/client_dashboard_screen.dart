import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../overview/presentation/overview_screen.dart'; 
import '../../projects/presentation/projects_screen.dart'; 
import '../../channels/presentation/channels_screen.dart';
import '../../shell/presentation/more_screen.dart';
import '../../proposals/presentation/proposal_room_screen.dart';
import '../../payments/presentation/paystack_service.dart';

class ClientDashboardScreen extends StatefulWidget {
  const ClientDashboardScreen({super.key});

  @override
  State<ClientDashboardScreen> createState() => _ClientDashboardScreenState();
}

class _ClientDashboardScreenState extends State<ClientDashboardScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const ClientOverviewTab(),
    const ProjectsScreen(), 
    const ChannelsScreen(),
    const MoreScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.folder_outlined),
            activeIcon: Icon(Icons.folder),
            label: 'Projects',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat_bubble_outline),
            activeIcon: Icon(Icons.chat_bubble),
            label: 'Messages',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.menu),
            activeIcon: Icon(Icons.menu),
            label: 'More',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: theme.colorScheme.primary,
        unselectedItemColor: theme.colorScheme.onSurface.withOpacity(0.5),
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
        onTap: _onItemTapped,
      ),
    );
  }
}

class ClientOverviewTab extends ConsumerWidget {
  const ClientOverviewTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Welcome back, Client!',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          _buildActionCard(
            theme, 
            title: 'Review Proposal', 
            subtitle: 'Website Redesign', 
            action: 'View Proposal', 
            icon: Icons.assignment_outlined,
            onTap: () {
               Navigator.push(
                 context, 
                 MaterialPageRoute(builder: (_) => const ProposalRoomScreen(proposalId: '1'))
               );
            }
          ),
          const SizedBox(height: 16),
          _buildActionCard(
            theme, 
            title: 'Unpaid Invoice', 
            subtitle: 'INV-004 - ₦800,000', 
            action: 'Pay Now', 
            icon: Icons.receipt_long,
            color: theme.colorScheme.error,
            onTap: () async {
               final paystack = ref.read(paystackServiceProvider);
               // Initialize just in time for demo purposes
               await paystack.initialize();
               
               if (context.mounted) {
                 final response = await paystack.chargeCard(
                   context: context,
                   amount: 80000000, // in kobo (₦800,000)
                   email: 'client@example.com',
                   reference: 'INV-004-${DateTime.now().millisecondsSinceEpoch}',
                 );

                 if (response != null && response.status == true) {
                   ScaffoldMessenger.of(context).showSnackBar(
                     const SnackBar(content: Text('Payment Successful!'))
                   );
                 }
               }
            }
          ),
          const SizedBox(height: 24),
          Text(
            'Active Projects',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          // Simplified project card
          Card(
            child: ListTile(
              leading: Icon(Icons.web, color: theme.colorScheme.primary),
              title: const Text('Website Redesign'),
              subtitle: const Text('In Progress - 65%'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {},
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard(ThemeData theme, {
    required String title,
    required String subtitle,
    required String action,
    required IconData icon,
    Color? color,
    required VoidCallback onTap,
  }) {
    final cardColor = color ?? theme.colorScheme.primary;
    return Card(
      color: cardColor.withOpacity(0.1),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: cardColor.withOpacity(0.3)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: cardColor),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: cardColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onTap,
                style: ElevatedButton.styleFrom(
                  backgroundColor: cardColor,
                  foregroundColor: theme.colorScheme.surface,
                ),
                child: Text(action),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
