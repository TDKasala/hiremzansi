import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Gift, Users, TrendingUp, Award, Plus, DollarSign } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ReferralOverview {
  totalUsers: number;
  totalReferrals: number;
  activeReferrals: number;
  premiumConversions: number;
  conversionRate: string;
}

interface ReferralRecord {
  id: number;
  referrerId: number;
  refereeId: number;
  referralCode: string;
  status: string;
  registeredAt: string;
  premiumUpgradeAt: string;
  createdAt: string;
  users: {
    username: string;
    email: string;
  };
}

export default function AdminReferralsPage() {
  const [overview, setOverview] = useState<ReferralOverview | null>(null);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [rewardForm, setRewardForm] = useState({
    userId: '',
    rewardType: '',
    rewardValue: '',
    description: ''
  });

  useEffect(() => {
    fetchOverview();
    fetchReferrals();
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await apiRequest('GET', '/api/admin/referrals/overview');
      if (response.ok) {
        const data = await response.json();
        setOverview(data);
      }
    } catch (error) {
      console.error('Error fetching referral overview:', error);
    }
  };

  const fetchReferrals = async () => {
    try {
      const response = await apiRequest('GET', '/api/admin/referrals/all');
      if (response.ok) {
        const data = await response.json();
        setReferrals(data);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const handleAwardReward = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiRequest('POST', '/api/admin/referrals/reward', {
        userId: parseInt(rewardForm.userId),
        rewardType: rewardForm.rewardType,
        rewardValue: parseInt(rewardForm.rewardValue),
        description: rewardForm.description
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Reward awarded successfully"
        });
        
        setShowRewardForm(false);
        setRewardForm({ userId: '', rewardType: '', rewardValue: '', description: '' });
        fetchOverview();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to award reward');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to award reward",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      registered: 'default',
      premium: 'default'
    };
    
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      registered: 'bg-green-100 text-green-800',
      premium: 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const rewardTypes = [
    { value: 'free_analysis', label: 'Free CV Analysis', description: 'Credits for CV analysis' },
    { value: 'scan_credits', label: 'Scan Credits', description: 'Credits for document scanning' },
    { value: 'premium_month', label: 'Premium Month', description: 'Free premium subscription month' },
    { value: 'discount_credit', label: 'Discount Credit', description: 'Discount credits for services' }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Referral Management</h1>
          <p className="text-muted-foreground">Monitor and manage the referral system</p>
        </div>
        <Button onClick={() => setShowRewardForm(true)}>
          <Gift className="h-4 w-4 mr-2" />
          Award Reward
        </Button>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{overview.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-bold">{overview.totalReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Referrals</p>
                  <p className="text-2xl font-bold">{overview.activeReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{overview.conversionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Award Reward Form */}
      {showRewardForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Award Manual Reward</CardTitle>
            <CardDescription>
              Manually award rewards to users for exceptional contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAwardReward} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    type="number"
                    value={rewardForm.userId}
                    onChange={(e) => setRewardForm({ ...rewardForm, userId: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rewardType">Reward Type</Label>
                  <Select 
                    value={rewardForm.rewardType} 
                    onValueChange={(value) => setRewardForm({ ...rewardForm, rewardType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reward type" />
                    </SelectTrigger>
                    <SelectContent>
                      {rewardTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rewardValue">Reward Value</Label>
                  <Input
                    id="rewardValue"
                    type="number"
                    value={rewardForm.rewardValue}
                    onChange={(e) => setRewardForm({ ...rewardForm, rewardValue: e.target.value })}
                    placeholder="e.g., 1, 5, 10"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={rewardForm.description}
                    onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                    placeholder="Reason for reward"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Awarding...' : 'Award Reward'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowRewardForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
          <CardDescription>All referral activities on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {referrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">{referral.users?.username || 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground">{referral.users?.email || 'No email'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Code: {referral.referralCode}</p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusBadge(referral.status)}
                  {referral.registeredAt && (
                    <Badge variant="outline" className="text-xs">
                      Registered: {new Date(referral.registeredAt).toLocaleDateString()}
                    </Badge>
                  )}
                  {referral.premiumUpgradeAt && (
                    <Badge variant="outline" className="text-xs">
                      Premium: {new Date(referral.premiumUpgradeAt).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            {referrals.length === 0 && (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No referrals yet</h3>
                <p className="text-muted-foreground">Referral activities will appear here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}