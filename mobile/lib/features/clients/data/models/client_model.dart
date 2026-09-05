class ClientModel {
  final String id;
  final String name;
  final String? email;
  final String? whatsappNumber;
  final String? country;
  final String? city;
  final String? address;
  final String? clientType; // INDIVIDUAL or BUSINESS

  ClientModel({
    required this.id,
    required this.name,
    this.email,
    this.whatsappNumber,
    this.country,
    this.city,
    this.address,
    this.clientType,
  });

  factory ClientModel.fromJson(Map<String, dynamic> json) {
    return ClientModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'],
      whatsappNumber: json['whatsappNumber'],
      country: json['country'],
      city: json['city'],
      address: json['address'],
      clientType: json['clientType'],
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'name': name,
      'clientType': clientType ?? 'INDIVIDUAL',
    };
    
    if (email != null && email!.isNotEmpty) data['email'] = email;
    if (whatsappNumber != null && whatsappNumber!.isNotEmpty) data['whatsappNumber'] = whatsappNumber;
    if (country != null && country!.isNotEmpty) data['country'] = country;
    if (city != null && city!.isNotEmpty) data['city'] = city;
    if (address != null && address!.isNotEmpty) data['address'] = address;
    
    return data;
  }
}
