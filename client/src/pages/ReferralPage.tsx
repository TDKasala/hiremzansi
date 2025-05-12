import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { 
  ArrowRight, 
  Copy, 
  Gift, 
  Share2, 
  Users, 
  Check, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function ReferralPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  // Generate a referral link based on user ID or a default code
  const referralCode = user ? `REF${user.id}${Math.floor(Math.random() * 1000)}` : "ATSBOOST10";
  const referralLink = `https://atsboost.co.za/signup?ref=${referralCode}`;
  
  // Mock referral stats data - would come from backend in a real implementation
  const referralStats = {
    invited: 7,
    registered: 4,
    premiumConversions: 2,
    rewards: "R150.00",
  };
  
  // Referral rewards explanation
  const referralRewards = [
    { type: "Free User Sign Up", reward: "R10 credit" },
    { type: "Deep Analysis Purchase", reward: "R15 credit" },
    { type: "Premium Subscription", reward: "R50 credit + 5% monthly commission" }
  ];
  
  // Copy referral link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    
    toast({
      title: "Referral Link Copied!",
      description: "The link has been copied to your clipboard.",
    });
    
    setTimeout(() => setCopied(false), 3000);
  };
  
  // Share via various platforms 
  const shareVia = (platform: string) => {
    let shareUrl = "";
    const shareText = "Boost your chances of landing your dream job in South Africa! Use ATSBoost to optimize your CV and stand out to employers. Use my referral link:";
    
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText + " " + referralLink)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}&title=${encodeURIComponent("Optimize Your CV with ATSBoost")}&summary=${encodeURIComponent(shareText)}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent("Optimize Your CV for South African Job Market")}&body=${encodeURIComponent(shareText + "\n\n" + referralLink)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Refer Friends & Earn Rewards | ATSBoost</title>
        <meta 
          name="description" 
          content="Refer friends to ATSBoost and earn rewards for each sign-up and premium conversion. Help your network improve their CVs while you earn cash rewards." 
        />
        <meta 
          name="keywords" 
          content="CV referral program, resume optimization rewards, ATSBoost referral, South African CV tool, job application referral" 
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Refer Friends & <span className="text-primary">Earn Rewards</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Help your network improve their job applications while earning rewards.
            Get paid when your referrals use ATSBoost to optimize their CVs for the South African job market.
          </p>
        </div>
        
        {!user && (
          <Alert className="mb-8 border-primary/50 bg-primary/10">
            <Gift className="h-5 w-5 text-primary" />
            <AlertTitle>Sign in to start earning</AlertTitle>
            <AlertDescription>
              Create an account or log in to get your unique referral link and start earning rewards.
              <div className="mt-2">
                <Link href="/auth">
                  <Button variant="default" size="sm" className="mr-2">
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Referral Link Card */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Your Referral Link
            </CardTitle>
            <CardDescription>
              Share this link with friends, family, and colleagues to earn rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input 
                value={referralLink} 
                readOnly 
                className="font-mono text-sm flex-1"
              />
              <Button 
                onClick={copyToClipboard} 
                variant="secondary" 
                className="sm:w-auto"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Share via</h4>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => shareVia("facebook")}
                  className="flex items-center gap-2"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => shareVia("twitter")}
                  className="flex items-center gap-2"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => shareVia("linkedin")}
                  className="flex items-center gap-2"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => shareVia("email")}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Referral Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Your Referral Stats
              </CardTitle>
              <CardDescription>
                Track how many people you've referred and your earned rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">{referralStats.invited}</p>
                  <p className="text-sm text-muted-foreground">People Invited</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">{referralStats.registered}</p>
                  <p className="text-sm text-muted-foreground">Signed Up</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">{referralStats.premiumConversions}</p>
                  <p className="text-sm text-muted-foreground">Premium Users</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{referralStats.rewards}</p>
                  <p className="text-sm text-muted-foreground">Rewards Earned</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard">
                  View Detailed History
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Reward Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Reward Structure
              </CardTitle>
              <CardDescription>
                Earn rewards based on how your referrals use ATSBoost
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referral Type</TableHead>
                    <TableHead className="text-right">Your Reward</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referralRewards.map((reward, index) => (
                    <TableRow key={index}>
                      <TableCell>{reward.type}</TableCell>
                      <TableCell className="text-right font-medium">{reward.reward}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                <p>
                  <span className="font-medium">Payout Options:</span> Bank transfer, PayFast credit, or ATSBoost account credit. Minimum payout: R100.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Call to Action */}
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">Ready to help your network succeed?</h2>
          <p className="mb-4 max-w-2xl mx-auto">
            Share your referral link today and help your friends and colleagues optimize 
            their CVs for South African employers while earning rewards.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={copyToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Referral Link
            </Button>
            <Button variant="outline" asChild>
              <a href="https://atsboost.co.za" target="_blank" rel="noopener noreferrer">
                Visit ATSBoost.co.za
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-bold mb-2">How does the referral program work?</h3>
              <p className="text-muted-foreground">
                When someone uses your unique referral link to create an account, they're 
                tracked as your referral. You earn rewards when they use ATSBoost services.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-bold mb-2">When do I get paid my rewards?</h3>
              <p className="text-muted-foreground">
                Rewards accumulate in your account and can be withdrawn once you reach 
                the R100 minimum threshold. Payouts are processed on the 15th of each month.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-bold mb-2">Is there a limit to how many people I can refer?</h3>
              <p className="text-muted-foreground">
                No! There's no limit to how many people you can refer or how much you can earn. 
                The more people you help, the more rewards you'll receive.
              </p>
            </div>
          </div>
        </div>
        
        {/* Second Call to Action */}
        <Card className="mb-10 bg-secondary text-white">
          <CardContent className="pt-6 pb-6">
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                South Africa's #1 CV Optimization Platform
              </h3>
              <p className="mb-4 max-w-2xl mx-auto">
                Join thousands of South Africans who have improved their job search 
                success with ATSBoost's locally-optimized tools and features.
              </p>
              <Button variant="default" className="bg-white text-secondary hover:bg-white/90" asChild>
                <a href="https://atsboost.co.za" target="_blank" rel="noopener noreferrer">
                  Optimize Your CV Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Testimonials */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-center">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="italic mb-4">
                  "I referred 5 friends from my university, and three of them got interviews 
                  within weeks of using ATSBoost. Plus, I earned enough rewards to cover my premium subscription!"
                </p>
                <p className="font-semibold">Thembi M.</p>
                <p className="text-sm text-muted-foreground">Cape Town</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="italic mb-4">
                  "The referral program is a win-win. My colleagues improved their CVs, 
                  and I earned R200 in two months just by sharing my link in our WhatsApp group."
                </p>
                <p className="font-semibold">James T.</p>
                <p className="text-sm text-muted-foreground">Johannesburg</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="italic mb-4">
                  "As a career coach, I recommend ATSBoost to all my clients. The referral program 
                  has been an unexpected bonus for helping people land jobs in SA's competitive market."
                </p>
                <p className="font-semibold">Lesedi K.</p>
                <p className="text-sm text-muted-foreground">Durban</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Third Call to Action */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-4">
            Start Sharing & Earning Today
          </h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Help your network overcome South Africa's 32% unemployment crisis.
            Share ATSBoost with friends and earn rewards together.
          </p>
          <Button size="lg" onClick={copyToClipboard} className="mr-4">
            <Share2 className="mr-2 h-5 w-5" />
            Share Your Referral Link
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="https://atsboost.co.za" target="_blank" rel="noopener noreferrer">
              Visit ATSBoost.co.za
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </>
  );
}