import { useState, useEffect } from "react";
import { Question, QuizState } from "@/types";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, ArrowRight, Flag, Clock, Grid, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Markdown from "react-markdown";

interface QuizInterfaceProps {
  questions: Question[];
  onFinish: (score: number, answers: Record<string, number>) => void;
  onExit: () => void;
  isMockExam?: boolean;
}

export function QuizInterface({ questions, onFinish, onExit, isMockExam = false }: QuizInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Timer State
  const [timeElapsed, setTimeElapsed] = useState(0); // in seconds
  const [timeLeft, setTimeLeft] = useState(questions.length * 60); // 1 minute per question for mock

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
      if (isMockExam) {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isMockExam]);

  // Restore selection if question was already answered
  useEffect(() => {
    const currentQId = questions[currentIndex].id;
    if (answers[currentQId] !== undefined) {
      setSelectedOption(answers[currentQId]);
      // If not mock exam, show explanation immediately if answered
      if (!isMockExam) {
        setShowExplanation(true);
      }
    } else {
      setSelectedOption(null);
      setShowExplanation(false);
    }
  }, [currentIndex, questions, answers, isMockExam]);

  const currentQuestion = questions[currentIndex];
  const progress = ((Object.keys(answers).length) / questions.length) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (index: number) => {
    if (showExplanation && !isMockExam) return; // Prevent changing answer in practice mode if already submitted
    setSelectedOption(index);
  };

  const handleToggleFlag = () => {
    setFlagged(prev => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id]
    }));
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    
    const newAnswers = { ...answers, [currentQuestion.id]: selectedOption };
    setAnswers(newAnswers);
    
    if (!isMockExam) {
      setShowExplanation(true);
    } else {
      // In mock exam, auto advance or just save? 
      // Usually in mock exams you just select and move on.
      // Let's just save selection. User manually clicks next.
    }
  };

  const handleNext = () => {
    // If mock exam, save answer on navigation if selected
    if (isMockExam && selectedOption !== null) {
       setAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedOption }));
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleJumpTo = (index: number) => {
    if (isMockExam && selectedOption !== null) {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedOption }));
    }
    setCurrentIndex(index);
  };

  const handleFinish = () => {
    // Calculate score
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswerIndex) {
        score++;
      }
    });
    onFinish(score, answers);
  };

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-4 space-y-4 md:space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 bg-card p-4 rounded-xl border shadow-sm sticky top-0 z-20 md:static">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onExit} size="icon" className="h-8 w-8 md:hidden">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" onClick={onExit} size="sm" className="hidden md:flex text-muted-foreground hover:text-foreground">
              Exit
            </Button>
            
            <Badge variant="outline" className="text-xs truncate max-w-[120px] md:max-w-none">
              {isMockExam ? "Mock Exam" : currentQuestion.category}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1 text-sm font-mono bg-muted px-2 py-1 rounded">
              <Clock className="w-3 h-3" />
              {isMockExam ? formatTime(timeLeft) : formatTime(timeElapsed)}
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
                  <Grid className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Question Navigator</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {questions.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isFlagged = flagged[q.id];
                    const isCurrent = idx === currentIndex;
                    
                    return (
                      <button
                        key={q.id}
                        onClick={() => handleJumpTo(idx)}
                        className={cn(
                          "h-10 w-10 rounded-md flex items-center justify-center text-sm font-medium transition-colors border",
                          isCurrent ? "ring-2 ring-primary ring-offset-2 border-primary" : "border-transparent bg-muted",
                          isAnswered && !isCurrent && "bg-primary/20 text-primary",
                          isFlagged && "ring-2 ring-yellow-500 ring-offset-1"
                        )}
                      >
                        {idx + 1}
                        {isFlagged && <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full -mr-1 -mt-1" />}
                      </button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full">
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap w-12">
            {currentIndex + 1} / {questions.length}
          </span>
          <Progress value={progress} className="h-2 flex-1" />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="pb-20 md:pb-0"
        >
          <Card className="min-h-[400px] flex flex-col border-0 md:border shadow-none md:shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-4 px-0 md:px-6">
              <CardTitle className="text-lg md:text-xl leading-relaxed font-medium">
                {currentQuestion.text}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleToggleFlag}
                className={cn(flagged[currentQuestion.id] ? "text-yellow-500" : "text-muted-foreground")}
              >
                <Flag className={cn("w-5 h-5", flagged[currentQuestion.id] && "fill-current")} />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 px-0 md:px-6">
              {currentQuestion.options.map((option, index) => {
                let variant = "outline";
                let icon = null;
                
                // Logic for styling based on state
                const isSelected = selectedOption === index;
                const isCorrect = index === currentQuestion.correctAnswerIndex;
                const isRevealed = showExplanation && !isMockExam;

                if (isRevealed) {
                  if (isCorrect) {
                    icon = <CheckCircle2 className="w-4 h-4 ml-auto text-green-500" />;
                  } else if (isSelected && !isCorrect) {
                    icon = <XCircle className="w-4 h-4 ml-auto text-red-500" />;
                  }
                }

                const getClassName = () => {
                   if (isRevealed) {
                       if (isCorrect) return "border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100";
                       if (isSelected && !isCorrect) return "border-red-500 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-100";
                   }
                   if (isSelected) return "border-primary bg-primary/5 ring-1 ring-primary";
                   return "hover:bg-accent";
                };

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center p-4 border rounded-lg cursor-pointer transition-all active:scale-[0.99]",
                      getClassName()
                    )}
                    onClick={() => handleSelectOption(index)}
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border mr-3 text-xs text-muted-foreground shrink-0">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="flex-1 font-medium text-sm md:text-base">{option}</div>
                    {icon}
                  </div>
                );
              })}
            </CardContent>
            
            {/* Explanation Area (Practice Mode Only) */}
            {showExplanation && !isMockExam && (
              <div className="px-0 md:px-6 pb-4">
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-muted/50 p-4 rounded-lg text-sm"
                >
                  <p className="font-semibold mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> 
                    Explanation
                  </p>
                  <div className="text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                    <Markdown>{currentQuestion.explanation}</Markdown>
                  </div>
                </motion.div>
              </div>
            )}

            <CardFooter className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:static md:bg-transparent md:border-t-0 md:p-6 z-20">
              <div className="flex justify-between items-center w-full gap-4 max-w-4xl mx-auto">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious} 
                  disabled={currentIndex === 0}
                  className="flex-1 md:flex-none"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Prev
                </Button>

                {!isMockExam ? (
                  !showExplanation ? (
                    <Button 
                      onClick={handleSubmitAnswer} 
                      disabled={selectedOption === null}
                      className="flex-1 md:min-w-[120px]"
                    >
                      Submit
                    </Button>
                  ) : (
                    <Button onClick={handleNext} className="flex-1 md:min-w-[120px]">
                      {currentIndex < questions.length - 1 ? "Next" : "Finish"} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )
                ) : (
                  <Button onClick={handleNext} className="flex-1 md:min-w-[120px]">
                    {currentIndex < questions.length - 1 ? "Next" : "Finish"} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
