import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../../shared/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);
        
        if (!user) return;
        
        // Fetch profile data from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('username, website, avatar_url')
          .eq('id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setUsername(data.username || '');
          setWebsite(data.website || '');
          setAvatarUrl(data.avatar_url || '');
        }
      } catch (error: any) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }
    
    getProfile();
  }, [user]);
  
  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      if (!user) return;
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username,
          website,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        });
        
      if (error) {
        throw error;
      }
      
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setLoading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);
        
      setAvatarUrl(data.publicUrl);
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your account information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4">
              <AlertDescription>Profile updated successfully!</AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl} alt={username} />
              <AvatarFallback>{username ? username[0]?.toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.email}</p>
              <Label htmlFor="avatar" className="cursor-pointer text-sm text-primary">
                Change Avatar
              </Label>
              <Input 
                id="avatar" 
                type="file" 
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={loading}
              />
            </div>
          </div>
          
          <form onSubmit={updateProfile} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="flex justify-between">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Update Profile'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => signOut()}
                disabled={loading}
              >
                Sign Out
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}