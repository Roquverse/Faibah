import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../channels/presentation/chat_screen.dart';
import '../../../tasks/presentation/tasks_screen.dart';
import '../../../invoices/presentation/invoices_screen.dart';
import '../../../proposals/presentation/create_proposal_screen.dart';

class ProjectQuickPanel extends StatelessWidget {
  final Map<String, dynamic> project;

  const ProjectQuickPanel({super.key, required this.project});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final sheetBg = isDark ? const Color(0xFF141414) : Colors.white;
    final cardBg = isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF9FAFB);
    final cardBorder = isDark ? Colors.white10 : const Color(0xFFE5E7EB);
    final textPrimary = isDark ? Colors.white : const Color(0xFF111827);
    final textSecondary = isDark ? Colors.white60 : const Color(0xFF6B7280);
    final textMuted = isDark ? Colors.white38 : const Color(0xFF9CA3AF);

    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: BoxDecoration(
        color: sheetBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Drag handle
          const SizedBox(height: 16),
          Center(
            child: Container(
              width: 48,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? Colors.white24 : Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              children: [
                // Header
                Text(
                  project['name'] ?? project['title'] ?? 'Unnamed Project',
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        (project['client'] is Map ? project['client']['name'] : project['client']) ?? 'No Client',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryGreen.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        project['status'] ?? 'Active',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: AppTheme.primaryGreen,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),

                // Quick Actions
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: _buildActionItem(context, isDark, Icons.chat_bubble_outline, 'Open Channel', () {
                        Navigator.pop(context);
                        Navigator.push(context, MaterialPageRoute(builder: (_) => ChatScreen(channelId: project['id'] ?? 'placeholder', channelName: project['name'] ?? 'Channel')));
                      }),
                    ),
                    Expanded(
                      child: _buildActionItem(context, isDark, Icons.add_task_outlined, 'New Task', () {
                        Navigator.pop(context);
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const TasksScreen()));
                      }),
                    ),
                    Expanded(
                      child: _buildActionItem(context, isDark, Icons.person_add_outlined, 'Collaborator', () {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Collaborator screen coming soon')));
                      }),
                    ),
                    Expanded(
                      child: _buildActionItem(context, isDark, Icons.description_outlined, 'New Proposal', () {
                        Navigator.pop(context);
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateProposalScreen()));
                      }),
                    ),
                    Expanded(
                      child: _buildActionItem(context, isDark, Icons.receipt_long_outlined, 'New Invoice', () {
                        Navigator.pop(context);
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const InvoicesScreen()));
                      }),
                    ),
                  ],
                ),
                const SizedBox(height: 32),

                // AT A GLANCE
                Text(
                  'AT A GLANCE',
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: textSecondary,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: cardBg,
                          border: Border.all(color: cardBorder),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Task Completion',
                              style: theme.textTheme.bodySmall?.copyWith(color: textSecondary),
                            ),
                            const SizedBox(height: 8),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  '${project['progressPercent'] ?? project['progress'] ?? 0}%',
                                  style: theme.textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: textPrimary,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '(0/0)',
                                  style: theme.textTheme.bodySmall?.copyWith(color: textSecondary),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            LinearProgressIndicator(
                              value: ((project['progressPercent'] ?? project['progress'] ?? 0) as num) / 100,
                              backgroundColor: isDark ? Colors.white10 : const Color(0xFFE5E7EB),
                              valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primaryGreen),
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: cardBg,
                          border: Border.all(color: cardBorder),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildMiniRow(theme, isDark, 'Quotation:', 'Accepted'),
                            const SizedBox(height: 8),
                            _buildMiniRow(theme, isDark, 'Latest Invoice:', 'DRAFT', highlight: true),
                            const SizedBox(height: 8),
                            _buildMiniRow(theme, isDark, 'Created:', '24/08/2026'),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),

                // UPCOMING SCHEDULE
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'UPCOMING SCHEDULE',
                      style: theme.textTheme.labelMedium?.copyWith(
                        color: textSecondary,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                    Text(
                      'View Full Schedule >',
                      style: theme.textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryGreen,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: cardBg,
                    border: Border.all(color: cardBorder),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    'No upcoming schedule events for this project.',
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: textMuted,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // FINANCIALS
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'FINANCIALS',
                      style: theme.textTheme.labelMedium?.copyWith(
                        color: textSecondary,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                    Text(
                      'View All Invoices >',
                      style: theme.textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryGreen,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: _buildFinancialCard(theme, isDark, 'INVOICED', project['budget']?.toString() ?? '₦0')),
                    const SizedBox(width: 8),
                    Expanded(child: _buildFinancialCard(theme, isDark, 'OUTSTANDING', project['budget']?.toString() ?? '₦0', borderColor: Colors.orange.withOpacity(0.4))),
                    const SizedBox(width: 8),
                    Expanded(child: _buildFinancialCard(theme, isDark, 'PAID', '₦0', borderColor: const Color(0xFF10B981).withOpacity(0.4))),
                  ],
                ),
                const SizedBox(height: 16),
                _buildInvoiceItem(theme, isDark, 'Invoice #aec8ff6a', '₦61,275', 'DRAFT'),
                const SizedBox(height: 8),
                _buildInvoiceItem(theme, isDark, 'Invoice #be66a633', '₦806,250', 'DRAFT'),
                
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isDark ? AppTheme.primaryGreen : const Color(0xFF111827),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text('View Full Project'),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionItem(BuildContext context, bool isDark, IconData icon, String label, VoidCallback onTap) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.all(4.0),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF3F4F6),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? Colors.white10 : const Color(0xFFE5E7EB),
                ),
              ),
              child: Icon(
                icon,
                color: isDark ? Colors.white : const Color(0xFF111827),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              maxLines: 2,
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
                fontSize: 11,
                color: isDark ? Colors.white70 : const Color(0xFF374151),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniRow(ThemeData theme, bool isDark, String label, String value, {bool highlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: isDark ? Colors.white60 : const Color(0xFF6B7280),
          ),
        ),
        Text(
          value,
          style: theme.textTheme.bodySmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: highlight
                ? const Color(0xFF10B981)
                : (isDark ? Colors.white : const Color(0xFF111827)),
          ),
        ),
      ],
    );
  }

  Widget _buildFinancialCard(ThemeData theme, bool isDark, String label, String value, {Color? borderColor}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF9FAFB),
        border: Border.all(
          color: borderColor ?? (isDark ? Colors.white10 : const Color(0xFFE5E7EB)),
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: isDark ? Colors.white54 : const Color(0xFF6B7280),
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : const Color(0xFF111827),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInvoiceItem(ThemeData theme, bool isDark, String title, String amount, String status) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF9FAFB),
        border: Border.all(
          color: isDark ? Colors.white10 : const Color(0xFFE5E7EB),
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(
            Icons.receipt_long_outlined,
            color: isDark ? Colors.white60 : const Color(0xFF6B7280),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : const Color(0xFF111827),
                  ),
                ),
                Text(
                  amount,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: isDark ? Colors.white54 : const Color(0xFF6B7280),
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.orange.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text(
              'DRAFT',
              style: TextStyle(
                color: Colors.orange,
                fontWeight: FontWeight.bold,
                fontSize: 11,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
