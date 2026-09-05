class ScheduleEventModel {
  final String id;
  final String title;
  final String? description;
  final DateTime? date;
  final String? startTime;
  final String? endTime;
  final String type;
  final double? amount;

  ScheduleEventModel({
    required this.id,
    required this.title,
    this.description,
    this.date,
    this.startTime,
    this.endTime,
    required this.type,
    this.amount,
  });

  factory ScheduleEventModel.fromJson(Map<String, dynamic> json) {
    return ScheduleEventModel(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? 'Untitled',
      description: json['description'] as String?,
      date: json['date'] != null ? DateTime.tryParse(json['date'].toString()) : null,
      startTime: json['startTime'] as String?,
      endTime: json['endTime'] as String?,
      type: json['type'] as String? ?? 'MEETING',
      amount: json['amount'] != null ? double.tryParse(json['amount'].toString()) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id.isNotEmpty) 'id': id,
      'title': title,
      'description': description,
      'date': date?.toIso8601String(),
      'startTime': startTime,
      'endTime': endTime,
      'type': type,
      if (amount != null) 'amount': amount,
    };
  }
}
