import { Question } from "@/types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle2, XCircle, RefreshCw, Home } from "lucide-react";
import { motion } from "motion/react";
import Markdown from "react-markdown";

interface ResultsViewProps {
  score: number;
  total: number;
  questions: Question[];
  answers: Record<string, number>;
  onRetry: () => void;
  onHome: () => void;
}

export function ResultsView({ score, total, questions, answers, onRetry, onHome }: ResultsViewProps) {
  const percentage = Math.round((score / total) * 100);
  
  let message = "Keep practicing!";
  let color = "text-red-500";
  if (percentage >= 80) {
    message = "Excellent work!";
    color = "text-green-500";
  } else if (percentage >= 50) {
    message = "Good job!";
    color = "text-yellow-500";
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block"
        >
          <div className="text-6xl font-bold mb-2">{percentage}%</div>
          <div className={`text-xl font-medium ${color}`}>{message}</div>
          <div className="text-muted-foreground mt-2">
            You scored {score} out of {total}
          </div>
        </motion.div>
        
        <div className="flex justify-center gap-4 pt-4">
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={onHome}>
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Review Answers</h3>
        {questions.map((q, index) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correctAnswerIndex;

          return (
            <Card key={q.id} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base font-medium">
                    <span className="text-muted-foreground mr-2">{index + 1}.</span>
                    {q.text}
                  </CardTitle>
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="grid grid-cols-1 gap-1">
                  {q.options.map((opt, i) => (
                    <div 
                      key={i} 
                      className={`p-2 rounded ${
                        i === q.correctAnswerIndex 
                          ? "bg-green-100 text-green-800 font-medium" 
                          : i === userAnswer 
                            ? "bg-red-100 text-red-800" 
                            : "text-muted-foreground"
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-muted-foreground bg-muted/30 p-3 rounded">
                  <span className="font-semibold text-foreground mb-1 block">Explanation: </span>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <Markdown>{q.explanation}</Markdown>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
