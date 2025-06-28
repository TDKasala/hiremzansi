import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ExternalLink, TrendingUp, Mouse, Globe, Smartphone, Monitor, Download } from 'lucide-react';

interface LinkClick {
  id: number;
  linkName: string;
  linkUrl: string;
  page: string;
  device: string;
  browser: string;
  country: string;
  city: string;
  clickedAt: string;
}

interface LinkAnalytics {
  totalClicks: number;
  clicksByLink: Array<{
    linkId: number;
    linkName: string;
    linkUrl: string;
    category: string;
    page: string;
    clickCount: number;
  }>;
  clicksByPage: Array<{
    page: string;
    clickCount: number;
  }>;
  clicksByDevice: Array<{
    device: string;
    clickCount: number;
  }>;
  recentClicks: LinkClick[];
}

interface TopLink {
  linkId: number;
  linkName: string;
  linkUrl: string;
  category: string;
  page: string;
  clickCount: number;
}

interface ClickTrend {
  date: string;
  clickCount: number;
}

const COLORS = ['#4ade80', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const adminQuery = async (endpoint: string) => {
  const token = localStorage.getItem('admin_token');
  const response = await fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

export default function LinkAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30');

  // Fetch analytics overview
  const { data: analytics, isLoading: analyticsLoading } = useQuery<LinkAnalytics>({
    queryKey: ['/api/admin/analytics/overview', timeRange],
    queryFn: () => adminQuery(`/api/admin/analytics/overview?days=${timeRange}`),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch top links
  const { data: topLinks, isLoading: topLinksLoading } = useQuery<TopLink[]>({
    queryKey: ['/api/admin/analytics/top-links', timeRange],
    queryFn: () => adminQuery(`/api/admin/analytics/top-links?limit=10&days=${timeRange}`),
    refetchInterval: 30000,
  });

  // Fetch click trends
  const { data: trends, isLoading: trendsLoading } = useQuery<ClickTrend[]>({
    queryKey: ['/api/admin/analytics/trends', timeRange],
    queryFn: () => adminQuery(`/api/admin/analytics/trends?days=${timeRange}`),
    refetchInterval: 30000,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDeviceIcon = (device: string) => {
    switch (device?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'navigation':
        return 'bg-blue-100 text-blue-800';
      case 'cta':
        return 'bg-green-100 text-green-800';
      case 'social':
        return 'bg-purple-100 text-purple-800';
      case 'referral':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (analyticsLoading || topLinksLoading || trendsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Link Analytics</h2>
            <p className="text-muted-foreground">Track user clicks and engagement across your platform</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Link Analytics</h2>
          <p className="text-muted-foreground">Track user clicks and engagement across your platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const data = analytics ? JSON.stringify(analytics, null, 2) : '{}';
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `link-analytics-${timeRange}days-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">{analytics?.totalClicks?.toLocaleString() || '0'}</p>
              </div>
              <Mouse className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Links</p>
                <p className="text-2xl font-bold">{analytics?.clicksByLink?.length || '0'}</p>
              </div>
              <ExternalLink className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pages with Clicks</p>
                <p className="text-2xl font-bold">{analytics?.clicksByPage?.length || '0'}</p>
              </div>
              <Globe className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Clicks/Day</p>
                <p className="text-2xl font-bold">
                  {analytics?.totalClicks && parseInt(timeRange) 
                    ? Math.round(analytics.totalClicks / parseInt(timeRange)) 
                    : '0'
                  }
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Click Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Click Trends</CardTitle>
            <CardDescription>Daily click patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-ZA')}
                  formatter={(value) => [value, 'Clicks']}
                />
                <Line 
                  type="monotone" 
                  dataKey="clickCount" 
                  stroke="#4ade80" 
                  strokeWidth={2}
                  dot={{ fill: '#4ade80', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
            <CardDescription>Clicks by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.clicksByDevice || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ device, percent }) => `${device} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="clickCount"
                >
                  {analytics?.clicksByDevice?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Clicks']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Links and Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Performing Links */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Links</CardTitle>
            <CardDescription>Most clicked links in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topLinks?.slice(0, 10).map((link, index) => (
                <div key={link.linkId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-600">#{index + 1}</span>
                      <p className="font-medium truncate">{link.linkName}</p>
                      <Badge variant="outline" className={getCategoryColor(link.category)}>
                        {link.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {link.page} → {link.linkUrl}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{link.clickCount}</p>
                    <p className="text-xs text-muted-foreground">clicks</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Click Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest link clicks across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {analytics?.recentClicks?.slice(0, 15).map((click) => (
                <div key={click.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(click.device)}
                    <div>
                      <p className="font-medium text-sm">{click.linkName}</p>
                      <p className="text-xs text-muted-foreground">
                        {click.page} • {click.browser} • {click.city}, {click.country}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(click.clickedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pages Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pages Performance</CardTitle>
          <CardDescription>Click distribution across different pages</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead className="text-center">Total Clicks</TableHead>
                <TableHead className="text-center">Unique Links</TableHead>
                <TableHead className="text-right">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics?.clicksByPage?.map((page) => {
                const pageLinks = analytics.clicksByLink.filter(link => link.page === page.page);
                const performance = analytics.totalClicks > 0 
                  ? ((page.clickCount / analytics.totalClicks) * 100).toFixed(1)
                  : '0.0';
                
                return (
                  <TableRow key={page.page}>
                    <TableCell className="font-medium">{page.page}</TableCell>
                    <TableCell className="text-center">{page.clickCount}</TableCell>
                    <TableCell className="text-center">{pageLinks.length}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">
                        {performance}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}