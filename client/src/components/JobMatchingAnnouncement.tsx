import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Briefcase, Target, Bell } from "lucide-react";

export function JobMatchingAnnouncement() {
  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-xl text-blue-900">AI-Powered Job Matching</CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Coming Soon
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700">
          We're building the most advanced job matching system for South Africa, 
          designed to connect your optimized CV with perfect job opportunities.
        </p>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">Smart Matching</h4>
              <p className="text-xs text-gray-600">AI analyzes your CV against thousands of SA job listings</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CalendarDays className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">Real-time Alerts</h4>
              <p className="text-xs text-gray-600">Get notified when perfect jobs match your profile</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">SA Context</h4>
              <p className="text-xs text-gray-600">Considers B-BBEE, NQF levels, and local requirements</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <span className="text-sm text-gray-600">
            📧 Be first to know when it launches
          </span>
          <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
            Notify Me
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}