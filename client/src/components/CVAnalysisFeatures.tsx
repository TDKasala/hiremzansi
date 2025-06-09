import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Globe, 
  BarChart3, 
  FileCheck, 
  Users, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Zap,
  Flag
} from "lucide-react";

export function CVAnalysisFeatures() {
  const analysisTypes = [
    {
      icon: <Target className="h-8 w-8 text-blue-600" />,
      title: "ATS Compatibility",
      score: 92,
      color: "blue",
      features: [
        "Applicant Tracking System formatting",
        "Keyword density optimization", 
        "Section structure validation",
        "File format compatibility"
      ]
    },
    {
      icon: <Flag className="h-8 w-8 text-green-600" />,
      title: "South African Context",
      score: 78,
      color: "green", 
      features: [
        "B-BBEE status optimization",
        "NQF qualification alignment",
        "Local industry standards",
        "Provincial job market fit"
      ]
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: "Skills Analysis",
      score: 85,
      color: "purple",
      features: [
        "Industry skill mapping",
        "Competency gap identification", 
        "Skill level assessment",
        "Trending skills recommendation"
      ]
    },
    {
      icon: <FileCheck className="h-8 w-8 text-orange-600" />,
      title: "Professional Quality",
      score: 88,
      color: "orange",
      features: [
        "Language and grammar check",
        "Professional tone analysis",
        "Achievement quantification",
        "Impact statement review"
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "border-blue-200 bg-blue-50",
      green: "border-green-200 bg-green-50", 
      purple: "border-purple-200 bg-purple-50",
      orange: "border-orange-200 bg-orange-50"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return null;
}