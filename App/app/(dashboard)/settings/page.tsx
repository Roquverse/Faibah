'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2, CreditCard, Users, Bell, Loader2,
  User, Shield, Palette, CheckCircle2, ChevronRight, Save, Sparkles, Check
} from 'lucide-react';
import { CompanyApi, UsersApi, AiApi } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
const PaystackCheckout = dynamic(() => import('@/components/PaystackWrapper'), { ssr: false });

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function SettingsPage() {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  
  // Security State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Appearance State
  const { theme, setTheme } = useTheme();
  const [primaryColor, setPrimaryColor] = useState('#1C0A3E');

  useEffect(() => {
    loadProfile();
    const savedColor = localStorage.getItem('primaryColor');
    if (savedColor) setPrimaryColor(savedColor);
  }, []);

  const loadProfile = async () => {
    try {
      const [companyData, userData] = await Promise.all([
        CompanyApi.getProfile(),
        UsersApi.getProfile()
      ]);
      setCompany(companyData);
      setUser(userData);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    const sanitizedOld = oldPassword.trim();
    const sanitizedNew = newPassword.trim();
    const sanitizedConfirm = confirmPassword.trim();

    if (!sanitizedOld) return toast.error('Please enter your current password');
    if (sanitizedNew !== sanitizedConfirm) return toast.error('New passwords do not match');
    if (sanitizedNew.length < 8) return toast.error('New password must be at least 8 characters');

    try {
      setIsChangingPassword(true);
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: sanitizedOld });
      if (signInError) throw new Error('Incorrect current password');
      const { error: updateError } = await supabase.auth.updateUser({ password: sanitizedNew });
      if (updateError) throw updateError;
      
      toast.success('Password updated successfully');
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSave = async (tab: string) => {
    if (!company) return;
    setIsSaving(true);
    try {
      if (tab === 'profile') {
        const updated = await UsersApi.updateProfile({
          firstName: user.firstName?.trim() || '',
          lastName: user.lastName?.trim() || '',
        });
        setUser(updated);
      } else if (tab === 'business') {
        const updated = await CompanyApi.updateProfile({
          name: company.name,
          workType: company.workType,
          companyEmail: company.companyEmail,
          companyPhone: company.companyPhone,
          address: company.address,
          city: company.city,
          country: company.country,
          bankName: company.bankName,
          accountName: company.accountName,
          accountNumber: company.accountNumber,
        });
        setCompany(updated);
        window.dispatchEvent(new Event('company-updated'));
      } else if (tab === 'appearance') {
        localStorage.setItem('primaryColor', primaryColor);
      }
      toast.success('Settings saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpgradeTier = async (tier: string) => {
    try {
      const updated = await CompanyApi.updateProfile({ planTier: tier });
      setCompany(updated);
      window.dispatchEvent(new Event('company-updated'));
      toast.success(`Successfully upgraded to ${tier.toUpperCase()} tier!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upgrade tier');
    }
  };

  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || '',
    amount: 3800 * 100, // 3800 NGN in kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  };

  const componentProps = {
    ...paystackConfig,
    text: 'Confirm & Pay ₦3,800',
    onSuccess: (reference: any) => handleUpgradeTier('agency'),
    onClose: () => toast.error('Payment cancelled'),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full font-sans min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your account, billing, and team preferences.</p>
        </div>

        <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-8">
          <TabsList className="flex flex-col h-auto bg-transparent items-start justify-start w-full md:w-64 space-y-1">
            <TabsTrigger value="profile" className="w-full justify-start text-left data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <User className="w-4 h-4 mr-2" /> My Profile
            </TabsTrigger>
            <TabsTrigger value="business" className="w-full justify-start text-left data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Building2 className="w-4 h-4 mr-2" /> Company
            </TabsTrigger>
            <TabsTrigger value="billing" className="w-full justify-start text-left data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <CreditCard className="w-4 h-4 mr-2" /> Billing & Plan
            </TabsTrigger>
            <TabsTrigger value="security" className="w-full justify-start text-left data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Shield className="w-4 h-4 mr-2" /> Security
            </TabsTrigger>
            <TabsTrigger value="appearance" className="w-full justify-start text-left data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Palette className="w-4 h-4 mr-2" /> Appearance
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 w-full">
            {/* PROFILE TAB */}
            <TabsContent value="profile" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <Card className="border-0 shadow-sm bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Profile Details</CardTitle>
                  <CardDescription>Update your personal information and email.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input value={user?.firstName || ''} onChange={(e) => setUser({ ...user, firstName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input value={user?.lastName || ''} onChange={(e) => setUser({ ...user, lastName: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input value={user?.email || ''} disabled className="bg-gray-50 text-gray-500" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleSave('profile')} disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* BUSINESS TAB */}
            <TabsContent value="business" className="m-0 space-y-6 focus-visible:outline-none focus-visible:ring-0">
              <Card className="border-0 shadow-sm bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Details that will appear on your invoices and proposals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input value={company?.name || ''} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Company Email</Label>
                      <Input value={company?.companyEmail || ''} onChange={(e) => setCompany({ ...company, companyEmail: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input value={company?.address || ''} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input value={company?.city || ''} onChange={(e) => setCompany({ ...company, city: e.target.value })} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Bank Details</CardTitle>
                  <CardDescription>Information provided to clients for direct payments.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input value={company?.bankName || ''} onChange={(e) => setCompany({ ...company, bankName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Name</Label>
                      <Input value={company?.accountName || ''} onChange={(e) => setCompany({ ...company, accountName: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input value={company?.accountNumber || ''} onChange={(e) => setCompany({ ...company, accountNumber: e.target.value })} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleSave('business')} disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Company Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* BILLING & PLAN TAB */}
            <TabsContent value="billing" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="mb-6">
                <h2 className="text-xl font-bold">Subscription Plans</h2>
                <p className="text-gray-500 text-sm mt-1">Upgrade your plan to unlock more features.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Solo */}
                <Card className={`relative flex flex-col justify-between transition-all hover:shadow-lg ${company?.planTier === 'solo' ? 'border-2 border-indigo-600 shadow-md' : 'border-gray-200'}`}>
                  {company?.planTier === 'solo' && <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg font-medium">Current Plan</div>}
                  <CardHeader>
                    <CardTitle className="text-lg">Solo</CardTitle>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold">Free</span>
                    </div>
                    <CardDescription className="pt-2">Perfect for side-hustlers and beginners.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1">
                    {['Unlimited Clients', 'Unlimited Invoices', 'Payment Tracking'].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Check className="w-4 h-4 text-green-500" /> {feature}
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" disabled={company?.planTier === 'solo'} onClick={() => handleUpgradeTier('solo')}>
                      {company?.planTier === 'solo' ? 'Active' : 'Downgrade to Solo'}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Contractor */}
                <Card className={`relative flex flex-col justify-between transition-all hover:shadow-lg ${company?.planTier === 'contractor' ? 'border-2 border-indigo-600 shadow-md' : 'border-gray-200'}`}>
                  {company?.planTier === 'contractor' && <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg font-medium">Current Plan</div>}
                  <CardHeader>
                    <CardTitle className="text-lg">Contractor</CardTitle>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold">Free</span>
                      <span className="text-sm text-gray-500 font-medium">for now</span>
                    </div>
                    <CardDescription className="pt-2">For independent professionals.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1">
                    {['Everything in Solo', 'Proposals & Quotations', 'Multiple Workspaces', 'Custom Branding'].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Check className="w-4 h-4 text-green-500" /> {feature}
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className={`w-full ${company?.planTier === 'contractor' ? 'bg-gray-100 text-gray-600 hover:bg-gray-100' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                      disabled={company?.planTier === 'contractor'} 
                      onClick={() => handleUpgradeTier('contractor')}
                    >
                      {company?.planTier === 'contractor' ? 'Active' : 'Upgrade to Contractor'}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Agency */}
                <Card className={`relative flex flex-col justify-between transition-all hover:shadow-xl bg-gradient-to-br from-gray-900 to-indigo-950 border-0 text-white`}>
                  {company?.planTier === 'agency' && <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg font-bold">Current Plan</div>}
                  {!company?.planTier || company?.planTier !== 'agency' ? <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg font-bold flex items-center gap-1"><Sparkles className="w-3 h-3"/> PRO</div> : null}
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Agency</CardTitle>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold">₦3,800</span>
                      <span className="text-sm text-gray-300 font-medium">/month</span>
                    </div>
                    <CardDescription className="pt-2 text-gray-300">For growing teams & agencies.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1">
                    {['Everything in Contractor', 'Team Members (Up to 10)', 'Kanban Task Board', 'Client Portals', 'Advanced Analytics'].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-200">
                        <Check className="w-4 h-4 text-yellow-500" /> {feature}
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className={`w-full ${company?.planTier === 'agency' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-indigo-900 hover:bg-gray-100 font-semibold'}`}
                          disabled={company?.planTier === 'agency'}
                        >
                          {company?.planTier === 'agency' ? 'Active' : 'Upgrade to Agency'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Upgrade to Agency Tier</DialogTitle>
                          <DialogDescription>
                            You are about to upgrade to the Agency tier for ₦3,800/month. This will instantly unlock Team management and Task boards.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-6 flex justify-center">
                          {/* Paystack Payment Checkout */}
                          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 text-center space-y-4 w-full">
                            <CreditCard className="w-12 h-12 text-indigo-600 mx-auto" />
                            <div className="text-sm text-gray-500">Secure payment via Paystack</div>
                            <div className="text-2xl font-bold text-gray-900">₦3,800</div>
                          </div>
                        </div>
                        <DialogFooter>
                          <PaystackCheckout 
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-10 px-4 py-2 rounded-md transition-colors" 
                            {...componentProps} 
                          />
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>

              </div>
            </TabsContent>

            {/* SECURITY TAB */}
            <TabsContent value="security" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <Card className="border-0 shadow-sm bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password securely.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-w-md">
                    <Label>Current Password</Label>
                    <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <Label>New Password</Label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <Label>Confirm New Password</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handlePasswordChange} disabled={isChangingPassword} variant="default">
                    {isChangingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Update Password
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* APPEARANCE TAB */}
            <TabsContent value="appearance" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <Card className="border-0 shadow-sm bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Theme Preferences</CardTitle>
                  <CardDescription>Customize the look and feel of your workspace.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Mode</Label>
                    <div className="flex gap-4">
                      <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>Light</Button>
                      <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>Dark</Button>
                      <Button variant={theme === 'system' ? 'default' : 'outline'} onClick={() => setTheme('system')}>System</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
