import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'channel_info_screen.dart';

class ChatScreen extends ConsumerStatefulWidget {
  final String channelId;
  final String channelName;

  const ChatScreen({
    super.key,
    required this.channelId,
    required this.channelName,
  });

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final List<Map<String, dynamic>> _messages = [
    {
      'id': '1',
      'sender': 'Arakunrin Cole',
      'role': 'CONTRACTOR',
      'text': 'Hello\nHi welcome to the project channel',
      'time': '25 Aug',
      'isMe': false,
    },
    {
      'id': '2',
      'sender': 'Oluwadamilola Cole (You)',
      'role': 'OWNER',
      'text': '@Oluwadamilola Cole Is this project ready?\n\nhttps://faibah.com',
      'time': '25 Aug',
      'isMe': true,
    },
    {
      'id': '3',
      'sender': 'Oluwadamilola Cole (You)',
      'role': 'OWNER',
      'text': 'Attached a file: 228c71510a8e868.png',
      'image': 'mock_image_path',
      'time': '26 Aug',
      'isMe': true,
    },
    {
      'id': '4',
      'sender': 'Oluwadamilola Cole (You)',
      'role': 'OWNER',
      'text': 'Voice Message',
      'isVoice': true,
      'time': '26 Aug',
      'isMe': true,
    },
  ];

  void _sendMessage() {
    if (_messageController.text.trim().isEmpty) return;

    setState(() {
      _messages.add({
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'sender': 'Oluwadamilola Cole (You)',
        'role': 'OWNER',
        'text': _messageController.text,
        'time': 'Just now',
        'isMe': true,
      });
    });

    _messageController.clear();
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.tag, size: 20),
            const SizedBox(width: 8),
            Text(widget.channelName),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ChannelInfoScreen(channelName: widget.channelName),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return _buildMessageTile(theme, message);
              },
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.only(left: 16, right: 16, bottom: 24, top: 8),
              child: Container(
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: theme.colorScheme.onSurface.withOpacity(0.2)),
                ),
                child: Column(
                  children: [
                    TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: 'Message #${widget.channelName}...',
                        hintStyle: TextStyle(color: theme.colorScheme.onSurface.withOpacity(0.5)),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.all(16),
                      ),
                      maxLines: 4,
                      minLines: 1,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _sendMessage(),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.3),
                        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(12)),
                      ),
                      child: Row(
                        children: [
                          _buildInputIcon(theme, Icons.alternate_email),
                          _buildInputIcon(theme, Icons.emoji_emotions_outlined),
                          _buildInputIcon(theme, Icons.attach_file),
                          _buildInputIcon(theme, Icons.mic_none),
                          const Spacer(),
                          ElevatedButton(
                            onPressed: _sendMessage,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: theme.colorScheme.onSurface.withOpacity(0.6),
                              foregroundColor: theme.colorScheme.surface,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                              elevation: 0,
                            ),
                            child: const Text('Send'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputIcon(ThemeData theme, IconData icon) {
    return IconButton(
      icon: Icon(icon, size: 20),
      color: theme.colorScheme.onSurface.withOpacity(0.6),
      onPressed: () {},
      padding: const EdgeInsets.all(8),
      constraints: const BoxConstraints(),
    );
  }

  Widget _buildMessageTile(ThemeData theme, Map<String, dynamic> message) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: theme.colorScheme.primary.withOpacity(0.2),
            foregroundColor: theme.colorScheme.primary,
            child: Text(
              message['sender'].substring(0, 1).toUpperCase(),
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      message['sender'],
                      style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      message['time'],
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.5),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  message['text'],
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.9),
                  ),
                ),
                if (message.containsKey('image'))
                  Container(
                    margin: const EdgeInsets.only(top: 8),
                    height: 200,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: theme.colorScheme.onSurface.withOpacity(0.1)),
                    ),
                    child: const Center(child: Icon(Icons.image, size: 48, color: Colors.grey)),
                  ),
                if (message.containsKey('isVoice') && message['isVoice'] == true)
                  Container(
                    margin: const EdgeInsets.only(top: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.play_arrow),
                        const SizedBox(width: 8),
                        Text('0:00 / 0:11', style: theme.textTheme.labelSmall),
                        const SizedBox(width: 8),
                        Expanded(child: Slider(value: 0, onChanged: (v) {})),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

