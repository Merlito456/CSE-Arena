import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Signal, Target, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category, QuizMode } from "@/types";

interface DifficultyLadderProps {
  onStartQuiz: (category: Category, difficulty: string, mode?: QuizMode) => void;
}

export function DifficultyLadder({ onStartQuiz }: DifficultyLadderProps) {
  const levels = [
    { id: 1, title: "Easy", difficulty: "Easy", status: "Completed", color: "text-green-600", bgColor: "bg-green-50" },
    { id: 2, title: "Moderate", difficulty: "Moderate", status: "Active", color: "text-blue-600", bgColor: "bg-blue-50" },
    { id: 3, title: "Hard", difficulty: "Hard", status: "Locked", color: "text-orange-600", bgColor: "bg-orange-50" },
    { id: 4, title: "Elite", difficulty: "Elite", status: "Locked", color: "text-red-600", bgColor: "bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Difficulty Ladder</h2>
        <p className="text-muted-foreground">Gradually increase challenge as you master each level.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mb-6">
            <h4 className="font-bold text-sm mb-2 uppercase tracking-wider text-primary">Ladder Workflow</h4>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Start at Easy level. Pass with 80%+ to move to Moderate.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Pass Moderate to unlock Hard, and Hard to unlock Elite.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Failing a level will step you down one level for reinforcement.</span>
              </li>
            </ul>
          </div>

          {levels.map((level) => (
            <Card key={level.id} className={cn(
              "transition-all",
              level.status === "Active" ? "ring-2 ring-primary border-primary/20" : "opacity-70"
            )}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl", level.bgColor, level.color)}>
                  {level.id}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold">{level.title}</h4>
                    {level.status === "Completed" && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                    {level.status === "Locked" && <Lock className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{level.difficulty} Difficulty</p>
                </div>
                {level.status === "Active" && (
                  <Button size="sm" onClick={() => onStartQuiz('Numerical Reasoning', level.difficulty, 'ladder')}>Start</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit sticky top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Your Progress
            </CardTitle>
            <CardDescription>Climb the ladder to reach board-level mastery.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Mastery</span>
                <span className="font-bold">35%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '35%' }} />
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-xl border space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Level</h5>
              <p className="text-sm font-medium">Moderate</p>
            </div>

            <Button className="w-full" onClick={() => onStartQuiz('Verbal Reasoning', 'Moderate', 'ladder')}>
              Continue Current Level <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
