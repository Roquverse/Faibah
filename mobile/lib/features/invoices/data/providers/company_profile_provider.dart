import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers/dio_provider.dart';

class CompanyProfile {
  final String name;
  final String? workType;
  final String? logoUrl;
  final String? companyEmail;
  final String? companyPhone;
  final String? address;
  final String? city;
  final String? state;
  final String? country;
  final String? zipCode;
  final double? taxRate;
  final String? bankName;
  final String? accountName;
  final String? accountNumber;
  final String? routingNumber;
  final String? swiftCode;
  final String? website;

  const CompanyProfile({
    required this.name,
    this.workType,
    this.logoUrl,
    this.companyEmail,
    this.companyPhone,
    this.address,
    this.city,
    this.state,
    this.country,
    this.zipCode,
    this.taxRate,
    this.bankName,
    this.accountName,
    this.accountNumber,
    this.routingNumber,
    this.swiftCode,
    this.website,
  });

  factory CompanyProfile.fromJson(Map<String, dynamic> json) {
    return CompanyProfile(
      name: json['name'] as String? ?? 'Faibah Agency',
      workType: json['workType'] as String?,
      logoUrl: json['logoUrl'] as String?,
      companyEmail: json['companyEmail'] as String?,
      companyPhone: json['companyPhone'] as String?,
      address: json['address'] as String?,
      city: json['city'] as String?,
      state: json['state'] as String?,
      country: json['country'] as String?,
      zipCode: json['zipCode'] as String?,
      taxRate: (json['taxRate'] as num?)?.toDouble(),
      bankName: json['bankName'] as String?,
      accountName: json['accountName'] as String?,
      accountNumber: json['accountNumber'] as String?,
      routingNumber: json['routingNumber'] as String?,
      swiftCode: json['swiftCode'] as String?,
      website: json['website'] as String?,
    );
  }
}

final companyProfileProvider = FutureProvider<CompanyProfile>((ref) async {
  final dioClient = ref.watch(dioClientProvider);
  try {
    final response = await dioClient.dio.get('/company/profile');
    if (response.data is Map<String, dynamic>) {
      return CompanyProfile.fromJson(response.data as Map<String, dynamic>);
    }
  } catch (_) {}
  return const CompanyProfile(name: 'Faibah Agency');
});
