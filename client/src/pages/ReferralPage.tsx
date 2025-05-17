import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  
  // Generate a referral link based on user ID or a default code
  const referralCode = user ? `REF${user.id}${Math.floor(Math.random() * 1000)}` : "ATSBOOST10";
  const referralLink = `https://atsboost.co.za/signup?ref=${referralCode}`;
  
  // Mock referral stats data - would come from backend in a real implementation
  const referralStats = {
    invited: 7,
    registered: 4,
    premiumConversions: 2,
    freeAnalysisEarned: 1,
  };
  
  // Referral rewards explanation
  const referralRewards = [
    { type: "1 Friend Signs Up", reward: "Free CV Template" },
    { type: "3 Friends Sign Up", reward: "Free CV Deep Analysis (R30 value)" },
    { type: "5 Friends Sign Up", reward: "1-Month Premium Subscription" }
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
        <title>Refer 3 Friends, Get Free CV Deep Analysis | ATSBoost</title>
        <meta 
          name="description" 
          content="Refer 3 friends to ATSBoost and get a FREE CV Deep Analysis (R30 value). Help your network improve their CVs while earning valuable resume optimization benefits." 
        />
        <meta 
          name="keywords" 
          content="free CV deep analysis, resume optimization rewards, ATSBoost referral, South African CV tool, job application referral" 
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {t('referral.title')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            {t('referral.subtitle')}
          </p>
        </div>
        
        {!user && (
          <Alert className="mb-8 border-primary/50 bg-primary/10">
            <Gift className="h-5 w-5 text-primary" />
            <AlertTitle>{t('common.signInToStart')}</AlertTitle>
            <AlertDescription>
              {t('referral.createAccountDescription')}
              <div className="mt-2">
                <Link href="/auth">
                  <Button variant="default" size="sm" className="mr-2">
                    {t('common.createAccount')} <ArrowRight className="ml-2 h-4 w-4" />
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
              {t('referral.yourReferralLink')}
            </CardTitle>
            <CardDescription>
              {t('referral.shareLink')}
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
                    {t('referral.copied')}
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    {t('referral.copyLink')}
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
                  <p className="text-2xl font-bold text-green-600">{referralStats.freeAnalysisEarned}</p>
                  <p className="text-sm text-muted-foreground">Free Analyses Earned</p>
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
          <h2 className="text-2xl font-bold mb-2">Get Your Free CV Deep Analysis</h2>
          <p className="mb-4 max-w-2xl mx-auto">
            Share your referral link with 3 friends and unlock a comprehensive CV Deep Analysis 
            worth R30—your key to standing out in the competitive South African job market.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={copyToClipboard} className="bg-green-600 hover:bg-green-700">
              <Copy className="mr-2 h-4 w-4" />
              Copy Referral Link
            </Button>
            <Button variant="outline" asChild>
              <Link href="/job-sites">
                Job Board
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-bold mb-2">How do I get my free CV Deep Analysis?</h3>
              <p className="text-muted-foreground">
                Share your unique referral link with friends. Once 3 friends create accounts using 
                your link, you'll automatically receive a free Deep Analysis credit in your account.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-bold mb-2">What's included in the CV Deep Analysis?</h3>
              <p className="text-muted-foreground">
                The Deep Analysis (worth R30) includes professional CV feedback with South African context, 
                industry-specific keyword recommendations, B-BBEE optimization, and personalized improvement tips.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-bold mb-2">Is there a limit to how many rewards I can earn?</h3>
              <p className="text-muted-foreground">
                No! You can earn multiple rewards. For every 3 referrals, you get another free CV Deep Analysis. 
                At 5 referrals, you'll also unlock a free month of Premium access.
              </p>
            </div>
          </div>
        </div>
        
        {/* Second Call to Action */}
        <Card className="mb-10 bg-secondary text-white">
          <CardContent className="pt-6 pb-6">
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                3 Referrals = Free CV Deep Analysis
              </h3>
              <p className="mb-4 max-w-2xl mx-auto">
                Your network needs quality CV feedback to succeed in South Africa's job market.
                Share ATSBoost and get valuable tools to boost your own career journey.
              </p>
              <Button variant="default" className="bg-white text-secondary hover:bg-white/90" asChild>
                <Link href="/refer">
                  Start Referring Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
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
                  "I referred 3 friends from my university and got the free Deep Analysis. It completely 
                  transformed my CV with South African-specific keywords, and I landed two interviews the following week!"
                </p>
                <p className="font-semibold">Thembi M.</p>
                <p className="text-sm text-muted-foreground">Cape Town</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="italic mb-4">
                  "After referring 3 friends, I used my free Deep Analysis on my CV. The detailed feedback on 
                  B-BBEE and NQF presentation helped me tailor my application to South African companies perfectly."
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
            <Link href="/tools/ats-keywords">
              Try ATS Keywords Tool
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}