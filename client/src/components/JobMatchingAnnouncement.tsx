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
      
    </Card>
  );
}