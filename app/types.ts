export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  questions: QuizQuestion[];
  title: string;
}

export interface UserAnswer {
  questionIndex: number;
  selectedAnswer: number;
}


