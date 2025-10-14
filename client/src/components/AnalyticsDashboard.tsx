import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  BarChart3,
  Activity,
  Calendar,
  Target,
  MousePointer,
  Timer,
} from "lucide-react";

interface DetailedAnalytics {
  totalVisitors: number;
  uniqueVisitors: number;
  totalSessions: number;
  totalPageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ url: string; title: string; views: number }>;
  trafficSources: Array<{ source: string; sessions: number; percentage: number }>;
  deviceStats: Array<{ device: string; visitors: number; percentage: number }>;
  realtimeData: {
    activeUsers: number;
    todayViews: number;
    todayVisitors: number;
  };
  hourlyStats: Array<{ hour: number; views: number; visitors: number }>;
  dailyStats: Array<{ date: string; views: number; visitors: number; sessions: number }>;
}

export default function AnalyticsDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");

  const { data: analytics, isLoading } = useQuery<DetailedAnalytics>({
    queryKey: ["detailed-analytics"],
    queryFn: () => fetch("/api/analytics/detailed").then(r => r.json()),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      case 'desktop': return <Monitor className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'organic': return 'bg-green-100 text-green-800';
      case 'direct': return 'bg-blue-100 text-blue-800';
      case 'social': return 'bg-purple-100 text-purple-800';
      case 'referral': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Real-time insights and visitor analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Live Data
          </Badge>
        </div>
      </div>

      {/* Real-time Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold text-green-600">{analytics.realtimeData.activeUsers}</p>
              <p className="text-xs text-muted-foreground">Last hour</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today's Views</p>
              <p className="text-2xl font-bold">{formatNumber(analytics.realtimeData.todayViews)}</p>
              <p className="text-xs text-muted-foreground">Page views today</p>
            </div>
            <Eye className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today's Visitors</p>
              <p className="text-2xl font-bold">{formatNumber(analytics.realtimeData.todayVisitors)}</p>
              <p className="text-xs text-muted-foreground">Unique visitors</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Session</p>
              <p className="text-2xl font-bold">{formatDuration(analytics.avgSessionDuration)}</p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </div>
            <Timer className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Visitors</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.totalVisitors)}</p>
                  <p className="text-xs text-green-600">{analytics.uniqueVisitors} unique</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MousePointer className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.totalSessions)}</p>
                  <p className="text-xs text-muted-foreground">{analytics.bounceRate.toFixed(1)}% bounce rate</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.totalPageViews)}</p>
                  <p className="text-xs text-muted-foreground">Total interactions</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Hourly Activity Chart (Simple) */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Hourly Activity (Last 24 Hours)
            </h3>
            <div className="space-y-2">
              {analytics.hourlyStats.slice(-12).map((hour, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 text-sm text-muted-foreground">
                    {hour.hour}:00
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <div className="flex-1 bg-blue-100 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min((hour.views / Math.max(...analytics.hourlyStats.map(h => h.views))) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex-1 bg-green-100 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${Math.min((hour.visitors / Math.max(...analytics.hourlyStats.map(h => h.visitors))) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="w-16 text-xs text-right">
                    {hour.views}v / {hour.visitors}u
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Traffic Sources
            </h3>
            <div className="space-y-3">
              {analytics.trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getSourceColor(source.source)}>
                      {source.source}
                    </Badge>
                    <span className="font-medium">{source.sessions} sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-12">
                      {source.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Device Breakdown
            </h3>
            <div className="space-y-3">
              {analytics.deviceStats.map((device, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(device.device)}
                    <span className="font-medium capitalize">{device.device}</span>
                    <span className="text-muted-foreground">{device.visitors} visitors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-12">
                      {device.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Top Performing Pages
            </h3>
            <div className="space-y-3">
              {analytics.topPages.slice(0, 10).map((page, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm truncate">{page.title || page.url}</h4>
                      <p className="text-xs text-muted-foreground truncate">{page.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{page.views}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}