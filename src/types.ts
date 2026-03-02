export type Category = 'Numerical Reasoning' | 'Verbal Reasoning' | 'General Information' | 'Clerical Ability' | 'Logic';

export interface Question {
  id: string;
  category: Category;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, number>; // questionId -> selectedIndex
  isFinished: boolean;
  score: number;
  isLoading: boolean;
}

export interface UserStats {
  totalQuestionsAnswered: number;
  correctAnswers: number;
  categoryScores: Record<Category, { correct: number; total: number }>;
}
