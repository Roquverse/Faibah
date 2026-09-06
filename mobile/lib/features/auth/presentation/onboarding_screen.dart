import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../shell/presentation/app_shell.dart';
import 'auth_controller.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentStep = 0;
  final int _totalSteps = 6;

  // Form State
  String _userType = 'professional';
  String _businessName = '';
  String _phone = '';
  String? _workType;

  String _billingModel = 'fixed';
  String _hourlyRate = '';
  bool _requireDeposit = false;
  String _depositPercent = '50';

  String _teamSize = 'solo';
  bool _assignRoles = false;

  bool _multipleMilestones = false;
  bool _itemizeMaterials = false;

  String _currency = 'NGN';
  bool _taxRegistered = false;
  String _taxRate = '7.5';

  String _commPreference = 'both';

  String _clientName = '';
  String _clientEmail = '';
  String _clientPhone = '';
  String _projectTitle = '';

  void _nextStep() {
    if (_currentStep < _totalSteps - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      setState(() {
        _currentStep++;
      });
    } else {
      _submit();
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      setState(() {
        _currentStep--;
      });
    }
  }

  Future<void> _submit() async {
    final payload = {
      'userType': _userType,
      'businessName': _businessName,
      'phone': _phone,
      'workType': _workType,
      'billingModel': _billingModel,
      'hourlyRate': _hourlyRate,
      'requireDeposit': _requireDeposit,
      'depositPercent': _depositPercent,
      'teamSize': _teamSize,
      'assignRoles': _assignRoles,
      'multipleMilestones': _multipleMilestones,
      'itemizeMaterials': _itemizeMaterials,
      'currency': _currency,
      'taxRegistered': _taxRegistered,
      'taxRate': _taxRate,
      'commPreference': _commPreference,
      'clientName': _clientName,
      'clientEmail': _clientEmail,
      'clientPhone': _clientPhone,
      'projectTitle': _projectTitle,
      'planTier': _workType == 'agency'
          ? 'agency'
          : (_workType == 'contractor' ? 'contractor' : 'solo'),
    };

    final success = await ref
        .read(authStateProvider.notifier)
        .submitOnboarding(payload);

    if (success && mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const AppShell()),
        (route) => false,
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to save onboarding data')),
      );
    }
  }

  Widget _buildStep1() {
    return _StepContainer(
      title: 'Welcome to Faibah',
      subtitle: 'How will you be using Faibah?',
      content: Column(
        children: [
          _SelectCard(
            title: "I'm a Professional/Business",
            subtitle: "I want to manage projects, send invoices, and get paid.",
            icon: Icons.business_center,
            isSelected: _userType == 'professional',
            onTap: () => setState(() => _userType = 'professional'),
          ),
          const SizedBox(height: 16),
          _SelectCard(
            title: "I'm a Client",
            subtitle: "I want to track projects and pay invoices.",
            icon: Icons.person,
            isSelected: _userType == 'client',
            onTap: () => setState(() => _userType = 'client'),
          ),
        ],
      ),
    );
  }

  Widget _buildStep2() {
    return _StepContainer(
      title: 'Tell us about your business',
      subtitle: 'This information will appear on your invoices.',
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _TextField(
            label: 'Business Name / Full Name',
            onChanged: (val) => _businessName = val,
            icon: Icons.business,
          ),
          const SizedBox(height: 16),
          _TextField(
            label: 'Phone Number',
            onChanged: (val) => _phone = val,
            icon: Icons.phone,
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: 24),
          Text(
            'What type of professional are you?',
            style: Theme.of(context).textTheme.titleSmall,
          ),
          const SizedBox(height: 12),
          _SelectCard(
            title: 'Freelancer / Independent',
            icon: Icons.person_outline,
            isSelected: _workType == 'freelancer',
            onTap: () => setState(() => _workType = 'freelancer'),
          ),
          const SizedBox(height: 12),
          _SelectCard(
            title: 'Agency / Studio',
            icon: Icons.group,
            isSelected: _workType == 'agency',
            onTap: () => setState(() => _workType = 'agency'),
          ),
          const SizedBox(height: 12),
          _SelectCard(
            title: 'Contractor / Builder',
            icon: Icons.build,
            isSelected: _workType == 'contractor',
            onTap: () => setState(() => _workType = 'contractor'),
          ),
        ],
      ),
    );
  }

  Widget _buildStep3() {
    if (_workType == 'freelancer') {
      return _StepContainer(
        title: 'Freelance Details',
        subtitle: 'Set your standard billing practices.',
        content: Column(
          children: [
            _SelectCard(
              title: 'Fixed Price',
              icon: Icons.attach_money,
              isSelected: _billingModel == 'fixed',
              onTap: () => setState(() => _billingModel = 'fixed'),
            ),
            const SizedBox(height: 12),
            _SelectCard(
              title: 'Hourly',
              icon: Icons.timer,
              isSelected: _billingModel == 'hourly',
              onTap: () => setState(() => _billingModel = 'hourly'),
            ),
            if (_billingModel == 'hourly') ...[
              const SizedBox(height: 16),
              _TextField(
                label: 'Standard Hourly Rate',
                onChanged: (val) => _hourlyRate = val,
                keyboardType: TextInputType.number,
                icon: Icons.money,
              ),
            ],
            const SizedBox(height: 24),
            SwitchListTile(
              title: const Text('Require Deposit?'),
              value: _requireDeposit,
              onChanged: (val) => setState(() => _requireDeposit = val),
              activeColor: const Color(0xFFFFC107),
            ),
            if (_requireDeposit)
              _TextField(
                label: 'Deposit Percentage',
                onChanged: (val) => _depositPercent = val,
                keyboardType: TextInputType.number,
                icon: Icons.percent,
              ),
          ],
        ),
      );
    } else if (_workType == 'agency') {
      return _StepContainer(
        title: 'Agency Details',
        subtitle: 'Tell us about your team size.',
        content: Column(
          children: [
            _SelectCard(
              title: 'Solo (Just me for now)',
              icon: Icons.person,
              isSelected: _teamSize == 'solo',
              onTap: () => setState(() => _teamSize = 'solo'),
            ),
            const SizedBox(height: 12),
            _SelectCard(
              title: '2-5 people',
              icon: Icons.group,
              isSelected: _teamSize == '2-5',
              onTap: () => setState(() => _teamSize = '2-5'),
            ),
            const SizedBox(height: 12),
            _SelectCard(
              title: '6+ people',
              icon: Icons.groups,
              isSelected: _teamSize == '6+',
              onTap: () => setState(() => _teamSize = '6+'),
            ),
            const SizedBox(height: 24),
            SwitchListTile(
              title: const Text('Assign Roles to members?'),
              value: _assignRoles,
              onChanged: (val) => setState(() => _assignRoles = val),
              activeColor: const Color(0xFFFFC107),
            ),
          ],
        ),
      );
    } else {
      return _StepContainer(
        title: 'Contractor Details',
        subtitle: 'How do you handle materials and milestones?',
        content: Column(
          children: [
            SwitchListTile(
              title: const Text('Multiple Milestones per project?'),
              value: _multipleMilestones,
              onChanged: (val) => setState(() => _multipleMilestones = val),
              activeColor: const Color(0xFFFFC107),
            ),
            SwitchListTile(
              title: const Text('Itemize Materials separately?'),
              value: _itemizeMaterials,
              onChanged: (val) => setState(() => _itemizeMaterials = val),
              activeColor: const Color(0xFFFFC107),
            ),
          ],
        ),
      );
    }
  }

  Widget _buildStep4() {
    return _StepContainer(
      title: 'Money Details',
      subtitle: 'Set up your default currency and tax options.',
      content: Column(
        children: [
          _SelectCard(
            title: 'Nigerian Naira (NGN)',
            icon: Icons.money,
            isSelected: _currency == 'NGN',
            onTap: () => setState(() => _currency = 'NGN'),
          ),
          const SizedBox(height: 12),
          _SelectCard(
            title: 'US Dollar (USD)',
            icon: Icons.attach_money,
            isSelected: _currency == 'USD',
            onTap: () => setState(() => _currency = 'USD'),
          ),
          const SizedBox(height: 24),
          SwitchListTile(
            title: const Text('Tax Registered? (VAT/GST)'),
            value: _taxRegistered,
            onChanged: (val) => setState(() => _taxRegistered = val),
            activeColor: const Color(0xFFFFC107),
          ),
          if (_taxRegistered)
            _TextField(
              label: 'Tax Rate (%)',
              onChanged: (val) => _taxRate = val,
              keyboardType: TextInputType.number,
              icon: Icons.percent,
            ),
        ],
      ),
    );
  }

  Widget _buildStep5() {
    return _StepContainer(
      title: 'Communication',
      subtitle: 'How do you prefer to notify your clients?',
      content: Column(
        children: [
          _SelectCard(
            title: 'WhatsApp Only',
            icon: Icons.message,
            isSelected: _commPreference == 'whatsapp',
            onTap: () => setState(() => _commPreference = 'whatsapp'),
          ),
          const SizedBox(height: 12),
          _SelectCard(
            title: 'Email Only',
            icon: Icons.email,
            isSelected: _commPreference == 'email',
            onTap: () => setState(() => _commPreference = 'email'),
          ),
          const SizedBox(height: 12),
          _SelectCard(
            title: 'Both (WhatsApp & Email)',
            icon: Icons.mark_chat_read,
            isSelected: _commPreference == 'both',
            onTap: () => setState(() => _commPreference = 'both'),
          ),
        ],
      ),
    );
  }

  Widget _buildStep6() {
    return _StepContainer(
      title: 'Quick Start',
      subtitle: 'Let\'s set up your first client.',
      content: Column(
        children: [
          _TextField(
            label: 'Client Name',
            onChanged: (val) => _clientName = val,
            icon: Icons.person,
          ),
          const SizedBox(height: 16),
          _TextField(
            label: 'Client Email',
            onChanged: (val) => _clientEmail = val,
            keyboardType: TextInputType.emailAddress,
            icon: Icons.email,
          ),
          const SizedBox(height: 16),
          _TextField(
            label: 'Client Phone',
            onChanged: (val) => _clientPhone = val,
            keyboardType: TextInputType.phone,
            icon: Icons.phone,
          ),
          const SizedBox(height: 16),
          _TextField(
            label: 'Project Title',
            onChanged: (val) => _projectTitle = val,
            icon: Icons.work,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final isLoading = authState.isLoading;
    final theme = Theme.of(context);
    final progress = (_currentStep + 1) / _totalSteps;

    return Scaffold(
      appBar: AppBar(
        leading: _currentStep > 0
            ? IconButton(
                icon: const Icon(Icons.arrow_back_ios),
                onPressed: _prevStep,
              )
            : null,
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: theme.colorScheme.onSurface),
        title: LinearProgressIndicator(
          value: progress,
          backgroundColor: theme.colorScheme.onSurface.withOpacity(0.1),
          valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFFFC107)),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _buildStep1(),
                  _buildStep2(),
                  _buildStep3(),
                  _buildStep4(),
                  _buildStep5(),
                  _buildStep6(),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: isLoading ? null : _nextStep,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFFC107),
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: isLoading && _currentStep == _totalSteps - 1
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            color: Colors.black,
                            strokeWidth: 2,
                          ),
                        )
                      : Text(
                          _currentStep == _totalSteps - 1
                              ? 'Complete Setup'
                              : 'Continue',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
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
}

class _StepContainer extends StatelessWidget {
  final String title;
  final String subtitle;
  final Widget content;

  const _StepContainer({
    required this.title,
    required this.subtitle,
    required this.content,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            title,
            style: Theme.of(
              context,
            ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            subtitle,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: Colors.grey),
          ),
          const SizedBox(height: 32),
          content,
        ],
      ),
    );
  }
}

class _SelectCard extends StatelessWidget {
  final String title;
  final String? subtitle;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _SelectCard({
    required this.title,
    this.subtitle,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = isSelected
        ? const Color(0xFFFFC107)
        : theme.colorScheme.onSurface.withOpacity(0.1);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: color, width: isSelected ? 2 : 1),
          borderRadius: BorderRadius.circular(12),
          color: isSelected
              ? const Color(0xFFFFC107).withOpacity(0.05)
              : Colors.transparent,
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected
                  ? const Color(0xFFFFB300)
                  : theme.colorScheme.onSurface.withOpacity(0.5),
              size: 28,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      subtitle!,
                      style: TextStyle(
                        color: theme.colorScheme.onSurface.withOpacity(0.5),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle, color: Color(0xFFFFC107)),
          ],
        ),
      ),
    );
  }
}

class _TextField extends StatelessWidget {
  final String label;
  final ValueChanged<String> onChanged;
  final TextInputType? keyboardType;
  final IconData? icon;

  const _TextField({
    required this.label,
    required this.onChanged,
    this.keyboardType,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
        ),
        const SizedBox(height: 8),
        TextField(
          onChanged: onChanged,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            prefixIcon: icon != null ? Icon(icon, color: Colors.grey) : null,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFFFC107), width: 2),
            ),
          ),
        ),
      ],
    );
  }
}
