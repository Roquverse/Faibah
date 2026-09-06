import 'package:flutter/material.dart';

class CreateProjectScreen extends StatefulWidget {
  const CreateProjectScreen({super.key});

  @override
  State<CreateProjectScreen> createState() => _CreateProjectScreenState();
}

class _CreateProjectScreenState extends State<CreateProjectScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _bodyController = TextEditingController();

  String _selectedClient = 'Arakunrin Cole';
  final List<String> _clients = ['Arakunrin Cole', 'Tizzle Studios', 'Amber'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _titleController.dispose();
    _bodyController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          TextButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.auto_awesome, size: 16),
            label: const Text('Generate with AI'),
            style: TextButton.styleFrom(
              foregroundColor: Colors.purpleAccent,
              backgroundColor: Colors.purple.withOpacity(0.1),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.send, size: 16),
            label: const Text('Send'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber,
              foregroundColor: Colors.black,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
          const SizedBox(width: 16),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: theme.colorScheme.primary,
          labelColor: theme.colorScheme.primary,
          unselectedLabelColor: theme.colorScheme.onSurface.withOpacity(0.5),
          tabs: const [
            Tab(icon: Icon(Icons.description_outlined, size: 18), text: 'Proposal'),
            Tab(icon: Icon(Icons.calculate_outlined, size: 18), text: 'Financials'),
            Tab(icon: Icon(Icons.visibility_outlined, size: 18), text: 'Preview'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildProposalTab(theme),
          _buildFinancialsTab(theme),
          _buildPreviewTab(theme),
        ],
      ),
    );
  }

  Widget _buildProposalTab(ThemeData theme) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Info
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Avatec Interactives',
                      style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'helpdesk@avatecinteractives.dev\n08035212521',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.5),
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'PROPOSAL / ESTIMATE',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.5),
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '#PRJ-092',
                    style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Client Dropdown
          Align(
            alignment: Alignment.centerRight,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: theme.colorScheme.onSurface.withOpacity(0.05),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: theme.colorScheme.onSurface.withOpacity(0.1)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedClient,
                  itemHeight: 56,
                  icon: const Icon(Icons.keyboard_arrow_down, size: 20),
                  items: _clients.map((String value) {
                    return DropdownMenuItem<String>(
                      value: value,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(value, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                          Text('Client Recipient', style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.5))),
                        ],
                      ),
                    );
                  }).toList(),
                  onChanged: (newValue) {
                    if (newValue != null) {
                      setState(() {
                        _selectedClient = newValue;
                      });
                    }
                  },
                ),
              ),
            ),
          ),
          const SizedBox(height: 48),

          // Document Title
          TextField(
            controller: _titleController,
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
            decoration: InputDecoration(
              hintText: 'Enter Proposal Title...',
              hintStyle: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface.withOpacity(0.2),
              ),
              border: InputBorder.none,
              contentPadding: EdgeInsets.zero,
            ),
          ),
          const SizedBox(height: 32),

          // Mock Rich Text Toolbar
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildToolbarDropdown(theme, 'Normal'),
                _buildToolbarDivider(theme),
                _buildToolbarDropdown(theme, 'Sans Serif'),
                _buildToolbarDivider(theme),
                _buildToolbarDropdown(theme, 'Normal'),
                _buildToolbarDivider(theme),
                _buildToolbarIcon(Icons.format_bold),
                _buildToolbarIcon(Icons.format_italic),
                _buildToolbarIcon(Icons.format_underlined),
                _buildToolbarIcon(Icons.strikethrough_s),
                _buildToolbarIcon(Icons.format_quote),
                _buildToolbarDivider(theme),
                _buildToolbarIcon(Icons.format_list_bulleted),
                _buildToolbarIcon(Icons.format_list_numbered),
                _buildToolbarIcon(Icons.format_indent_decrease),
                _buildToolbarIcon(Icons.format_indent_increase),
                _buildToolbarDivider(theme),
                _buildToolbarIcon(Icons.format_align_left),
                _buildToolbarDivider(theme),
                _buildToolbarIcon(Icons.link),
                _buildToolbarIcon(Icons.image_outlined),
                _buildToolbarIcon(Icons.format_clear),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Divider(color: theme.colorScheme.onSurface.withOpacity(0.1)),
          const SizedBox(height: 24),

          // Document Body
          TextField(
            controller: _bodyController,
            maxLines: null,
            style: theme.textTheme.bodyLarge,
            decoration: InputDecoration(
              hintText: '[Proposal Title]\n\n[Section Sub-heading]\n\n[Start typing your paragraph here...]',
              hintStyle: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.4),
              ),
              border: InputBorder.none,
              contentPadding: EdgeInsets.zero,
            ),
          ),
          const SizedBox(height: 100), // padding for scrolling
        ],
      ),
    );
  }

  Widget _buildToolbarDropdown(ThemeData theme, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0),
      child: Row(
        children: [
          Text(text, style: theme.textTheme.bodySmall),
          const SizedBox(width: 4),
          Icon(Icons.unfold_more, size: 14, color: theme.colorScheme.onSurface.withOpacity(0.5)),
        ],
      ),
    );
  }

  Widget _buildToolbarIcon(IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6.0),
      child: Icon(icon, size: 18),
    );
  }

  Widget _buildToolbarDivider(ThemeData theme) {
    return Container(
      height: 16,
      width: 1,
      margin: const EdgeInsets.symmetric(horizontal: 8),
      color: theme.colorScheme.onSurface.withOpacity(0.2),
    );
  }

  Widget _buildFinancialsTab(ThemeData theme) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildLineItemCard(theme, description: null, qty: '1', rate: '2500000', amount: '₦2,500,000.00'),
          const SizedBox(height: 24),
          _buildLineItemCard(theme, description: 'Post-Production Editing', qty: '1', rate: '750000', amount: '₦750,000.00'),
          const SizedBox(height: 24),
          
          InkWell(
            onTap: () {},
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.add, size: 16, color: theme.colorScheme.onSurface),
                  const SizedBox(width: 8),
                  Text(
                    'Add Line Item',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: theme.colorScheme.onSurface,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 48),

          Align(
            alignment: Alignment.centerRight,
            child: SizedBox(
              width: MediaQuery.of(context).size.width * 0.6,
              child: Column(
                children: [
                  _buildSummaryRow(theme, 'Subtotal', '₦3,750,000.00'),
                  const SizedBox(height: 16),
                  _buildSummaryRow(theme, 'Tax', '₦281,250.00', inputLabel: '7.5', inputSuffix: '%'),
                  const SizedBox(height: 16),
                  Divider(color: theme.colorScheme.onSurface, thickness: 2),
                  const SizedBox(height: 16),
                  _buildSummaryRow(theme, 'TOTAL', '₦4,031,250.00', isTotal: true),
                  const SizedBox(height: 24),
                  _buildSummaryRow(theme, 'Upfront\nDeposit', '₦2,015,625.00', inputLabel: '50', inputSuffix: '%', highlightLabel: true),
                ],
              ),
            ),
          ),
          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(ThemeData theme, String label, String amount, {String? inputLabel, String? inputSuffix, bool isTotal = false, bool highlightLabel = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: highlightLabel ? Colors.green : theme.colorScheme.onSurface.withOpacity(isTotal ? 1 : 0.6),
                fontWeight: isTotal || highlightLabel ? FontWeight.bold : FontWeight.normal,
              ),
            ),
            if (inputLabel != null) ...[
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: highlightLabel ? Colors.green.withOpacity(0.1) : theme.colorScheme.onSurface.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(inputLabel, style: theme.textTheme.bodySmall?.copyWith(color: highlightLabel ? Colors.green : theme.colorScheme.onSurface)),
                    const SizedBox(width: 8),
                    Text(inputSuffix ?? '', style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.5))),
                  ],
                ),
              ),
            ],
          ],
        ),
        Text(
          amount,
          style: isTotal 
              ? theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)
              : theme.textTheme.bodyMedium?.copyWith(fontWeight: highlightLabel ? FontWeight.bold : FontWeight.normal, color: highlightLabel ? Colors.green : null),
        ),
      ],
    );
  }

  Widget _buildLineItemCard(ThemeData theme, {String? description, required String qty, required String rate, required String amount}) {
    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.onSurface.withOpacity(0.02),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.colorScheme.onSurface.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (description != null) ...[
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('DESCRIPTION', style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.4), letterSpacing: 1.2)),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.onSurface.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(description, style: theme.textTheme.bodyMedium),
                  ),
                ],
              ),
            ),
          ],
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  flex: 1,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('QTY', style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.4), letterSpacing: 1.2)),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.onSurface.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(qty, style: theme.textTheme.bodyMedium),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 2,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('RATE (₦)', style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.4), letterSpacing: 1.2)),
                      const SizedBox(height: 8),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.onSurface.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(rate, style: theme.textTheme.bodyMedium),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 24),
                Expanded(
                  flex: 2,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('AMOUNT', style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.4), letterSpacing: 1.2)),
                      const SizedBox(height: 12),
                      Text(amount, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: theme.colorScheme.onSurface.withOpacity(0.1)),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.onSurface.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text('Recurring Subscription', style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold, color: theme.colorScheme.onSurface.withOpacity(0.7))),
                  ],
                ),
                Icon(Icons.delete_outline, size: 20, color: theme.colorScheme.onSurface.withOpacity(0.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPreviewTab(ThemeData theme) {
    // We enforce light mode colors for the document preview
    const textColor = Color(0xFF1A1D21);
    const mutedColor = Color(0xFF6B7280);
    const dividerColor = Color(0xFFE5E7EB);
    
    // Check if the current theme is dark to set the outer background
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      color: isDark ? const Color(0xFF121212) : Colors.grey.shade50,
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(4), // A4 paper usually has sharp edges, a tiny border radius looks neat
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header Info
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Avatec Interactives',
                              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold, color: textColor),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'helpdesk@avatecinteractives.dev\n08035212521',
                              style: theme.textTheme.labelSmall?.copyWith(color: mutedColor),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            'PROPOSAL / ESTIMATE',
                            style: theme.textTheme.labelSmall?.copyWith(color: mutedColor, letterSpacing: 1.2, fontWeight: FontWeight.bold, fontSize: 8),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '#PRJ-092',
                            style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold, color: textColor),
                          ),
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.grey.shade50,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.grey.shade200),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text('Arakunrin Cole', style: theme.textTheme.labelMedium?.copyWith(fontWeight: FontWeight.bold, color: textColor)),
                                Text('Client Recipient', style: theme.textTheme.labelSmall?.copyWith(color: mutedColor, fontSize: 10)),
                              ],
                            ),
                          )
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 40),
                  const Divider(color: dividerColor),
                  const SizedBox(height: 40),
                  
                  Text('Untitled Proposal', style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold, color: textColor)),
                  const SizedBox(height: 32),
                  Text('[Proposal Title]\n\n[Section Sub-heading]\n\n[Start typing your paragraph here...]', style: theme.textTheme.bodyMedium?.copyWith(color: mutedColor)),
                  const SizedBox(height: 48),
                  
                  const Divider(color: dividerColor),
                  const SizedBox(height: 40),
                  
                  Text('Investment', style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold, color: textColor)),
                  const SizedBox(height: 24),
                  
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('DESCRIPTION', style: theme.textTheme.labelSmall?.copyWith(color: mutedColor, letterSpacing: 1.2, fontWeight: FontWeight.bold, fontSize: 10)),
                      Text('AMOUNT', style: theme.textTheme.labelSmall?.copyWith(color: mutedColor, letterSpacing: 1.2, fontWeight: FontWeight.bold, fontSize: 10)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(height: 1, color: dividerColor),
                  const SizedBox(height: 16),
                  
                  _buildPreviewLineItem(theme, 'Concept Development', '₦500k', textColor),
                  const Divider(color: dividerColor),
                  _buildPreviewLineItem(theme, '2-Day On-Site Photography', '₦2.5m', textColor),
                  const Divider(color: dividerColor),
                  _buildPreviewLineItem(theme, 'Post-Production Editing', '₦750k', textColor),
                  const SizedBox(height: 40),

                Align(
                  alignment: Alignment.centerRight,
                  child: SizedBox(
                    width: MediaQuery.of(context).size.width * 0.65,
                    child: Column(
                      children: [
                        _buildPreviewSummaryRow(theme, 'Subtotal', '₦3,750,000.00', mutedColor, textColor),
                        const SizedBox(height: 16),
                        _buildPreviewSummaryRow(theme, 'Tax (7.5%)', '₦281,250.00', mutedColor, textColor),
                        const SizedBox(height: 16),
                        Container(height: 2, color: textColor),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('TOTAL', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold, color: textColor, letterSpacing: 1.2)),
                            Expanded(child: Align(alignment: Alignment.centerRight, child: FittedBox(fit: BoxFit.scaleDown, child: Text('₦4,031,250.00', style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold, color: textColor))))),
                          ],
                        ),
                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(child: Text('Required Deposit (50%)', style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold, color: Colors.green.shade700))),
                            Text('₦2,015,625.00', style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold, color: Colors.green.shade700)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 64),
                Align(
                  alignment: Alignment.centerRight,
                  child: ElevatedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.check_circle_outline, size: 18),
                    label: const Text('Accept Proposal'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.amber,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 100),
        ],
      ),
    ));
  }

  Widget _buildPreviewLineItem(ThemeData theme, String desc, String amount, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(child: Text(desc, style: theme.textTheme.bodyMedium?.copyWith(color: color))),
          const SizedBox(width: 16),
          Text(amount, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }

  Widget _buildPreviewSummaryRow(ThemeData theme, String label, String amount, Color labelColor, Color amountColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: theme.textTheme.bodyMedium?.copyWith(color: labelColor)),
        Text(amount, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold, color: amountColor)),
      ],
    );
  }
}
