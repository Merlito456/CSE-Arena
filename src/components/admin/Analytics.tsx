import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, Activity, BookOpen, Brain, DollarSign,
  Users, Zap, Target, TrendingUp, Construction, Crown, FileText
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart } from "recharts";
import { cn } from "@/lib/utils";
import { AnalyticsTab } from "./types";

export const Analytics = () => {
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<AnalyticsTab>("overview");
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [weakTopics, setWeakTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, revRes, weakRes] = await Promise.all([
          fetch("/api/admin/dashboard-stats"),
          fetch("/api/admin/revenue"),
          fetch("/api/admin/weak-topics")
        ]);

        const [statsData, revData, weakData] = await Promise.all([
          statsRes.json(),
          revRes.json(),
          weakRes.json()
        ]);

        setStats(statsData);
        setRevenue(revData);
        setWeakTopics(weakData);
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const analyticsTabs: { id: AnalyticsTab; label: string; icon: any }[] = [
    { id: "overview", label: "Platform Overview", icon: LayoutDashboard },
    { id: "engagement", label: "User Engagement", icon: Activity },
    { id: "content", label: "Content Performance", icon: BookOpen },
    { id: "learning", label: "Learning Insights", icon: Brain },
    { id: "premium", label: "Premium & Revenue", icon: DollarSign },
  ];

  const engagementData = [
    { name: "Mon", active: 400, sessions: 2400 },
    { name: "Tue", active: 550, sessions: 3200 },
    { name: "Wed", active: 500, sessions: 2800 },
    { name: "Thu", active: 650, sessions: 3800 },
    { name: "Fri", active: 800, sessions: 4500 },
    { name: "Sat", active: 950, sessions: 5200 },
    { name: "Sun", active: 1100, sessions: 6000 },
  ];

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {analyticsTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeAnalyticsTab === tab.id ? "default" : "outline"}
            size="sm"
            className="whitespace-nowrap"
            onClick={() => setActiveAnalyticsTab(tab.id)}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {activeAnalyticsTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Users", value: stats?.totalUsers?.toLocaleString() || "0", trend: "+0%", icon: Users, color: "text-blue-600" },
              { label: "Daily Active", value: "0", trend: "+0%", icon: Activity, color: "text-emerald-600" },
              { label: "Quizzes Today", value: "0", trend: "+0%", icon: Zap, color: "text-amber-600" },
              { label: "Avg Accuracy", value: "0%", trend: "+0%", icon: Target, color: "text-indigo-600" },
              { label: "Retention Rate", value: "0%", trend: "+0%", icon: TrendingUp, color: "text-purple-600" },
              { label: "Premium Users", value: stats?.premiumUsers?.toLocaleString() || "0", trend: "+0%", icon: Crown, color: "text-yellow-600" },
              { label: "Monthly Revenue", value: `₱${stats?.revenueToday || 0}`, trend: "+0%", icon: DollarSign, color: "text-green-600" },
              { label: "Questions Ans.", value: "0", trend: "+0%", icon: FileText, color: "text-slate-600" },
            ].map((kpi, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                    <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{kpi.value}</span>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                      {kpi.trend}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over the last 30 days.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={engagementData}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="active" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly recurring revenue growth.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenue}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₱${value}`} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeAnalyticsTab === "content" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Most Attempted Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-slate-400 text-sm">No data available yet</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hardest Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weakTopics.length > 0 ? weakTopics.map((topic, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{topic.topic}</span>
                      <span className="font-bold text-red-600">{topic.failRate}% Fail</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${topic.failRate}%` }} />
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate-400 text-sm">No data available yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeAnalyticsTab === "learning" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Learning Progress Trends</CardTitle>
              <CardDescription>Average accuracy and completion rates over time.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="active" name="Avg Accuracy" stroke="#6366f1" strokeWidth={2} />
                    <Line type="monotone" dataKey="sessions" name="Completion Rate" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Mistake Clusters</CardTitle>
              <CardDescription>Common areas where students struggle.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { category: "Logic Fallacies", count: 450, color: "bg-red-500" },
                  { category: "Complex Math", count: 380, color: "bg-orange-500" },
                  { category: "History Dates", count: 310, color: "bg-amber-500" },
                  { category: "Grammar Rules", count: 240, color: "bg-yellow-500" },
                ].map((cluster, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={cn("w-2 h-10 rounded-full", cluster.color)} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{cluster.category}</p>
                      <p className="text-xs text-muted-foreground">{cluster.count} mistakes recorded</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeAnalyticsTab === "premium" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Conversion Rate</p>
                <p className="text-3xl font-bold">4.2%</p>
                <p className="text-xs text-green-600 mt-1">↑ 0.8% this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Churn Rate</p>
                <p className="text-3xl font-bold">1.8%</p>
                <p className="text-xs text-red-600 mt-1">↓ 0.2% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Trial → Paid</p>
                <p className="text-3xl font-bold">62%</p>
                <p className="text-xs text-indigo-600 mt-1">Industry avg: 45%</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Revenue Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenue}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeAnalyticsTab === "engagement" && (
        <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-white rounded-xl border border-dashed">
          <Construction className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="font-semibold text-slate-900">Analytics Module Coming Soon</h3>
          <p className="text-sm text-slate-500 max-w-xs">
            The {activeAnalyticsTab} detailed analytics interface is currently under development.
          </p>
        </div>
      )}
    </div>
  );
};
