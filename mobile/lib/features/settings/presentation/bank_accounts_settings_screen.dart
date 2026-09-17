import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/providers/dio_provider.dart';
import '../../invoices/data/providers/company_profile_provider.dart';

class BankAccountsSettingsScreen extends ConsumerStatefulWidget {
  const BankAccountsSettingsScreen({super.key});

  @override
  ConsumerState<BankAccountsSettingsScreen> createState() =>
      _BankAccountsSettingsScreenState();
}

class _BankAccountsSettingsScreenState
    extends ConsumerState<BankAccountsSettingsScreen> {
  bool _isSaving = false;

  void _showAddOrEditBankModal(BuildContext context, CompanyProfile? profile) {
    final bankNameController =
        TextEditingController(text: profile?.bankName ?? '');
    final accountNameController =
        TextEditingController(text: profile?.accountName ?? '');
    final accountNumberController =
        TextEditingController(text: profile?.accountNumber ?? '');
    final routingNumberController =
        TextEditingController(text: profile?.routingNumber ?? '');
    final swiftCodeController =
        TextEditingController(text: profile?.swiftCode ?? '');

    final formKey = GlobalKey<FormState>();
    final surfaceColor = context.surfaceColor;
    final textPrimary = context.textPrimary;
    final textSecondary = context.textSecondary;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 24,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: Form(
                key: formKey,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            profile?.bankName != null &&
                                    profile!.bankName!.isNotEmpty
                                ? 'Edit Bank Account'
                                : 'Add Bank Account',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: textPrimary,
                            ),
                          ),
                          IconButton(
                            icon: Icon(Icons.close, color: textSecondary),
                            onPressed: () => Navigator.pop(ctx),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Clients will use these details to pay you via direct bank transfer.',
                        style: TextStyle(
                          fontSize: 13,
                          color: textSecondary,
                        ),
                      ),
                      const SizedBox(height: 20),
                      _buildModalField(
                        controller: bankNameController,
                        label: 'Bank Name',
                        icon: Icons.account_balance,
                        hint: 'e.g. Chase, Access Bank, GTBank',
                        validator: (val) => val == null || val.trim().isEmpty
                            ? 'Please enter bank name'
                            : null,
                      ),
                      const SizedBox(height: 14),
                      _buildModalField(
                        controller: accountNameController,
                        label: 'Account Name',
                        icon: Icons.person_outline,
                        hint: 'e.g. Acme Studio LLC',
                        validator: (val) => val == null || val.trim().isEmpty
                            ? 'Please enter account holder name'
                            : null,
                      ),
                      const SizedBox(height: 14),
                      _buildModalField(
                        controller: accountNumberController,
                        label: 'Account Number',
                        icon: Icons.numbers,
                        hint: 'e.g. 0123456789',
                        keyboardType: TextInputType.number,
                        validator: (val) => val == null || val.trim().isEmpty
                            ? 'Please enter account number'
                            : null,
                      ),
                      const SizedBox(height: 14),
                      _buildModalField(
                        controller: routingNumberController,
                        label: 'Routing / Sort Code (Optional)',
                        icon: Icons.alt_route,
                        hint: 'e.g. 09100001',
                      ),
                      const SizedBox(height: 14),
                      _buildModalField(
                        controller: swiftCodeController,
                        label: 'SWIFT / BIC Code (Optional)',
                        icon: Icons.public,
                        hint: 'e.g. CHASUS33',
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: _isSaving
                              ? null
                              : () async {
                                  if (!formKey.currentState!.validate()) return;
                                  setModalState(() => _isSaving = true);
                                  setState(() => _isSaving = true);

                                  try {
                                    final dioClient =
                                        ref.read(dioClientProvider);
                                    await dioClient.dio.patch(
                                      '/company/profile',
                                      data: {
                                        'bankName':
                                            bankNameController.text.trim(),
                                        'accountName':
                                            accountNameController.text.trim(),
                                        'accountNumber':
                                            accountNumberController.text.trim(),
                                        'routingNumber':
                                            routingNumberController.text.trim(),
                                        'swiftCode':
                                            swiftCodeController.text.trim(),
                                      },
                                    );

                                    ref.invalidate(companyProfileProvider);

                                    if (context.mounted) {
                                      Navigator.pop(ctx);
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(
                                        const SnackBar(
                                          content: Text(
                                              'Bank account details saved successfully'),
                                          backgroundColor:
                                              AppTheme.primaryGreen,
                                        ),
                                      );
                                    }
                                  } catch (e) {
                                    if (context.mounted) {
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(
                                        SnackBar(
                                          content: Text(
                                              'Failed to save bank details: $e'),
                                          backgroundColor: Colors.redAccent,
                                        ),
                                      );
                                    }
                                  } finally {
                                    if (mounted) {
                                      setState(() => _isSaving = false);
                                    }
                                  }
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.yellow,
                            foregroundColor: Colors.black,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: _isSaving
                              ? const SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.5,
                                    color: Colors.black,
                                  ),
                                )
                              : const Text(
                                  'Save Bank Account',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _removeBankAccount() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.darkSurface01,
        title: const Text('Remove Bank Account',
            style: TextStyle(color: Colors.white)),
        content: const Text(
          'Are you sure you want to remove your payout bank account? Invoices will no longer display direct bank payment information.',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Remove', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      final dioClient = ref.read(dioClientProvider);
      await dioClient.dio.patch(
        '/company/profile',
        data: {
          'bankName': null,
          'accountName': null,
          'accountNumber': null,
          'routingNumber': null,
          'swiftCode': null,
        },
      );

      ref.invalidate(companyProfileProvider);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Bank account removed'),
            backgroundColor: AppTheme.primaryGreen,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to remove bank account: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  Widget _buildModalField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    String? hint,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      validator: validator,
      style: TextStyle(color: context.textPrimary, fontSize: 15),
      decoration: InputDecoration(
        labelText: label,
        labelStyle:
            TextStyle(color: context.textSecondary, fontSize: 14),
        hintText: hint,
        hintStyle:
            TextStyle(color: context.textSecondary.withValues(alpha: 0.5), fontSize: 13),
        prefixIcon: Icon(icon,
            color: context.textSecondary, size: 20),
        filled: true,
        fillColor: context.inputFillColor,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: context.borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.yellow, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.redAccent),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.redAccent, width: 1.5),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(companyProfileProvider);

    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.backgroundColor,
        elevation: 0,
        title: Text(
          'Bank Accounts',
          style: TextStyle(fontWeight: FontWeight.bold, color: context.textPrimary),
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new,
              size: 20, color: context.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: profileAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppTheme.yellow),
        ),
        error: (err, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Error loading bank details: $err',
                  style: TextStyle(color: context.textSecondary)),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => ref.invalidate(companyProfileProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (profile) {
          final hasBank = profile.bankName != null &&
              profile.bankName!.trim().isNotEmpty &&
              profile.accountNumber != null &&
              profile.accountNumber!.trim().isNotEmpty;

          return ListView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            children: [
              if (hasBank) ...[
                _buildBankAccountCard(profile),
                const SizedBox(height: 24),
                OutlinedButton.icon(
                  onPressed: () => _showAddOrEditBankModal(context, profile),
                  icon: const Icon(Icons.edit_outlined,
                      color: AppTheme.yellow, size: 20),
                  label: const Text('Edit Bank Details',
                      style: TextStyle(
                          color: AppTheme.yellow,
                          fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppTheme.yellow),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ] else ...[
                _buildEmptyBankState(profile),
              ],
            ],
          );
        },
      ),
    );
  }

  Widget _buildBankAccountCard(CompanyProfile profile) {
    final accNum = profile.accountNumber ?? '';
    final maskedNumber = accNum.length > 4
        ? '•••• •••• ${accNum.substring(accNum.length - 4)}'
        : accNum;

    return Container(
      decoration: BoxDecoration(
        gradient: context.isDark
            ? const LinearGradient(
                colors: [Color(0xFF1F1F1F), Color(0xFF141414)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : const LinearGradient(
                colors: [Color(0xFF2B2D42), Color(0xFF1A1C29)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppTheme.yellow.withValues(alpha: 0.35),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: context.isDark ? 0.4 : 0.15),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: const EdgeInsets.all(22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppTheme.yellow.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.account_balance,
                      color: AppTheme.yellow,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        profile.bankName ?? 'Bank',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryGreen.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'Primary Payout Account',
                          style: TextStyle(
                            color: AppTheme.primaryGreen,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert, color: Colors.white70),
                color: context.surface02Color,
                onSelected: (val) {
                  if (val == 'edit') {
                    _showAddOrEditBankModal(context, profile);
                  } else if (val == 'copy') {
                    Clipboard.setData(ClipboardData(text: accNum));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content: Text('Account number copied to clipboard')),
                    );
                  } else if (val == 'remove') {
                    _removeBankAccount();
                  }
                },
                itemBuilder: (ctx) => [
                  PopupMenuItem(
                    value: 'edit',
                    child: Row(
                      children: [
                        Icon(Icons.edit, size: 18, color: context.textSecondary),
                        const SizedBox(width: 8),
                        Text('Edit Details',
                            style: TextStyle(color: context.textPrimary)),
                      ],
                    ),
                  ),
                  PopupMenuItem(
                    value: 'copy',
                    child: Row(
                      children: [
                        Icon(Icons.copy, size: 18, color: context.textSecondary),
                        const SizedBox(width: 8),
                        Text('Copy Account Number',
                            style: TextStyle(color: context.textPrimary)),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'remove',
                    child: Row(
                      children: [
                        Icon(Icons.delete_outline,
                            size: 18, color: Colors.redAccent),
                        SizedBox(width: 8),
                        Text('Remove Account',
                            style: TextStyle(color: Colors.redAccent)),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 28),
          Text(
            'ACCOUNT NUMBER',
            style: TextStyle(
              fontSize: 11,
              letterSpacing: 1.2,
              fontWeight: FontWeight.w600,
              color: Colors.white.withValues(alpha: 0.5),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            maskedNumber,
            style: const TextStyle(
              fontSize: 20,
              letterSpacing: 2,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'ACCOUNT HOLDER',
                    style: TextStyle(
                      fontSize: 10,
                      letterSpacing: 1,
                      color: Colors.white.withValues(alpha: 0.5),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    profile.accountName ?? profile.name,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              if (profile.routingNumber != null &&
                  profile.routingNumber!.isNotEmpty)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'ROUTING / SORT',
                      style: TextStyle(
                        fontSize: 10,
                        letterSpacing: 1,
                        color: Colors.white.withValues(alpha: 0.5),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      profile.routingNumber!,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyBankState(CompanyProfile profile) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: context.surface02Color,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.account_balance_outlined,
              size: 48,
              color: AppTheme.yellow,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'No Payout Account Configured',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: context.textPrimary,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Add your company bank details so clients can make direct payments to your account when viewing invoices.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: context.textSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 28),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton.icon(
              onPressed: () => _showAddOrEditBankModal(context, profile),
              icon: const Icon(Icons.add, color: Colors.black),
              label: const Text(
                'Add Bank Account',
                style: TextStyle(
                  color: Colors.black,
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.yellow,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
