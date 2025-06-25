import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Share2, 
  Users, 
  Gift, 
  TrendingUp, 
  Copy, 
  Star,
  Calendar,
  Award,
  CreditCard,
  Percent
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface ReferralStats {
  invited: number;
  registered: number;
  premiumConversions: number;
  freeAnalysisEarned: number;
}

interface UserCredits {
  freeAnalysisCredits: number;
  scanCredits: number;
  premiumMonths: number;
  discountCredits: number;
  totalEarned: number;
  totalSpent: number;
}

interface ReferralReward {
  id: string;
  rewardType: string;
  rewardValue: number;
  rewardAmount: number;
  description: string;
  isRedeemed: boolean;
  expiresAt: string;
  createdAt: string;
}

interface ReferralData {
  id: string;
  referralCode: string;
  refereeEmail?: string;
  status: 'pending' | 'registered' | 'premium';
  registeredAt?: string;
  premiumUpgradeAt?: string;
  createdAt: string;
}

interface ReferralResponse {
  stats: ReferralStats;
  credits: UserCredits;
  rewards: ReferralReward[];
  referrals: ReferralData[];
}

export default function ReferralDashboard() {
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      
      // Get referral code
      const codeResponse = await apiRequest('GET', '/api/referrals/code');
      const codeData = await codeResponse.json();
      setReferralCode(codeData.referralCode);
      setReferralLink(codeData.referralLink);

      // Get stats and data
      const statsResponse = await apiRequest('GET', '/api/referrals/stats');
      const statsData: ReferralResponse = await statsResponse.json();
      
      setStats(statsData.stats);
      setCredits(statsData.credits);
      setRewards(statsData.rewards);
      setReferrals(statsData.referrals);
    } catch (error) {
      console.error('Error loading referral data:', error);
      toast({
        title: "Error",
        description: "Failed to load referral data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const generateNewReferralLink = async () => {
    try {
      const response = await apiRequest('POST', '/api/referrals/generate');
      const data = await response.json();
      
      if (response.ok) {
        setReferralCode(data.referralCode);
        setReferralLink(data.referralLink);
        toast({
          title: "New Referral Link Generated",
          description: data.message,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate new referral link",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate new referral link",
        variant: "destructive",
      });
    }
  };

  const spendCredits = async (type: string, amount: number = 1) => {
    try {
      const response = await apiRequest('POST', '/api/referrals/spend-credits', {
        type,
        amount
      });
      
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
        toast({
          title: "Credits Used",
          description: `Successfully used ${amount} ${type.replace('_', ' ')} credit(s)`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to use credits",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to use credits",
        variant: "destructive",
      });
    }
  };

  const getProgressToNextReward = () => {
    if (!stats) return { progress: 0, nextMilestone: 1, nextReward: '' };
    
    const milestones = [
      { count: 1, reward: '2 Free CV Analyses' },
      { count: 3, reward: 'Essential Pack (R49)' },
      { count: 5, reward: 'Professional Month (R99)' },
      { count: 10, reward: '20% Annual Discount' }
    ];
    
    const nextMilestone = milestones.find(m => m.count > stats.registered);
    if (!nextMilestone) {
      return { progress: 100, nextMilestone: 10, nextReward: 'All rewards unlocked!' };
    }
    
    const progress = (stats.registered / nextMilestone.count) * 100;
    return { progress, nextMilestone: nextMilestone.count, nextReward: nextMilestone.reward };
  };

  const formatCurrency = (amount: number) => {
    return `R${(amount / 100).toFixed(2)}`;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'premium': return 'bg-green-500';
      case 'registered': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const progressData = getProgressToNextReward();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Refer & Earn</h1>
        <p className="text-gray-600">Share Hire Mzansi and earn valuable rewards for every successful referral</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Referrals Sent</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.invited || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Successful Signups</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.registered || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Premium Converts</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.premiumConversions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Gift className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Rewards</p>
                <p className="text-2xl font-bold text-gray-900">{rewards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Next Reward */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Progress to Next Reward
          </CardTitle>
          <CardDescription>
            {stats?.registered || 0} of {progressData.nextMilestone} referrals needed for: {progressData.nextReward}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressData.progress} className="w-full" />
          <p className="text-sm text-gray-600 mt-2">
            {progressData.nextMilestone - (stats?.registered || 0)} more referrals to unlock your next reward
          </p>
        </CardContent>
      </Card>

      {/* Share Your Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            Share Your Referral Code
          </CardTitle>
          <CardDescription>
            Share your unique code and earn rewards when friends sign up
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              value={referralCode}
              readOnly
              className="flex-1 font-mono text-center text-lg font-bold"
            />
            <Button
              onClick={() => copyToClipboard(referralCode, 'Referral code')}
              variant="outline"
              size="sm"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Input
              value={referralLink}
              readOnly
              className="flex-1 text-sm"
            />
            <Button
              onClick={() => copyToClipboard(referralLink, 'Referral link')}
              variant="outline"
              size="sm"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={generateNewReferralLink}
              variant="secondary"
              className="w-full md:w-auto"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Generate New Link
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Reward Structure:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 1 signup = 2 Free CV Analyses (R10 value)</li>
              <li>• 3 signups = Essential Pack (R25 value)</li>
              <li>• 5 signups = Professional Month (R50 value)</li>
              <li>• 10 signups = 20% Annual Discount (R100 savings)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Credits Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Your Credits Balance
          </CardTitle>
          <CardDescription>
            Use your earned credits for premium services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{credits?.freeAnalysisCredits || 0}</p>
              <p className="text-sm text-blue-800">Free Analyses</p>
              {(credits?.freeAnalysisCredits || 0) > 0 && (
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => spendCredits('free_analysis')}
                >
                  Use 1 Credit
                </Button>
              )}
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{credits?.scanCredits || 0}</p>
              <p className="text-sm text-green-800">Scan Credits</p>
              {(credits?.scanCredits || 0) > 0 && (
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => spendCredits('scan_credits')}
                >
                  Use 1 Credit
                </Button>
              )}
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{credits?.premiumMonths || 0}</p>
              <p className="text-sm text-purple-800">Premium Months</p>
              {(credits?.premiumMonths || 0) > 0 && (
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => spendCredits('professional_month')}
                >
                  Activate Month
                </Button>
              )}
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{credits?.discountCredits || 0}</p>
              <p className="text-sm text-orange-800">Discount Credits</p>
              {(credits?.discountCredits || 0) > 0 && (
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => spendCredits('discount_credit')}
                >
                  Apply Discount
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Rewards */}
      {rewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Rewards</CardTitle>
            <CardDescription>Your latest earned rewards and bonuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rewards.slice(0, 5).map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Gift className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{reward.description}</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(reward.rewardAmount)} value • 
                        Earned {new Date(reward.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={reward.isRedeemed ? "secondary" : "default"}>
                    {reward.isRedeemed ? "Redeemed" : "Available"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referral History */}
      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
            <CardDescription>Track the status of your referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.slice(0, 10).map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">
                        {referral.refereeEmail || 'Anonymous User'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Referred {new Date(referral.createdAt).toLocaleDateString()}
                        {referral.registeredAt && (
                          <> • Signed up {new Date(referral.registeredAt).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusBadgeColor(referral.status)}>
                    {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}