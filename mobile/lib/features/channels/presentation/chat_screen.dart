import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:emoji_picker_flutter/emoji_picker_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'package:record/record.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:path_provider/path_provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import 'package:dio/dio.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide MultipartFile;
import 'channel_info_screen.dart';
import '../data/providers/chat_provider.dart';
import '../../../../core/providers/dio_provider.dart';
import '../../../../core/theme/app_theme.dart';

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
  bool _isUploadingAttachment = false;

  @override
  void initState() {
    super.initState();
    // Initialize the channel connection once when screen is opened
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(chatProvider.notifier).initChannel(
            widget.channelId,
            channelName: widget.channelName,
          );
    });
  }

  void _sendMessage() {
    if (_messageController.text.trim().isEmpty) return;

    ref.read(chatProvider.notifier).sendMessage(_messageController.text);

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
    final surfaceColor = context.surfaceColor;
    final textPrimary = context.textPrimary;
    final textSecondary = context.textSecondary;

    showModalBottomSheet(
      context: context,
      backgroundColor: surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        final members = ref.read(chatProvider.notifier).members;
        final teamMembers = members
            .map((member) {
              final user = member['user'] as Map<String, dynamic>?;
              if (user != null) {
                final first = user['firstName']?.toString() ?? '';
                final last = user['lastName']?.toString() ?? '';
                final name = '$first $last'.trim();
                if (name.isNotEmpty) return name;
              }
              final contact = member['clientContact'] as Map<String, dynamic>?;
              return contact?['name']?.toString() ?? 'Member';
            })
            .where((name) => name.isNotEmpty)
            .toList();

        if (teamMembers.isEmpty) {
          return SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Text(
                'No team members found for this project.',
                style: TextStyle(color: textSecondary),
              ),
            ),
          );
        }

        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  'Mention a team member',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: textPrimary,
                  ),
                ),
              ),
              Expanded(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: teamMembers.length,
                  itemBuilder: (context, index) {
                    final name = teamMembers[index];
                    return ListTile(
                      tileColor: Colors.transparent,
                      leading: CircleAvatar(
                        backgroundColor:
                            AppTheme.yellow.withValues(alpha: 0.2),
                        foregroundColor: AppTheme.yellow,
                        child: Text(name[0].toUpperCase()),
                      ),
                      title: Text(name, style: TextStyle(color: textPrimary)),
                      onTap: () {
                        final current = _messageController.text;
                        _messageController.text = '$current@$name ';
                        _messageController.selection =
                            TextSelection.fromPosition(
                          TextPosition(
                              offset: _messageController.text.length),
                        );
                        Navigator.pop(context);
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
      backgroundColor: context.surfaceColor,
      builder: (context) {
        return SafeArea(
          child: SizedBox(
            height: 300,
            child: EmojiPicker(
              onEmojiSelected: (category, emoji) {
                final text = _messageController.text;
                _messageController.text = '$text${emoji.emoji}';
                _messageController.selection = TextSelection.fromPosition(
                    TextPosition(offset: _messageController.text.length));
              },
              config: const Config(
                bottomActionBarConfig: BottomActionBarConfig(
                    showBackspaceButton: false, showSearchViewButton: false),
              ),
            ),
          ),
        );
      },
    );
  }

  Future<void> _showAttachmentPicker() async {
    final textPrimary = context.textPrimary;
    final choice = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: context.surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Share Media & Files',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: textPrimary),
              ),
              const SizedBox(height: 12),
              ListTile(
                tileColor: Colors.transparent,
                leading: const Icon(Icons.photo_library_outlined,
                    color: AppTheme.yellow),
                title: Text('Photo & Video Library',
                    style: TextStyle(color: textPrimary)),
                onTap: () => Navigator.pop(ctx, 'gallery'),
              ),
              ListTile(
                tileColor: Colors.transparent,
                leading: const Icon(Icons.camera_alt_outlined,
                    color: AppTheme.yellow),
                title: Text('Take Photo',
                    style: TextStyle(color: textPrimary)),
                onTap: () => Navigator.pop(ctx, 'camera'),
              ),
              ListTile(
                tileColor: Colors.transparent,
                leading: const Icon(Icons.insert_drive_file_outlined,
                    color: AppTheme.yellow),
                title: Text('Document / PDF',
                    style: TextStyle(color: textPrimary)),
                onTap: () => Navigator.pop(ctx, 'document'),
              ),
            ],
          ),
        ),
      ),
    );

    if (choice == null) return;

    try {
      setState(() => _isUploadingAttachment = true);
      String? filePath;
      String? fileName;
      bool isPdf = false;

      if (choice == 'camera' || choice == 'gallery') {
        final picker = ImagePicker();
        final picked = await picker.pickImage(
          source:
              choice == 'camera' ? ImageSource.camera : ImageSource.gallery,
          imageQuality: 85,
        );
        if (picked != null) {
          filePath = picked.path;
          fileName = picked.name;
        }
      } else if (choice == 'document') {
        final pickedDoc = await FilePicker.pickFile();
        if (pickedDoc != null && pickedDoc.path != null) {
          filePath = pickedDoc.path!;
          fileName = pickedDoc.name;
          isPdf = fileName.toLowerCase().endsWith('.pdf');
        }
      }

      if (filePath == null) {
        setState(() => _isUploadingAttachment = false);
        return;
      }

      final dioClient = ref.read(dioClientProvider);
      final endpoint = isPdf ? '/upload/pdf' : '/upload/image';
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath, filename: fileName),
      });

      final response = await dioClient.dio.post(endpoint, data: formData);
      final url = response.data?['url'] as String?;

      if (url != null) {
        await ref.read(chatProvider.notifier).sendMessage(
              '',
              attachmentUrl: url,
              messageType: 'FILE',
            );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Failed to upload attachment: $e'),
              backgroundColor: Colors.redAccent),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isUploadingAttachment = false);
      }
    }
  }

  Future<void> _toggleVoiceRecording() async {
    try {
      if (_isRecording) {
        final path = await _audioRecorder.stop();
        setState(() => _isRecording = false);
        if (path != null) {
          setState(() => _isUploadingAttachment = true);
          final dioClient = ref.read(dioClientProvider);
          final formData = FormData.fromMap({
            'file': await MultipartFile.fromFile(
              path,
              filename: 'voice_${DateTime.now().millisecondsSinceEpoch}.m4a',
            ),
          });
          final res = await dioClient.dio.post('/upload/image', data: formData);
          final url = res.data?['url'] as String?;
          if (url != null) {
            await ref.read(chatProvider.notifier).sendMessage(
                  'Voice message',
                  attachmentUrl: url,
                  messageType: 'FILE',
                );
          }
          setState(() => _isUploadingAttachment = false);
        }
      } else {
        if (await _audioRecorder.hasPermission()) {
          final dir = await getTemporaryDirectory();
          final path =
              '${dir.path}/voice_${DateTime.now().millisecondsSinceEpoch}.m4a';
          await _audioRecorder.start(const RecordConfig(), path: path);
          setState(() {
            _isRecording = true;
          });
        }
      }
    } catch (e) {
      setState(() {
        _isRecording = false;
        _isUploadingAttachment = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Error with voice recording: $e'),
              backgroundColor: Colors.redAccent),
        );
      }
    }
  }

  void _showImagePreview(BuildContext context, String imageUrl) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.black.withValues(alpha: 0.95),
        insetPadding: EdgeInsets.zero,
        child: Stack(
          fit: StackFit.expand,
          children: [
            InteractiveViewer(
              panEnabled: true,
              minScale: 0.5,
              maxScale: 4.0,
              child: Center(
                child: Image.network(
                  imageUrl,
                  fit: BoxFit.contain,
                  loadingBuilder: (context, child, progress) {
                    if (progress == null) return child;
                    return const Center(
                      child: CircularProgressIndicator(color: AppTheme.yellow),
                    );
                  },
                  errorBuilder: (context, error, stackTrace) => const Center(
                    child: Icon(Icons.broken_image,
                        color: Colors.white70, size: 64),
                  ),
                ),
              ),
            ),
            SafeArea(
              child: Align(
                alignment: Alignment.topRight,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: CircleAvatar(
                    backgroundColor: Colors.black54,
                    child: IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: () => Navigator.pop(ctx),
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

  bool _isImageUrl(String url) {
    final lower = url.toLowerCase();
    return lower.contains('.png') ||
        lower.contains('.jpg') ||
        lower.contains('.jpeg') ||
        lower.contains('.webp') ||
        lower.contains('.gif') ||
        lower.contains('.svg') ||
        lower.contains('/image/upload/');
  }

  bool _isAudioUrl(String url) {
    final lower = url.toLowerCase();
    return lower.contains('.m4a') ||
        lower.contains('.mp3') ||
        lower.contains('.wav') ||
        lower.contains('.ogg') ||
        lower.contains('.aac') ||
        lower.contains('.webm') ||
        lower.contains('/audio/upload/');
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
          statusBarBrightness: isDark ? Brightness.dark : Brightness.light,
        ),
        title: Text('# ${widget.channelName}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ChannelInfoScreen(
                    projectId: widget.channelId,
                    channelName: widget.channelName,
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ref.watch(chatProvider).when(
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (e, st) => Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.chat_bubble_outline_rounded,
                              size: 40, color: context.textSecondary),
                          const SizedBox(height: 12),
                          Text(
                            'Unable to load channel',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: context.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Something went wrong connecting to #${widget.channelName}.',
                            style: TextStyle(
                              fontSize: 13,
                              color: context.textSecondary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () {
                              ref.read(chatProvider.notifier).initChannel(
                                    widget.channelId,
                                    channelName: widget.channelName,
                                  );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.yellow,
                              foregroundColor: Colors.black,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8)),
                            ),
                            child: const Text('Try Again'),
                          ),
                        ],
                      ),
                    ),
                  ),
                  data: (messages) {
                    if (messages.isEmpty) {
                      return const Center(
                        child: Text('No messages yet. Say hello!',
                            style: TextStyle(color: Colors.grey)),
                      );
                    }
                    return ListView.builder(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 24),
                      itemCount: messages.length,
                      itemBuilder: (context, index) {
                        final message = messages[index];
                        return _buildMessageTile(theme, message);
                      },
                    );
                  },
                ),
          ),
          if (_isUploadingAttachment)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: AppTheme.darkSurface01,
              child: const Row(
                children: [
                  SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppTheme.yellow,
                    ),
                  ),
                  SizedBox(width: 12),
                  Text('Uploading media...',
                      style: TextStyle(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ),
          Container(
            decoration: BoxDecoration(
              color: context.surfaceColor,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: context.isDark ? 0.3 : 0.06),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.only(
                    left: 16, right: 16, top: 16, bottom: 0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 4, vertical: 4),
                      decoration: BoxDecoration(
                        color: context.inputFillColor,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: context.borderColor),
                      ),
                      child: Row(
                        children: [
                          IconButton(
                            icon: Icon(
                                _showActionIcons ? Icons.close : Icons.add,
                                color: context.textSecondary),
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
                              cursorColor: AppTheme.yellow,
                              style: TextStyle(color: context.textPrimary),
                              decoration: InputDecoration(
                                hintText: 'Send to ${widget.channelName}',
                                hintStyle: TextStyle(
                                    color: context.textSecondary.withValues(alpha: 0.6), fontSize: 16),
                                border: InputBorder.none,
                                enabledBorder: InputBorder.none,
                                focusedBorder: InputBorder.none,
                                contentPadding:
                                    const EdgeInsets.symmetric(vertical: 12),
                              ),
                              maxLines: 4,
                              minLines: 1,
                              textInputAction: TextInputAction.send,
                              onSubmitted: (_) => _sendMessage(),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.send_outlined,
                                color: AppTheme.yellow),
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
                            _buildActionIcon(Icons.alternate_email, 'Mention',
                                _showMentionPicker,
                                color: context.textSecondary),
                            _buildActionIcon(Icons.sentiment_satisfied_alt,
                                'Emoji', _showEmojiPicker,
                                color: context.textSecondary),
                            _buildActionIcon(Icons.attach_file, 'Attachment',
                                _showAttachmentPicker,
                                color: context.textSecondary),
                            _buildActionIcon(Icons.mic_none, 'Voice',
                                _toggleVoiceRecording,
                                color: _isRecording ? Colors.red : context.textSecondary),
                          ],
                        ),
                      ),
                    if (!_showActionIcons) const SizedBox(height: 8),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionIcon(IconData icon, String tooltip, VoidCallback onTap,
      {Color color = Colors.grey}) {
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
    final isMe =
        message['senderId'] == currentUserId || message['isMe'] == true;

    final chatNotifier = ref.read(chatProvider.notifier);
    final senderName = isMe
        ? 'You'
        : chatNotifier.resolveSenderName(message);

    // Resolve avatar URL — real photo or generated initials fallback
    final userMeta = Supabase.instance.client.auth.currentUser?.userMetadata;
    final myAvatarUrl = userMeta != null ? userMeta['avatar_url']?.toString() : null;
    final String? rawAvatarUrl = isMe
        ? myAvatarUrl
        : chatNotifier.resolveSenderAvatar(message);
    final encodedName = Uri.encodeComponent(isMe ? 'You' : senderName);
    final fallbackAvatarUrl =
        'https://ui-avatars.com/api/?name=$encodedName&background=6D9773&color=fff&format=png';
    final avatarUrl = (rawAvatarUrl != null && rawAvatarUrl.isNotEmpty)
        ? rawAvatarUrl
        : fallbackAvatarUrl;

    // Parse time
    String displayTime = message['time'] ?? '';
    if (message['createdAt'] != null) {
      final dt = DateTime.tryParse(message['createdAt']);
      if (dt != null) {
        displayTime = DateFormat('MMM d, h:mm a').format(dt.toLocal());
      }
    }

    final attachmentUrl =
        (message['attachmentUrl'] ?? message['image'])?.toString();
    final hasVoice =
        message['isVoice'] == true || (attachmentUrl != null && _isAudioUrl(attachmentUrl));
    final contentText = (message['content'] ?? message['text'] ?? '').toString();

    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.2),
            backgroundImage: NetworkImage(avatarUrl),
            onBackgroundImageError: (_, __) {},
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
                      style: theme.textTheme.titleSmall
                          ?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      displayTime,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                      ),
                    ),
                  ],
                ),
                if (contentText.isNotEmpty &&
                    !(contentText == 'Shared an attachment' &&
                        attachmentUrl != null)) ...[
                  const SizedBox(height: 4),
                  Text(
                    contentText,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.9),
                    ),
                  ),
                ],
                if (attachmentUrl != null && attachmentUrl.isNotEmpty) ...[
                  if (hasVoice)
                    _AudioAttachmentPlayer(url: attachmentUrl)
                  else if (_isImageUrl(attachmentUrl))
                    GestureDetector(
                      onTap: () => _showImagePreview(context, attachmentUrl),
                      child: Container(
                        margin: const EdgeInsets.only(top: 8),
                        constraints: const BoxConstraints(
                          maxHeight: 240,
                          maxWidth: 320,
                        ),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: theme.colorScheme.onSurface.withValues(alpha: 0.12),
                          ),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Stack(
                            alignment: Alignment.bottomRight,
                            children: [
                              Image.network(
                                attachmentUrl,
                                fit: BoxFit.cover,
                                loadingBuilder:
                                    (context, child, loadingProgress) {
                                  if (loadingProgress == null) return child;
                                  return Container(
                                    height: 180,
                                    color: AppTheme.darkSurface01,
                                    child: const Center(
                                      child: CircularProgressIndicator(
                                        color: AppTheme.yellow,
                                      ),
                                    ),
                                  );
                                },
                                errorBuilder:
                                    (context, error, stackTrace) => Container(
                                  height: 140,
                                  color: AppTheme.darkSurface01,
                                  child: const Center(
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Icon(Icons.broken_image,
                                            color: Colors.grey, size: 36),
                                        SizedBox(height: 6),
                                        Text('Image unavailable',
                                            style: TextStyle(
                                                color: Colors.grey,
                                                fontSize: 12)),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              Container(
                                margin: const EdgeInsets.all(8),
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: Colors.black54,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(Icons.fullscreen,
                                    color: Colors.white, size: 18),
                              ),
                            ],
                          ),
                        ),
                      ),
                    )
                  else
                    _buildDocumentAttachment(context, attachmentUrl),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDocumentAttachment(BuildContext context, String url) {
    final fileName = url.split('/').last.split('?').first;
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: context.borderColor),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.redAccent.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.picture_as_pdf,
                color: Colors.redAccent, size: 24),
          ),
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              fileName.isEmpty ? 'Document Attachment' : fileName,
              style: TextStyle(
                  color: context.textPrimary,
                  fontSize: 13,
                  fontWeight: FontWeight.w500),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.open_in_new,
                color: AppTheme.yellow, size: 20),
            onPressed: () async {
              final uri = Uri.parse(url);
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              }
            },
          ),
        ],
      ),
    );
  }
}

class _AudioAttachmentPlayer extends StatefulWidget {
  final String url;
  const _AudioAttachmentPlayer({required this.url});

  @override
  State<_AudioAttachmentPlayer> createState() => _AudioAttachmentPlayerState();
}

class _AudioAttachmentPlayerState extends State<_AudioAttachmentPlayer> {
  final AudioPlayer _player = AudioPlayer();
  bool _isPlaying = false;
  Duration _duration = Duration.zero;
  Duration _position = Duration.zero;

  @override
  void initState() {
    super.initState();
    _player.onPlayerStateChanged.listen((state) {
      if (mounted) setState(() => _isPlaying = state == PlayerState.playing);
    });
    _player.onDurationChanged.listen((d) {
      if (mounted) setState(() => _duration = d);
    });
    _player.onPositionChanged.listen((p) {
      if (mounted) setState(() => _position = p);
    });
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  Future<void> _togglePlay() async {
    if (_isPlaying) {
      await _player.pause();
    } else {
      await _player.play(UrlSource(widget.url));
    }
  }

  String _formatDuration(Duration d) {
    final minutes = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final maxSec = _duration.inMilliseconds.toDouble();
    final currentSec = _position.inMilliseconds.toDouble();

    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      constraints: const BoxConstraints(maxWidth: 320),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: context.borderColor),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: _togglePlay,
            child: CircleAvatar(
              radius: 18,
              backgroundColor: AppTheme.yellow,
              child: Icon(
                _isPlaying ? Icons.pause : Icons.play_arrow,
                color: Colors.black,
                size: 20,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            _formatDuration(_position),
            style: theme.textTheme.labelSmall?.copyWith(color: context.textSecondary),
          ),
          Expanded(
            child: SliderTheme(
              data: SliderTheme.of(context).copyWith(
                thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                trackHeight: 3,
                activeTrackColor: AppTheme.yellow,
                inactiveTrackColor: context.borderColor,
                thumbColor: AppTheme.yellow,
              ),
              child: Slider(
                value: (maxSec > 0 && currentSec <= maxSec) ? currentSec : 0.0,
                max: maxSec > 0 ? maxSec : 1.0,
                onChanged: (v) {
                  _player.seek(Duration(milliseconds: v.toInt()));
                },
              ),
            ),
          ),
          Text(
            _formatDuration(_duration),
            style: theme.textTheme.labelSmall?.copyWith(color: context.textSecondary),
          ),
        ],
      ),
    );
  }
}
