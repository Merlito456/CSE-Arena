import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Zap, Search, Target, Brain, History, ArrowRight } from "lucide-react";
import { Category, QuizMode } from "@/types";

interface LooksfamArenaProps {
  onStartQuiz: (category: Category, difficulty: string, mode?: QuizMode) => void;
}

export function LooksfamArena({ onStartQuiz }: LooksfamArenaProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Looksfam Arena</h2>
        <p className="text-muted-foreground">Train pattern recognition of frequently repeated exam questions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-indigo-500/20 bg-indigo-500/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Zap className="w-5 h-5" />
              Pattern Recognition Workflow
            </CardTitle>
            <CardDescription>Rapid-fire recognition of common board exam patterns.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-background rounded-xl border border-indigo-200">
              <h4 className="font-bold text-sm mb-2 uppercase tracking-wider text-indigo-700">Workflow</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>System selects frequently repeated exam patterns and high-frequency DB questions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>Rapid-fire session: 30 seconds per question with minimal explanations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>Focus on recognition speed and pattern familiarity index.</span>
                </li>
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-background rounded-xl border">
                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Familiarity Score</p>
                <p className="text-2xl font-bold text-indigo-600">85%</p>
              </div>
              <div className="p-4 bg-background rounded-xl border">
                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Avg. Recognition</p>
                <p className="text-2xl font-bold text-blue-600">0.8s</p>
              </div>
            </div>

            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => onStartQuiz('General Information', 'Moderate', 'looksfam')}
            >
              Start Pattern Blitz <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Historical Bank
            </CardTitle>
            <CardDescription>Questions that frequently reappear.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Master the "classics" that have been part of the Civil Service Exam for over a decade.
            </p>
            <Button variant="outline" className="w-full" onClick={() => onStartQuiz('General Information', 'Easy', 'looksfam')}>Start Session</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
