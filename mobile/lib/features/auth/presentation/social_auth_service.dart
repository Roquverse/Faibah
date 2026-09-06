import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import '../data/auth_repository.dart';

final socialAuthServiceProvider = Provider<SocialAuthService>((ref) {
  final authRepo = ref.watch(authRepositoryProvider);
  return SocialAuthService(authRepo);
});

class SocialAuthService {
  final AuthRepository _authRepository;

  SocialAuthService(this._authRepository);

  Future<bool> signInWithGoogle() async {
    try {
      /// TODO: Replace with your actual Web Client ID from Google Cloud Console.
      const webClientId = '192600666701-10vhcfu9ds4ra1mav2hggfh03pshu2jh.apps.googleusercontent.com';
      
      /// TODO: Replace with your actual iOS Client ID from Google Cloud Console.
      /// It should look something like: 192600666701-a1b2c3d4e5f6g7h8i9j0.apps.googleusercontent.com
      const iosClientId = '192600666701-do6uq491d4jaiv2j7mkebem8bo39nn37.apps.googleusercontent.com';
      
      final GoogleSignIn googleSignIn = GoogleSignIn(
        clientId: iosClientId,
        serverClientId: webClientId,
      );
      
      final googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        return false; // User canceled the sign-in
      }
      
      final googleAuth = await googleUser.authentication;
      final accessToken = googleAuth.accessToken;
      final idToken = googleAuth.idToken;
      
      if (accessToken == null || idToken == null) {
        throw 'No ID Token or Access Token found.';
      }
      
      final response = await Supabase.instance.client.auth.signInWithIdToken(
        provider: OAuthProvider.google,
        idToken: idToken,
        accessToken: accessToken,
      );
      return response.session != null;
    } catch (e) {
      debugPrint('Error signing in with Google: $e');
      return false;
    }
  }

  Future<bool> signInWithApple() async {
    try {
      final rawNonce = Supabase.instance.client.auth.generateRawNonce();
      final hashedNonce = sha256.convert(utf8.encode(rawNonce)).toString();

      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
        nonce: hashedNonce,
      );

      final idToken = credential.identityToken;
      if (idToken == null) {
        throw 'No ID Token found.';
      }

      final response = await Supabase.instance.client.auth.signInWithIdToken(
        provider: OAuthProvider.apple,
        idToken: idToken,
        nonce: rawNonce,
      );
      return response.session != null;
    } catch (e) {
      debugPrint('Error signing in with Apple: $e');
      return false;
    }
  }
}
