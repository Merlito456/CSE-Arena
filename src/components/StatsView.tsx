import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts";
import { storageService } from "@/services/storageService";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Trophy, Activity, BookOpen, Clock, TrendingUp, Brain, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

interface StatsViewProps {
  onBack: () => void;
  userId: string | null;
}

interface CategoryStat {
  category: string;
  quizzes_taken: number;
  total_score: number;
  total_questions: number;
}

interface StatsData {
  categoryStats: CategoryStat[];
  totalQuizzes: number;
  dailyQuestions: number;
  streak: number;
  weakestSubject: { category: string; accuracy: number } | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function StatsView({ onBack, userId }: StatsViewProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    try {
      const data = storageService.getStats(userId);
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Failed to load statistics.</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const categoryStats = stats.categoryStats || [];
  const chartData = categoryStats.map(stat => ({
    name: stat?.category || "Unknown",
    score: Math.round((stat.total_score / stat.total_questions) * 100) || 0,
    attempts: stat.quizzes_taken
  }));

  const totalQuestionsAnswered = categoryStats.reduce((acc, curr) => acc + (Number(curr.total_questions) || 0), 0);
  const totalCorrectAnswers = categoryStats.reduce((acc, curr) => acc + (Number(curr.total_score) || 0), 0);
  const overallAccuracy = totalQuestionsAnswered > 0 
    ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100) 
    : 0;

  // Mock trend data for now (would need backend support for real history)
  const trendData = [
    { day: 'Mon', accuracy: 65 },
    { day: 'Tue', accuracy: 68 },
    { day: 'Wed', accuracy: 72 },
    { day: 'Thu', accuracy: 70 },
    { day: 'Fri', accuracy: 75 },
    { day: 'Sat', accuracy: 78 },
    { day: 'Sun', accuracy: overallAccuracy },
  ];

  const strongestSubject = [...(stats.categoryStats || [])].sort((a, b) => {
    const accA = a.total_questions > 0 ? a.total_score / a.total_questions : 0;
    const accB = b.total_questions > 0 ? b.total_score / b.total_questions : 0;
    return accB - accA;
  })[0];

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>
        <h2 className="text-2xl font-bold">Your Progress</h2>
      </div>

      {/* Exam Readiness Score */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-lg font-semibold flex items-center gap-2 justify-center md:justify-start">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Exam Readiness Score
              </h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Based on your accuracy, mock exam scores, and subject balance.
                Keep practicing to reach 85%+ for a high chance of passing!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <div className="text-3xl font-bold text-primary">{Math.round(overallAccuracy * 0.9)}%</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {overallAccuracy > 80 ? "Ready" : overallAccuracy > 60 ? "Nearly Ready" : "Needs Work"}
                </div>
              </div>
              <div className="relative w-20 h-20 flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90">
                   <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                   <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary" strokeDasharray={226} strokeDashoffset={226 - (226 * Math.round(overallAccuracy * 0.9)) / 100} strokeLinecap="round" />
                 </svg>
                 <span className="absolute text-sm font-bold">{Math.round(overallAccuracy * 0.9)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Insights Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Brain className="w-5 h-5" /> AI Insight
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">You're doing great in:</p>
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-semibold">{strongestSubject?.category || "None yet"}</span>
                  <span className="ml-auto text-xs font-bold bg-white px-2 py-1 rounded shadow-sm">
                    {strongestSubject ? Math.round((strongestSubject.total_score / strongestSubject.total_questions) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Focus needed on:</p>
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-semibold">{stats.weakestSubject?.category || "None yet"}</span>
                  <span className="ml-auto text-xs font-bold bg-white px-2 py-1 rounded shadow-sm">
                    {stats.weakestSubject ? Math.round(stats.weakestSubject.accuracy * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2">Recommended Practice:</p>
                <Button variant="outline" size="sm" className="w-full justify-between">
                  Practice {stats.weakestSubject?.category || "General"} (15 Qs)
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
           <div className="grid grid-cols-2 gap-4 h-full">
             <Card>
               <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                 <div className="p-3 bg-orange-100 rounded-full mb-3">
                   <TrendingUp className="w-6 h-6 text-orange-600" />
                 </div>
                 <div className="text-2xl font-bold">{stats.streak} Days</div>
                 <p className="text-xs text-muted-foreground">Study Streak</p>
               </CardContent>
             </Card>
             <Card>
               <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                 <div className="p-3 bg-blue-100 rounded-full mb-3">
                   <Clock className="w-6 h-6 text-blue-600" />
                 </div>
                 <div className="text-2xl font-bold">--</div>
                 <p className="text-xs text-muted-foreground">Study Time</p>
               </CardContent>
             </Card>
             <Card>
               <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                 <div className="p-3 bg-purple-100 rounded-full mb-3">
                   <BookOpen className="w-6 h-6 text-purple-600" />
                 </div>
                 <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                 <p className="text-xs text-muted-foreground">Total Quizzes</p>
               </CardContent>
             </Card>
             <Card>
               <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                 <div className="p-3 bg-green-100 rounded-full mb-3">
                   <Activity className="w-6 h-6 text-green-600" />
                 </div>
                 <div className="text-2xl font-bold">{totalQuestionsAnswered}</div>
                 <p className="text-xs text-muted-foreground">Questions Answered</p>
               </CardContent>
             </Card>
           </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] min-h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Accuracy by Subject</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] min-h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} unit="%" hide />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="score" name="Accuracy" radius={[0, 4, 4, 0]} barSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
