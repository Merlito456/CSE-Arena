import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, TrendingUp, TrendingDown, DollarSign, Zap, 
  Target, AlertTriangle, FileText, UserPlus, Brain
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

export const AdminDashboardHome = () => {
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [weakTopics, setWeakTopics] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, revRes, weakRes, leadRes] = await Promise.all([
          fetch("/api/admin/dashboard-stats").catch(() => null),
          fetch("/api/admin/revenue").catch(() => null),
          fetch("/api/admin/weak-topics").catch(() => null),
          fetch("/api/admin/leaderboard").catch(() => null)
        ]);

        const statsData = statsRes?.ok ? await statsRes.json().catch(() => null) : null;
        const revData = revRes?.ok ? await revRes.json().catch(() => []) : [];
        const weakData = weakRes?.ok ? await weakRes.json().catch(() => []) : [];
        const leadData = leadRes?.ok ? await leadRes.json().catch(() => []) : [];

        setStats(statsData || { totalUsers: 0, premiumUsers: 0, totalQuizzes: 0, aiUsageToday: 0 });
        setRevenue(revData || []);
        setWeakTopics(weakData || []);
        setLeaderboard(leadData || []);
      } catch (error) {
        console.error("Failed to fetch admin dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats?.totalUsers?.toLocaleString() || "0", trend: "+0%", up: true, icon: Users, color: "text-blue-600" },
          { label: "Premium Users", value: stats?.premiumUsers?.toLocaleString() || "0", trend: "+0%", up: true, icon: Zap, color: "text-amber-600" },
          { label: "Total Quizzes", value: stats?.totalQuizzes?.toLocaleString() || "0", trend: "+0%", up: true, icon: Target, color: "text-green-600" },
          { label: "AI Usage Today", value: stats?.aiUsageToday?.toLocaleString() || "0", trend: "+0%", up: true, icon: Brain, color: "text-indigo-600" },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                <kpi.icon className={cn("h-4 w-4", kpi.color)} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{kpi.value}</span>
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5",
                  kpi.up ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                )}>
                  {kpi.up ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
                  {kpi.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Activity</CardTitle>
            <CardDescription>Monthly revenue growth and user engagement trends.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] min-h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₱${value}`} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weakest Topics */}
        <Card>
          <CardHeader>
            <CardTitle>Weak Topic Analytics</CardTitle>
            <CardDescription>Topics where users struggle the most.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {weakTopics.length > 0 ? weakTopics.map((topic, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{topic.topic}</span>
                  <span className="text-red-600 font-bold">{topic.failRate}% Fail Rate</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full" 
                    style={{ width: `${topic.failRate}%` }} 
                  />
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-400 text-sm">No data available yet</div>
            )}
            <Button variant="outline" className="w-full text-xs">
              <Zap className="w-3 h-3 mr-2" /> Generate Targeted Content
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard Snapshot */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Current leaderboard leaders.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.length > 0 ? leaderboard.map((user) => (
                <div key={user.rank} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                      {user.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-[10px] text-slate-500">Rank #{user.rank}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100">
                    {user.score}
                  </Badge>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-400 text-sm">No leaderboard data yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Critical updates and notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900">AI Quota Warning</p>
                <p className="text-xs text-amber-700">Daily generation limit is at 85%. Consider upgrading plan.</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">Failed Payments</p>
                <p className="text-xs text-red-700">12 premium subscriptions failed to renew today.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
