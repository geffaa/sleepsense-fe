"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Save, UserCircle } from 'lucide-react';
import { authService, patientService } from '@/lib/api';

const PatientProfileContent: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Profile states
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    medicalConditions: '',
    medications: ''
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await patientService.getProfile();
        
        // Initialize form with user and patient data
        setProfile({
          fullName: user?.fullName || '',
          email: user?.email || '',
          gender: response.patient.gender || '',
          age: response.patient.age ? response.patient.age.toString() : '',
          height: response.patient.height ? response.patient.height.toString() : '',
          weight: response.patient.weight ? response.patient.weight.toString() : '',
          medicalConditions: Array.isArray(response.patient.medical_conditions) ? 
                            response.patient.medical_conditions.join(', ') : '',
          medications: Array.isArray(response.patient.medications) ? 
                      response.patient.medications.join(', ') : ''
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    
    // Clear any success/error messages when user makes changes
    setSuccess(null);
    setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Clear any success/error messages when user makes changes
    setSuccess(null);
    setError(null);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Process medical conditions and medications from comma-separated strings to arrays
      const medicalConditionsArray = profile.medicalConditions
        ? profile.medicalConditions.split(',').map(item => item.trim()).filter(Boolean)
        : [];
      
      const medicationsArray = profile.medications
        ? profile.medications.split(',').map(item => item.trim()).filter(Boolean)
        : [];
      
      // Prepare data for API
      const profileData = {
        gender: profile.gender,
        age: profile.age ? parseInt(profile.age) : undefined,
        height: profile.height ? parseFloat(profile.height) : undefined,
        weight: profile.weight ? parseFloat(profile.weight) : undefined,
        medicalConditions: medicalConditionsArray,
        medications: medicationsArray
      };
      
      // Call API to update profile
      await patientService.updateProfile(profileData);
      
      setSuccess('Profile updated successfully!');
      setError(null);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    try {
      setSaving(true);
      
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      setSuccess('Password updated successfully!');
      setError(null);
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to update password. Please check your current password and try again.');
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600">Manage your account and personal information</p>
      </div>

      {success && (
        <Alert className="mb-6 text-green-800 border-green-200 bg-green-50">
          <AlertCircle className="w-4 h-4 text-green-600" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6 text-red-800 border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and medical information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Full Name"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleProfileChange}
                    disabled
                    icon={<UserCircle className="w-5 h-5 text-gray-400" />}
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    disabled
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    }
                  />
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Gender"
                    name="gender"
                    value={profile.gender}
                    onChange={handleProfileChange}
                    placeholder="Male, Female, or Other"
                  />
                  <Input
                    label="Age"
                    name="age"
                    type="number"
                    value={profile.age}
                    onChange={handleProfileChange}
                    placeholder="Your age in years"
                  />
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Height (cm)"
                    name="height"
                    type="number"
                    step="0.1"
                    value={profile.height}
                    onChange={handleProfileChange}
                    placeholder="Your height in centimeters"
                  />
                  <Input
                    label="Weight (kg)"
                    name="weight"
                    type="number"
                    step="0.1"
                    value={profile.weight}
                    onChange={handleProfileChange}
                    placeholder="Your weight in kilograms"
                  />
                </div>
                
                <Input
                  label="Medical Conditions"
                  name="medicalConditions"
                  value={profile.medicalConditions}
                  onChange={handleProfileChange}
                  placeholder="Separate conditions with commas (e.g., Hypertension, Diabetes)"
                />
                
                <Input
                  label="Medications"
                  name="medications"
                  value={profile.medications}
                  onChange={handleProfileChange}
                  placeholder="Separate medications with commas (e.g., Lisinopril 10mg, Metformin 500mg)"
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="flex items-center gap-2"
                    isLoading={saving}
                  >
                    {!saving && <Save className="w-4 h-4" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  }
                />
                
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your new password"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  }
                />
                
                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  }
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="flex items-center gap-2"
                    isLoading={saving}
                  >
                    {!saving && <Save className="w-4 h-4" />}
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default PatientProfileContent;