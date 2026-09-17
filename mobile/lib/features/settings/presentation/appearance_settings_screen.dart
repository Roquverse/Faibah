import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/theme_provider.dart';

class AppearanceSettingsScreen extends ConsumerWidget {
  const AppearanceSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentThemeMode = ref.watch(themeModeProvider);

    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.backgroundColor,
        elevation: 0,
        title: Text(
          'Appearance',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: context.textPrimary,
          ),
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new,
              size: 20, color: context.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        children: [
          Text(
            'THEME PREFERENCE',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
              color: context.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Choose how Faibah looks on your device. You can select Light, Dark, or sync with your system settings.',
            style: TextStyle(
              fontSize: 13,
              color: context.textSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 24),

          // Visual Mode Cards
          _buildThemeCard(
            context: context,
            title: 'Light Mode',
            subtitle: 'Crisp, high-contrast clean look for bright environments',
            icon: Icons.light_mode_outlined,
            isSelected: currentThemeMode == ThemeMode.light,
            previewBgColor: const Color(0xFFF8F9FA),
            previewCardColor: Colors.white,
            previewTextColor: const Color(0xFF111827),
            onTap: () {
              ref.read(themeModeProvider.notifier).setTheme(ThemeMode.light);
            },
          ),
          const SizedBox(height: 16),

          _buildThemeCard(
            context: context,
            title: 'Dark Mode',
            subtitle: 'Sleek dark aesthetics designed for low-light comfort',
            icon: Icons.dark_mode_outlined,
            isSelected: currentThemeMode == ThemeMode.dark,
            previewBgColor: const Color(0xFF121212),
            previewCardColor: const Color(0xFF1E1E1E),
            previewTextColor: Colors.white,
            onTap: () {
              ref.read(themeModeProvider.notifier).setTheme(ThemeMode.dark);
            },
          ),
          const SizedBox(height: 16),

          _buildThemeCard(
            context: context,
            title: 'System Default',
            subtitle: 'Automatically match your device\'s system display settings',
            icon: Icons.brightness_auto_outlined,
            isSelected: currentThemeMode == ThemeMode.system,
            previewBgColor: context.isDark
                ? const Color(0xFF121212)
                : const Color(0xFFF8F9FA),
            previewCardColor: context.isDark
                ? const Color(0xFF1E1E1E)
                : Colors.white,
            previewTextColor: context.textPrimary,
            onTap: () {
              ref.read(themeModeProvider.notifier).setTheme(ThemeMode.system);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildThemeCard({
    required BuildContext context,
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isSelected,
    required Color previewBgColor,
    required Color previewCardColor,
    required Color previewTextColor,
    required VoidCallback onTap,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isSelected
              ? AppTheme.yellow
              : context.borderColor,
          width: isSelected ? 2 : 1,
        ),
        boxShadow: [
          if (isSelected)
            BoxShadow(
              color: AppTheme.yellow.withValues(alpha: 0.15),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
        ],
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Row(
            children: [
              // Mini theme illustration preview
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: previewBgColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Colors.grey.withValues(alpha: 0.2),
                  ),
                ),
                child: Center(
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: previewCardColor,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          blurRadius: 4,
                        ),
                      ],
                    ),
                    child: Icon(icon, size: 18, color: AppTheme.yellow),
                  ),
                ),
              ),
              const SizedBox(width: 16),

              // Title and description
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: context.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        color: context.textSecondary,
                        height: 1.3,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),

              // Selection checkmark or radio
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isSelected ? AppTheme.yellow : Colors.transparent,
                  border: Border.all(
                    color: isSelected
                        ? AppTheme.yellow
                        : context.textSecondary.withValues(alpha: 0.4),
                    width: 2,
                  ),
                ),
                child: isSelected
                    ? const Icon(Icons.check, size: 16, color: Colors.black)
                    : null,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
