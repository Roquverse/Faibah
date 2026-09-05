import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

final socketClientProvider = Provider<SocketClient>((ref) {
  return SocketClient();
});

class SocketClient {
  io.Socket? _socket;
  
  // TODO: Move to env file
  final String _socketUrl = 'http://localhost:3000'; // Replace with actual backend IP for emulator

  void connect(String token) {
    if (_socket != null && _socket!.connected) return;

    _socket = io.io(_socketUrl, io.OptionBuilder()
        .setTransports(['websocket'])
        .disableAutoConnect()
        .setAuth({'token': token})
        .build()
    );

    _socket!.connect();

    _socket!.onConnect((_) {
      debugPrint('Socket.io connected');
    });

    _socket!.onDisconnect((_) {
      debugPrint('Socket.io disconnected');
    });

    _socket!.onConnectError((err) {
      debugPrint('Socket.io connection error: $err');
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }

  void emit(String event, dynamic data) {
    _socket?.emit(event, data);
  }

  void on(String event, void Function(dynamic) handler) {
    _socket?.on(event, handler);
  }

  void off(String event, [void Function(dynamic)? handler]) {
    _socket?.off(event, handler);
  }
}
