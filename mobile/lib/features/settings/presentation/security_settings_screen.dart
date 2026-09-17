import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/theme/app_theme.dart';
import '../../auth/presentation/login_screen.dart';

class SecuritySettingsScreen extends StatefulWidget {
  const SecuritySettingsScreen({super.key});

  @override
  State<SecuritySettingsScreen> createState() => _SecuritySettingsScreenState();
}

class _SecuritySettingsScreenState extends State<SecuritySettingsScreen> {
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _isUpdatingPassword = false;
  bool _isLoading2fa = true;
  bool _twoFactorEnabled = false;
  String? _enrolledFactorId;

  bool _isSigningOutOthers = false;

  @override
  void initState() {
    super.initState();
    _check2FaStatus();
  }

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _check2FaStatus() async {
    setState(() => _isLoading2fa = true);
    try {
      final res = await Supabase.instance.client.auth.mfa.listFactors();
      final totpFactors = res.totp;
      final verifiedFactor = totpFactors.where((f) => f.status == FactorStatus.verified);

      if (verifiedFactor.isNotEmpty) {
        setState(() {
          _twoFactorEnabled = true;
          _enrolledFactorId = verifiedFactor.first.id;
        });
      } else {
        setState(() {
          _twoFactorEnabled = false;
          _enrolledFactorId = null;
        });
      }
    } catch (_) {
      // Fallback
    } finally {
      if (mounted) {
        setState(() => _isLoading2fa = false);
      }
    }
  }

  Future<void> _handlePasswordUpdate() async {
    final current = _currentPasswordController.text.trim();
    final newPass = _newPasswordController.text.trim();
    final confirmPass = _confirmPasswordController.text.trim();

    if (current.isEmpty) {
      _showSnackBar('Please enter your current password', isError: true);
      return;
    }
    if (newPass.length < 8) {
      _showSnackBar('New password must be at least 8 characters', isError: true);
      return;
    }
    if (newPass != confirmPass) {
      _showSnackBar('New passwords do not match', isError: true);
      return;
    }

    final user = Supabase.instance.client.auth.currentUser;
    if (user?.email == null) {
      _showSnackBar('User not authenticated', isError: true);
      return;
    }

    setState(() => _isUpdatingPassword = true);

    try {
      // Verify current password first
      await Supabase.instance.client.auth.signInWithPassword(
        email: user!.email!,
        password: current,
      );

      // Update password
      await Supabase.instance.client.auth.updateUser(
        UserAttributes(password: newPass),
      );

      _currentPasswordController.clear();
      _newPasswordController.clear();
      _confirmPasswordController.clear();

      _showSnackBar('Password updated successfully');
    } on AuthException catch (e) {
      _showSnackBar(e.message, isError: true);
    } catch (e) {
      _showSnackBar('Failed to update password: $e', isError: true);
    } finally {
      if (mounted) {
        setState(() => _isUpdatingPassword = false);
      }
    }
  }

  Future<void> _toggle2FA(bool value) async {
    if (value) {
      await _enroll2FA();
    } else {
      await _disable2FA();
    }
  }

  Future<void> _enroll2FA() async {
    try {
      final enrollRes = await Supabase.instance.client.auth.mfa.enroll(
        factorType: FactorType.totp,
        friendlyName: 'Faibah Mobile Authenticator',
      );

      final secret = enrollRes.totp?.secret ?? '';

      if (!mounted) return;

      final otpController = TextEditingController();
      bool isVerifying = false;
      final isDark = context.isDark;
      final surfaceColor = context.surfaceColor;
      final textPrimary = context.textPrimary;
      final textSecondary = context.textSecondary;
      final borderColor = context.borderColor;
      final surface02Color = context.surface02Color;

      await showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: surfaceColor,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        builder: (ctx) {
          return StatefulBuilder(
            builder: (context, setSheetState) {
              return Padding(
                padding: EdgeInsets.only(
                  left: 24,
                  right: 24,
                  top: 24,
                  bottom: MediaQuery.of(context).viewInsets.bottom + 24,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Set up Authenticator',
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
                      'Copy this secret key into your authenticator app (e.g. Google Authenticator, Authy):',
                      style: TextStyle(color: textSecondary, fontSize: 14),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: surface02Color,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: borderColor),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: SelectableText(
                              secret,
                              style: const TextStyle(
                                fontFamily: 'monospace',
                                color: AppTheme.yellow,
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.copy, size: 20, color: AppTheme.yellow),
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: secret));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Secret copied to clipboard')),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Enter the 6-digit code from your app:',
                      style: TextStyle(color: textPrimary, fontSize: 14, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: otpController,
                      keyboardType: TextInputType.number,
                      maxLength: 6,
                      style: TextStyle(color: textPrimary, letterSpacing: 6, fontSize: 18),
                      decoration: InputDecoration(
                        hintText: '000000',
                        hintStyle: TextStyle(color: textSecondary.withValues(alpha: 0.5)),
                        filled: true,
                        fillColor: surface02Color,
                        counterText: '',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: isVerifying
                            ? null
                            : () async {
                                final code = otpController.text.trim();
                                if (code.length != 6) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Please enter a 6-digit code')),
                                  );
                                  return;
                                }

                                setSheetState(() => isVerifying = true);
                                try {
                                  await Supabase.instance.client.auth.mfa.challengeAndVerify(
                                    factorId: enrollRes.id,
                                    code: code,
                                  );

                                  if (context.mounted) {
                                    Navigator.pop(ctx);
                                  }

                                  setState(() {
                                    _twoFactorEnabled = true;
                                    _enrolledFactorId = enrollRes.id;
                                  });

                                  _showSnackBar('2FA enabled successfully!');
                                } catch (e) {
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('Verification failed: $e'),
                                        backgroundColor: Colors.redAccent,
                                      ),
                                    );
                                  }
                                } finally {
                                  setSheetState(() => isVerifying = false);
                                }
                              },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.yellow,
                          foregroundColor: Colors.black,
                        ),
                        child: isVerifying
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                              )
                            : const Text('Verify and Activate', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      );
    } catch (e) {
      _showSnackBar('Failed to initiate 2FA enrollment: $e', isError: true);
    }
  }

  Future<void> _disable2FA() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: context.surfaceColor,
        title: Text('Disable 2FA', style: TextStyle(color: context.textPrimary)),
        content: Text(
          'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
          style: TextStyle(color: context.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel', style: TextStyle(color: context.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Disable', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      if (_enrolledFactorId != null) {
        await Supabase.instance.client.auth.mfa.unenroll(_enrolledFactorId!);
      }
      setState(() {
        _twoFactorEnabled = false;
        _enrolledFactorId = null;
      });
      _showSnackBar('Two-factor authentication disabled');
    } catch (e) {
      _showSnackBar('Failed to disable 2FA: $e', isError: true);
    }
  }

  Future<void> _signOutOtherSessions() async {
    setState(() => _isSigningOutOthers = true);
    try {
      await Supabase.instance.client.auth.signOut(scope: SignOutScope.others);
      _showSnackBar('All other sessions signed out successfully');
    } catch (e) {
      _showSnackBar('Failed to sign out other sessions: $e', isError: true);
    } finally {
      if (mounted) {
        setState(() => _isSigningOutOthers = false);
      }
    }
  }

  Future<void> _signOutCurrentDevice() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: context.surfaceColor,
        title: Text('Sign Out', style: TextStyle(color: context.textPrimary)),
        content: Text('Are you sure you want to sign out of this device?', style: TextStyle(color: context.textSecondary)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel', style: TextStyle(color: context.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Sign Out', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      await Supabase.instance.client.auth.signOut(scope: SignOutScope.local);
      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
          (_) => false,
        );
      }
    } catch (e) {
      _showSnackBar('Failed to sign out: $e', isError: true);
    }
  }

  void _showSnackBar(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.redAccent : AppTheme.primaryGreen,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final deviceName = Platform.isIOS
        ? 'iPhone (This Device)'
        : Platform.isAndroid
            ? 'Android Phone (This Device)'
            : 'Mobile App (This Device)';

    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.backgroundColor,
        elevation: 0,
        title: Text(
          'Security',
          style: TextStyle(fontWeight: FontWeight.bold, color: context.textPrimary),
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, size: 20, color: context.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        children: [
          _buildSectionHeader('CHANGE PASSWORD'),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: context.surfaceColor,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: context.borderColor),
            ),
            child: Column(
              children: [
                _buildPasswordField(
                  controller: _currentPasswordController,
                  labelText: 'Current Password',
                ),
                const SizedBox(height: 14),
                _buildPasswordField(
                  controller: _newPasswordController,
                  labelText: 'New Password',
                ),
                const SizedBox(height: 14),
                _buildPasswordField(
                  controller: _confirmPasswordController,
                  labelText: 'Confirm New Password',
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _isUpdatingPassword ? null : _handlePasswordUpdate,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.yellow,
                      foregroundColor: Colors.black,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: _isUpdatingPassword
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.black,
                            ),
                          )
                        : const Text(
                            'Update Password',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),

          _buildSectionHeader('TWO-FACTOR AUTHENTICATION'),
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: context.borderColor),
            ),
            child: Material(
              color: context.surfaceColor,
              borderRadius: BorderRadius.circular(16),
              clipBehavior: Clip.antiAlias,
              child: _isLoading2fa
                  ? const Padding(
                      padding: EdgeInsets.all(24),
                      child: Center(
                        child: CircularProgressIndicator(color: AppTheme.yellow, strokeWidth: 2.5),
                      ),
                    )
                  : SwitchListTile(
                      activeThumbColor: AppTheme.yellow,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                      title: Text(
                        'Enable 2FA',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: context.textPrimary,
                          fontSize: 15,
                        ),
                      ),
                      subtitle: Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          _twoFactorEnabled
                              ? 'Two-factor authentication is active on your account'
                              : 'Add an extra layer of security to your account',
                          style: TextStyle(
                            color: context.textSecondary,
                            fontSize: 13,
                          ),
                        ),
                      ),
                      value: _twoFactorEnabled,
                      onChanged: (val) => _toggle2FA(val),
                    ),
            ),
          ),
          const SizedBox(height: 28),

          _buildSectionHeader('ACTIVE SESSIONS'),
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: context.borderColor),
            ),
            child: Material(
              color: context.surfaceColor,
              borderRadius: BorderRadius.circular(16),
              clipBehavior: Clip.antiAlias,
              child: Column(
                children: [
                  // Current device
                  ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
                    leading: const Icon(Icons.phone_iphone, color: AppTheme.yellow, size: 28),
                    title: Row(
                      children: [
                        Text(
                          deviceName,
                          style: TextStyle(fontWeight: FontWeight.bold, color: context.textPrimary, fontSize: 14),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryGreen.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'Active',
                            style: TextStyle(color: AppTheme.primaryGreen, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        'Signed in • Current session',
                        style: TextStyle(color: context.textSecondary, fontSize: 12),
                      ),
                    ),
                    trailing: TextButton(
                      onPressed: _signOutCurrentDevice,
                      style: TextButton.styleFrom(foregroundColor: Colors.redAccent),
                      child: const Text('Sign Out'),
                    ),
                  ),
                  Divider(height: 1, color: context.borderColor),
                  // Other devices/sessions
                  ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
                    leading: Icon(Icons.devices, color: context.textSecondary, size: 28),
                    title: Text(
                      'All Other Sessions',
                      style: TextStyle(fontWeight: FontWeight.bold, color: context.textPrimary, fontSize: 14),
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        'Web browsers and other mobile logins',
                        style: TextStyle(color: context.textSecondary, fontSize: 12),
                      ),
                    ),
                    trailing: _isSigningOutOthers
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.yellow),
                          )
                        : TextButton(
                            onPressed: _signOutOtherSessions,
                            style: TextButton.styleFrom(foregroundColor: AppTheme.yellow),
                            child: const Text('Sign Out All'),
                          ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10, left: 4),
      child: Text(
        title,
        style: TextStyle(
          color: context.textSecondary,
          fontWeight: FontWeight.bold,
          fontSize: 12,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildPasswordField({
    required TextEditingController controller,
    required String labelText,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: true,
      style: TextStyle(color: context.textPrimary, fontSize: 15),
      decoration: InputDecoration(
        labelText: labelText,
        labelStyle: TextStyle(color: context.textSecondary, fontSize: 14),
        prefixIcon: Icon(Icons.lock_outline, color: context.textSecondary, size: 20),
        filled: true,
        fillColor: context.inputFillColor,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: context.borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.yellow, width: 1.5),
        ),
      ),
    );
  }
}
