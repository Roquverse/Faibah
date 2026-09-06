import 'package:flutter/material.dart';

class CompanyInfoSettingsScreen extends StatelessWidget {
  const CompanyInfoSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Company Info'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const Text(
            'Business Details',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          TextFormField(
            decoration: const InputDecoration(
              labelText: 'Business Name',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.business),
            ),
            initialValue: 'Acme Corp',
          ),
          const SizedBox(height: 16),
          TextFormField(
            decoration: const InputDecoration(
              labelText: 'Tax ID / EIN',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.receipt_long),
            ),
            initialValue: 'XX-XXXXXXX',
          ),
          
          const SizedBox(height: 32),
          const Text(
            'Business Address',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          TextFormField(
            decoration: const InputDecoration(
              labelText: 'Street Address',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.location_on_outlined),
            ),
            initialValue: '123 Tech Boulevard, Suite 400',
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                flex: 2,
                child: TextFormField(
                  decoration: const InputDecoration(
                    labelText: 'City',
                    border: OutlineInputBorder(),
                  ),
                  initialValue: 'San Francisco',
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: TextFormField(
                  decoration: const InputDecoration(
                    labelText: 'State',
                    border: OutlineInputBorder(),
                  ),
                  initialValue: 'CA',
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextFormField(
            decoration: const InputDecoration(
              labelText: 'ZIP / Postal Code',
              border: OutlineInputBorder(),
            ),
            initialValue: '94105',
          ),
          
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: () {
               ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Company info updated')));
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber,
              foregroundColor: Colors.black,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            child: const Text('Save Company Info'),
          ),
        ],
      ),
    );
  }
}
