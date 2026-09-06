import 'package:flutter/material.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../auth/presentation/login_screen.dart';
import '../../shell/presentation/app_shell.dart';

class AnimatedSplashScreen extends ConsumerStatefulWidget {
  const AnimatedSplashScreen({super.key});

  @override
  ConsumerState<AnimatedSplashScreen> createState() =>
      _AnimatedSplashScreenState();
}

class _AnimatedSplashScreenState extends ConsumerState<AnimatedSplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _collapseController;
  late Animation<double> _heightFactorAnimation;
  late Animation<double> _fadeAnimation;

  bool _isNavigating = false;

  @override
  void initState() {
    super.initState();

    // Remove the native splash screen immediately since we render our own.
    FlutterNativeSplash.remove();

    _collapseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    // Animates from 1.0 (full height) to 0.0 (collapsed)
    _heightFactorAnimation = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(
        parent: _collapseController,
        curve: Curves.easeInOutCubic,
      ),
    );

    // Fades out the content before the collapse finishes
    _fadeAnimation = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(
        parent: _collapseController,
        curve: const Interval(0.0, 0.4, curve: Curves.easeOut),
      ),
    );

    _collapseController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _checkAuthAndNavigate();
      }
    });
  }

  void _onContinuePressed() {
    if (_isNavigating) return;
    setState(() {
      _isNavigating = true;
    });
    _collapseController.forward();
  }

  void _checkAuthAndNavigate() {
    final authState = ref.read(authCheckProvider);
    // If auth state is still loading, wait. We'll listen for changes below.
    if (!authState.isLoading) {
      final isAuthenticated = authState.hasValue
          ? (authState.value ?? false)
          : false;

      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) =>
              isAuthenticated ? const AppShell() : const LoginScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
          transitionDuration: const Duration(milliseconds: 400),
        ),
      );
    }
  }

  @override
  void dispose() {
    _collapseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // If the animation finished but auth was still loading, listen for when auth completes to navigate.
    ref.listen(authCheckProvider, (previous, next) {
      if (!next.isLoading && _collapseController.isCompleted) {
        _checkAuthAndNavigate();
      }
    });

    final screenHeight = MediaQuery.of(context).size.height;
    final topSectionHeight = screenHeight * 0.55;

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: AnimatedBuilder(
        animation: _collapseController,
        builder: (context, child) {
          return Stack(
            children: [
              // Top Dark Green Section
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: ClipPath(
                  clipper: BottomCurveClipper(),
                  child: Container(
                    height: topSectionHeight * _heightFactorAnimation.value,
                    color: const Color(0xFFFFC107),
                    // Add a subtle starry or noisy background if desired
                  ),
                ),
              ),

              // Content (Fades out when continue is pressed)
              FadeTransition(
                opacity: _fadeAnimation,
                child: IgnorePointer(
                  ignoring: _isNavigating,
                  child: SizedBox(
                    width: double.infinity,
                    height: double.infinity,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Centered Logo overlapping the curve
                        Positioned(
                          top: topSectionHeight - 50,
                          child: Container(
                            width: 100,
                            height: 100,
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E1E1E),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.05),
                                  blurRadius: 20,
                                  offset: const Offset(0, 10),
                                ),
                              ],
                            ),
                            child: Image.asset(
                              'assets/images/icon.png',
                              fit: BoxFit.contain,
                            ),
                          ),
                        ),

                        // Text Content
                        Positioned(
                          top: topSectionHeight + 80,
                          child: Column(
                            children: [
                              Image.asset(
                                'assets/images/logo.png',
                                width: 120,
                                fit: BoxFit.contain,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'A platform built for a new way of working',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.white70,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Continue Button
                        Positioned(
                          bottom: 50,
                          child: GestureDetector(
                            onTap: _onContinuePressed,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                                vertical: 16,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(
                                  0xFFFFC107,
                                ), // Yellow from palette
                                borderRadius: BorderRadius.circular(30),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(
                                      0xFFFFC107,
                                    ).withOpacity(0.3),
                                    blurRadius: 15,
                                    offset: const Offset(0, 5),
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: const [
                                  Text(
                                    'Continue',
                                    style: TextStyle(
                                      color: Colors.black87,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  SizedBox(width: 8),
                                  Icon(
                                    Icons.arrow_forward_ios,
                                    size: 14,
                                    color: Colors.black87,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

// Custom clipper for the deep curved bottom edge
class BottomCurveClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.lineTo(0, size.height - 80);

    // Create a bezier curve for the deep bottom roundness
    path.quadraticBezierTo(
      size.width / 2,
      size.height + 40,
      size.width,
      size.height - 80,
    );

    path.lineTo(size.width, 0);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => true;
}
