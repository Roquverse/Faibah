import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:emoji_picker_flutter/emoji_picker_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'package:intl/intl.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'channel_info_screen.dart';
import '../data/providers/chat_provider.dart';

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
  final FocusNode _messageFocusNode = FocusNode();
  final AudioRecorder _audioRecorder = AudioRecorder();
  bool _isRecording = false;
  bool _showActionIcons = false;
  // Remove mock messages
  
  void _sendMessage() {
    if (_messageController.text.trim().isEmpty) return;

    ref.read(chatProviderFamily(widget.channelId).notifier).sendMessage(_messageController.text);
    
    _messageController.clear();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _messageFocusNode.dispose();
    _audioRecorder.dispose();
    super.dispose();
  }

  void _showMentionPicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1A1A1A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        final List<String> teamMembers = [
          'Arakunrin Cole',
          'Oluwadamilola Cole',
          'Jane Doe',
          'John Smith',
        ];

        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text('Mention a teammate', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ),
              Expanded(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: teamMembers.length,
                  itemBuilder: (context, index) {
                    final member = teamMembers[index];
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.2),
                        child: Text(member[0]),
                      ),
                      title: Text(member),
                      onTap: () {
                        Navigator.pop(context);
                        final text = _messageController.text;
                        _messageController.text = '$text@$member ';
                        _messageController.selection = TextSelection.fromPosition(TextPosition(offset: _messageController.text.length));
                        _messageFocusNode.requestFocus();
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showEmojiPicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1A1A1A),
      builder: (context) {
        return SafeArea(
          child: SizedBox(
            height: 300,
            child: EmojiPicker(
              onEmojiSelected: (category, emoji) {
                final text = _messageController.text;
                _messageController.text = '$text${emoji.emoji}';
                _messageController.selection = TextSelection.fromPosition(TextPosition(offset: _messageController.text.length));
              },
              config: const Config(
                bottomActionBarConfig: BottomActionBarConfig(showBackspaceButton: false, showSearchViewButton: false),
              ),
            ),
          ),
        );
      },
    );
  }

  Future<void> _showAttachmentPicker() async {
    final ImagePicker picker = ImagePicker();
    try {
      final List<XFile> images = await picker.pickMultiImage();
      if (images.isNotEmpty) {
        setState(() {
          // Add dummy local attachments to simulate for now
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error selecting attachment: $e')));
      }
    }
  }

  Future<void> _toggleVoiceRecording() async {
    try {
      if (_isRecording) {
        final path = await _audioRecorder.stop();
        setState(() {
          _isRecording = false;
          if (path != null) {
             // Mock add voice
          }
        });
      } else {
        if (await _audioRecorder.hasPermission()) {
          final dir = await getTemporaryDirectory();
          final path = '${dir.path}/voice_${DateTime.now().millisecondsSinceEpoch}.m4a';
          await _audioRecorder.start(const RecordConfig(), path: path);
          setState(() {
            _isRecording = true;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error recording voice: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text('# ${widget.channelName}'),
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
            child: ref.watch(chatProviderFamily(widget.channelId)).when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, st) => Center(child: Text('Error: $e')),
              data: (messages) {
                if (messages.isEmpty) {
                  return const Center(child: Text('No messages yet. Say hello!', style: TextStyle(color: Colors.grey)));
                }
                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final message = messages[index];
                    return _buildMessageTile(theme, message);
                  },
                );
              },
            ),
          ),
          Container(
            decoration: const BoxDecoration(
              color: Color(0xFF050505),
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1A1A1A),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: Row(
                        children: [
                          IconButton(
                            icon: Icon(_showActionIcons ? Icons.close : Icons.add, color: Colors.grey),
                            onPressed: () {
                              setState(() {
                                _showActionIcons = !_showActionIcons;
                              });
                            },
                          ),
                          Expanded(
                            child: TextField(
                              controller: _messageController,
                              focusNode: _messageFocusNode,
                              cursorColor: const Color(0xFF6B4EFF),
                              style: const TextStyle(color: Colors.white),
                              decoration: InputDecoration(
                                hintText: 'Send to ${widget.channelName}',
                                hintStyle: const TextStyle(color: Colors.grey, fontSize: 16),
                                border: InputBorder.none,
                                enabledBorder: InputBorder.none,
                                focusedBorder: InputBorder.none,
                                contentPadding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                              maxLines: 4,
                              minLines: 1,
                              textInputAction: TextInputAction.send,
                              onSubmitted: (_) => _sendMessage(),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.send_outlined, color: Colors.grey),
                            onPressed: _sendMessage,
                          ),
                        ],
                      ),
                    ),
                    if (_showActionIcons)
                      Padding(
                        padding: const EdgeInsets.only(top: 8.0, bottom: 8.0),
                        child: Row(
                          children: [
                            // Action Icons
                            _buildActionIcon(Icons.alternate_email, 'Mention', _showMentionPicker),
                            _buildActionIcon(Icons.sentiment_satisfied_alt, 'Emoji', _showEmojiPicker),
                            _buildActionIcon(Icons.attach_file, 'Attachment', _showAttachmentPicker),
                            _buildActionIcon(Icons.mic_none, 'Voice', _toggleVoiceRecording, color: _isRecording ? Colors.red : Colors.grey),
                          ],
                        ),
                      ),
                    if (!_showActionIcons)
                      const SizedBox(height: 8),
                  ],
                ),
            ),
          ),
        ),
      ],
      ),
    );
  }

  Widget _buildActionIcon(IconData icon, String tooltip, VoidCallback onTap, {Color color = Colors.grey}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: IconButton(
        icon: Icon(icon, size: 22, color: color),
        onPressed: onTap,
        constraints: const BoxConstraints(),
        padding: const EdgeInsets.all(8),
      ),
    );
  }

  Widget _buildMessageTile(ThemeData theme, Map<String, dynamic> message) {
    final currentUserId = Supabase.instance.client.auth.currentUser?.id;
    final isMe = message['senderId'] == currentUserId || message['isMe'] == true;
    
    final senderName = isMe ? 'You' : (message['senderType'] == 'TEAM' ? 'Team Member' : 'Client');
    final avatarLetter = senderName.substring(0, 1).toUpperCase();
    
    // Parse time
    String displayTime = message['time'] ?? '';
    if (message['createdAt'] != null) {
      final dt = DateTime.tryParse(message['createdAt']);
      if (dt != null) {
        displayTime = DateFormat('MMM d, h:mm a').format(dt.toLocal());
      }
    }
    
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
              avatarLetter,
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
                      senderName,
                      style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      displayTime,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.5),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  message['content'] ?? message['text'] ?? '',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.9),
                  ),
                ),
                if (message['attachmentUrl'] != null || message.containsKey('image'))
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

