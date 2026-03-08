import { useState, useEffect } from "react";
import { Category, Question, QuizMode } from "@/types";
import { getQuestionsFromDB } from "@/services/questions";
import { SubjectSelector } from "@/components/SubjectSelector";
import { QuizInterface } from "@/components/QuizInterface";
import { ResultsView } from "@/components/ResultsView";
import { BrainProfileView } from "@/components/BrainProfileView";
import { StatsView } from "@/components/StatsView";
import { Loading } from "@/components/Loading";
import { Sidebar, ViewState } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { PracticeMode } from "@/components/PracticeMode";
import { ExamHistory } from "@/components/ExamHistory";
import { MiniQuizView } from "@/components/MiniQuizView";
import { FlashcardView } from "@/components/FlashcardView";
import { FlashcardInterface } from "@/components/FlashcardInterface";
import { StudyPlannerView } from "@/components/StudyPlannerView";
import { LeaderboardView } from "@/components/LeaderboardView";
import { AchievementsView } from "@/components/AchievementsView";
import { PremiumView } from "@/components/PremiumView";
import { SettingsView } from "@/components/SettingsView";
import { LoginView } from "@/components/LoginView";
import { AdminDashboard } from "@/components/AdminDashboard";
import { storageService } from "@/services/storageService";
import { aiService } from "@/services/aiService";
import { motion, AnimatePresence } from "motion/react";
import { Menu, Clock, AlertCircle, CheckCircle2, Brain, BookOpenCheck, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [currentView, setCurrentView] = useState<ViewState>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Quiz State
  const [quizActive, setQuizActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isMockExam, setIsMockExam] = useState(false);
  const [quizMode, setQuizMode] = useState<QuizMode>("standard");
  const [responseTimes, setResponseTimes] = useState<Record<string, number>>({});
  const [practiceSubView, setPracticeSubView] = useState<string>("hub");
  
  // Flashcard State
  const [flashcardActive, setFlashcardActive] = useState(false);
  const [currentDeck, setCurrentDeck] = useState<{ id: string; title: string; cards: any[] } | null>(null);

  // Mock Exam Settings
  const [mockSettings, setMockSettings] = useState({
    questionCount: 20,
    timeMode: "mini" as "full" | "mini",
    difficulty: "Mixed" as "Mixed" | "Easy" | "Moderate" | "Hard" | "Adaptive",
  });

  // Dashboard Stats State
  const [dashboardStats, setDashboardStats] = useState<{
    totalQuizzes: number;
    questionsAnswered: number;
    accuracy: number;
    dailyQuestions: number;
    streak: number;
    weakestSubject: { category: string; accuracy: number } | null;
  } | null>(null);

  useEffect(() => {
    if (userId) {
      fetchStats();
    }
  }, [currentView, userId]);

  const fetchStats = async () => {
    if (!userId) return;
    if (userId === "GUEST") {
      const data = storageService.getStats(userId);
      setDashboardStats(data);
      return;
    }
    try {
      const res = await fetch(`/api/stats?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data);
      } else {
        // Fallback to local
        const data = storageService.getStats(userId);
        setDashboardStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
      const data = storageService.getStats(userId);
      setDashboardStats(data);
    }
  };

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    setQuizActive(false);
    setIsMockExam(false);
  };

  const handleSelectCategory = async (category: Category, difficulty: string, mode: QuizMode = 'standard') => {
    setLoading(true);
    setSelectedCategory(category);
    setQuizMode(mode);
    setIsMockExam(mode === 'simulation');
    try {
      const generatedQuestions = await getQuestionsFromDB(category, mode === 'quick-start' ? 5 : 10, difficulty);
      setQuestions(generatedQuestions);
      setQuizActive(true);
    } catch (error) {
      console.error("Failed to start quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMockExam = async () => {
    setLoading(true);
    setIsMockExam(true);
    setQuizMode('simulation');
    setSelectedCategory(null); // Mock exam has mixed categories
    try {
      // Generate questions from multiple categories based on settings
      const countPerCategory = Math.ceil(mockSettings.questionCount / 4);
      const categories: Category[] = ['Numerical Reasoning', 'Verbal Reasoning', 'General Information', 'Logic'];
      
      // Use selected difficulty, or "Moderate" if Mixed/Adaptive (Adaptive logic would be handled by prompt engineering or post-processing in a real app)
      const difficulty = mockSettings.difficulty === "Mixed" || mockSettings.difficulty === "Adaptive" ? "Moderate" : mockSettings.difficulty;
      
      const promises = categories.map(cat => getQuestionsFromDB(cat, countPerCategory, difficulty));
      const results = await Promise.all(promises);
      
      // Flatten and trim to exact count
      const mixedQuestions = results.flat().sort(() => Math.random() - 0.5).slice(0, mockSettings.questionCount);
      
      setQuestions(mixedQuestions);
      setQuizActive(true);
    } catch (error) {
      console.error("Failed to start mock exam:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishQuiz = async (finalScore: number, finalAnswers: Record<string, number>, finalResponseTimes: Record<string, number>) => {
    setScore(finalScore);
    setAnswers(finalAnswers);
    setResponseTimes(finalResponseTimes);
    setQuizActive(false);
    
    if (userId) {
      const resultData = {
        category: isMockExam ? "Mock Exam" : (selectedCategory || "General"),
        score: finalScore,
        totalQuestions: questions.length,
        answers: finalAnswers,
        questions: questions,
        userId: userId,
        mode: quizMode,
        responseTimes: finalResponseTimes
      };

      // Save locally as fallback
      storageService.saveResult(resultData);

      if (userId !== "GUEST") {
        try {
          const res = await fetch("/api/results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resultData),
          });
          if (!res.ok) {
            const errorData = await res.json();
            console.error("Failed to save result to database:", errorData);
          }
        } catch (error) {
          console.error("Network error saving result to database:", error);
        }
      }
      
      fetchStats(); // Refresh dashboard stats
    }
  };

  const handleExitQuiz = () => {
    setQuizActive(false);
    setQuestions([]);
    setScore(0);
    setAnswers({});
    setSelectedCategory(null);
    setIsMockExam(false);
    // Return to previous view
    if (isMockExam) setCurrentView("mock-exam");
    else setCurrentView("subjects");
  };

  const handleRetry = () => {
    if (isMockExam) {
      handleStartMockExam();
    } else if (selectedCategory) {
      handleSelectCategory(selectedCategory, "Moderate");
    } else {
      handleExitQuiz();
    }
  };

  const handleStartMiniQuiz = async (type: string, config: any) => {
    setLoading(true);
    setIsMockExam(false);
    setSelectedCategory(null);
    
    try {
      let quizQuestions: Question[] = [];
      
      if (type === "daily" || type === "ai-smart") {
        // For daily/smart, we mix categories
        // In a real app, "ai-smart" would fetch specific weak areas
        const categories: Category[] = ['Numerical Reasoning', 'Verbal Reasoning', 'General Information', 'Logic'];
        const countPerCategory = 2; // 2 * 4 = 8 questions, slice to 5
        const promises = categories.map(cat => getQuestionsFromDB(cat, countPerCategory, config.difficulty));
        const results = await Promise.all(promises);
        quizQuestions = results.flat().sort(() => Math.random() - 0.5).slice(0, config.count);
      } else {
        // Specific category
        quizQuestions = await getQuestionsFromDB(config.category, config.count, config.difficulty);
      }
      
      setQuestions(quizQuestions);
      setQuizActive(true);
    } catch (error) {
      console.error("Failed to start mini quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartFlashcards = async (deckId: string, title: string) => {
    setLoading(true);
    try {
      // Local fallback flashcards since we're removing API calls
      const localFlashcards = [
        { id: "1", question: "What is the capital of the Philippines?", answer: "Manila" },
        { id: "2", question: "Who is the national hero of the Philippines?", answer: "Jose Rizal" },
        { id: "3", question: "What is the largest island in the Philippines?", answer: "Luzon" }
      ];
      setCurrentDeck({ id: deckId, title, cards: localFlashcards });
      setFlashcardActive(true);
    } catch (error) {
      console.error("Failed to fetch flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExitFlashcards = () => {
    setFlashcardActive(false);
    setCurrentDeck(null);
  };

  // Placeholder component for new features
  const PlaceholderView = ({ title, icon: Icon, description }: any) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 space-y-4">
      <div className="p-4 bg-primary/10 rounded-full">
        <Icon className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground max-w-md">{description}</p>
      <Button onClick={() => handleNavigate('dashboard')}>Back to Dashboard</Button>
    </div>
  );

  // Render Content Logic
  const renderContent = () => {
    if (loading) return <Loading />;

    if (quizActive) {
      return (
        <QuizInterface
          questions={questions}
          onFinish={handleFinishQuiz}
          onExit={handleExitQuiz}
          isMockExam={isMockExam}
          mode={quizMode}
        />
      );
    }

    if (flashcardActive && currentDeck) {
      return (
        <FlashcardInterface
          deckTitle={currentDeck.title}
          cards={currentDeck.cards}
          onExit={handleExitFlashcards}
        />
      );
    }

    // If we have questions and answers but quiz is not active, show results
    if (questions.length > 0 && Object.keys(answers).length > 0) {
      if (quizMode === 'recognition') {
        return (
          <BrainProfileView
            score={score}
            total={questions.length}
            questions={questions}
            answers={answers}
            responseTimes={responseTimes}
            onRetry={handleRetry}
            onHome={handleExitQuiz}
            onNavigateToPractice={(subView) => {
              setPracticeSubView(subView);
              handleExitQuiz();
              setCurrentView('practice');
            }}
          />
        );
      }
      return (
        <ResultsView
          score={score}
          total={questions.length}
          questions={questions}
          answers={answers}
          onRetry={handleRetry}
          onHome={handleExitQuiz}
        />
      );
    }

    switch (currentView) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} userId={userId} stats={dashboardStats} />;
      case "subjects":
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold tracking-tight">Subject Review</h2>
              <p className="text-muted-foreground">Select a topic to start practicing.</p>
            </div>
            <SubjectSelector onSelect={handleSelectCategory} userId={userId} />
          </div>
        );
      case "mock-exam":
        return (
          <div className="space-y-6">
             <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold tracking-tight">Mock Board Exam</h2>
              <p className="text-muted-foreground">Simulate the actual examination experience.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-card border rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">Exam Settings</h3>
                  <p className="text-sm text-muted-foreground">Customize your mock exam experience.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Exam Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={mockSettings.timeMode === "mini" ? "default" : "outline"}
                        onClick={() => setMockSettings(s => ({ ...s, timeMode: "mini", questionCount: 20 }))}
                      >
                        Mini Mock (20 Qs)
                      </Button>
                      <Button 
                        variant={mockSettings.timeMode === "full" ? "default" : "outline"}
                        onClick={() => setMockSettings(s => ({ ...s, timeMode: "full", questionCount: 50 }))}
                      >
                        Full Exam (50 Qs)
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Mixed", "Easy", "Moderate", "Hard"].map(diff => (
                        <Button
                          key={diff}
                          variant={mockSettings.difficulty === diff ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMockSettings(s => ({ ...s, difficulty: diff as any }))}
                        >
                          {diff}
                        </Button>
                      ))}
                    </div>
                    <Button 
                      variant={mockSettings.difficulty === "Adaptive" ? "default" : "outline"}
                      className="w-full mt-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                      onClick={() => setMockSettings(s => ({ ...s, difficulty: "Adaptive" }))}
                    >
                      <Brain className="w-4 h-4 mr-2" /> AI Adaptive Mode ⭐
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Exam Rules</label>
                    <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>Time Limit: {mockSettings.questionCount} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                        <span>Auto-submit when time ends</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                        <span>Score shown after completion</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">AI Prediction</span>
                      <Badge variant="outline" className="bg-background">Based on recent activity</Badge>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-primary">
                        {dashboardStats?.accuracy ? Math.round(dashboardStats.accuracy * 0.85) : 0}%
                      </span>
                      <span className="text-sm text-muted-foreground mb-1">Passing Chance</span>
                    </div>
                    <Progress value={dashboardStats?.accuracy ? Math.round(dashboardStats.accuracy * 0.85) : 0} className="h-2 mt-2" />
                  </div>

                  <Button onClick={handleStartMockExam} size="lg" className="w-full">
                    Start Exam ({mockSettings.questionCount} Questions)
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                   <h4 className="font-semibold text-blue-800 mb-2">Exam Coverage</h4>
                   <ul className="space-y-2 text-sm text-blue-700">
                     <li className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-blue-500" />
                       Numerical Reasoning (25%)
                     </li>
                     <li className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-green-500" />
                       Verbal Reasoning (25%)
                     </li>
                     <li className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-yellow-500" />
                       General Information (25%)
                     </li>
                     <li className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-red-500" />
                       Logic (25%)
                     </li>
                   </ul>
                </div>
              </div>
            </div>
          </div>
        );
      case "stats":
        return <StatsView onBack={() => handleNavigate("dashboard")} userId={userId} />;
      case "practice":
        return (
          <PracticeMode 
            onBack={() => handleNavigate("dashboard")} 
            onStartQuiz={handleSelectCategory}
            onStartMockExam={handleStartMockExam}
            userId={userId}
            initialSubView={practiceSubView as any}
          />
        );
      case "history":
        return <ExamHistory onBack={() => handleNavigate("dashboard")} userId={userId} />;
      case "mini-quizzes":
        return (
          <MiniQuizView 
            onBack={() => handleNavigate("dashboard")} 
            onStartQuiz={handleStartMiniQuiz}
            userId={userId}
          />
        );
      case "flashcards":
        return (
          <FlashcardView 
            onBack={() => handleNavigate("dashboard")} 
            onStartDeck={handleStartFlashcards}
            userId={userId}
          />
        );
      case "planner":
        return (
          <StudyPlannerView 
            onBack={() => handleNavigate("dashboard")} 
            onNavigate={handleNavigate}
            userId={userId}
            stats={dashboardStats}
          />
        );
      case "leaderboard":
        return <LeaderboardView onBack={() => handleNavigate("dashboard")} />;
      case "achievements":
        return <AchievementsView onBack={() => handleNavigate("dashboard")} />;
      case "premium":
        return <PremiumView onBack={() => handleNavigate("dashboard")} />;
      case "settings":
        return (
          <SettingsView 
            onBack={() => handleNavigate("dashboard")} 
            userId={userId}
            userName={userName}
            userEmail={userEmail}
            onUpdateProfile={(name, email) => {
              setUserName(name);
              setUserEmail(email);
            }}
          />
        );
      default:
        return <Dashboard onNavigate={handleNavigate} userId={userId} stats={dashboardStats} />;
    }
  };

  const handleLogin = (user: any, admin: boolean = false) => {
    setUserId(user.id || user);
    setUserName(user.name || "");
    setUserEmail(user.email || "");
    setIsAdmin(admin);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserId(null);
    setCurrentView("dashboard");
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  if (isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView as ViewState} 
        onNavigate={(view) => handleNavigate(view)} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b bg-card flex items-center px-4 justify-between sticky top-0 z-30">
          <div className="font-bold text-lg flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <BookOpenCheck className="w-5 h-5 text-primary" />
            </div>
            CSE Arena
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView + (quizActive ? "-quiz" : "") + (questions.length > 0 && !quizActive ? "-results" : "")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl mx-auto w-full pb-20 md:pb-0"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
