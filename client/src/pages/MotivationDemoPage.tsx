import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Upload, 
  FileText, 
  Sparkles, 
  BriefcaseBusiness,
  RefreshCw,
  Clock,
  Info
} from 'lucide-react';
import { useMotivation } from '@/hooks/use-motivation';
import MotivationalProgress from '@/components/MotivationalProgress';
import Confetti from '@/components/ui/confetti';

export default function MotivationDemoPage() {
  const [, setLocation] = useLocation();
  const { 
    showMotivation, 
    celebrateProgress, 
    motivationEnabled, 
    setMotivationEnabled 
  } = useMotivation();
  
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState('journey');
  
  // Milestone achievements
  const milestones = [
    { 
      title: "Upload your CV", 
      description: "The first step toward an optimized CV",
      icon: <Upload className="h-5 w-5 text-blue-500" />
    },
    { 
      title: "Get ATS analysis", 
      description: "Understand where your CV stands",
      icon: <FileText className="h-5 w-5 text-amber-500" />
    },
    { 
      title: "Improve key areas", 
      description: "Enhanced with South African context",
      icon: <Sparkles className="h-5 w-5 text-green-500" />
    },
    { 
      title: "Ready for applications", 
      description: "Your optimized CV is ready to impress",
      icon: <BriefcaseBusiness className="h-5 w-5 text-purple-500" />
    }
  ];
  
  // CV journey milestones
  const advanceStep = () => {
    if (currentStep < totalSteps) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      if (newStep === totalSteps) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
  };
  
  const resetDemo = () => {
    setCurrentStep(0);
  };
  
  const triggerMotivation = (type: 'general' | 'upload' | 'analysis' | 'improvement' | 'application') => {
    showMotivation(type);
  };
  
  const triggerCelebration = () => {
    celebrateProgress("You've unlocked a major achievement!");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };
  
  // Handles tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (
    <div className="container mx-auto py-8">
      <Confetti active={showConfetti} />
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Job Seeker Motivation System</h1>
        <p className="text-gray-600 mt-2">
          Interactive microinteractions to keep job seekers motivated during their CV optimization journey
        </p>
      </div>
      
      {/* Settings and controls */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center">
            <Info className="h-5 w-5 mr-2 text-blue-500" />
            Motivation Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Switch
                  id="motivation-toggle"
                  checked={motivationEnabled}
                  onCheckedChange={setMotivationEnabled}
                />
                <Label htmlFor="motivation-toggle">Enable Motivation System</Label>
              </div>
              <p className="text-sm text-gray-500">
                Toggle motivational messages and celebrations throughout your journey
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetDemo}
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset Demo
              </Button>
              
              <Button
                onClick={() => setLocation('/upload')}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Try with Real CV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main content tabs */}
      <Tabs defaultValue="journey" value={activeTab} onValueChange={handleTabChange} className="mb-8">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="journey">CV Optimization Journey</TabsTrigger>
          <TabsTrigger value="test">Test Motivation Features</TabsTrigger>
        </TabsList>
        
        {/* CV Journey Tab */}
        <TabsContent value="journey" className="space-y-6">
          {/* Progress bar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Your CV Optimization Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <MotivationalProgress 
                currentStep={currentStep} 
                totalSteps={totalSteps} 
              />
            </CardContent>
          </Card>
          
          {/* Milestone cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {milestones.map((milestone, index) => (
              <Card 
                key={index}
                className={`transition-all duration-300 ${
                  index < currentStep 
                    ? 'border-green-300 bg-green-50' 
                    : index === currentStep 
                      ? 'border-amber-300 bg-amber-50 shadow-md' 
                      : 'opacity-70'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      {milestone.icon}
                      <h3 className="font-medium">{milestone.title}</h3>
                    </div>
                    
                    {index < currentStep && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    )}
                    
                    {index === currentStep && (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Current
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600">{milestone.description}</p>
                  
                  {index === currentStep && (
                    <Button 
                      onClick={advanceStep} 
                      className="w-full mt-4 bg-amber-500 hover:bg-amber-600"
                    >
                      Complete this step
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Test Features Tab */}
        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Test Motivation Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gray-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Motivational Messages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={() => triggerMotivation('general')} 
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      General Motivation
                    </Button>
                    
                    <Button 
                      onClick={() => triggerMotivation('upload')} 
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      CV Upload Motivation
                    </Button>
                    
                    <Button 
                      onClick={() => triggerMotivation('analysis')} 
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      Analysis Motivation
                    </Button>
                    
                    <Button 
                      onClick={() => triggerMotivation('improvement')} 
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      Improvement Motivation
                    </Button>
                    
                    <Button 
                      onClick={() => triggerMotivation('application')} 
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      Application Motivation
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Special Celebrations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={triggerCelebration} 
                      variant="outline" 
                      className="w-full justify-start bg-amber-50 text-amber-800"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Trigger Celebration
                    </Button>
                    
                    <p className="text-sm text-gray-600 italic">
                      This demo shows how we can celebrate key achievements in the job seeker's journey with special notifications and confetti animations.
                    </p>
                    
                    <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                      <p><strong>Tip:</strong> Motivation features are integrated throughout the application at key moments to improve user engagement:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>When uploading a CV</li>
                        <li>After completing ATS analysis</li>
                        <li>When making CV improvements</li>
                        <li>After reaching job application readiness</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}