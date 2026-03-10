import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Heart, Zap, Target, Shield, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { Category, QuizMode } from "@/types";

interface PsychConditioningProps {
  onStartQuiz: (category: Category, difficulty: string, mode?: QuizMode) => void;
}

export function PsychConditioning({ onStartQuiz }: PsychConditioningProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Psych Conditioning</h2>
        <p className="text-muted-foreground">Train mental endurance and exam stress control.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <Heart className="w-5 h-5" />
              Stress Resilience Workflow
            </CardTitle>
            <CardDescription>Practice under high-pressure conditions with DB items.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-background rounded-xl border border-emerald-200">
              <h4 className="font-bold text-sm mb-2 uppercase tracking-wider text-emerald-700">Workflow</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>Session begins with timed questions and random difficulty spikes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>Occasionally introduce tricky questions and misleading options.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>Track stress response and mistakes under pressure.</span>
                </li>
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-background rounded-xl border">
                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Focus Score</p>
                <p className="text-2xl font-bold text-emerald-600">78%</p>
              </div>
              <div className="p-4 bg-background rounded-xl border">
                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Resilience Level</p>
                <p className="text-2xl font-bold text-blue-600">High</p>
              </div>
            </div>

            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => onStartQuiz('Logic', 'Hard', 'psych')}
            >
              Start Pressure Test <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Time Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Optimize your pace using database items to ensure you finish on time.</p>
              <Button variant="outline" size="sm" className="w-full" onClick={() => onStartQuiz('Numerical Reasoning', 'Moderate', 'psych')}>Start Drill</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Anxiety Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Techniques to stay calm when encountering unfamiliar database items.</p>
              <Button variant="outline" size="sm" className="w-full" onClick={() => onStartQuiz('Verbal Reasoning', 'Moderate', 'psych')}>Start Drill</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
