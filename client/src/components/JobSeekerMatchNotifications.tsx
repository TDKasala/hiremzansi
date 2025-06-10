import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bell, 
  Target, 
  TrendingUp, 
  Lightbulb,
  Star,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface MatchNotification {
  id: number;
  type: 'potential_match' | 'cv_optimization' | 'skill_suggestion';
  title: string;
  message: string;
  matchStrength: number;
  industry: string;
  location: string;
  optimizationTips: string[];
  requiredSkills: string[];
  missingSkills: string[];
  isRead: boolean;
  createdAt: string;
  urgency: 'low' | 'medium' | 'high';
}

export function JobSeekerMatchNotifications() {
  const { user } = useAuth();
  const [selectedNotification, setSelectedNotification] = useState<MatchNotification | null>(null);

  // Fetch match notifications for job seeker
  const { data: notifications = [], isLoading } = useQuery<MatchNotification[]>({
    queryKey: ['/api/job-seeker/match-notifications'],
    enabled: !!user,
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getMatchColor = (strength: number) => {
    if (strength >= 80) return 'text-green-600';
    if (strength >= 60) return 'text-blue-600';
    if (strength >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return null;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Job Match Notifications</h3>
            <p className="text-sm text-gray-600">
              {unreadCount > 0 ? `${unreadCount} new opportunities` : 'No new notifications'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Badge className="bg-red-100 text-red-800">
            {unreadCount} new
          </Badge>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-600">
                We'll notify you when recruiters post jobs that match your CV
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                !notification.isRead ? 'ring-2 ring-blue-200 bg-blue-50' : ''
              }`}
              onClick={() => setSelectedNotification(notification)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                      {!notification.isRead && (
                        <Badge className="bg-blue-100 text-blue-600 text-xs">New</Badge>
                      )}
                      <Badge className={`text-xs ${getUrgencyColor(notification.urgency)}`}>
                        {notification.urgency} priority
                      </Badge>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">{notification.message}</p>
                    
                    {/* Match details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600">Match:</span>
                        <span className={`font-semibold ${getMatchColor(notification.matchStrength)}`}>
                          {notification.matchStrength}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Industry:</span>
                        <span className="font-medium">{notification.industry}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{notification.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-xs text-gray-500">{formatDate(notification.createdAt)}</div>
                    <ChevronRight className="h-4 w-4 text-gray-400 mt-1" />
                  </div>
                </div>

                {/* Quick optimization preview */}
                {notification.optimizationTips.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-700">Quick tip to improve your match:</span>
                    </div>
                    <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                      {notification.optimizationTips[0]}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detailed notification modal/expanded view */}
      {selectedNotification && (
        <Card className="mt-6 border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{selectedNotification.title}</CardTitle>
                <p className="text-gray-600 mt-1">{selectedNotification.message}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedNotification(null)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Match strength */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Match Strength</span>
                <span className={`text-lg font-bold ${getMatchColor(selectedNotification.matchStrength)}`}>
                  {selectedNotification.matchStrength}%
                </span>
              </div>
              <Progress value={selectedNotification.matchStrength} className="h-3" />
            </div>

            {/* Required skills */}
            {selectedNotification.requiredSkills.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Skills You Have</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedNotification.requiredSkills.map((skill, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing skills */}
            {selectedNotification.missingSkills.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-gray-900">Skills to Add</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedNotification.missingSkills.map((skill, index) => (
                    <Badge key={index} className="bg-orange-100 text-orange-800">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Optimization tips */}
            {selectedNotification.optimizationTips.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">CV Optimization Tips</h4>
                </div>
                <div className="space-y-2">
                  {selectedNotification.optimizationTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm text-blue-900">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <TrendingUp className="h-4 w-4 mr-2" />
                Optimize My CV
              </Button>
              <Button variant="outline">
                <Star className="h-4 w-4 mr-2" />
                View Similar Jobs
              </Button>
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Set Job Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}