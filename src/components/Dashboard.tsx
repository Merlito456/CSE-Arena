import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Activity, BookOpen, Trophy, ArrowRight, Flame, Target, Brain, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { aiService } from "@/services/aiService";

interface DashboardProps {
  onNavigate: (view: any) => void;
  userId: string | null;
  stats: {
    totalQuizzes: number;
    questionsAnswered: number;
    accuracy: number;
    dailyQuestions: number;
    streak: number;
    weakestSubject: { category: string; accuracy: number } | null;
  } | null;
}

export function Dashboard({ onNavigate, userId, stats }: DashboardProps) {
  const dailyGoal = 20;
  const dailyProgress = stats?.dailyQuestions || 0;
  const progressPercent = Math.min((dailyProgress / dailyGoal) * 100, 100);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    if (userId && stats && stats.totalQuizzes > 0) {
      setLoadingInsight(true);
      aiService.getPerformanceInsights(userId).then(insight => {
        setAiInsight(insight);
        setLoadingInsight(false);
      });
    }
  }, [userId, stats?.totalQuizzes]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Reviewer!</h1>
        <p className="text-muted-foreground">Here's an overview of your progress today.</p>
      </div>

      {/* Progress & Motivation Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Daily Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span>{dailyProgress} / {dailyGoal} questions</span>
              <span className="font-bold text-primary">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-xs text-muted-foreground mt-3">
              {dailyProgress >= dailyGoal 
                ? "Goal reached! Great job! 🎉" 
                : "Keep going! You're getting closer to your target."}
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-orange-600">{stats?.streak || 0}</span>
              <span className="text-sm text-muted-foreground mb-1">days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Consistency is key to passing the board exam!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendation & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats?.weakestSubject && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-l-4 border-l-primary h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Brain className="w-5 h-5" />
                  AI Practice Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm">
                  We noticed you might need more practice in <span className="font-bold">{stats.weakestSubject?.category || "General Practice"}</span>.
                  Your accuracy is currently {Math.round((stats.weakestSubject?.accuracy || 0) * 100)}%.
                </p>
                <Button 
                  onClick={() => onNavigate('practice')} 
                  className="bg-primary hover:bg-primary/90 text-white w-full"
                >
                  Enter Practice Mode <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-purple-500 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Sparkles className="w-5 h-5" />
                Localized AI Mentor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingInsight ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                  <Brain className="w-4 h-4 animate-bounce" />
                  Analyzing your performance patterns...
                </div>
              ) : aiInsight ? (
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {aiInsight}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Complete more quizzes to unlock personalized AI insights and pattern analysis.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalQuizzes || 0}</div>
            <p className="text-xs text-muted-foreground">Lifetime attempts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.questionsAnswered || 0}</div>
            <p className="text-xs text-muted-foreground">Total practice questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.accuracy || 0}%</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Card className="h-full cursor-pointer border-primary/20 hover:border-primary/50 transition-colors" onClick={() => onNavigate('practice')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Practice Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Access specialized training modules including Recognition Engine, Topnotcher Mode, and more.
              </p>
              <Button className="w-full" variant="secondary">
                Enter Hub <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Card className="h-full cursor-pointer border-primary/20 hover:border-primary/50 transition-colors" onClick={() => onNavigate('mock-exam')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Take Mock Exam
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Simulate the actual Civil Service Exam with mixed questions and time constraints.
              </p>
              <Button className="w-full">
                Start Mock Exam <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
