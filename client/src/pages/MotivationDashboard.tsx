import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Award, 
  TrendingUp, 
  Settings, 
  Clock, 
  Calendar,
  RefreshCw,
  Star
} from 'lucide-react';
import MotivationalProgress from '@/components/MotivationalProgress';
import MotivationalQuote from '@/components/MotivationalQuote';
import Confetti from '@/components/ui/confetti';
import { useMotivation } from '@/hooks/use-motivation';

export default function MotivationDashboard() {
  const { 
    showMotivation, 
    celebrateProgress, 
    motivationEnabled, 
    setMotivationEnabled 
  } = useMotivation();
  
  const [journeyStep, setJourneyStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Trigger confetti celebration
  const triggerCelebration = () => {
    setShowConfetti(true);
    celebrateProgress("You've unlocked a new achievement!");
    setTimeout(() => setShowConfetti(false), 3000);
  };
  
  // Handle step progress in the journey
  const handleStepProgress = () => {
    if (journeyStep < 4) {
      setJourneyStep(journeyStep + 1);
      
      // Show confetti on completion
      if (journeyStep === 3) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
  };
  
  const resetJourney = () => {
    setJourneyStep(0);
  };
  
  // South African specific motivation examples
  const saMilestones = [
    "Added B-BBEE status to CV",
    "Included NQF level qualifications",
    "Added South African regulatory knowledge",
    "Highlighted experience with local companies"
  ];
  
  return (
    <div className="container mx-auto py-8">
      <Confetti active={showConfetti} />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Job Seeker Motivation Centre</h1>
        <p className="text-gray-600 mt-1">
          Track your progress, celebrate achievements, and stay motivated in your South African job search
        </p>
      </div>
      
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="dashboard">
            <TrendingUp className="h-4 w-4 mr-2" />
            Progress Dashboard
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Award className="h-4 w-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Progress Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Motivational quote */}
          <MotivationalQuote type="sa-specific" />
          
          {/* CV optimization journey */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-amber-500" />
                CV Optimization Journey
              </CardTitle>
              <CardDescription>
                Track your progress towards an optimized CV for the South African job market
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MotivationalProgress 
                currentStep={journeyStep} 
                totalSteps={4} 
              />
              
              <div className="flex justify-between items-center pt-4">
                <Button variant="outline" size="sm" onClick={resetJourney}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Progress
                </Button>
                
                <Button 
                  onClick={handleStepProgress} 
                  disabled={journeyStep >= 4}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  {journeyStep >= 4 ? "Journey Complete!" : "Complete Next Step"}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Today's motivation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-amber-500" />
                South African Job Market Insights
              </CardTitle>
              <CardDescription>
                Daily tips and motivation for job seekers in South Africa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <h3 className="font-medium text-amber-800 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Today's Tip
                  </h3>
                  <p className="mt-2 text-gray-700">
                    When applying for jobs in South Africa, highlight your B-BBEE status when applicable. This information is valuable for employers who need to meet equity and transformation goals.
                  </p>
                  <Button 
                    onClick={() => showMotivation('general')} 
                    className="mt-3" 
                    variant="outline" 
                    size="sm"
                  >
                    Show More Tips
                  </Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">South African CV Optimization Checklist</h3>
                  <div className="space-y-2">
                    {saMilestones.map((milestone, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center p-2 rounded-md ${
                          index < journeyStep ? 'bg-green-50 text-green-800' : 'bg-gray-50'
                        }`}
                      >
                        {index < journeyStep ? (
                          <Star className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                          <Star className="h-4 w-4 mr-2 text-gray-400" />
                        )}
                        <span>{milestone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-amber-500" />
                Your Achievements
              </CardTitle>
              <CardDescription>
                Track your progress and celebrate milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Achievement cards */}
                <Card className="bg-gradient-to-r from-amber-50 to-white border-amber-200">
                  <CardContent className="pt-6">
                    <h3 className="font-medium flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-amber-500" />
                      South African Context Specialist
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Your CV includes South African specific elements that make it more relevant for local employers.
                    </p>
                    <Button 
                      onClick={triggerCelebration} 
                      className="mt-3 w-full bg-amber-100 hover:bg-amber-200 text-amber-800"
                    >
                      Claim Achievement
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className={`bg-gradient-to-r from-amber-50 to-white border-amber-200 ${journeyStep < 2 ? 'opacity-50' : ''}`}>
                  <CardContent className="pt-6">
                    <h3 className="font-medium flex items-center">
                      <Award className="h-5 w-5 mr-2 text-amber-500" />
                      CV Optimization Expert
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      You've made significant improvements to your CV, making it more effective for the South African job market.
                    </p>
                    <Button 
                      onClick={triggerCelebration} 
                      className="mt-3 w-full bg-amber-100 hover:bg-amber-200 text-amber-800"
                      disabled={journeyStep < 2}
                    >
                      {journeyStep < 2 ? "Complete More Steps to Unlock" : "Claim Achievement"}
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className={`bg-gradient-to-r from-blue-50 to-white border-blue-200 ${journeyStep < 3 ? 'opacity-50' : ''}`}>
                  <CardContent className="pt-6">
                    <h3 className="font-medium flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                      ATS Master
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Your CV is now optimized for Applicant Tracking Systems used by South African companies.
                    </p>
                    <Button 
                      onClick={triggerCelebration} 
                      className="mt-3 w-full bg-blue-100 hover:bg-blue-200 text-blue-800"
                      disabled={journeyStep < 3}
                    >
                      {journeyStep < 3 ? "Complete More Steps to Unlock" : "Claim Achievement"}
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className={`bg-gradient-to-r from-blue-50 to-white border-blue-200 ${journeyStep < 4 ? 'opacity-50' : ''}`}>
                  <CardContent className="pt-6">
                    <h3 className="font-medium flex items-center">
                      <Star className="h-5 w-5 mr-2 text-blue-500" />
                      Job Ready
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Your CV is now fully optimized and ready for applications to South African employers.
                    </p>
                    <Button 
                      onClick={triggerCelebration} 
                      className="mt-3 w-full bg-blue-100 hover:bg-blue-200 text-blue-800"
                      disabled={journeyStep < 4}
                    >
                      {journeyStep < 4 ? "Complete All Steps to Unlock" : "Claim Achievement"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-amber-500" />
                Motivation Settings
              </CardTitle>
              <CardDescription>
                Customize your motivation experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="motivation-toggle" className="font-medium">
                    Enable Motivation Features
                  </Label>
                  <p className="text-sm text-gray-500">
                    Show motivational messages, progress tracking, and celebrations
                  </p>
                </div>
                <Switch
                  id="motivation-toggle"
                  checked={motivationEnabled}
                  onCheckedChange={setMotivationEnabled}
                />
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Test Motivation Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button 
                    onClick={() => showMotivation('general')} 
                    variant="outline"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    General Motivation
                  </Button>
                  
                  <Button 
                    onClick={() => showMotivation('upload')} 
                    variant="outline"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Upload Motivation
                  </Button>
                  
                  <Button 
                    onClick={() => showMotivation('analysis')} 
                    variant="outline"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Analysis Motivation
                  </Button>
                  
                  <Button 
                    onClick={() => showMotivation('improvement')} 
                    variant="outline"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Improvement Motivation
                  </Button>
                  
                  <Button 
                    onClick={() => celebrateProgress("You've unlocked an achievement!")} 
                    variant="outline" 
                    className="sm:col-span-2"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Trigger Achievement Celebration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}