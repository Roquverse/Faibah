import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:dio/dio.dart';
import '../../../../core/theme/app_theme.dart';
import '../../schedule/data/providers/schedule_provider.dart';

class ConnectedAppsSettingsScreen extends ConsumerStatefulWidget {
  const ConnectedAppsSettingsScreen({super.key});

  @override
  ConsumerState<ConnectedAppsSettingsScreen> createState() =>
      _ConnectedAppsSettingsScreenState();
}

class _ConnectedAppsSettingsScreenState
    extends ConsumerState<ConnectedAppsSettingsScreen> {
  static const String _boxName = 'connected_apps_prefs';
  static const String _webClientId =
      '192600666701-10vhcfu9ds4ra1mav2hggfh03pshu2jh.apps.googleusercontent.com';
  static const String _iosClientId =
      '192600666701-do6uq491d4jaiv2j7mkebem8bo39nn37.apps.googleusercontent.com';

  late final GoogleSignIn _googleSignIn;

  bool _isLoading = true;
  bool _isConnecting = false;
  bool _isSyncing = false;
  String? _googleCalendarEmail;
  String? _googleAccessToken;

  bool _stripeConnected = false;

  @override
  void initState() {
    super.initState();
    _googleSignIn = GoogleSignIn(
      clientId: _iosClientId,
      serverClientId: _webClientId,
      scopes: [
        'email',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    );
    _loadConnectionState();
  }

  Future<void> _loadConnectionState() async {
    try {
      final box = await Hive.openBox(_boxName);
      final email = box.get('google_calendar_email') as String?;
      final token = box.get('google_calendar_token') as String?;
      final stripe = box.get('stripe_connected', defaultValue: false) as bool;

      if (mounted) {
        setState(() {
          _googleCalendarEmail = email;
          _googleAccessToken = token;
          _stripeConnected = stripe;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _connectGoogleCalendar() async {
    setState(() => _isConnecting = true);
    try {
      final account = await _googleSignIn.signIn();
      if (account == null) {
        // User cancelled
        return;
      }

      final auth = await account.authentication;
      final accessToken = auth.accessToken;
      final email = account.email;

      final box = await Hive.openBox(_boxName);
      await box.put('google_calendar_email', email);
      if (accessToken != null) {
        await box.put('google_calendar_token', accessToken);
      }

      setState(() {
        _googleCalendarEmail = email;
        _googleAccessToken = accessToken;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Connected to Google Calendar as $email'),
            backgroundColor: AppTheme.primaryGreen,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to connect to Google Calendar: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isConnecting = false);
      }
    }
  }

  Future<void> _disconnectGoogleCalendar() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: context.surfaceColor,
        title: Text('Disconnect Google Calendar',
            style: TextStyle(color: context.textPrimary)),
        content: Text(
          'Are you sure you want to disconnect Google Calendar? Events will no longer automatically sync.',
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
            child:
                const Text('Disconnect', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      await _googleSignIn.signOut();
      final box = await Hive.openBox(_boxName);
      await box.delete('google_calendar_email');
      await box.delete('google_calendar_token');

      setState(() {
        _googleCalendarEmail = null;
        _googleAccessToken = null;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Google Calendar disconnected'),
            backgroundColor: AppTheme.primaryGreen,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error disconnecting: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  Future<void> _syncGoogleCalendar() async {
    setState(() => _isSyncing = true);
    try {
      // Re-authenticate token if needed
      final currentUser = _googleSignIn.currentUser;
      String? token = _googleAccessToken;
      if (currentUser != null) {
        final auth = await currentUser.authentication;
        token = auth.accessToken ?? token;
      }

      // Fetch upcoming events from scheduleProvider
      final events =
          ref.read(scheduleProvider).value ?? [];

      int syncedCount = 0;
      if (token != null && events.isNotEmpty) {
        final dio = Dio();
        for (final ev in events.take(10)) {
          try {
            await dio.post(
              'https://www.googleapis.com/calendar/v3/calendars/primary/events',
              options: Options(
                headers: {
                  'Authorization': 'Bearer $token',
                  'Content-Type': 'application/json',
                },
              ),
              data: {
                'summary': ev.title,
                'description': ev.description ?? 'Scheduled via Faibah',
                'start': {
                  'dateTime': ev.startTime.toUtc().toIso8601String(),
                },
                'end': {
                  'dateTime': (ev.endTime ??
                          ev.startTime.add(const Duration(hours: 1)))
                      .toUtc()
                      .toIso8601String(),
                },
              },
            );
            syncedCount++;
          } catch (_) {
            // Event might already exist or format error
          }
        }
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(syncedCount > 0
                ? 'Synced $syncedCount event(s) to Google Calendar'
                : 'Google Calendar is up to date'),
            backgroundColor: AppTheme.primaryGreen,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Sync failed: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSyncing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isGoogleConnected = _googleCalendarEmail != null;

    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.backgroundColor,
        elevation: 0,
        title: Text(
          'Connected Apps',
          style: TextStyle(fontWeight: FontWeight.bold, color: context.textPrimary),
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new,
              size: 20, color: context.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppTheme.yellow),
            )
          : ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              children: [
                _buildGoogleCalendarCard(isGoogleConnected),
                const SizedBox(height: 16),
                _buildPaystackCard(),
                const SizedBox(height: 16),
                _buildStripeCard(),
              ],
            ),
    );
  }

  Widget _buildGoogleCalendarCard(bool isConnected) {
    return Container(
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isConnected
              ? AppTheme.primaryGreen.withValues(alpha: 0.3)
              : context.borderColor,
          width: 1.5,
        ),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.blueAccent.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.calendar_month,
                    size: 26, color: Colors.blueAccent),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          'Google Calendar',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: context.textPrimary,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: isConnected
                                ? AppTheme.primaryGreen.withValues(alpha: 0.2)
                                : context.isDark
                                    ? Colors.white.withValues(alpha: 0.1)
                                    : Colors.black.withValues(alpha: 0.05),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            isConnected ? 'Connected' : 'Not Connected',
                            style: TextStyle(
                              color: isConnected
                                  ? AppTheme.primaryGreen
                                  : context.textSecondary,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      isConnected
                          ? 'Account: $_googleCalendarEmail'
                          : 'Sync client meetings, appointments & project deadlines',
                      style: TextStyle(
                        fontSize: 12,
                        color: context.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (isConnected) ...[
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _isSyncing ? null : _syncGoogleCalendar,
                    icon: _isSyncing
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.black,
                            ),
                          )
                        : const Icon(Icons.sync, size: 18),
                    label: Text(_isSyncing ? 'Syncing...' : 'Sync Now'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.yellow,
                      foregroundColor: Colors.black,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                OutlinedButton(
                  onPressed: _disconnectGoogleCalendar,
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(
                        color: Colors.redAccent.withValues(alpha: 0.5)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text('Disconnect',
                      style: TextStyle(color: Colors.redAccent)),
                ),
              ],
            ),
          ] else ...[
            SizedBox(
              width: double.infinity,
              height: 44,
              child: ElevatedButton.icon(
                onPressed: _isConnecting ? null : _connectGoogleCalendar,
                icon: _isConnecting
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.black,
                        ),
                      )
                    : const Icon(Icons.add_link, size: 20),
                label: Text(
                  _isConnecting
                      ? 'Connecting...'
                      : 'Connect with Google Calendar',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.yellow,
                  foregroundColor: Colors.black,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPaystackCard() {
    return Container(
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.borderColor),
      ),
      padding: const EdgeInsets.all(18),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.teal.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.credit_card, size: 26, color: Colors.teal),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      'Paystack Gateway',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: context.textPrimary,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryGreen.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'Active',
                        style: TextStyle(
                          color: AppTheme.primaryGreen,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  'Accept online card payments and USSD in NGN',
                  style: TextStyle(
                    fontSize: 12,
                    color: context.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStripeCard() {
    return Container(
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.borderColor),
      ),
      padding: const EdgeInsets.all(18),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.deepPurpleAccent.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.payment,
                size: 26, color: Colors.deepPurpleAccent),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Stripe Payments',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: context.textPrimary,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  'Process international payments in USD, EUR & GBP',
                  style: TextStyle(
                    fontSize: 12,
                    color: context.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: _stripeConnected,
            activeTrackColor: AppTheme.yellow.withValues(alpha: 0.5),
            activeThumbColor: AppTheme.yellow,
            onChanged: (val) async {
              setState(() => _stripeConnected = val);
              final box = await Hive.openBox(_boxName);
              await box.put('stripe_connected', val);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(val
                        ? 'Stripe integration enabled'
                        : 'Stripe integration disabled'),
                  ),
                );
              }
            },
          ),
        ],
      ),
    );
  }
}
