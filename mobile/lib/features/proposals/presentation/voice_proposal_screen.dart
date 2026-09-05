import 'package:flutter/material.dart';

class VoiceProposalScreen extends StatefulWidget {
  const VoiceProposalScreen({super.key});

  @override
  State<VoiceProposalScreen> createState() => _VoiceProposalScreenState();
}

class _VoiceProposalScreenState extends State<VoiceProposalScreen> with SingleTickerProviderStateMixin {
  bool _isRecording = false;
  bool _isProcessing = false;
  String? _transcription;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _toggleRecording() async {
    if (_isRecording) {
      // Stop recording and process
      setState(() {
        _isRecording = false;
        _isProcessing = true;
      });
      _pulseController.stop();

      // Simulate backend AI processing time
      await Future.delayed(const Duration(seconds: 3));

      if (mounted) {
        setState(() {
          _isProcessing = false;
          _transcription = "Client wants a 5-page e-commerce website with Stripe integration. Budget is around ₦1.5M. Timeline is 4 weeks.";
        });
      }
    } else {
      // Start recording
      setState(() {
        _isRecording = true;
        _transcription = null;
      });
      _pulseController.repeat(reverse: true);
    }
  }

  void _generateProposal() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Generating Proposal via AI...')),
    );
    // TODO: Send transcription to NestJS AI endpoint
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Voice-to-Proposal'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Spacer(),
            if (_isProcessing)
              Column(
                children: [
                  const CircularProgressIndicator(),
                  const SizedBox(height: 24),
                  Text(
                    'AI is transcribing your voice memo...',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.7),
                    ),
                  ),
                ],
              )
            else if (_transcription != null)
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: theme.colorScheme.primary.withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.auto_awesome, color: theme.colorScheme.primary),
                        const SizedBox(width: 8),
                        Text(
                          'Extracted Details',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _transcription!,
                      style: theme.textTheme.bodyLarge,
                    ),
                  ],
                ),
              )
            else
              Text(
                'Tap the microphone and describe the project scope, budget, and timeline.',
                textAlign: TextAlign.center,
                style: theme.textTheme.titleMedium?.copyWith(
                  color: theme.colorScheme.onSurface.withOpacity(0.6),
                ),
              ),
            const Spacer(),

            if (_transcription != null && !_isProcessing)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _generateProposal,
                  icon: const Icon(Icons.description),
                  label: const Text('Generate Proposal'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: theme.colorScheme.primary,
                    foregroundColor: theme.colorScheme.onPrimary,
                  ),
                ),
              ),
            
            const SizedBox(height: 32),

            // Record Button
            GestureDetector(
              onTap: _toggleRecording,
              child: AnimatedBuilder(
                animation: _pulseController,
                builder: (context, child) {
                  return Container(
                    padding: EdgeInsets.all(24 + (_pulseController.value * 12)),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _isRecording 
                        ? theme.colorScheme.error.withOpacity(0.2) 
                        : theme.colorScheme.primary.withOpacity(0.1),
                    ),
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _isRecording ? theme.colorScheme.error : theme.colorScheme.primary,
                        boxShadow: _isRecording ? [
                          BoxShadow(
                            color: theme.colorScheme.error.withOpacity(0.5),
                            blurRadius: 20,
                            spreadRadius: _pulseController.value * 10,
                          )
                        ] : null,
                      ),
                      child: Icon(
                        _isRecording ? Icons.stop : Icons.mic,
                        size: 48,
                        color: theme.colorScheme.onPrimary,
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            Text(
              _isRecording ? 'Recording...' : (_transcription != null ? 'Record Again' : 'Tap to Record'),
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: _isRecording ? theme.colorScheme.error : theme.colorScheme.primary,
              ),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }
}
